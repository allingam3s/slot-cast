import { Router, Request, Response } from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..');

const PLATFORMS_PATH = path.join(ROOT, 'artifacts', 'slotcast-web', 'public', 'data', 'platforms.json');

const router = Router();

function readPlatforms(): Platform[] {
  if (!existsSync(PLATFORMS_PATH)) return [];
  return JSON.parse(readFileSync(PLATFORMS_PATH, 'utf-8'));
}

interface Platform {
  id: string;
  name: string;
  icon: string;
  url: string;
  enabled: boolean;
  order: number;
  incomplete: boolean;
}

// GET /api/platforms – Plattformen lesen
router.get('/', (_req: Request, res: Response) => {
  try {
    res.json(readPlatforms());
  } catch (err) {
    res.status(500).json({ error: 'Plattformen konnten nicht gelesen werden.', detail: String(err) });
  }
});

// POST /api/platforms – Alle Plattformen speichern (vollständiges Array)
router.post('/', (req: Request, res: Response) => {
  try {
    const platforms: Platform[] = req.body;
    if (!Array.isArray(platforms)) {
      res.status(400).json({ error: 'Ungültiges Format. Erwartet wird ein Array von Plattformen.' });
      return;
    }
    // Reihenfolge normalisieren
    const normalized = platforms.map((p, idx) => ({ ...p, order: idx + 1 }));
    writeFileSync(PLATFORMS_PATH, JSON.stringify(normalized, null, 2), 'utf-8');
    res.json({ success: true, message: 'Plattformen wurden gespeichert.', platforms: normalized });
  } catch (err) {
    res.status(500).json({ error: 'Plattformen konnten nicht gespeichert werden.', detail: String(err) });
  }
});

// POST /api/platforms/add – Neue Plattform hinzufügen
router.post('/add', (req: Request, res: Response) => {
  try {
    const platforms = readPlatforms();
    const { name, url, icon } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Der Plattformname darf nicht leer sein.' });
      return;
    }
    const newPlatform: Platform = {
      id: name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now(),
      name: name.trim(),
      icon: icon || '',
      url: url || '',
      enabled: true,
      order: platforms.length + 1,
      incomplete: !url
    };
    platforms.push(newPlatform);
    writeFileSync(PLATFORMS_PATH, JSON.stringify(platforms, null, 2), 'utf-8');
    res.json({ success: true, platform: newPlatform });
  } catch (err) {
    res.status(500).json({ error: 'Plattform konnte nicht hinzugefügt werden.', detail: String(err) });
  }
});

// DELETE /api/platforms/:id – Plattform löschen
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const platforms = readPlatforms();
    const filtered = platforms.filter(p => p.id !== req.params.id);
    if (filtered.length === platforms.length) {
      res.status(404).json({ error: `Plattform "${req.params.id}" wurde nicht gefunden.` });
      return;
    }
    writeFileSync(PLATFORMS_PATH, JSON.stringify(filtered, null, 2), 'utf-8');
    res.json({ success: true, message: 'Plattform wurde gelöscht.' });
  } catch (err) {
    res.status(500).json({ error: 'Plattform konnte nicht gelöscht werden.', detail: String(err) });
  }
});

export default router;
