/**
 * SLOT-CAST Creator-App – Express-Server
 * Läuft NUR lokal auf localhost:3000
 * Wird NICHT auf GitHub Pages oder sonst öffentlich bereitgestellt
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { exec } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API-Routen
const { default: configRouter } = await import('./routes/config.js');
const { default: platformsRouter } = await import('./routes/platforms.js');
const { default: rssRouter } = await import('./routes/rss.js');
const { default: uploadRouter } = await import('./routes/upload.js');
const { default: backupRouter } = await import('./routes/backup.js');
const { default: gitRouter } = await import('./routes/git.js');

app.use('/api/config', configRouter);
app.use('/api/platforms', platformsRouter);
app.use('/api/rss', rssRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/backup', backupRouter);
app.use('/api/git', gitRouter);

// Statische Bilder aus dem Landingpage-Public-Ordner ausliefern.
// Upload schreibt nach artifacts/slotcast-web/public/images/ → hier unter /images/ erreichbar.
app.use('/images', express.static(
  path.resolve(ROOT, 'artifacts', 'slotcast-web', 'public', 'images'),
  { maxAge: 0 }   // kein Browser-Cache während der Entwicklung
));

// Vite Dev-Middleware (serviert die React-App)
const vite = await createViteServer({
  configFile: path.resolve(__dirname, '..', '..', 'vite.config.ts'),
  server: { middlewareMode: true },
  appType: 'spa',
  root: path.resolve(__dirname, '..', '..'),
});

app.use(vite.middlewares);

// Server starten
app.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log('');
  console.log('══════════════════════════════════════════════');
  console.log('  SLOT-CAST Creator-App gestartet!');
  console.log(`  Adresse: ${url}`);
  console.log('  Zum Beenden: Strg+C drücken');
  console.log('══════════════════════════════════════════════');
  console.log('');

  // Browser automatisch öffnen
  // Windows: start braucht einen leeren Titel ("") vor der URL,
  // sonst interpretiert cmd.exe den Doppelpunkt in "http:" als Fenstertitel.
  const openCmd = process.platform === 'win32'
    ? `start "" "${url}"`
    : process.platform === 'darwin'
      ? `open ${url}`
      : `xdg-open ${url}`;

  exec(openCmd, (err) => {
    if (err) {
      console.log(`Browser konnte nicht automatisch geöffnet werden.`);
      console.log(`Bitte manuell öffnen: ${url}`);
    }
  });
});

export { ROOT };
