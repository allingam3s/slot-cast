import { useSiteConfig } from "../hooks/useData";
import { Panel } from "./Panel";

export function AdditionalLinks() {
  const { data: config, isLoading } = useSiteConfig();

  if (isLoading || !config) return null;
  if (!config.socialLinks.beacons && !config.socialLinks.twitch) return null;

  return (
    <section className="mb-12 md:mb-20 stagger-enter" style={{ animationDelay: '400ms' }}>
      <h2 className="heading-exo section-heading">Auch auf</h2>
      
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {config.socialLinks.beacons && (
          <Panel 
            as="a" 
            href={config.socialLinks.beacons}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 py-4 md:py-6"
          >
            <img 
              src={`${import.meta.env.BASE_URL}icons/beacons.svg`} 
              alt="Beacons"
              className="w-10 h-10 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="font-bold text-lg md:text-xl">Beacons</span>
          </Panel>
        )}
        
        {config.socialLinks.twitch && (
          <Panel 
            as="a" 
            href={config.socialLinks.twitch}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 py-4 md:py-6"
          >
            <img 
              src={`${import.meta.env.BASE_URL}icons/twitch.svg`} 
              alt="Twitch"
              className="w-10 h-10 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="font-bold text-lg md:text-xl">Twitch</span>
          </Panel>
        )}
      </div>
    </section>
  );
}
