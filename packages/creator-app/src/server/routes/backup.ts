import { Router, Request, Response } from 'express';
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..');
const DATA_DIR = path.resolve(path.join(ROOT, 'artifacts', 'slotcast-web', 'public', 'data'));
const BACKUP_DIR = path.resolve(path.join(ROOT, 'packages', 'creator-app', 'backups'));

const router = Router();

/**
 * Sicherheit: Timestamp-Format streng validieren.
 * Erlaubt sind ausschließlich Zeichen, die in ISO-Zeitstempeln vorkommen:
 * Ziffern, Bindestriche und Unterstriche.
 * "..", Schrägstriche, Backslashes und alle anderen Sonderzeichen werden abgelehnt.
 */
const SAFE_TIMESTAMP_RE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}_[0-9]{2}-[0-9]{2}-[0-9]{2}$/;

function validateTimestamp(ts: unknown): ts is string {
  return typeof ts === 'string' && SAFE_TIMESTAMP_RE.test(ts);
}

/**
 * Sicherheit: Prüft, ob ein aufgelöster Pfad innerhalb eines erlaubten
 * Basisverzeichnisses liegt (verhindert Path Traversal nach path.join).
 */
function isInsideDir(resolvedPath: string, baseDir: string): boolean {
  const normalBase = baseDir.endsWith(path.sep) ? baseDir : baseDir + path.sep;
  return resolvedPath.startsWith(normalBase) || resolvedPath === baseDir;
}

/**
 * Sicherheit: Dateinamen innerhalb eines Backup-Ordners validieren.
 * Erlaubt sind nur einfache Dateinamen ohne Verzeichniskomponenten.
 * "..", "/", "\" und alle anderen Pfad-Trennzeichen werden abgelehnt.
 */
const SAFE_FILENAME_RE = /^[a-zA-Z0-9_\-]+\.json$/;

function validateBackupFilename(filename: string): boolean {
  return SAFE_FILENAME_RE.test(filename) && !filename.includes('..') && !filename.includes('/') && !filename.includes('\\');
}

function formatTimestamp() {
  const now = new Date();
  return now.toISOString()
    .replace(/:/g, '-')
    .replace('T', '_')
    .replace(/\..+/, '');
}

interface BackupEntry {
  timestamp: string;
  folder: string;
  files: string[];
  createdAt: string;
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

    // Sicherheit 1: Timestamp-Format streng prüfen.
    // Nur "YYYY-MM-DD_HH-MM-SS" ist erlaubt. Alles andere wird sofort abgelehnt.
    if (!validateTimestamp(timestamp)) {
      res.status(400).json({
        error: 'Ungültiger Backup-Name. Nur Zeitstempel im Format YYYY-MM-DD_HH-MM-SS sind erlaubt.'
      });
      return;
    }

    // Sicherheit 2: Pfad aufbauen und anschließend prüfen, ob er
    // sich tatsächlich innerhalb von BACKUP_DIR befindet.
    const backupFolder = path.resolve(path.join(BACKUP_DIR, `backup_${timestamp}`));

    if (!isInsideDir(backupFolder, BACKUP_DIR)) {
      res.status(400).json({ error: 'Ungültiger Backup-Pfad.' });
      return;
    }

    if (!existsSync(backupFolder)) {
      res.status(404).json({ error: `Sicherung "${timestamp}" wurde nicht gefunden.` });
      return;
    }

    const files = readdirSync(backupFolder);
    const restored: string[] = [];
    const skipped: string[] = [];

    for (const file of files) {
      // Sicherheit 3: Dateinamen innerhalb des Backups validieren.
      // Nur einfache .json-Dateinamen sind erlaubt – keine Pfadkomponenten.
      if (!validateBackupFilename(file)) {
        skipped.push(file);
        continue;
      }

      const src = path.resolve(path.join(backupFolder, file));
      const dest = path.resolve(path.join(DATA_DIR, file));

      // Sicherheit 4: Auch Quell- und Zielpfad nach path.resolve prüfen.
      if (!isInsideDir(src, backupFolder) || !isInsideDir(dest, DATA_DIR)) {
        skipped.push(file);
        continue;
      }

      const content = readFileSync(src, 'utf-8');
      writeFileSync(dest, content, 'utf-8');
      restored.push(file);
    }

    res.json({
      success: true,
      message: `Sicherung "${timestamp}" wurde wiederhergestellt. ${restored.length} Dateien geladen.${skipped.length > 0 ? ` ${skipped.length} Datei(en) übersprungen (ungültiger Name).` : ''}`,
      files: restored,
      skipped
    });
  } catch (err) {
    res.status(500).json({ error: 'Sicherung konnte nicht wiederhergestellt werden.', detail: String(err) });
  }
});

export default router;
