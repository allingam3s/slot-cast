import { useState, useEffect, useRef } from 'react';

interface Config {
  title: string;
  shortTitle: string;
  description: string;
  author: string;
  language: string;
  rssUrl: string;
  baseUrl: string;
  logoUrl: string;
  coverUrl: string;
  socialLinks: { beacons: string; twitch: string };
  seo: { keywords: string; twitterHandle: string };
}

const DEFAULT_CONFIG: Config = {
  title: 'SLOT-CAST | Der all_in_gam3s Podcast',
  shortTitle: 'SLOT-CAST',
  description: '',
  author: 'all_in_gam3s',
  language: 'de',
  rssUrl: 'https://anchor.fm/s/11248c624/podcast/rss',
  baseUrl: '',
  logoUrl: 'images/logo.png',
  coverUrl: 'images/cover.jpg',
  socialLinks: { beacons: 'https://beacons.ai/all_in_gam3s', twitch: 'https://twitch.tv/all_in_gam3s' },
  seo: { keywords: 'podcast, gaming, all_in_gam3s', twitterHandle: '@all_in_gam3s' }
};

type Alert = { type: 'success' | 'error' | 'info'; text: string } | null;

export default function Settings() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<Alert>(null);
  const [rssChecking, setRssChecking] = useState(false);
  const [rssAlert, setRssAlert] = useState<Alert>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState<'logo' | 'cover' | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(d => { setConfig({ ...DEFAULT_CONFIG, ...d }); setLoading(false); })
      .catch(() => { setAlert({ type: 'error', text: 'Einstellungen konnten nicht geladen werden.' }); setLoading(false); });
  }, []);

  function set(key: keyof Config, value: string) {
    setConfig(prev => ({ ...prev, [key]: value }));
  }
  function setSocialLink(key: 'beacons' | 'twitch', value: string) {
    setConfig(prev => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }));
  }
  function setSeo(key: 'keywords' | 'twitterHandle', value: string) {
    setConfig(prev => ({ ...prev, seo: { ...prev.seo, [key]: value } }));
  }

  async function handleSave() {
    setSaving(true);
    setAlert(null);
    try {
      const res = await fetch('/api/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
      const data = await res.json();
      if (res.ok) {
        setAlert({ type: 'success', text: data.message || 'Einstellungen gespeichert.' });
      } else {
        setAlert({ type: 'error', text: data.error || 'Speichern fehlgeschlagen.' });
      }
    } catch {
      setAlert({ type: 'error', text: 'Netzwerkfehler beim Speichern.' });
    }
    setSaving(false);
  }

  async function handleRssCheck() {
    setRssChecking(true);
    setRssAlert(null);
    try {
      const res = await fetch('/api/rss/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: config.rssUrl }) });
      const data = await res.json();
      if (data.ok) {
        setRssAlert({ type: 'success', text: data.message });
      } else {
        setRssAlert({ type: 'error', text: data.error });
      }
    } catch {
      setRssAlert({ type: 'error', text: 'Verbindung zur Creator-App unterbrochen.' });
    }
    setRssChecking(false);
  }

  async function handleUpload(type: 'logo' | 'cover', file: File) {
    if (!file) return;
    const maxMb = 5;
    if (file.size > maxMb * 1024 * 1024) {
      setAlert({ type: 'error', text: `Die Datei ist zu groß. Maximal ${maxMb} MB erlaubt.` });
      return;
    }
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setAlert({ type: 'error', text: 'Nur PNG, JPG und WEBP-Dateien sind erlaubt.' });
      return;
    }
    setUploading(type);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`/api/upload/${type}`, { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        const reader = new FileReader();
        reader.onload = e => {
          if (type === 'logo') setLogoPreview(e.target?.result as string);
          else setCoverPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        setAlert({ type: 'success', text: `${type === 'logo' ? 'Logo' : 'Cover'} erfolgreich hochgeladen: ${data.filename}` });
        set(type === 'logo' ? 'logoUrl' : 'coverUrl', data.path);
      } else {
        setAlert({ type: 'error', text: data.error || 'Upload fehlgeschlagen.' });
      }
    } catch {
      setAlert({ type: 'error', text: 'Upload fehlgeschlagen. Ist die Creator-App noch gestartet?' });
    }
    setUploading(null);
  }

  if (loading) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Einstellungen werden geladen...</div>;

  return (
    <div>
      <h1 className="page-title">Einstellungen</h1>
      <p className="page-subtitle">Allgemeine Podcast-Informationen und Konfiguration</p>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          <span>{alert.type === 'success' ? '✓' : alert.type === 'error' ? '✗' : 'ℹ'}</span>
          {alert.text}
        </div>
      )}

      <div className="card">
        <div className="card-title">Podcast-Informationen</div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">Vollständiger Titel</label>
            <input id="title" type="text" value={config.title} onChange={e => set('title', e.target.value)} placeholder="SLOT-CAST | Der all_in_gam3s Podcast" />
          </div>
          <div className="form-group">
            <label htmlFor="shortTitle">Kurztitel (für Kopfzeile)</label>
            <input id="shortTitle" type="text" value={config.shortTitle} onChange={e => set('shortTitle', e.target.value)} placeholder="SLOT-CAST" />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="description">Beschreibung</label>
          <textarea id="description" value={config.description} onChange={e => set('description', e.target.value)} placeholder="Kurze Beschreibung deines Podcasts..." />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="author">Autor / Ersteller</label>
            <input id="author" type="text" value={config.author} onChange={e => set('author', e.target.value)} placeholder="all_in_gam3s" />
          </div>
          <div className="form-group">
            <label htmlFor="language">Sprache</label>
            <select id="language" value={config.language} onChange={e => set('language', e.target.value)}>
              <option value="de">Deutsch (de)</option>
              <option value="en">Englisch (en)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">RSS-Feed</div>
        <div className="form-group">
          <label htmlFor="rssUrl">RSS-Feed-URL</label>
          <input id="rssUrl" type="url" value={config.rssUrl} onChange={e => set('rssUrl', e.target.value)} placeholder="https://anchor.fm/s/..." />
        </div>
        {rssAlert && (
          <div className={`alert alert-${rssAlert.type}`} style={{ marginBottom: 12 }}>
            <span>{rssAlert.type === 'success' ? '✓' : '✗'}</span>
            {rssAlert.text}
          </div>
        )}
        <button className="btn btn-secondary" onClick={handleRssCheck} disabled={rssChecking || !config.rssUrl}>
          {rssChecking ? <><span className="spinner" /> Prüfe...</> : 'RSS-Feed testen'}
        </button>
      </div>

      <div className="card">
        <div className="card-title">Bilder</div>
        <div className="form-row">
          <div className="form-group">
            <label>Logo (PNG, JPG, WEBP – max. 5 MB)</label>
            <div className="upload-area" onClick={() => logoRef.current?.click()}>
              <input ref={logoRef} type="file" accept=".png,.jpg,.jpeg,.webp" onChange={e => e.target.files?.[0] && handleUpload('logo', e.target.files[0])} />
              {logoPreview
                ? <img src={logoPreview} alt="Logo Vorschau" className="img-preview" />
                : <>
                  <div className="upload-icon">🖼️</div>
                  <p><strong>Klicken zum Hochladen</strong></p>
                  <p>PNG, JPG oder WEBP</p>
                  {uploading === 'logo' && <span className="spinner" style={{ margin: '8px auto 0', display: 'block' }} />}
                </>
              }
            </div>
          </div>
          <div className="form-group">
            <label>Cover-Bild (PNG, JPG, WEBP – max. 5 MB)</label>
            <div className="upload-area" onClick={() => coverRef.current?.click()}>
              <input ref={coverRef} type="file" accept=".png,.jpg,.jpeg,.webp" onChange={e => e.target.files?.[0] && handleUpload('cover', e.target.files[0])} />
              {coverPreview
                ? <img src={coverPreview} alt="Cover Vorschau" className="img-preview" />
                : <>
                  <div className="upload-icon">📷</div>
                  <p><strong>Klicken zum Hochladen</strong></p>
                  <p>PNG, JPG oder WEBP</p>
                  {uploading === 'cover' && <span className="spinner" style={{ margin: '8px auto 0', display: 'block' }} />}
                </>
              }
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Weitere Links</div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="beacons">Beacons-Link</label>
            <input id="beacons" type="url" value={config.socialLinks.beacons} onChange={e => setSocialLink('beacons', e.target.value)} placeholder="https://beacons.ai/..." />
          </div>
          <div className="form-group">
            <label htmlFor="twitch">Twitch-Link</label>
            <input id="twitch" type="url" value={config.socialLinks.twitch} onChange={e => setSocialLink('twitch', e.target.value)} placeholder="https://twitch.tv/..." />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">SEO &amp; Suchmaschinen</div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="keywords">Schlüsselwörter (kommagetrennt)</label>
            <input id="keywords" type="text" value={config.seo.keywords} onChange={e => setSeo('keywords', e.target.value)} placeholder="podcast, gaming, all_in_gam3s" />
          </div>
          <div className="form-group">
            <label htmlFor="twitter">Twitter/X-Handle</label>
            <input id="twitter" type="text" value={config.seo.twitterHandle} onChange={e => setSeo('twitterHandle', e.target.value)} placeholder="@all_in_gam3s" />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="baseUrl">Basis-URL (GitHub Pages oder eigene Domain)</label>
          <input id="baseUrl" type="url" value={config.baseUrl} onChange={e => set('baseUrl', e.target.value)} placeholder="https://deinname.github.io/slotcast/" />
          <span className="text-muted" style={{ marginTop: 4 }}>Wird für Sitemap und kanonische Links verwendet</span>
        </div>
      </div>

      <div className="flex gap-8">
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? <><span className="spinner" /> Speichern...</> : '💾 Lokal speichern'}
        </button>
        <span className="text-muted items-center flex">Speichert in config.json</span>
      </div>
    </div>
  );
}
