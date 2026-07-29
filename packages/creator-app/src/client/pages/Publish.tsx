import { useState, useEffect } from 'react';

type Alert = { type: 'success' | 'error' | 'info' | 'warning'; text: string } | null;

interface GitStatus {
  ok: boolean;
  branch?: string;
  changes?: number;
  publicChanges?: number;
  error?: string;
  changedFiles?: string[];
}

interface BackupEntry {
  timestamp: string;
  folder: string;
  files: string[];
  createdAt: string;
}

interface GitStep {
  step: string;
  output: string;
}

export default function Publish() {
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [commitMessage, setCommitMessage] = useState('Webseite aktualisiert');
  const [addAll, setAddAll] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishAlert, setPublishAlert] = useState<Alert>(null);
  const [publishLog, setPublishLog] = useState<GitStep[]>([]);
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [backingUp, setBackingUp] = useState(false);
  const [backupAlert, setBackupAlert] = useState<Alert>(null);
  const [rssAlert, setRssAlert] = useState<Alert>(null);
  const [rssFetching, setRssFetching] = useState(false);

  useEffect(() => {
    loadGitStatus();
    loadBackups();
  }, []);

  async function loadGitStatus() {
    setStatusLoading(true);
    try {
      const res = await fetch('/api/git/status');
      const data = await res.json();
      setGitStatus(data);
    } catch {
      setGitStatus({ ok: false, error: 'Verbindung zur Creator-App unterbrochen.' });
    }
    setStatusLoading(false);
  }

  async function loadBackups() {
    try {
      const res = await fetch('/api/backup/list');
      const data = await res.json();
      setBackups(data.backups || []);
    } catch { /* ignore */ }
  }

  async function handleBackup() {
    setBackingUp(true);
    setBackupAlert(null);
    try {
      const res = await fetch('/api/backup/create', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setBackupAlert({ type: 'success', text: data.message });
        await loadBackups();
      } else {
        setBackupAlert({ type: 'error', text: data.error });
      }
    } catch {
      setBackupAlert({ type: 'error', text: 'Sicherung fehlgeschlagen.' });
    }
    setBackingUp(false);
  }

  async function handleRssFetch() {
    setRssFetching(true);
    setRssAlert(null);
    try {
      const res = await fetch('/api/rss/fetch', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        setRssAlert({ type: 'success', text: data.message });
      } else {
        setRssAlert({ type: 'error', text: data.error || 'RSS-Fetch fehlgeschlagen.' });
      }
    } catch {
      setRssAlert({ type: 'error', text: 'Verbindung fehlgeschlagen.' });
    }
    setRssFetching(false);
  }

  async function handlePublish() {
    if (!commitMessage.trim()) {
      setPublishAlert({ type: 'error', text: 'Bitte eine Beschreibung der Änderungen eingeben.' });
      return;
    }
    setPublishing(true);
    setPublishAlert(null);
    setPublishLog([]);
    try {
      const res = await fetch('/api/git/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: commitMessage, addAll })
      });
      const data = await res.json();
      if (data.steps) setPublishLog(data.steps);
      if (res.ok && data.ok) {
        if (data.noChanges) {
          setPublishAlert({ type: 'info', text: data.message });
        } else {
          setPublishAlert({ type: 'success', text: data.message });
          await loadGitStatus();
        }
      } else {
        setPublishAlert({ type: 'error', text: data.error || 'Veröffentlichen fehlgeschlagen.' });
      }
    } catch {
      setPublishAlert({ type: 'error', text: 'Verbindung zur Creator-App unterbrochen.' });
    }
    setPublishing(false);
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  }

  return (
    <div>
      <h1 className="page-title">Veröffentlichen</h1>
      <p className="page-subtitle">RSS-Feed aktualisieren, Sicherung erstellen und auf GitHub pushen</p>

      {/* Schritt 1: RSS-Feed */}
      <div className="card">
        <div className="card-title">1. RSS-Feed aktualisieren</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>
          Holt die neuesten Episoden aus dem RSS-Feed und speichert sie als episodes.json.
          Dies geschieht auch automatisch bei jedem GitHub-Deployment.
        </p>
        {rssAlert && <div className={`alert alert-${rssAlert.type}`}><span>{rssAlert.type === 'success' ? '✓' : '✗'}</span> {rssAlert.text}</div>}
        <button className="btn btn-secondary" onClick={handleRssFetch} disabled={rssFetching}>
          {rssFetching ? <><span className="spinner" /> Wird abgerufen...</> : '📡 RSS-Feed jetzt abrufen'}
        </button>
      </div>

      {/* Schritt 2: Sicherung */}
      <div className="card">
        <div className="card-title">2. Lokale Sicherung erstellen</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>
          Erstellt eine lokale Sicherungskopie aller JSON-Dateien (config.json, platforms.json, episodes.json, legal.json).
          Die Sicherung wird im Ordner <code style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>packages/creator-app/backups/</code> gespeichert.
        </p>
        {backupAlert && <div className={`alert alert-${backupAlert.type}`}><span>{backupAlert.type === 'success' ? '✓' : '✗'}</span> {backupAlert.text}</div>}
        <div className="flex gap-8 items-center" style={{ marginBottom: 12 }}>
          <button className="btn btn-secondary" onClick={handleBackup} disabled={backingUp}>
            {backingUp ? <><span className="spinner" /> Sicherung läuft...</> : '💾 Sicherung erstellen'}
          </button>
        </div>
        {backups.length > 0 && (
          <details>
            <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem', userSelect: 'none' }}>
              {backups.length} vorhandene Sicherungen anzeigen
            </summary>
            <div style={{ marginTop: 12, maxHeight: 200, overflowY: 'auto' }}>
              {backups.map(b => (
                <div key={b.timestamp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text)' }}>{formatDate(b.createdAt)}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{b.files.length} Dateien</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Schritt 3: Git-Status */}
      <div className="card">
        <div className="card-title">3. Git-Status prüfen</div>
        {statusLoading && <div style={{ color: 'var(--text-muted)' }}>Git-Status wird geladen...</div>}
        {gitStatus && (
          <div>
            {gitStatus.ok ? (
              <div>
                <div className="flex gap-8" style={{ marginBottom: 12 }}>
                  <span className="badge badge-active">Git aktiv</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Branch: <strong style={{ color: 'var(--text)' }}>{gitStatus.branch}</strong></span>
                </div>
                {gitStatus.changes === 0 ? (
                  <div className="alert alert-info"><span>ℹ</span> Keine Änderungen – alles ist veröffentlicht.</div>
                ) : (
                  <div className="alert alert-warning">
                    <span>!</span>
                    <div>
                      <strong>{gitStatus.changes} Datei(en) geändert</strong> ({gitStatus.publicChanges} öffentliche Dateien)
                      {gitStatus.changedFiles && gitStatus.changedFiles.length <= 10 && (
                        <ul style={{ marginTop: 6, paddingLeft: 16, fontSize: '0.8rem' }}>
                          {gitStatus.changedFiles.map(f => <li key={f}>{f}</li>)}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="alert alert-error"><span>✗</span> {gitStatus.error}</div>
            )}
          </div>
        )}
        <button className="btn btn-secondary" style={{ marginTop: 12 }} onClick={loadGitStatus} disabled={statusLoading}>
          ↺ Status aktualisieren
        </button>
      </div>

      {/* Schritt 4: Veröffentlichen */}
      <div className="card">
        <div className="card-title">4. Auf GitHub veröffentlichen</div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>
          Führt <code style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>git add</code>,{' '}
          <code style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>git commit</code> und{' '}
          <code style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>git push</code> aus.{' '}
          GitHub Actions deployt die Webseite danach automatisch.
        </p>
        <div className="form-group">
          <label htmlFor="commitMsg">Beschreibung der Änderungen</label>
          <input id="commitMsg" type="text" value={commitMessage} onChange={e => setCommitMessage(e.target.value)} placeholder="z.B. Spotify-Link hinzugefügt, neue Episode verfügbar" />
        </div>
        <div className="flex items-center gap-8" style={{ marginBottom: 16 }}>
          <button className="toggle" onClick={() => setAddAll(v => !v)} aria-label="Alle Dateien hinzufügen" style={{ background: addAll ? 'var(--mid-blue)' : undefined }}>
            <span />
          </button>
          <span style={{ fontSize: '0.88rem' }}>Alle geänderten Dateien hinzufügen (statt nur public/)</span>
        </div>

        {publishAlert && (
          <div className={`alert alert-${publishAlert.type}`}>
            <span>{publishAlert.type === 'success' ? '✓' : publishAlert.type === 'error' ? '✗' : 'ℹ'}</span>
            {publishAlert.text}
          </div>
        )}

        {publishLog.length > 0 && (
          <div className="git-log">
            {publishLog.map((step, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <span style={{ color: 'var(--mid-blue)' }}>$ {step.step}</span>{'\n'}{step.output}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-8" style={{ marginTop: 16 }}>
          <button className="btn btn-success" onClick={handlePublish} disabled={publishing || !gitStatus?.ok}>
            {publishing ? <><span className="spinner" /> Wird veröffentlicht...</> : '🚀 Auf GitHub veröffentlichen'}
          </button>
        </div>

        <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text)' }}>Nach dem Push:</strong> GitHub Actions baut deine Webseite automatisch und veröffentlicht sie auf GitHub Pages. Das dauert normalerweise 1–3 Minuten. Du kannst den Fortschritt unter <em>GitHub → Actions</em> verfolgen.
        </div>
      </div>
    </div>
  );
}
