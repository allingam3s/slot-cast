import { useState, useEffect } from "react";
import { SiteConfig, Platform, EpisodesData, LegalData } from "../types";

function dataUrl(file: string): string {
  const base = import.meta.env.BASE_URL ?? "/";
  const prefix = base.endsWith("/") ? base : base + "/";
  return `${prefix}data/${file}`;
}

export function useSiteConfig() {
  const [data, setData] = useState<SiteConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(dataUrl("config.json"))
      .then((r) => r.json())
      .then(setData)
      .catch((err) => console.error("Failed to load config:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}

export function usePlatforms() {
  const [data, setData] = useState<Platform[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(dataUrl("platforms.json"))
      .then((r) => r.json())
      .then(setData)
      .catch((err) => console.error("Failed to load platforms:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}

export function useEpisodes() {
  const [data, setData] = useState<EpisodesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(dataUrl("episodes.json"))
      .then((r) => r.json())
      .then(setData)
      .catch((err) => console.error("Failed to load episodes:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}

export function useLegal() {
  const [data, setData] = useState<LegalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(dataUrl("legal.json"))
      .then((r) => r.json())
      .then(setData)
      .catch((err) => console.error("Failed to load legal:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return { data, isLoading };
}
