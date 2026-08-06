import { Router, Request, Response } from 'express';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..');
const RSS_SCRIPT = path.join(ROOT, 'scripts', 'fetch-rss.mjs');
const EPISODES_FILE = path.join(ROOT, 'artifacts', 'slotcast-web', 'public', 'data', 'episodes.json');

const router = Router();

/**
 * Führt fetch-rss.mjs aus, wenn episodes.json fehlt, leer ist oder älter als 24h.
 * Läuft im Hintergrund – blockiert den Serverstart nicht.
 */
export function autoFetchRssIfStale(): void {
  let needsFetch = true;
  try {
    const data = JSON.parse(fs.readFileSync(EPISODES_FILE, 'utf-8'));
    if (data.lastUpdated && Array.isArray(data.episodes) && data.episodes.length > 0) {
      const ageMs = Date.now() - new Date(data.lastUpdated).getTime();
      if (ageMs < 24 * 60 * 60 * 1000) needsFetch = false;
    }
  } catch {
    // Datei fehlt oder ist ungültig – Fetch nötig
  }

  if (!needsFetch) {
    console.log('RSS: episodes.json ist aktuell (< 24h) – kein automatischer Fetch nötig.');
    return;
  }

  console.log('RSS: episodes.json fehlt oder ist älter als 24h – starte automatischen RSS-Fetch...');
  execFile('node', [RSS_SCRIPT], { cwd: ROOT }, (error, stdout, stderr) => {
    if (error) {
      console.error('RSS: Automatischer Fetch fehlgeschlagen:', stderr || error.message);
      console.error('RSS: Vorhandene episodes.json bleibt unverändert. Manuell über "Veröffentlichen → RSS-Feed abrufen" erneut versuchen.');
      return;
    }
    console.log('RSS: Automatischer Fetch erfolgreich abgeschlossen.');
  });
}

// GET /api/rss/episodes – gespeicherte Episodendaten liefern
router.get('/episodes', (_req: Request, res: Response) => {
  try {
    const data = JSON.parse(fs.readFileSync(EPISODES_FILE, 'utf-8'));
    res.json(data);
  } catch {
    res.json({ lastUpdated: null, episodes: [] });
  }
});

// POST /api/rss/check – RSS-URL auf Erreichbarkeit testen
router.post('/check', async (req: Request, res: Response) => {
  const { url } = req.body;
  if (!url) {
    res.status(400).json({ ok: false, error: 'Keine URL angegeben.' });
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'SLOT-CAST-Creator/1.0' }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      res.json({ ok: false, error: `Server antwortete mit HTTP ${response.status} ${response.statusText}. Bitte prüfe die URL.` });
      return;
    }

    const text = await response.text();
    const hasRssContent = text.includes('<rss') || text.includes('<feed') || text.includes('<channel');
    if (!hasRssContent) {
      res.json({ ok: false, error: 'Die URL ist erreichbar, aber der Inhalt sieht nicht wie ein RSS-Feed aus.' });
      return;
    }

    const itemCount = (text.match(/<item[\s>]/gi) || []).length;
    res.json({ ok: true, message: `RSS-Feed erreichbar. ${itemCount} Episoden gefunden.`, itemCount });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('aborted') || msg.includes('abort')) {
      res.json({ ok: false, error: 'Zeitüberschreitung: Der RSS-Feed hat nicht innerhalb von 15 Sekunden geantwortet.' });
    } else if (msg.includes('ENOTFOUND') || msg.includes('getaddrinfo')) {
      res.json({ ok: false, error: 'Die URL konnte nicht aufgelöst werden. Ist die Internetverbindung aktiv?' });
    } else {
      res.json({ ok: false, error: `Verbindungsfehler: ${msg}` });
    }
  }
});

// POST /api/rss/fetch – RSS-Feed lokal aktualisieren (startet fetch-rss.mjs)
router.post('/fetch', (req: Request, res: Response) => {
  execFile('node', [RSS_SCRIPT], { cwd: ROOT }, (error, stdout, stderr) => {
    if (error) {
      console.error('RSS-Fetch Fehler:', stderr || error.message);
      res.status(500).json({
        ok: false,
        error: 'RSS-Feed konnte nicht abgerufen werden.',
        detail: stderr || error.message
      });
      return;
    }
    res.json({ ok: true, message: 'RSS-Feed erfolgreich aktualisiert.', output: stdout });
  });
});

export default router;
