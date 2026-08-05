import { useEpisodes } from "../hooks/useData";
import { Panel } from "./Panel";
import { AudioPreview } from "./AudioPreview";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

/** Strip HTML entities then HTML tags, collapse whitespace. */
function stripHtml(raw: string): string {
  return raw
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&amp;/g,  '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '…')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const TRUNCATE = 200;

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
    <section className="mb-12 md:mb-20 stagger-enter" style={{ animationDelay: '100ms' }}>
      <h2 className="heading-exo section-heading">Hör jetzt in die neueste Folge rein!</h2>

      {!latest ? (
        <Panel>
          <p className="text-lg font-medium">
            Neue Folgen kommen bald – abonniere uns auf deiner Lieblingsplattform!
          </p>
        </Panel>
      ) : (
        <Panel>
          {/* Meta: Datum + Dauer */}
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

          {/* Titel */}
          <h3 className="heading-exo text-2xl md:text-3xl font-bold mb-3 leading-tight">
            {latest.episodeNum ? `${latest.episodeNum} - ${latest.title}` : latest.title}
          </h3>

          {/* Beschreibung (bereinigt, ~2 Zeilen) */}
          <p className="text-black/80 leading-relaxed mb-4 max-w-3xl">
            {(() => {
              const clean = stripHtml(latest.description || '');
              return clean.length > TRUNCATE ? `${clean.substring(0, TRUNCATE)}…` : clean;
            })()}
          </p>

          {/* Eingebetteter Audioplayer – 60 s Hörprobe */}
          {latest.url && <AudioPreview url={latest.url} />}
        </Panel>
      )}
    </section>
  );
}
