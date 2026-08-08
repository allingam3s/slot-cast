import { usePlatforms } from "../hooks/useData";

/** Brand colour + text colour per platform id */
const BRAND: Record<string, { bg: string; text: string }> = {
  spotify:          { bg: '#1DB954', text: '#fff' },
  youtube:          { bg: '#FF0000', text: '#fff' },
  'youtube-music':  { bg: '#FF0000', text: '#fff' },
  'amazon-music':   { bg: '#232F3E', text: '#25D1DA' },
  castbox:          { bg: '#F55B23', text: '#fff' },
  'pocket-casts':   { bg: '#E62B33', text: '#fff' },
  podimo:           { bg: '#5C3EEE', text: '#fff' },
  beacons:          { bg: '#FFFFFF', text: '#000000' },
  twitch:           { bg: '#FFFFFF', text: '#9146FF' },
  goodpods:         { bg: '#00B8A9', text: '#fff' },
};

export function Platforms() {
  const { data, isLoading } = usePlatforms();

  if (isLoading) {
    return <div className="h-64 animate-pulse bg-white/10 rounded-2xl mb-16" />;
  }

  const platforms = (data || [])
    .filter((p) => p.enabled)
    .sort((a, b) => a.order - b.order);

  if (platforms.length === 0) return null;

  return (
    <section className="mb-10 md:mb-14 stagger-enter" style={{ animationDelay: '300ms' }}>
      <h2 className="heading-exo section-heading">Auf diesen Plattformen hören</h2>

      {/*
        flex-wrap + justify-center → incomplete last row is centred automatically.
        Each card: 2-per-row on mobile, 3-per-row on md+.
        gap-4 = 16 px  →  (100% - 16px) / 2 = calc(50% - 8px)
        gap-5 = 20 px  →  (100% - 40px) / 3 ≈ calc(33.333% - 14px)
      */}
      <div className="flex flex-wrap justify-center gap-4 md:gap-5">
        {platforms.map((platform) => {
          const isDisabled = platform.incomplete || !platform.url;
          const brand = BRAND[platform.id] ?? { bg: '#4B5563', text: '#fff' };

          const card = (
            <div
              className="flex flex-col items-center justify-center text-center rounded-2xl p-4 md:p-5 transition-transform hover:scale-[1.03] w-full"
              style={{
                background: brand.bg,
                color: brand.text,
                opacity: isDisabled ? 0.55 : 1,
                cursor: isDisabled ? 'default' : 'pointer',
              }}
            >
              {/* Icon */}
              <div className="mb-3 flex items-center justify-center" style={{ height: 48 }}>
                <img
                  src={`${import.meta.env.BASE_URL}${platform.icon}`}
                  alt={platform.name}
                  className="h-10 w-auto max-w-[120px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>

              {/* Name */}
              <h3 className="font-bold text-sm md:text-base leading-tight" style={{ color: brand.text }}>
                {platform.name}
              </h3>

              {isDisabled && (
                <span
                  className="mt-1.5 text-xs font-bold px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(255,255,255,0.2)', color: brand.text }}
                >
                  bald verfügbar
                </span>
              )}
            </div>
          );

          // .platform-item in index.css: 50% mobile, 33.333% md+ → centred last row
          return isDisabled ? (
            <div key={platform.id} className="platform-item">
              {card}
            </div>
          ) : (
            <a
              key={platform.id}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="platform-item no-underline"
            >
              {card}
            </a>
          );
        })}
      </div>
    </section>
  );
}
