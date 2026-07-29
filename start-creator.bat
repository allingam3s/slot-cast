@echo off
chcp 65001 > nul
title SLOT-CAST Creator-App

echo ============================================
echo   SLOT-CAST Creator-App
echo   Der all_in_gam3s Podcast
echo ============================================
echo.

:: Prüfen ob Node.js installiert ist
node --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
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

:: Node.js Version anzeigen
echo Node.js: 
node --version

:: Prüfen ob pnpm installiert ist
pnpm --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo pnpm nicht gefunden. Installiere pnpm...
    npm install -g pnpm
    if %ERRORLEVEL% NEQ 0 (
        echo FEHLER: pnpm konnte nicht installiert werden.
        echo Versuche: npm install -g pnpm
        pause
        exit /b 1
    )
)

echo pnpm:
pnpm --version
echo.

:: In das Projektverzeichnis wechseln (relativ zur Batch-Datei)
cd /d "%~dp0"

:: Abhängigkeiten installieren (nur wenn nötig)
if not exist "packages\creator-app\node_modules" (
    echo Installiere Abhaengigkeiten (einmalig, kann einige Minuten dauern)...
    echo.
    cd packages\creator-app
    pnpm install
    if %ERRORLEVEL% NEQ 0 (
        echo FEHLER: Abhaengigkeiten konnten nicht installiert werden.
        echo Versuche manuell: cd packages\creator-app ^&^& pnpm install
        pause
        exit /b 1
    )
    cd /d "%~dp0"
) else (
    echo Abhaengigkeiten bereits vorhanden.
)

echo.
echo Starte Creator-App...
echo Die App oeffnet sich gleich im Browser unter: http://localhost:3000
echo.
echo Um die App zu beenden: Dieses Fenster schliessen oder Strg+C druecken.
echo.

:: Creator-App starten
cd packages\creator-app
pnpm start

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo FEHLER: Die Creator-App konnte nicht gestartet werden.
    echo.
    echo Moegliche Ursachen:
    echo   - Port 3000 ist bereits belegt (andere App laeuft auf diesem Port)
    echo   - Fehlende Abhaengigkeiten: pnpm install ausfuehren
    echo   - Berechtigungsfehler: Als Administrator ausfuehren
    echo.
    pause
)
