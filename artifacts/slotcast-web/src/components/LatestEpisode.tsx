import { useEpisodes } from "../hooks/useData";
import { Panel } from "./Panel";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

export function LatestEpisode() {
  const { data, isLoading } = useEpisodes();

  if (isLoading) {
    return <div className="h-64 animate-pulse bg-white/10 rounded-2xl mb-16" />;
  }

  const episodes = data?.episodes || [];
  
  const sortedEpisodes = [...episodes].sort((a, b) => {
    if (!a.pubDate) return 1;
    if (!b.pubDate) return -1;
    return parseISO(b.pubDate).getTime() - parseISO(a.pubDate).getTime();
  });

  const latest = sortedEpisodes[0];

  return (
    <section className="mb-20 stagger-enter" style={{ animationDelay: '100ms' }}>
      <h2 className="heading-exo section-heading">Hör jetzt in die neueste Folge rein!</h2>
      
      {!latest ? (
        <Panel>
          <p className="text-lg font-medium">
            Neue Folgen kommen bald – abonniere uns auf deiner Lieblingsplattform!
          </p>
        </Panel>
      ) : (
        <Panel>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-black/60 mb-2">
                {latest.pubDate && (
                  <span>{format(parseISO(latest.pubDate), "d. MMMM yyyy", { locale: de })}</span>
                )}
                {latest.duration && (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
                    <span>{latest.duration}</span>
                  </>
                )}
              </div>
              
              <h3 className="heading-exo text-2xl md:text-3xl font-bold mb-4 leading-tight">
                {latest.episodeNum ? `${latest.episodeNum} - ${latest.title}` : latest.title}
              </h3>
              
              <p className="text-black/80 leading-relaxed mb-6 max-w-3xl">
                {latest.description.length > 200 
                  ? `${latest.description.substring(0, 200)}...` 
                  : latest.description}
              </p>
              
              <a 
                href={latest.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-black text-[#B7F3E8] px-6 py-3 rounded-full font-bold text-sm hover:bg-black/90 transition-colors"
              >
                Jetzt anhören
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </Panel>
      )}
    </section>
  );
}
