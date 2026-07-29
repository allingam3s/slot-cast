import { Router, Request, Response } from 'express';
import { execFile } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..');
const RSS_SCRIPT = path.join(ROOT, 'scripts', 'fetch-rss.mjs');

const router = Router();

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
