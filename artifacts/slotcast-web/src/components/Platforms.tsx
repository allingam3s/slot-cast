import { usePlatforms } from "../hooks/useData";
import { Panel } from "./Panel";
import { cn } from "@/lib/utils";

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
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {platforms.map((platform, idx) => {
          const isDisabled = platform.incomplete || !platform.url;
          
          const CardContent = (
            <>
              <div className="mb-4 relative">
                <img 
                  src={`${import.meta.env.BASE_URL}${platform.icon}`} 
                  alt={platform.name}
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <h3 className="font-bold text-lg leading-tight">{platform.name}</h3>
              {isDisabled && (
                <div className="mt-2 text-xs font-bold text-black/50 bg-black/5 inline-block px-2 py-1 rounded-md">
                  bald verfügbar
                </div>
              )}
            </>
          );

          if (isDisabled) {
            return (
              <Panel 
                key={platform.id} 
                className="opacity-65 cursor-default hover:transform-none hover:shadow-none"
              >
                {CardContent}
              </Panel>
            );
          }

          return (
            <Panel 
              key={platform.id} 
              as="a" 
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col"
            >
              {CardContent}
            </Panel>
          );
        })}
      </div>
    </section>
  );
}
