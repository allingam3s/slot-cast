import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSiteConfig } from "../hooks/useData";

/** Docked logo distance from viewport top (px) */
const DOCK_TOP = 10;
/** Scale of the logo when fully docked */
const DOCK_SCALE = 0.5;

export function Header() {
  const { data: config, isLoading } = useSiteConfig();

  const placeholderRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const placeholder = placeholderRef.current;
    const logo = logoRef.current;
    if (!placeholder || !logo) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = placeholder.getBoundingClientRect();
      // Absolute document offset of the placeholder top
      const offsetTop = rect.top + window.scrollY;
      const dockDistance = Math.max(offsetTop - DOCK_TOP, 1);
      const progress = Math.min(Math.max(window.scrollY / dockDistance, 0), 1);

      const scale = 1 - (1 - DOCK_SCALE) * progress;
      const top = Math.max(rect.top, DOCK_TOP);

      logo.style.top = `${top}px`;
      logo.style.width = `${rect.width}px`;
      logo.style.height = `${rect.height}px`;
      logo.style.transform = `translateX(-50%) scale(${scale})`;
    };

    const onScrollOrResize = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    // Späte Layout-Verschiebungen (z. B. Font-Load) ebenfalls abfangen
    const ro = new ResizeObserver(onScrollOrResize);
    ro.observe(placeholder);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isLoading, config?.logoUrl]);

  if (isLoading || !config) {
    return <div className="h-40 animate-pulse bg-white/10 rounded-2xl mb-6" />;
  }

  const hasCover = Boolean(config.coverUrl);
  const coverUrl = hasCover
    ? `${import.meta.env.BASE_URL}${config.coverUrl}`
    : null;

  return (
    <header
      className="relative flex flex-col items-center justify-center text-center stagger-enter overflow-hidden rounded-2xl mb-6"
      style={{
        animationDelay: '0ms',
        paddingTop:    'clamp(28px, 6vw, 64px)',
        paddingBottom: 'clamp(32px, 6.5vw, 72px)',
        paddingLeft:   'clamp(16px, 4vw, 48px)',
        paddingRight:  'clamp(16px, 4vw, 48px)',
        minHeight:     'clamp(220px, 32vw, 380px)',
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
          background: coverUrl
            ? 'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 45%, rgba(8,71,228,0.55) 100%)'
            : 'none',
        }}
      />

      {/* Inhalt liegt vor dem Overlay */}
      <div className="relative z-10 flex flex-col items-center w-full">
        {config.logoUrl && (
          <>
            {/* Platzhalter reserviert den Platz des Logos im Hero-Layout */}
            <div
              ref={placeholderRef}
              aria-hidden="true"
              className="w-24 h-24 md:w-36 md:h-36 mb-4 md:mb-6"
            />
            {/*
              Das eigentliche Logo ist fixed und skaliert beim Scrollen bis zum Dock.
              Per Portal direkt in <body>, damit weder die Enter-Animation (transform
              erzeugt einen eigenen Containing Block für fixed) noch overflow-hidden
              des Headers die Fixierung/Sichtbarkeit brechen.
            */}
            {createPortal(
              <img
                ref={logoRef}
                src={`${import.meta.env.BASE_URL}${config.logoUrl}`}
                alt={`${config.title} Logo`}
                className="fixed left-1/2 z-50 object-contain pointer-events-none select-none"
                style={{
                  transformOrigin: 'top center',
                  transform: 'translateX(-50%)',
                  filter: 'drop-shadow(0 3px 12px rgba(0,0,0,0.55))',
                  willChange: 'transform, top',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />,
              document.body
            )}
          </>
        )}
        <h1
          className="heading-exo text-4xl md:text-6xl font-bold text-white mb-3"
          style={{ textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}
        >
          SLOT-CAST
        </h1>
        <p
          className="text-lg md:text-xl text-white/90 font-medium"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
        >
          Der all_in_gam3s Podcast
        </p>

        {/* Dezenter Hinweis: alle Plattformen weiter unten */}
        <div className="mt-5 md:mt-7 flex flex-col items-center gap-0.5 text-white/80 text-sm md:text-base font-medium"
          style={{ textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}
        >
          <span>Alle Plattformen findest du weiter unten</span>
          <svg
            className="w-5 h-5 scroll-hint-arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </header>
  );
}
