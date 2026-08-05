import { useRef, useState, useEffect } from 'react';

const MAX_S = 60;

function fmt(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

interface Props {
  url: string;
}

export function AudioPreview({ url }: Props) {
  const ref   = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying]   = useState(false);
  const [time,    setTime]      = useState(0);
  const [ended,   setEnded]     = useState(false);
  const [error,   setError]     = useState(false);

  useEffect(() => {
    const a = ref.current;
    if (!a) return;

    const onTime = () => {
      const t = Math.min(a.currentTime, MAX_S);
      setTime(t);
      if (a.currentTime >= MAX_S) {
        a.pause();
        setPlaying(false);
        setEnded(true);
      }
    };
    const onEnded = () => { setPlaying(false); setEnded(true); };
    const onErr   = () => { setError(true); setPlaying(false); };

    a.addEventListener('timeupdate', onTime);
    a.addEventListener('ended',      onEnded);
    a.addEventListener('error',      onErr);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('ended',      onEnded);
      a.removeEventListener('error',      onErr);
    };
  }, []);

  const toggle = () => {
    const a = ref.current;
    if (!a || error) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      if (ended || a.currentTime >= MAX_S) {
        a.currentTime = 0;
        setTime(0);
        setEnded(false);
      }
      a.play().catch(() => setError(true));
      setPlaying(true);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = ref.current;
    if (!a || error) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const t    = pct * MAX_S;
    a.currentTime = t;
    setTime(t);
    if (t < MAX_S) setEnded(false);
  };

  const pct = (time / MAX_S) * 100;

  if (error) {
    return (
      <p className="text-sm font-semibold text-black/50 mb-6">
        Audio konnte nicht geladen werden – vollständige Folge auf den Plattformen verfügbar.
      </p>
    );
  }

  return (
    <div className="mb-6">
      <audio ref={ref} src={url} preload="none" />

      <div className="flex items-center gap-4">
        {/* Play / Pause */}
        <button
          onClick={toggle}
          aria-label={playing ? 'Pause' : 'Abspielen'}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-black text-[#B7F3E8] flex items-center justify-center hover:bg-black/80 active:scale-95 transition-all"
        >
          {playing ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <rect x="5" y="4" width="4" height="16" rx="1" />
              <rect x="15" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Bar + times */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div
            className="relative h-2.5 bg-black/15 rounded-full overflow-hidden cursor-pointer group"
            onClick={seek}
          >
            <div
              className="absolute inset-y-0 left-0 bg-black rounded-full transition-[width] duration-100"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-semibold text-black/50 select-none">
            <span className="tabular-nums">{fmt(time)}</span>
            <span>
              {ended
                ? 'Hörprobe beendet'
                : `Hörprobe · ${fmt(MAX_S)}`}
            </span>
          </div>
        </div>
      </div>

      {ended && (
        <p className="mt-2 text-xs font-semibold text-black/60">
          Die vollständige Folge ist auf allen Plattformen verfügbar.
        </p>
      )}
    </div>
  );
}
