#!/usr/bin/env node
/**
 * fetch-rss.mjs
 * Holt den Podcast-RSS-Feed, verarbeitet ihn und speichert episodes.json.
 * Läuft bei GitHub Actions und lokal (node scripts/fetch-rss.mjs).
 *
 * Sicherheit: Die letzte erfolgreiche episodes.json wird NIE gelöscht,
 * wenn ein Fehler auftritt. Bei Fehlern bleibt die vorherige Datei erhalten.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Pfade
const OUTPUT_FILE = join(__dirname, '..', 'artifacts', 'slotcast-web', 'public', 'data', 'episodes.json');
const BACKUP_FILE = OUTPUT_FILE + '.backup';
const CONFIG_FILE = join(__dirname, '..', 'artifacts', 'slotcast-web', 'public', 'data', 'config.json');

// RSS-URL aus config.json lesen, Fallback auf bekannte URL
let RSS_URL = 'https://anchor.fm/s/11248c624/podcast/rss';
try {
  const config = JSON.parse(readFileSync(CONFIG_FILE, 'utf-8'));
  if (config.rssUrl) RSS_URL = config.rssUrl;
} catch {
  // config.json nicht vorhanden – Fallback verwenden
}

/**
 * Einfacher XML-Tag-Extraktor (kein externer Parser nötig)
 */
function extractTag(xml, tag, defaultValue = '') {
  const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(pattern);
  if (!match) return defaultValue;
  return match[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function extractAttr(xml, tag, attr, defaultValue = '') {
  const pattern = new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']*)["']`, 'i');
  const match = xml.match(pattern);
  return match ? match[1].trim() : defaultValue;
}

function extractAllTags(xml, tag) {
  const results = [];
  const pattern = new RegExp(`<${tag}[\\s>]([\\s\\S]*?)<\\/${tag}>`, 'gi');
  let match;
  while ((match = pattern.exec(xml)) !== null) {
    results.push(match[1]);
  }
  return results;
}

function formatDuration(durationStr) {
  if (!durationStr) return null;
  // Bereits HH:MM:SS oder MM:SS
  if (/^\d+:\d+(:\d+)?$/.test(durationStr)) return durationStr;
  // Sekunden als Zahl
  const secs = parseInt(durationStr, 10);
  if (!isNaN(secs)) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${m}:${String(s).padStart(2, '0')}`;
  }
  return durationStr;
}

