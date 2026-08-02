import { useState, useEffect } from 'react';

type ViewMode = 'smartphone' | 'tablet' | 'desktop';

interface ViewConfig {
  label: string;
  icon: string;
  width: number;
  height: number;
}

const VIEWS: Record<ViewMode, ViewConfig> = {
  smartphone: { label: 'Smartphone', icon: '📱', width: 390, height: 844 },
  tablet:     { label: 'Tablet',      icon: '📋', width: 768, height: 1024 },
  desktop:    { label: 'Desktop',     icon: '🖥️', width: 1280, height: 800 },
};

export default function Preview() {
  const [mode, setMode] = useState<ViewMode>('smartphone');
  const [key, setKey] = useState(0);

  const view = VIEWS[mode];

  return (
    <div>
      <h1 className="page-title">Live-Vorschau</h1>
      <p className="page-subtitle">So sieht deine Webseite auf verschiedenen Geräten aus</p>

      <div className="preview-controls">
        {(Object.keys(VIEWS) as ViewMode[]).map(m => (
          <button
            key={m}
            className={`preview-size-btn${mode === m ? ' active' : ''}`}
            onClick={() => setMode(m)}
          >
            <span aria-hidden="true">{VIEWS[m].icon}</span> {VIEWS[m].label}
            <small style={{ marginLeft: 6, opacity: 0.7 }}>({VIEWS[m].width}px)</small>
          </button>
        ))}
        <button className="btn btn-secondary" style={{ marginLeft: 'auto' }} onClick={() => setKey(k => k + 1)}>
          ↺ Neu laden
        </button>
      </div>

      <div className="alert alert-info" style={{ marginBottom: 24 }}>
        <span>ℹ</span>
        Die Vorschau zeigt deine gespeicherten Daten. Um Änderungen zu sehen, zuerst speichern, dann hier auf "Neu laden" klicken.
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        overflow: mode === 'desktop' ? 'auto' : 'hidden',
        background: 'var(--bg)',
        borderRadius: 12,
        padding: mode === 'desktop' ? '0' : '24px',
        border: '1px solid var(--border)'
      }}>
        <div
          className="preview-frame-wrapper"
          style={{ width: view.width, maxWidth: '100%' }}
        >
          <PreviewContent key={key} mode={mode} view={view} />
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
        Vorschau-Breite: {view.width}px × {view.height}px
      </div>
    </div>
  );
}

function PreviewContent({ mode, view }: { mode: ViewMode; view: ViewConfig }) {
  const [config, setConfig] = useState<any>(null);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/config').then(r => r.json()),
      fetch('/api/platforms').then(r => r.json()),
    ]).then(([cfg, plats]) => {
      setConfig(cfg);
      setPlatforms(Array.isArray(plats) ? plats : []);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  if (!loaded) {
    return (
      <div style={{ height: view.height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0847E4', color: 'white' }}>
        <div className="spinner" />
      </div>
    );
  }

  const enabledPlatforms = platforms.filter(p => p.enabled);
  const isSmall = mode === 'smartphone';

  // Bildpfade: config.logoUrl = "images/logo.webp" → absoluter Pfad "/images/logo.webp"
  // Der Express-Server liefert /images/* aus artifacts/slotcast-web/public/images/
  const logoSrc  = config?.logoUrl  ? `/${config.logoUrl}`  : null;
  const coverSrc = config?.coverUrl ? `/${config.coverUrl}` : null;

  return (
    <div style={{
      width: view.width,
      minHeight: view.height,
      background: 'linear-gradient(to bottom, #0847E4 0%, #3C9FE0 50%, #6FEFD7 100%)',
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden',
      fontSize: isSmall ? '14px' : '16px',
      padding: isSmall ? '20px 16px' : '32px 40px',
      boxSizing: 'border-box',
    }}>

      {/* ── Header: Logo + Titel ── */}
      <div style={{ textAlign: 'center', paddingBottom: 24 }}>
        {logoSrc && (
          <img
            src={logoSrc}
            alt="Podcast Logo"
            style={{
              width:        isSmall ? 64 : 80,
              height:       isSmall ? 64 : 80,
              objectFit:    'contain',
              borderRadius: 12,
              marginBottom: 14,
              display:      'block',
              margin:       '0 auto 14px',
              // Weicher Schatten damit es auf dem blauen Grund abhebt
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.35))',
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        <h1 style={{
          fontFamily: "'Exo 2', sans-serif",
          fontWeight: 800,
          fontSize:   isSmall ? '1.8rem' : '2.5rem',
          color:      'white',
          lineHeight: 1.1,
          margin:     0,
        }}>
          {config?.shortTitle || 'SLOT-CAST'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8, fontSize: isSmall ? '0.9rem' : '1rem' }}>
          {config?.description || 'Der all_in_gam3s Podcast'}
        </p>
      </div>

      {/* ── Cover-Art ── */}
      {coverSrc && (
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img
            src={coverSrc}
            alt="Podcast Cover"
            style={{
              width:        isSmall ? 150 : 220,
              height:       isSmall ? 150 : 220,
              objectFit:    'cover',      // füllt den Rahmen; Seitenverhältnis erhalten durch sharp
              borderRadius: 18,
              border:       '3px solid rgba(255,255,255,0.35)',
              boxShadow:    '0 8px 28px rgba(0,0,0,0.35)',
              display:      'block',
              margin:       '0 auto',
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      {/* ── Neueste Folge Placeholder ── */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: 'white', fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: isSmall ? '1rem' : '1.3rem', marginBottom: 12 }}>
          Hör jetzt in die neueste Folge rein!
        </h2>
        <div style={{ background: '#B7F3E8', border: '2.5px solid #000', borderRadius: 20, padding: '20px 24px' }}>
          <p style={{ color: '#000', fontWeight: 600, fontSize: isSmall ? '0.9rem' : '1rem' }}>
            Episodendaten werden nach dem ersten RSS-Fetch angezeigt
          </p>
          <p style={{ color: '#333', fontSize: '0.82rem', marginTop: 6 }}>
            Klicke in der Creator-App unter "Veröffentlichen" auf "RSS-Feed jetzt abrufen"
          </p>
        </div>
      </div>

      {/* ── Plattformen ── */}
      <div>
        <h2 style={{ color: 'white', fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: isSmall ? '1rem' : '1.3rem', marginBottom: 12 }}>
          Auf diesen Plattformen hören
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: isSmall ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: 12 }}>
          {enabledPlatforms.slice(0, isSmall ? 4 : 8).map(p => (
            <div key={p.id} style={{ background: '#B7F3E8', border: '2.5px solid #000', borderRadius: 16, padding: '14px 12px', textAlign: 'center', opacity: p.incomplete ? 0.65 : 1 }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>🎙️</div>
              <div style={{ color: '#000', fontWeight: 600, fontSize: '0.78rem' }}>{p.name}</div>
              {p.incomplete && <div style={{ color: '#555', fontSize: '0.68rem', marginTop: 4 }}>bald verfügbar</div>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.3)', textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
        © 2024 {config?.author || 'all_in_gam3s'} – {config?.shortTitle || 'SLOT-CAST'}
      </div>
    </div>
  );
}
