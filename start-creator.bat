@echo off
setlocal enabledelayedexpansion
chcp 65001 > nul
title SLOT-CAST Creator-App

echo ============================================
echo   SLOT-CAST Creator-App
echo   Der all_in_gam3s Podcast
echo ============================================
echo.

:: ── Node.js prüfen ──────────────────────────────────────────────────────────
node --version > nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo FEHLER: Node.js wurde nicht gefunden!
    echo.
    echo Bitte Node.js installieren:
    echo   1. Gehe zu https://nodejs.org/de/
    echo   2. Lade "LTS" herunter und installiere es
    echo   3. Starte dieses Fenster neu und versuche es erneut
    echo.
    pause
    exit /b 1
)
echo Node.js:
node --version

:: ── pnpm prüfen ─────────────────────────────────────────────────────────────
pnpm --version > nul 2>&1
if !ERRORLEVEL! NEQ 0 (
    echo pnpm nicht gefunden. Installiere pnpm global...
    npm install -g pnpm
    set NPM_EXIT=!ERRORLEVEL!
    if !NPM_EXIT! NEQ 0 (
        echo.
        echo FEHLER: pnpm konnte nicht installiert werden.
        echo Versuche es manuell: npm install -g pnpm
        echo.
        pause
        exit /b 1
    )
    echo.
    echo pnpm wurde erfolgreich installiert.
    echo.
    echo WICHTIG: Bitte dieses Fenster schliessen und
    echo          start-creator.bat erneut starten,
    echo          damit Windows den neuen Befehl erkennt.
    echo.
    pause
    exit /b 0
)
echo pnpm:
pnpm --version
echo.

:: ── In Projektverzeichnis wechseln ──────────────────────────────────────────
cd /d "%~dp0"
if !ERRORLEVEL! NEQ 0 (
    echo FEHLER: Konnte nicht in das Projektverzeichnis wechseln.
    echo Pfad: %~dp0
    echo.
    pause
    exit /b 1
)

:: ── Abhaengigkeiten installieren (nur beim Erststart) ────────────────────────
if not exist "packages\creator-app\node_modules" (
    echo Installiere Abhaengigkeiten ^(einmalig, kann einige Minuten dauern^)...
    echo.
    cd packages\creator-app
    pnpm install
    set INSTALL_EXIT=!ERRORLEVEL!
    cd /d "%~dp0"
    if !INSTALL_EXIT! NEQ 0 (
        echo.
        echo FEHLER: Abhaengigkeiten konnten nicht installiert werden.
        echo.
        echo Versuche manuell:
        echo   1. Oeffne CMD in diesem Ordner
        echo   2. Fuehre aus: cd packages\creator-app
        echo   3. Fuehre aus: pnpm install
        echo.
        pause
        exit /b 1
    )
    echo.
    echo Abhaengigkeiten erfolgreich installiert.
) else (
    echo Abhaengigkeiten bereits vorhanden.
)

:: ── Creator-App starten ──────────────────────────────────────────────────────
echo.
echo Starte Creator-App...
echo Die App oeffnet sich gleich im Browser unter: http://localhost:3000
echo.
echo Um die App zu beenden: Dieses Fenster schliessen oder Strg+C druecken.
echo ============================================
echo.

cd packages\creator-app
pnpm start

:: ── Nach dem Beenden der App ─────────────────────────────────────────────────
set APP_EXIT=!ERRORLEVEL!
echo.
if !APP_EXIT! NEQ 0 (
    echo FEHLER: Die Creator-App wurde mit einem Fehler beendet. ^(Code: !APP_EXIT!^)
    echo.
    echo Moegliche Ursachen:
    echo   - Port 3000 ist bereits belegt
    echo   - Abhaengigkeiten unvollstaendig: packages\creator-app\node_modules loeschen
    echo     und start-creator.bat erneut starten
    echo   - Berechtigungsfehler: Als Administrator ausfuehren
) else (
    echo Die Creator-App wurde beendet.
)
echo.
pause
