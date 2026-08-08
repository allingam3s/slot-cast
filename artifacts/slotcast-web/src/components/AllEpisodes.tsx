import { useState } from "react";
import { useEpisodes } from "../hooks/useData";
import { Panel } from "./Panel";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";

export function AllEpisodes() {
  const { data, isLoading } = useEpisodes();
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return <div className="h-24 animate-pulse bg-white/10 rounded-2xl mb-10" />;
  }

  const episodes = data?.episodes || [];

  if (episodes.length === 0) {
    return (
      <section className="mb-10 md:mb-14 stagger-enter" style={{ animationDelay: '200ms' }}>
        <h2 className="heading-exo section-heading">Alle Folgen</h2>
        <Panel>
          <p className="text-base font-medium">Bisher keine Folgen verfügbar.</p>
        </Panel>
      </section>
    );
  }

  const count = episodes.length;
  const label = `Alle Folgen im Überblick · ${count} ${count === 1 ? "Folge" : "Folgen"}`;

  return (
    <section className="mb-10 md:mb-14 stagger-enter" style={{ animationDelay: '200ms' }}>
      {/* Toggle-Kopf */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="all-episodes-list"
        className="panel w-full flex items-center justify-between gap-3 text-left py-3.5 px-4 md:py-4 md:px-5 cursor-pointer"
      >
        <span className="heading-exo text-base md:text-lg font-bold">
          {label}
        </span>
        <svg
          className="w-5 h-5 shrink-0 transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
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
      </button>

      {/* Weich auf-/zuklappender Bereich */}
      <div
        id="all-episodes-list"
        className={`collapse-grid ${open ? "collapse-open" : ""}`}
        aria-hidden={!open}
      >
        <div className="collapse-inner">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-3 pt-3">
            {episodes.map((ep, idx) => (
              <Panel key={ep.guid || idx} className="py-3 px-4">
                {/* Datum · Dauer */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-black/55 mb-1">
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
                <h3 className="heading-exo text-sm md:text-base font-bold leading-snug line-clamp-2">
                  {ep.episodeNum ? `${ep.episodeNum} - ${ep.title}` : ep.title}
                </h3>
              </Panel>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
