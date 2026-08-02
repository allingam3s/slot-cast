import { useSiteConfig } from "../hooks/useData";

export function Header() {
  const { data: config, isLoading } = useSiteConfig();

  if (isLoading || !config) {
    return <div className="h-40 animate-pulse bg-white/10 rounded-2xl mb-8" />;
  }

  const hasCover = Boolean(config.coverUrl);
  const coverUrl = hasCover
    ? `${import.meta.env.BASE_URL}${config.coverUrl}`
    : null;

  return (
    <header
      className="relative flex flex-col items-center justify-center text-center stagger-enter overflow-hidden rounded-2xl mb-8"
      style={{
        animationDelay: '0ms',
        paddingTop:    'clamp(40px, 8vw, 96px)',
        paddingBottom: 'clamp(44px, 9vw, 104px)',
        paddingLeft:   'clamp(16px, 4vw, 48px)',
        paddingRight:  'clamp(16px, 4vw, 48px)',
        minHeight:     'clamp(260px, 40vw, 480px)',
        // Cover als Hintergrundbild; fehlt das Bild, greift der Seiten-Gradient
        ...(coverUrl ? {
          backgroundImage:    `url(${coverUrl})`,
          backgroundSize:     'cover',
          backgroundPosition: 'center top',
        } : {}),
      }}
    >
      {/* Overlay: oben dunkel für Lesbarkeit, unten fließt es in den Seiten-Gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: hasCover
            ? 'linear-gradient(to bottom, rgba(0,0,0,0.50) 0%, rgba(4,35,150,0.68) 80%, rgba(8,71,228,1) 100%)'
            : 'none',
        }}
      />

      {/* Inhalt liegt vor dem Overlay */}
      <div className="relative z-10 flex flex-col items-center w-full">
        {config.logoUrl && (
          <img
            src={`${import.meta.env.BASE_URL}${config.logoUrl}`}
            alt={`${config.title} Logo`}
            className="w-28 h-28 md:w-44 md:h-44 object-contain mb-6 md:mb-8"
            style={{ filter: 'drop-shadow(0 3px 12px rgba(0,0,0,0.55))' }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <h1
          className="heading-exo text-5xl md:text-7xl font-bold text-white mb-4"
          style={{ textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
        >
          SLOT-CAST
        </h1>
        <p
          className="text-xl md:text-2xl text-white/90 font-medium"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
        >
          Der all_in_gam3s Podcast
        </p>
      </div>
    </header>
  );
}
