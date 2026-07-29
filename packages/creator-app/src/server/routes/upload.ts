import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, copyFileSync, unlinkSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..');
const IMAGES_DIR = path.join(ROOT, 'artifacts', 'slotcast-web', 'public', 'images');

// Sicherstellen dass das Verzeichnis existiert
if (!existsSync(IMAGES_DIR)) {
  mkdirSync(IMAGES_DIR, { recursive: true });
}

const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(ROOT, 'packages', 'creator-app', 'temp-uploads');
    if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `upload-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_TYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
      cb(new Error(`Ungültiges Dateiformat. Erlaubt sind: PNG, JPG, WEBP (maximal ${MAX_SIZE_MB} MB)`));
      return;
    }
    cb(null, true);
  }
});

const router = Router();

function handleUpload(targetFilename: string) {
  return (req: Request & { file?: Express.Multer.File }, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'Keine Datei hochgeladen.' });
      return;
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    // Logo immer als logo.png speichern (oder Originalformat)
    const dest = path.join(IMAGES_DIR, targetFilename + ext);

    try {
      copyFileSync(req.file.path, dest);
      unlinkSync(req.file.path); // Temporäre Datei löschen
      res.json({
        success: true,
        message: `Datei erfolgreich hochgeladen.`,
        path: `images/${targetFilename}${ext}`,
        filename: `${targetFilename}${ext}`
      });
    } catch (err) {
      res.status(500).json({ error: 'Datei konnte nicht gespeichert werden.', detail: String(err) });
    }
  };
}

// POST /api/upload/logo – Logo hochladen
router.post('/logo', upload.single('file'), handleUpload('logo'));

// POST /api/upload/cover – Cover hochladen
router.post('/cover', upload.single('file'), handleUpload('cover'));

// Multer-Fehlerbehandlung
router.use((err: Error, req: Request, res: Response, _next: () => void) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ error: `Die Datei ist zu groß. Maximal ${MAX_SIZE_MB} MB sind erlaubt.` });
      return;
    }
  }
  res.status(400).json({ error: err.message || 'Upload-Fehler.' });
});

export default router;
