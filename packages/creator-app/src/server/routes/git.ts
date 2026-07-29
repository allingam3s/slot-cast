import { Router, Request, Response } from 'express';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..');

const router = Router();

function translateGitError(stderr: string, stdout: string): string {
  const all = (stderr + ' ' + stdout).toLowerCase();

  if (all.includes('not a git repository')) {
    return 'Das Verzeichnis ist kein Git-Repository. Bitte führe "git init" im Projektordner aus.';
  }
  if (all.includes('remote: repository not found') || all.includes('repository not found')) {
    return 'Das GitHub-Repository wurde nicht gefunden. Prüfe, ob die Remote-URL korrekt ist (git remote -v).';
  }
  if (all.includes('authentication failed') || all.includes('could not read username') || all.includes('invalid credentials')) {
    return 'Authentifizierung fehlgeschlagen. Prüfe deine GitHub-Zugangsdaten oder richte einen SSH-Key ein.';
  }
  if (all.includes('permission denied')) {
    return 'Zugriff verweigert. Prüfe deine GitHub-Berechtigungen für dieses Repository.';
  }
  if (all.includes('rejected') && all.includes('fetch first')) {
    return 'Push abgelehnt: Das Remote-Repository hat neue Commits. Führe zuerst "git pull" aus und versuche es erneut.';
  }
  if (all.includes('rejected') && all.includes('non-fast-forward')) {
    return 'Push abgelehnt: Es gibt Konflikte mit dem Remote-Branch. Führe "git pull --rebase" aus und versuche es erneut.';
  }
  if (all.includes('no remote') || all.includes("'origin' does not appear to be a git repository")) {
    return 'Kein Remote-Repository konfiguriert. Richte einen Remote mit "git remote add origin <URL>" ein.';
  }
  if (all.includes('nothing to commit')) {
    return 'Es gibt keine Änderungen zum Veröffentlichen. Speichere zuerst Änderungen in der Creator-App.';
  }
  if (all.includes('connection refused') || all.includes('could not connect')) {
    return 'Keine Verbindung zu GitHub. Prüfe deine Internetverbindung.';
  }
  if (all.includes('timed out') || all.includes('timeout')) {
    return 'Zeitüberschreitung bei der Verbindung zu GitHub. Prüfe deine Internetverbindung und versuche es erneut.';
  }
  if (stderr.trim()) return `Git-Fehler: ${stderr.trim()}`;
  return 'Unbekannter Git-Fehler. Prüfe die Fehlermeldung in der Ausgabe.';
}

// GET /api/git/status – Git-Status abrufen
router.get('/status', async (_req: Request, res: Response) => {
  try {
    // Prüfen ob git vorhanden ist
    await execAsync('git --version', { cwd: ROOT });
    const { stdout } = await execAsync('git status --porcelain', { cwd: ROOT });
    const changes = stdout.trim().split('\n').filter(l => l.trim());
    const { stdout: branch } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: ROOT });

    // Geänderte Dateien kategorisieren
    const publicChanges = changes.filter(l => l.includes('artifacts/slotcast-web/public/'));
    const otherChanges = changes.filter(l => !l.includes('artifacts/slotcast-web/public/'));

    res.json({
      ok: true,
      branch: branch.trim(),
      changes: changes.length,
      publicChanges: publicChanges.length,
      otherChanges: otherChanges.length,
      changedFiles: changes
    });
  } catch (err: unknown) {
    const e = err as { stderr?: string; stdout?: string; message?: string };
    const errMsg = translateGitError(e.stderr || '', e.stdout || e.message || '');
    res.status(500).json({ ok: false, error: errMsg });
  }
});

// POST /api/git/publish – Änderungen committen und pushen
router.post('/publish', async (req: Request, res: Response) => {
  const { message, addAll } = req.body;
  const commitMessage = (message || 'Aktualisierung: Podcast-Inhalte').trim();

  if (!commitMessage) {
    res.status(400).json({ ok: false, error: 'Die Commit-Beschreibung darf nicht leer sein.' });
    return;
  }

  const steps: { step: string; output: string }[] = [];

  try {
    // Schritt 1: git add
    const addPath = addAll
      ? '.'
      : 'artifacts/slotcast-web/public/';

    await execAsync(`git add "${addPath}"`, { cwd: ROOT });
    steps.push({ step: 'git add', output: `Dateien aus ${addPath} wurden zur Staging-Area hinzugefügt.` });

    // Schritt 2: Prüfen ob es etwas zu committen gibt
    const { stdout: statusOut } = await execAsync('git status --porcelain --cached', { cwd: ROOT });
    if (!statusOut.trim()) {
      res.json({
        ok: true,
        noChanges: true,
        message: 'Keine neuen Änderungen gefunden. Die Webseite ist bereits auf dem neuesten Stand.',
        steps
      });
      return;
    }

    // Schritt 3: git commit
    await execAsync(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { cwd: ROOT });
    steps.push({ step: 'git commit', output: `Commit erstellt: "${commitMessage}"` });

    // Schritt 4: git push
    const { stdout: pushOut, stderr: pushErr } = await execAsync('git push', { cwd: ROOT });
    steps.push({ step: 'git push', output: (pushOut || pushErr || 'Erfolgreich gepusht.').trim() });

    res.json({
      ok: true,
      message: 'Änderungen wurden erfolgreich auf GitHub veröffentlicht! GitHub Actions wird die Webseite automatisch aktualisieren.',
      steps
    });
  } catch (err: unknown) {
    const e = err as { stderr?: string; stdout?: string; message?: string };
    const errMsg = translateGitError(e.stderr || '', e.stdout || e.message || '');
    res.status(500).json({
      ok: false,
      error: errMsg,
      detail: e.stderr || e.message,
      steps
    });
  }
});

export default router;
