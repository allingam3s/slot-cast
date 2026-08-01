import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync, unlinkSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..');
const IMAGES_DIR = path.join(ROOT, 'artifacts', 'slotcast-web', 'public', 'images');

if (!existsSync(IMAGES_DIR)) {
  mkdirSync(IMAGES_DIR, { recursive: true });
}

const MAX_SIZE_MB = 20;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

// Zielgrößen je Bildtyp – fit:'inside' erhält das Seitenverhältnis.
// withoutEnlargement: kleinere Bilder werden nicht hochskaliert.
const RESIZE: Record<string, { width: number; height: number; quality: number; label: string }> = {
  logo:  { width: 512,  height: 512,  quality: 90, label: '512×512 px max' },
  cover: { width: 1600, height: 1600, quality: 85, label: '1600×1600 px max' },
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = path.join(ROOT, 'packages', 'creator-app', 'temp-uploads');
    if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `upload-${Date.now()}${ext}`);
  },
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
  },
});

const router = Router();

function handleUpload(targetFilename: string) {
  return async (req: Request & { file?: Express.Multer.File }, res: Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'Keine Datei hochgeladen.' });
      return;
    }

    const cfg = RESIZE[targetFilename] ?? RESIZE.cover;
    const dest = path.join(IMAGES_DIR, `${targetFilename}.webp`);
    const tempPath = req.file.path;

    // Alte Varianten derselben Datei löschen (PNG, JPG, JPEG, WebP),
    // damit keine verwaisten Dateien aus früheren Uploads zurückbleiben.
    for (const ext of ['.png', '.jpg', '.jpeg', '.webp']) {
      const old = path.join(IMAGES_DIR, `${targetFilename}${ext}`);
      if (old !== dest && existsSync(old)) {
        try { unlinkSync(old); } catch { /* ignore – Datei ggf. schreibgeschützt */ }
      }
    }

    try {
      // Bild einlesen, skalieren (Seitenverhältnis erhalten), als WebP speichern
      const info = await sharp(tempPath)
        .resize(cfg.width, cfg.height, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: cfg.quality })
        .toFile(dest);

      res.json({
        success: true,
        message: `Bild optimiert: ${info.width}×${info.height} px, ${(info.size / 1024).toFixed(0)} KB WebP.`,
        path: `images/${targetFilename}.webp`,
        filename: `${targetFilename}.webp`,
        width: info.width,
        height: info.height,
        sizeKb: Math.round(info.size / 1024),
      });
    } catch (err) {
      res.status(500).json({ error: 'Bildverarbeitung fehlgeschlagen.', detail: String(err) });
    } finally {
      // Temp-Datei immer löschen, auch bei Fehler
      try { unlinkSync(tempPath); } catch { /* ignore */ }
    }
  };
}

// POST /api/upload/logo
router.post('/logo', upload.single('file'), handleUpload('logo'));

// POST /api/upload/cover
router.post('/cover', upload.single('file'), handleUpload('cover'));

// Multer-Fehlerbehandlung (LIMIT_FILE_SIZE etc.)
router.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ error: `Die Datei ist zu groß. Maximal ${MAX_SIZE_MB} MB sind erlaubt.` });
    return;
  }
  res.status(400).json({ error: err.message || 'Upload-Fehler.' });
});

export default router;
