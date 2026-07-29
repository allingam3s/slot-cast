import { useState, useEffect, useRef } from 'react';

interface Platform {
  id: string;
  name: string;
  icon: string;
  url: string;
  enabled: boolean;
  order: number;
  incomplete: boolean;
}

type Alert = { type: 'success' | 'error' | 'info'; text: string } | null;

const PLATFORM_ICONS: Record<string, string> = {
  spotify: '🟢', youtube: '▶️', 'youtube-music': '🎵',
  'amazon-music': '🎶', castbox: '📻', goodpods: '🎙️',
  'pocket-casts': '📡', podimo: '🎧'
};

function getIcon(platform: Platform): string {
  return PLATFORM_ICONS[platform.id.split('-').slice(0, 2).join('-')] || '🎙️';
}

export default function Platforms() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<Alert>(null);
  const [showModal, setShowModal] = useState(false);
  const [editPlatform, setEditPlatform] = useState<Platform | null>(null);
  const [newForm, setNewForm] = useState({ name: '', url: '', icon: '' });
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const dragNode = useRef<number | null>(null);

  useEffect(() => {
    fetch('/api/platforms')
      .then(r => r.json())
      .then(d => { setPlatforms(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setAlert({ type: 'error', text: 'Plattformen konnten nicht geladen werden.' }); setLoading(false); });
  }, []);

  async function handleSave(updated: Platform[]) {
    setSaving(true);
    setAlert(null);
    try {
      const res = await fetch('/api/platforms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
      const data = await res.json();
      if (res.ok) {
        setPlatforms(data.platforms || updated);
        setAlert({ type: 'success', text: 'Plattformen gespeichert.' });
      } else {
        setAlert({ type: 'error', text: data.error || 'Speichern fehlgeschlagen.' });
      }
    } catch {
      setAlert({ type: 'error', text: 'Netzwerkfehler beim Speichern.' });
    }
    setSaving(false);
  }

  function toggleEnabled(id: string) {
    const updated = platforms.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p);
    setPlatforms(updated);
  }

  async function deletePlatform(id: string) {
    if (!confirm('Plattform wirklich löschen?')) return;
    const res = await fetch(`/api/platforms/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) {
      setPlatforms(prev => prev.filter(p => p.id !== id));
      setAlert({ type: 'success', text: 'Plattform gelöscht.' });
    } else {
      setAlert({ type: 'error', text: data.error });
    }
  }

  function openEdit(platform: Platform) {
    setEditPlatform({ ...platform });
    setNewForm({ name: platform.name, url: platform.url, icon: platform.icon });
    setShowModal(true);
  }

  function openAdd() {
    setEditPlatform(null);
    setNewForm({ name: '', url: '', icon: '' });
    setShowModal(true);
  }

  async function handleModalSave() {
    if (!newForm.name.trim()) { setAlert({ type: 'error', text: 'Name darf nicht leer sein.' }); return; }
    if (editPlatform) {
      const updated = platforms.map(p => p.id === editPlatform.id
        ? { ...p, name: newForm.name.trim(), url: newForm.url.trim(), icon: newForm.icon.trim(), incomplete: !newForm.url.trim() }
        : p);
      setPlatforms(updated);
      setShowModal(false);
      await handleSave(updated);
    } else {
      const res = await fetch('/api/platforms/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newForm) });
      const data = await res.json();
      if (res.ok) {
        setPlatforms(prev => [...prev, data.platform]);
        setAlert({ type: 'success', text: `"${newForm.name}" wurde hinzugefügt.` });
        setShowModal(false);
      } else {
        setAlert({ type: 'error', text: data.error });
      }
    }
  }

  // Drag & Drop
  function onDragStart(idx: number) {
    setDragIdx(idx);
    dragNode.current = idx;
  }
  function onDragEnter(idx: number) { setDragOverIdx(idx); }
  function onDragEnd() {
    if (dragIdx !== null && dragOverIdx !== null && dragIdx !== dragOverIdx) {
      const updated = [...platforms];
      const [moved] = updated.splice(dragIdx, 1);
      updated.splice(dragOverIdx, 0, moved);
      setPlatforms(updated);
    }
    setDragIdx(null);
    setDragOverIdx(null);
    dragNode.current = null;
  }

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Plattformen werden geladen...</div>;

  return (
    <div>
      <h1 className="page-title">Plattformen</h1>
      <p className="page-subtitle">Podcast-Plattformen verwalten, sortieren und Links eintragen</p>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          <span>{alert.type === 'success' ? '✓' : '✗'}</span> {alert.text}
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-8" style={{ marginBottom: 16 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Plattformen ({platforms.length})</div>
          <div className="ml-auto flex gap-8">
            <button className="btn btn-secondary" onClick={openAdd}>+ Hinzufügen</button>
            <button className="btn btn-primary" onClick={() => handleSave(platforms)} disabled={saving}>
              {saving ? <><span className="spinner" /> Speichern...</> : '💾 Speichern'}
            </button>
          </div>
        </div>

        <div className="alert alert-info" style={{ marginBottom: 16 }}>
          <span>ℹ</span>
          Ziehe die Karten, um die Reihenfolge zu ändern. Klicke auf ✏️ um Links einzutragen. Plattformen ohne Link werden auf der Webseite als "bald verfügbar" angezeigt.
        </div>

        <div className="platforms-list">
          {platforms.map((platform, idx) => (
            <div
              key={platform.id}
              className={`platform-card${dragIdx === idx ? ' dragging' : ''}${dragOverIdx === idx && dragIdx !== idx ? ' drag-over' : ''}`}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragEnter={() => onDragEnter(idx)}
              onDragEnd={onDragEnd}
              onDragOver={e => e.preventDefault()}
            >
              <span className="drag-handle" title="Zum Sortieren ziehen">⠿</span>
              <div className="platform-icon" aria-hidden="true">{getIcon(platform)}</div>
              <div className="platform-info">
                <div className="platform-name">{platform.name}</div>
                <div className="platform-url">{platform.url || '– noch kein Link eingetragen –'}</div>
              </div>
              <div className="platform-badges">
                <span className={`badge ${platform.enabled ? 'badge-active' : 'badge-inactive'}`}>
                  {platform.enabled ? 'Aktiv' : 'Inaktiv'}
                </span>
                {platform.incomplete && <span className="badge badge-incomplete">Unvollständig</span>}
              </div>
              <div className="platform-actions">
                <button
                  className="toggle"
                  style={{ width: 38, height: 22 }}
                  onClick={() => toggleEnabled(platform.id)}
                  title={platform.enabled ? 'Deaktivieren' : 'Aktivieren'}
                  aria-label={`${platform.name} ${platform.enabled ? 'deaktivieren' : 'aktivieren'}`}
                >
                  <span />
                </button>
                <button className="icon-btn" onClick={() => openEdit(platform)} title="Bearbeiten" aria-label={`${platform.name} bearbeiten`}>✏️</button>
                <button className="icon-btn danger" onClick={() => deletePlatform(platform.id)} title="Löschen" aria-label={`${platform.name} löschen`}>🗑️</button>
              </div>
            </div>
          ))}

          {platforms.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
              Keine Plattformen vorhanden. Klicke auf "+ Hinzufügen".
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-title">{editPlatform ? `"${editPlatform.name}" bearbeiten` : 'Neue Plattform hinzufügen'}</div>
            <div className="form-group">
              <label htmlFor="pname">Name der Plattform *</label>
              <input id="pname" type="text" value={newForm.name} onChange={e => setNewForm(f => ({ ...f, name: e.target.value }))} placeholder="z.B. Spotify, Apple Podcasts..." autoFocus />
            </div>
            <div className="form-group">
              <label htmlFor="purl">Link zur Podcast-Seite auf dieser Plattform</label>
              <input id="purl" type="url" value={newForm.url} onChange={e => setNewForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." />
              <span className="text-muted" style={{ marginTop: 4 }}>Leer lassen, wenn der Link noch nicht bekannt ist</span>
            </div>
            <div className="form-group">
              <label htmlFor="picon">Icon-Pfad (relativ zu public/, z.B. icons/spotify.svg)</label>
              <input id="picon" type="text" value={newForm.icon} onChange={e => setNewForm(f => ({ ...f, icon: e.target.value }))} placeholder="icons/meinicon.svg" />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Abbrechen</button>
              <button className="btn btn-primary" onClick={handleModalSave}>
                {editPlatform ? 'Speichern' : 'Hinzufügen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
