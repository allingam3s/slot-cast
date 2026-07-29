import { useState, useEffect } from 'react';

type ViewMode = 'smartphone' | 'tablet' | 'desktop';

interface ViewConfig {
  label: string;
  icon: string;
  width: number;
  height: number;
  frameScale?: number;
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

  // Die Landingpage läuft im Replit-Workflow auf PORT, aber lokal können wir sie
  // nicht direkt aufrufen — stattdessen zeigen wir den IFRAME mit der öffentlichen
  // Seite oder einem lokalen Build.
  // Fallback: Seite aus dem öffentlichen data-Ordner laden
  const previewUrl = window.location.origin + '/preview-frame';

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
          style={{
            width: view.width,
            maxWidth: '100%',
          }}
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

  // Load data for preview
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

  return (
    <div style={{
      width: view.width,
      minHeight: view.height,
      background: 'linear-gradient(to bottom, #0847E4 0%, #3C9FE0 50%, #6FEFD7 100%)',
      fontFamily: "'Inter', sans-serif",
      overflow: 'hidden',
      fontSize: mode === 'smartphone' ? '14px' : '16px',
      padding: mode === 'smartphone' ? '20px 16px' : '32px 40px'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', paddingBottom: 32 }}>
        <h1 style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 800, fontSize: mode === 'smartphone' ? '1.8rem' : '2.5rem', color: 'white', lineHeight: 1.1 }}>
          {config?.shortTitle || 'SLOT-CAST'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8, fontSize: mode === 'smartphone' ? '0.9rem' : '1rem' }}>
          {config?.description || 'Der all_in_gam3s Podcast'}
        </p>
      </div>

      {/* Neueste Folge placeholder */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ color: 'white', fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: mode === 'smartphone' ? '1rem' : '1.3rem', marginBottom: 12 }}>
          Hör jetzt in die neueste Folge rein!
        </h2>
        <div style={{ background: '#B7F3E8', border: '2.5px solid #000', borderRadius: 20, padding: '20px 24px' }}>
          <p style={{ color: '#000', fontWeight: 600, fontSize: mode === 'smartphone' ? '0.9rem' : '1rem' }}>
            Episodendaten werden nach dem ersten RSS-Fetch angezeigt
          </p>
          <p style={{ color: '#333', fontSize: '0.82rem', marginTop: 6 }}>
            Klicke in der Creator-App unter "Veröffentlichen" auf "RSS-Feed jetzt abrufen"
          </p>
        </div>
      </div>

      {/* Plattformen */}
      <div>
        <h2 style={{ color: 'white', fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: mode === 'smartphone' ? '1rem' : '1.3rem', marginBottom: 12 }}>
          Auf diesen Plattformen hören
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: mode === 'smartphone' ? '1fr 1fr' : '1fr 1fr 1fr 1fr', gap: 12 }}>
          {enabledPlatforms.slice(0, mode === 'smartphone' ? 4 : 8).map(p => (
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
