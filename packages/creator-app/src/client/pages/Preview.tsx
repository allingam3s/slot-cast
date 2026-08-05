import { useState, useEffect, useRef } from 'react';

type ViewMode = 'smartphone' | 'tablet' | 'desktop';

interface ViewConfig {
  label: string;
  icon: string;
  width: number;
  height: number;
}

const VIEWS: Record<ViewMode, ViewConfig> = {
  smartphone: { label: 'Smartphone', icon: '📱', width: 390,  height: 844  },
  tablet:     { label: 'Tablet',      icon: '📋', width: 768,  height: 1024 },
  desktop:    { label: 'Desktop',     icon: '🖥️', width: 1280, height: 800  },
};

/** Brand colour per platform id */
const BRAND: Record<string, { bg: string; text: string }> = {
  spotify:          { bg: '#1DB954', text: '#fff' },
  youtube:          { bg: '#FF0000', text: '#fff' },
  'youtube-music':  { bg: '#FF0000', text: '#fff' },
  'amazon-music':   { bg: '#00A8E1', text: '#fff' },
  castbox:          { bg: '#F55B23', text: '#fff' },
  'pocket-casts':   { bg: '#E62B33', text: '#fff' },
  podimo:           { bg: '#5C3EEE', text: '#fff' },
  beacons:          { bg: '#111111', text: '#FBCD00' },
  twitch:           { bg: '#FFFFFF', text: '#9146FF' },
  goodpods:         { bg: '#00B8A9', text: '#fff' },
};

/** Strip HTML entities + tags for clean description display */
function stripHtml(raw: string): string {
  return raw
    .replace(/&lt;/g,   '<').replace(/&gt;/g, '>')
    .replace(/&amp;/g,  '&').replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'").replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '…')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function Preview() {
  const [mode, setMode] = useState<ViewMode>('smartphone');
  const [key,  setKey]  = useState(0);
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
        Die Vorschau zeigt deine gespeicherten Daten. Um Änderungen zu sehen, zuerst speichern, dann "Neu laden".
      </div>

      <div style={{
        display:    'flex',
        justifyContent: 'center',
        overflow:   mode === 'desktop' ? 'auto' : 'hidden',
        background: 'var(--bg)',
        borderRadius: 12,
        padding:    mode === 'desktop' ? '0' : '24px',
        border:     '1px solid var(--border)',
      }}>
        <div style={{ width: view.width, maxWidth: '100%' }}>
          <PreviewContent key={key} mode={mode} view={view} />
        </div>
      </div>

      <div style={{ marginTop: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
        Vorschau-Breite: {view.width}px × {view.height}px
      </div>
    </div>
  );
}

/* ─── Mini-Audioplayer für Vorschau ─────────────────────────────────── */
function PreviewPlayer({ url }: { url: string }) {
  const ref  = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time,    setTime]    = useState(0);
  const [ended,   setEnded]   = useState(false);
  const MAX = 60;

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    const onTime = () => {
      const t = Math.min(a.currentTime, MAX);
      setTime(t);
      if (a.currentTime >= MAX) { a.pause(); setPlaying(false); setEnded(true); }
    };
    const onEnd  = () => { setPlaying(false); setEnded(true); };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('ended',      onEnd);
    return () => { a.removeEventListener('timeupdate', onTime); a.removeEventListener('ended', onEnd); };
  }, []);

  const toggle = () => {
    const a = ref.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else {
      if (ended || a.currentTime >= MAX) { a.currentTime = 0; setTime(0); setEnded(false); }
      a.play().catch(() => {});
      setPlaying(true);
    }
  };

  const pct = (time / MAX) * 100;
  const fmt = (s: number) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

  return (
    <div style={{ marginBottom: 0 }}>
      <audio ref={ref} src={url} preload="none" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Play/Pause */}
        <button
          onClick={toggle}
          style={{
            flexShrink: 0, width: 40, height: 40, borderRadius: '50%',
            background: '#000', color: '#B7F3E8', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 16,
          }}
          aria-label={playing ? 'Pause' : 'Abspielen'}
        >
          {playing ? '⏸' : '▶'}
        </button>
        {/* Bar + times */}
        <div style={{ flex: 1 }}>
          <div
            style={{ height: 8, background: 'rgba(0,0,0,0.15)', borderRadius: 4, overflow: 'hidden', cursor: 'pointer', marginBottom: 4 }}
            onClick={(e) => {
              const a = ref.current; if (!a) return;
              const r = e.currentTarget.getBoundingClientRect();
              a.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * MAX;
            }}
          >
            <div style={{ height: '100%', width: `${pct}%`, background: '#000', borderRadius: 4, transition: 'width 0.1s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'rgba(0,0,0,0.5)', fontWeight: 600 }}>
            <span>{fmt(time)}</span>
            <span>{ended ? 'Hörprobe beendet' : `Hörprobe · ${fmt(MAX)}`}</span>
          </div>
        </div>
      </div>
      {ended && (
        <p style={{ margin: '6px 0 0', fontSize: '0.72rem', color: 'rgba(0,0,0,0.55)', fontWeight: 600 }}>
          Vollständige Folge auf allen Plattformen verfügbar.
        </p>
      )}
    </div>
  );
}