function parseEpisode(itemXml, index, totalItems) {
  // Episode-Nummer: itunes:episode, dann aus Titel extrahieren, dann Rückwärts-Index
  let episodeNum = extractTag(itemXml, 'itunes:episode');
  const title = extractTag(itemXml, 'title') || `Episode ${totalItems - index}`;

  if (!episodeNum) {
    const numMatch = title.match(/^#?(\d+)[^\d]/);
    if (numMatch) episodeNum = numMatch[1];
  }

  const pubDateStr = extractTag(itemXml, 'pubDate');
  const pubDate = pubDateStr ? new Date(pubDateStr).toISOString() : null;

  // URL: enclosure-URL oder link
  let url = extractAttr(itemXml, 'enclosure', 'url');
  if (!url) url = extractTag(itemXml, 'link') || '';

  // Beschreibung: itunes:summary oder description
  let description = extractTag(itemXml, 'itunes:summary');
  if (!description) description = extractTag(itemXml, 'description');

  // Bild: itunes:image oder channel-Bild (wird später gesetzt)
  const imageHref = extractAttr(itemXml, 'itunes:image', 'href') || '';

  const durationRaw = extractTag(itemXml, 'itunes:duration');
  const duration = formatDuration(durationRaw);

  const season = extractTag(itemXml, 'itunes:season') || null;
  const explicit = extractTag(itemXml, 'itunes:explicit') || 'no';
  const guid = extractTag(itemXml, 'guid') || url;

  return {
    guid,
    episodeNum: episodeNum || null,
    title,
    description: description || '',
    pubDate,
    url,
    duration,
    imageUrl: imageHref || null,
    season,
    explicit: explicit === 'yes' || explicit === 'true'
  };
}

async function fetchRSS() {
  console.log(`\nSLOT-CAST RSS-Fetch gestartet`);
  console.log(`Feed-URL: ${RSS_URL}`);
  console.log(`Ausgabe:  ${OUTPUT_FILE}`);
  console.log('');

  // Sicherheitskopie der aktuellen episodes.json
  if (existsSync(OUTPUT_FILE)) {
    copyFileSync(OUTPUT_FILE, BACKUP_FILE);
    console.log('Sicherheitskopie der aktuellen episodes.json erstellt.');
  }

  let xml;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    const response = await fetch(RSS_URL, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SLOT-CAST-RSSFetcher/1.0 (+https://github.com/all_in_gam3s)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP-Fehler: ${response.status} ${response.statusText}`);
    }
    xml = await response.text();
    console.log(`RSS-Feed erfolgreich abgerufen (${xml.length} Zeichen).`);
  } catch (err) {
    console.error(`FEHLER beim Abrufen des RSS-Feeds: ${err.message}`);
    console.error('Die vorhandene episodes.json wird NICHT verändert.');
    process.exit(1);
  }

  // Channel-Daten extrahieren
  const channelMatch = xml.match(/<channel[^>]*>([\s\S]*?)<\/channel>/i);
  const channelXml = channelMatch ? channelMatch[1] : xml;

  const channelTitle = extractTag(channelXml, 'title');
  const channelDescription = extractTag(channelXml, 'description');
  const channelImageUrl =
    extractAttr(channelXml, 'itunes:image', 'href') ||
    extractTag(channelXml, 'url') || // <image><url>...
    '';
  const channelLink = extractTag(channelXml, 'link');
  const channelAuthor = extractTag(channelXml, 'itunes:author');
  const channelLanguage = extractTag(channelXml, 'language') || 'de';

  // Alle <item>-Blöcke
  const itemMatches = extractAllTags(xml, 'item');
  console.log(`${itemMatches.length} Episoden im Feed gefunden.`);

  if (itemMatches.length === 0) {
    console.error('FEHLER: Keine Episoden im RSS-Feed gefunden. Die vorhandene episodes.json wird NICHT verändert.');
    process.exit(1);
  }

  const episodes = itemMatches
    .map((itemXml, idx) => parseEpisode(itemXml, idx, itemMatches.length))
    .filter(ep => ep.title)
    .map(ep => ({
      ...ep,
      imageUrl: ep.imageUrl || channelImageUrl || null
    }));

  // Nach pubDate absteigend sortieren (neueste zuerst)
  episodes.sort((a, b) => {
    if (!a.pubDate && !b.pubDate) return 0;
    if (!a.pubDate) return 1;
    if (!b.pubDate) return -1;
    return new Date(b.pubDate) - new Date(a.pubDate);
  });

  const output = {
    lastUpdated: new Date().toISOString(),
    feedTitle: channelTitle,
    feedDescription: channelDescription,
    feedImageUrl: channelImageUrl,
    feedLink: channelLink,
    feedAuthor: channelAuthor,
    feedLanguage: channelLanguage,
    episodeCount: episodes.length,
    episodes
  };

  // Verzeichnis sicherstellen
  const dir = dirname(OUTPUT_FILE);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  // Schreiben
  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf-8');

  // Backup entfernen (alles ok)
  if (existsSync(BACKUP_FILE)) {
    try {
      const { unlinkSync } = await import('node:fs');
      unlinkSync(BACKUP_FILE);
    } catch { /* ignorieren */ }
  }

  console.log(`\nErfolgreich: ${episodes.length} Episoden gespeichert.`);
  console.log(`Neueste:     "${episodes[0]?.title}" (${episodes[0]?.pubDate?.split('T')[0] ?? 'kein Datum'})`);
  console.log(`Älteste:     "${episodes[episodes.length - 1]?.title}" (${episodes[episodes.length - 1]?.pubDate?.split('T')[0] ?? 'kein Datum'})`);
  console.log('\nDone.');
}

fetchRSS().catch(err => {
  console.error('Unerwarteter Fehler:', err);
  process.exit(1);
});
