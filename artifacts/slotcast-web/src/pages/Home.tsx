import { useEffect } from "react";
import { Header } from "../components/Header";
import { LatestEpisode } from "../components/LatestEpisode";
import { AllEpisodes } from "../components/AllEpisodes";
import { Platforms } from "../components/Platforms";
import { AdditionalLinks } from "../components/AdditionalLinks";
import { Footer } from "../components/Footer";
import { useSiteConfig, useEpisodes } from "../hooks/useData";

export default function Home() {
  const { data: config } = useSiteConfig();
  const { data: episodesData } = useEpisodes();

  useEffect(() => {
    // Add SEO Meta tags programmatically if not fully matching index.html
    if (config) {
      document.title = config.title;
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute("content", config.description);
    }
  }, [config]);

  const episodes = episodesData?.episodes || [];
  const latestEpisode = episodes.length > 0 ? episodes[0] : null;

  return (
    <div className="page-bg">
      <div className="max-w-[900px] mx-auto px-5 md:px-10 pb-8 min-h-screen flex flex-col">
        {config && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "PodcastSeries",
                name: config.title,
                description: config.description,
                author: { "@type": "Person", name: config.author },
                inLanguage: config.language,
                webFeed: config.rssUrl,
              }),
            }}
          />
        )}
        
        {latestEpisode && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "PodcastEpisode",
                name: latestEpisode.title,
                description: latestEpisode.description,
                datePublished: latestEpisode.pubDate,
                url: latestEpisode.url,
                partOfSeries: {
                  "@type": "PodcastSeries",
                  name: config?.title || "SLOT-CAST",
                },
              }),
            }}
          />
        )}

        <Header />
        <main className="flex-grow">
          <LatestEpisode />
          <AllEpisodes />
          <Platforms />
          <AdditionalLinks />
        </main>
        <Footer />
      </div>
    </div>
  );
}
