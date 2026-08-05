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
      <section className="mb-12 md:mb-20 stagger-enter" style={{ animationDelay: '200ms' }}>
        <h2 className="heading-exo section-heading">Alle Folgen</h2>
        <Panel>
          <p className="text-lg font-medium">Bisher keine Folgen verfügbar.</p>
        </Panel>
      </section>
    );
  }

  return (
    <section className="mb-12 md:mb-20 stagger-enter" style={{ animationDelay: '200ms' }}>
      <h2 className="heading-exo section-heading">Alle Folgen</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {episodes.map((ep, idx) => (
          <Panel key={ep.guid || idx} className="py-4 px-5">
            {/* Datum · Dauer */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-black/55 mb-1.5">
              {ep.pubDate && (
                <span>{format(parseISO(ep.pubDate), "d. MMM yyyy", { locale: de })}</span>
              )}
              {ep.duration && (
                <>
                  <span className="w-1 h-1 rounded-full bg-black/20" />
                  <span>{ep.duration}</span>
                </>
              )}
            </div>

            {/* Titel */}
            <h3 className="heading-exo text-base md:text-lg font-bold leading-snug line-clamp-2">
              {ep.episodeNum ? `${ep.episodeNum} - ${ep.title}` : ep.title}
            </h3>
          </Panel>
        ))}
      </div>
    </section>
  );
}
