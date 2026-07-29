import { Router, Request, Response } from 'express';
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..');
const DATA_DIR = path.join(ROOT, 'artifacts', 'slotcast-web', 'public', 'data');
const BACKUP_DIR = path.join(ROOT, 'packages', 'creator-app', 'backups');

const router = Router();

function formatTimestamp() {
  const now = new Date();
  return now.toISOString()
    .replace(/:/g, '-')
    .replace('T', '_')
    .replace(/\..+/, '');
}

// POST /api/backup/create – Lokale Sicherung der JSON-Dateien erstellen
router.post('/create', (_req: Request, res: Response) => {
  try {
    if (!existsSync(BACKUP_DIR)) {
      mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const timestamp = formatTimestamp();
    const backupFolder = path.join(BACKUP_DIR, `backup_${timestamp}`);
    mkdirSync(backupFolder, { recursive: true });

    const files = ['config.json', 'platforms.json', 'episodes.json', 'legal.json'];
    const backedUp: string[] = [];

    for (const file of files) {
      const src = path.join(DATA_DIR, file);
      if (existsSync(src)) {
        const content = readFileSync(src, 'utf-8');
        writeFileSync(path.join(backupFolder, file), content, 'utf-8');
        backedUp.push(file);
      }
    }

    // Backup-Index aktualisieren
    const indexPath = path.join(BACKUP_DIR, 'backups.json');
    let index: BackupEntry[] = [];
    if (existsSync(indexPath)) {
      try { index = JSON.parse(readFileSync(indexPath, 'utf-8')); } catch { index = []; }
    }
    const entry: BackupEntry = {
      timestamp,
      folder: `backup_${timestamp}`,
      files: backedUp,
      createdAt: new Date().toISOString()
    };
    index.unshift(entry);
    // Maximal 20 Sicherungen behalten
    if (index.length > 20) index = index.slice(0, 20);
    writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf-8');

    res.json({
      success: true,
      message: `Sicherung erstellt: ${backedUp.length} Dateien gespeichert.`,
      backup: entry
    });
  } catch (err) {
    res.status(500).json({ error: 'Sicherung konnte nicht erstellt werden.', detail: String(err) });
  }
});

interface BackupEntry {
  timestamp: string;
  folder: string;
  files: string[];
  createdAt: string;
}

// GET /api/backup/list – Liste aller Sicherungen
router.get('/list', (_req: Request, res: Response) => {
  try {
    const indexPath = path.join(BACKUP_DIR, 'backups.json');
    if (!existsSync(indexPath)) {
      res.json({ backups: [] });
      return;
    }
    const backups: BackupEntry[] = JSON.parse(readFileSync(indexPath, 'utf-8'));
    res.json({ backups });
  } catch (err) {
    res.status(500).json({ error: 'Sicherungsliste konnte nicht geladen werden.', detail: String(err) });
  }
});

// POST /api/backup/restore/:timestamp – Sicherung wiederherstellen
router.post('/restore/:timestamp', (req: Request, res: Response) => {
  try {
    const { timestamp } = req.params;
    const backupFolder = path.join(BACKUP_DIR, `backup_${timestamp}`);

    if (!existsSync(backupFolder)) {
      res.status(404).json({ error: `Sicherung "${timestamp}" wurde nicht gefunden.` });
      return;
    }

    const files = readdirSync(backupFolder);
    const restored: string[] = [];
    for (const file of files) {
      const src = path.join(backupFolder, file);
      const dest = path.join(DATA_DIR, file);
      const content = readFileSync(src, 'utf-8');
      writeFileSync(dest, content, 'utf-8');
      restored.push(file);
    }

    res.json({
      success: true,
      message: `Sicherung "${timestamp}" wurde wiederhergestellt. ${restored.length} Dateien geladen.`,
      files: restored
    });
  } catch (err) {
    res.status(500).json({ error: 'Sicherung konnte nicht wiederhergestellt werden.', detail: String(err) });
  }
});

export default router;
