import { useSiteConfig } from "../hooks/useData";

export function Header() {
  const { data: config, isLoading } = useSiteConfig();

  if (isLoading || !config) {
    return <div className="h-40 animate-pulse bg-white/10 rounded-2xl mb-16" />;
  }

  return (
    <header className="flex flex-col items-center justify-center pt-24 pb-16 text-center stagger-enter" style={{ animationDelay: '0ms' }}>
      {config.logoUrl && (
        <img 
          src={`${import.meta.env.BASE_URL}${config.logoUrl}`} 
          alt={`${config.title} Logo`}
          className="w-32 h-32 md:w-48 md:h-48 object-contain mb-8"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
      <h1 className="heading-exo text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-sm">
        SLOT-CAST
      </h1>
      <p className="text-xl md:text-2xl text-white/90 font-medium">
        Der all_in_gam3s Podcast
      </p>
    </header>
  );
}