/* ─── Vorschau-Inhalt ────────────────────────────────────────────────── */
function PreviewContent({ mode, view }: { mode: ViewMode; view: ViewConfig }) {
  const [config,    setConfig]    = useState<any>(null);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [episodes,  setEpisodes]  = useState<any[]>([]);
  const [loaded,    setLoaded]    = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/config').then(r => r.json()),
      fetch('/api/platforms').then(r => r.json()),
      fetch('/api/episodes').then(r => r.json()).catch(() => ({ episodes: [] })),
    ]).then(([cfg, plats, eps]) => {
      setConfig(cfg);
      setPlatforms(Array.isArray(plats) ? plats : []);
      setEpisodes(Array.isArray(eps?.episodes) ? eps.episodes : []);
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

  const enabledPlatforms = platforms.filter(p => p.enabled).sort((a, b) => a.order - b.order);
  const isSmall  = mode === 'smartphone';
  const isMedium = mode === 'tablet';

  const logoSrc  = config?.logoUrl  ? `/${config.logoUrl}`  : null;
  const coverSrc = config?.coverUrl ? `/${config.coverUrl}` : null;

  const heroPadV = isSmall ? 36 : isMedium ? 52 : 72;
  const heroPadH = isSmall ? 16 : isMedium ? 40 : 80;

  // Latest episode
  const latest = episodes.length > 0
    ? [...episodes].sort((a, b) => new Date(b.pubDate||0).getTime() - new Date(a.pubDate||0).getTime())[0]
    : null;

  // Platform grid: 2-col mobile, 3-col tablet/desktop, centred last row via flex
  const colCount = isSmall ? 2 : 3;
  const gap      = 10;

  return (
    <div style={{
      width: view.width, minHeight: view.height,
      background: 'linear-gradient(to bottom, #0847E4 0%, #3C9FE0 50%, #6FEFD7 100%)',
      fontFamily: "'Inter', sans-serif",
      fontSize:   isSmall ? '14px' : '16px',
      boxSizing:  'border-box',
      overflow:   'hidden',
    }}>

      {/* ── Hero ── */}
      <div style={{
        position: 'relative', width: '100%',
        padding: `${heroPadV}px ${heroPadH}px`,
        boxSizing: 'border-box', textAlign: 'center',
        ...(coverSrc ? { backgroundImage: `url(${coverSrc})`, backgroundSize: 'cover', backgroundPosition: 'center top' } : {}),
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: coverSrc
            ? 'linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, rgba(4,35,150,0.72) 85%, rgba(8,71,228,1) 100%)'
            : 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {logoSrc && (
            <img src={logoSrc} alt="Logo"
              style={{ width: isSmall ? 72 : 100, height: isSmall ? 72 : 100, objectFit: 'contain', borderRadius: 16, display: 'block', margin: '0 auto 18px', filter: 'drop-shadow(0 3px 10px rgba(0,0,0,0.5))' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <h1 style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 800, fontSize: isSmall ? '2rem' : isMedium ? '2.8rem' : '3.4rem', color: 'white', lineHeight: 1.1, margin: 0, textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>
            {config?.shortTitle || 'SLOT-CAST'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: 10, fontSize: isSmall ? '0.95rem' : '1.1rem', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
            {config?.description || 'Der all_in_gam3s Podcast'}
          </p>
        </div>
      </div>

      {/* ── Seiteninhalt ── */}
      <div style={{ padding: isSmall ? '16px 16px 24px' : `20px ${heroPadH}px 32px` }}>

        {/* Neueste Folge */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ color: 'white', fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: isSmall ? '1rem' : '1.3rem', marginBottom: 12 }}>
            Hör jetzt in die neueste Folge rein!
          </h2>
          <div style={{ background: '#B7F3E8', border: '2.5px solid #000', borderRadius: 20, padding: '16px 20px' }}>
            {latest ? (
              <>
                <p style={{ color: 'rgba(0,0,0,0.55)', fontWeight: 700, fontSize: '0.75rem', marginBottom: 4 }}>
                  {latest.pubDate ? new Date(latest.pubDate).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                  {latest.duration ? ` · ${latest.duration}` : ''}
                </p>
                <p style={{ color: '#000', fontWeight: 700, fontSize: isSmall ? '0.9rem' : '1rem', marginBottom: 10, fontFamily: "'Exo 2', sans-serif" }}>
                  {latest.episodeNum ? `${latest.episodeNum} - ${latest.title}` : latest.title}
                </p>
                <p style={{ color: 'rgba(0,0,0,0.7)', fontSize: '0.8rem', marginBottom: 12, lineHeight: 1.5 }}>
                  {(() => { const c = stripHtml(latest.description || ''); return c.length > 200 ? c.slice(0, 200) + '…' : c; })()}
                </p>
                {latest.url && <PreviewPlayer url={latest.url} />}
              </>
            ) : (
              <>
                <p style={{ color: '#000', fontWeight: 600, fontSize: isSmall ? '0.9rem' : '1rem' }}>
                  Episodendaten werden nach dem ersten RSS-Fetch angezeigt
                </p>
                <p style={{ color: '#333', fontSize: '0.82rem', marginTop: 6 }}>
                  Klicke unter "Veröffentlichen" auf "RSS-Feed jetzt abrufen"
                </p>
              </>
            )}
          </div>
        </div>

        {/* Plattformen – flex-wrap, centred last row */}
        <div>
          <h2 style={{ color: 'white', fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: isSmall ? '1rem' : '1.3rem', marginBottom: 12 }}>
            Auf diesen Plattformen hören
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap }}>
            {enabledPlatforms.map(p => {
              const brand  = BRAND[p.id] ?? { bg: '#4B5563', text: '#fff' };
              const w      = `calc(${100 / colCount}% - ${gap * (colCount - 1) / colCount}px)`;
              return (
                <div key={p.id} style={{
                  width: w, background: brand.bg, borderRadius: 14,
                  padding: isSmall ? '12px 8px' : '14px 10px',
                  textAlign: 'center', opacity: p.incomplete ? 0.55 : 1,
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: 5, color: brand.text }}>
                    {/* Platform initial as fallback */}
                    {p.name.charAt(0)}
                  </div>
                  <div style={{ color: brand.text, fontWeight: 700, fontSize: '0.75rem' }}>{p.name}</div>
                  {p.incomplete && <div style={{ color: brand.text, opacity: 0.7, fontSize: '0.65rem', marginTop: 3 }}>bald verfügbar</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.3)', textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
          © 2025 {config?.author || 'all_in_gam3s'} – {config?.shortTitle || 'SLOT-CAST'}
        </div>
      </div>
    </div>
  );
}
