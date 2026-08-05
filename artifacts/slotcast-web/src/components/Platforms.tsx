import { usePlatforms } from "../hooks/useData";

/** Brand colour + text colour per platform id */
const BRAND: Record<string, { bg: string; text: string }> = {
  spotify:          { bg: '#1DB954', text: '#fff' },
  youtube:          { bg: '#FF0000', text: '#fff' },
  'youtube-music':  { bg: '#FF0000', text: '#fff' },
  'amazon-music':   { bg: '#00A8E1', text: '#fff' },
  castbox:          { bg: '#F55B23', text: '#fff' },
  'pocket-casts':   { bg: '#E62B33', text: '#fff' },
  podimo:           { bg: '#5C3EEE', text: '#fff' },
  beacons:          { bg: '#111111', text: '#FBCD00' },
  twitch:           { bg: '#9146FF', text: '#fff' },
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
    <section className="mb-12 md:mb-20 stagger-enter" style={{ animationDelay: '300ms' }}>
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
              className="flex flex-col items-center justify-center text-center rounded-2xl p-5 md:p-6 transition-transform hover:scale-[1.03] w-full"
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
                  className="w-10 h-10 object-contain"
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

          // Wrapper: link or plain div
          return isDisabled ? (
            <div
              key={platform.id}
              className="md:w-[calc(33.333%-14px)]"
              style={{ width: 'calc(50% - 8px)' }}
            >
              {card}
            </div>
          ) : (
            <a
              key={platform.id}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="md:w-[calc(33.333%-14px)] no-underline"
              style={{ width: 'calc(50% - 8px)' }}
            >
              {card}
            </a>
          );
        })}
      </div>
    </section>
  );
}
