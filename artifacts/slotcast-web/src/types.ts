export interface SiteConfig {
  title: string;
  shortTitle: string;
  description: string;
  author: string;
  language: string;
  rssUrl: string;
  baseUrl: string;
  logoUrl: string;
  coverUrl: string;
  socialLinks: {
    beacons: string;
    twitch: string;
  };
  seo: {
    keywords: string;
    twitterHandle: string;
  };
}

export interface Platform {
  id: string;
  name: string;
  icon: string;
  url: string;
  enabled: boolean;
  order: number;
  incomplete: boolean;
}

export interface Episode {
  guid: string;
  episodeNum: string | null;
  title: string;
  description: string;
  pubDate: string | null;
  url: string;
  duration: string | null;
  imageUrl: string | null;
  season: string | null;
  explicit: boolean;
}

export interface EpisodesData {
  lastUpdated: string | null;
  feedTitle?: string;
  feedImageUrl?: string;
  episodeCount?: number;
  episodes: Episode[];
}

export interface LegalSection {
  heading: string;
  text: string;
}

export interface LegalPage {
  title: string;
  content: LegalSection[];
}

export interface LegalData {
  impressum: LegalPage;
  datenschutz: LegalPage;
}
