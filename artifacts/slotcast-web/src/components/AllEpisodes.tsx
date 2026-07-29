import { useEpisodes } from "../hooks/useData";
import { Panel } from "./Panel";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

export function AllEpisodes() {
  const { data, isLoading } = useEpisodes();

  if (isLoading) {
    return <div className="h-64 animate-pulse bg-white/10 rounded-2xl mb-16" />;
  }

  const episodes = data?.episodes || [];
  
  if (episodes.length === 0) {
    return (
      <section className="mb-20 stagger-enter" style={{ animationDelay: '200ms' }}>
        <h2 className="heading-exo section-heading">Alle Folgen</h2>
        <Panel>
          <p className="text-lg font-medium">Bisher keine Folgen verfügbar.</p>
        </Panel>
      </section>
    );
  }

  return (
    <section className="mb-20 stagger-enter" style={{ animationDelay: '200ms' }}>
      <h2 className="heading-exo section-heading">Alle Folgen</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {episodes.map((ep, idx) => (
          <Panel key={ep.guid || idx} className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-black/60 mb-2">
              {ep.pubDate && (
                <span>{format(parseISO(ep.pubDate), "d. MMM yyyy", { locale: de })}</span>
              )}
              {ep.duration && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
                  <span>{ep.duration}</span>
                </>
              )}
            </div>
            
            <h3 className="heading-exo text-xl font-bold mb-2 line-clamp-2 leading-snug">
              {ep.episodeNum ? `${ep.episodeNum} - ${ep.title}` : ep.title}
            </h3>
            
            <p className="text-sm text-black/80 mb-6 line-clamp-2 flex-grow">
              {ep.description}
            </p>
            
            <div className="mt-auto pt-2">
              <a 
                href={ep.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-bold hover:underline"
              >
                Jetzt anhören →
              </a>
            </div>
          </Panel>
        ))}
      </div>
    </section>
  );
}
