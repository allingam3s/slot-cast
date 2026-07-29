import { Router, Request, Response } from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..');

const CONFIG_PATH = path.join(ROOT, 'artifacts', 'slotcast-web', 'public', 'data', 'config.json');

const router = Router();

function readConfig() {
  if (!existsSync(CONFIG_PATH)) {
    return {
      title: 'SLOT-CAST | Der all_in_gam3s Podcast',
      shortTitle: 'SLOT-CAST',
      description: '',
      author: 'all_in_gam3s',
      language: 'de',
      rssUrl: 'https://anchor.fm/s/11248c624/podcast/rss',
      baseUrl: '',
      logoUrl: 'images/logo.png',
      coverUrl: 'images/cover.jpg',
      socialLinks: { beacons: 'https://beacons.ai/all_in_gam3s', twitch: 'https://twitch.tv/all_in_gam3s' },
      seo: { keywords: 'podcast, gaming, all_in_gam3s', twitterHandle: '@all_in_gam3s' }
    };
  }
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
}

// GET /api/config – Aktuelle Konfiguration lesen
router.get('/', (_req: Request, res: Response) => {
  try {
    res.json(readConfig());
  } catch (err) {
    res.status(500).json({ error: 'Konfigurationsdatei konnte nicht gelesen werden.', detail: String(err) });
  }
});

// POST /api/config – Konfiguration speichern
router.post('/', (req: Request, res: Response) => {
  try {
    const current = readConfig();
    const updated = { ...current, ...req.body };

    // Pflichtfelder validieren
    if (!updated.title || typeof updated.title !== 'string') {
      res.status(400).json({ error: 'Der Podcast-Titel darf nicht leer sein.' });
      return;
    }
    if (!updated.rssUrl || typeof updated.rssUrl !== 'string') {
      res.status(400).json({ error: 'Die RSS-URL darf nicht leer sein.' });
      return;
    }

    writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2), 'utf-8');
    res.json({ success: true, message: 'Einstellungen wurden gespeichert.' });
  } catch (err) {
    res.status(500).json({ error: 'Einstellungen konnten nicht gespeichert werden.', detail: String(err) });
  }
});

export default router;
