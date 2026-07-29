# SLOT-CAST | Der all_in_gam3s Podcast

**Vollständige Anleitung für Nicht-Programmierer**

Hier findest du alles, was du wissen musst, um deine Podcast-Webseite einzurichten, zu pflegen und zu veröffentlichen. Diese Anleitung ist für Windows-Nutzer geschrieben und geht davon aus, dass du noch keine Erfahrung mit Programmierung hast.

---

## Inhaltsverzeichnis

1. [Was ist dieses Projekt?](#1-was-ist-dieses-projekt)
2. [Systemvoraussetzungen](#2-systemvoraussetzungen)
3. [Node.js installieren](#3-nodejs-installieren)
4. [Git installieren und einrichten](#4-git-installieren-und-einrichten)
5. [GitHub-Konto und Repository](#5-github-konto-und-repository)
6. [Projekt auf deinen Computer laden](#6-projekt-auf-deinen-computer-laden)
7. [Creator-App starten](#7-creator-app-starten)
8. [Einstellungen ausfüllen](#8-einstellungen-ausfüllen)
9. [Logo und Cover hochladen](#9-logo-und-cover-hochladen)
10. [Plattformen verwalten](#10-plattformen-verwalten)
11. [Vorschau ansehen](#11-vorschau-ansehen)
12. [Änderungen lokal speichern](#12-änderungen-lokal-speichern)
13. [RSS-Feed aktualisieren](#13-rss-feed-aktualisieren)
14. [Auf GitHub veröffentlichen](#14-auf-github-veröffentlichen)
15. [GitHub Pages einrichten](#15-github-pages-einrichten)
16. [GitHub Actions verstehen](#16-github-actions-verstehen)
17. [Eigene Domain einrichten (optional)](#17-eigene-domain-einrichten-optional)
18. [Fehlerbehebung](#18-fehlerbehebung)
19. [Tägliche Nutzung](#19-tägliche-nutzung)
20. [Produktivstart-Checkliste](#20-produktivstart-checkliste)
21. [Zentrale Übersicht aller einzutragenden Angaben](#21-zentrale-übersicht-aller-einzutragenden-angaben)

---

## 1. Was ist dieses Projekt?

Dieses Projekt besteht aus zwei Teilen:

**Teil 1: Die öffentliche Webseite (für alle sichtbar)**
- Deine Podcast-Landingpage unter einer GitHub-Pages-Adresse
- Zeigt dein Logo, die neueste Folge und alle Episoden
- Verweist auf Spotify, YouTube und andere Plattformen
- Wird automatisch aktualisiert, wenn du neuen Episoden veröffentlichst

**Teil 2: Die Creator-App (nur auf deinem Computer)**
- Läuft lokal in deinem Browser unter `http://localhost:3000`
- Damit verwaltest du alle Inhalte: Titel, Beschreibung, Plattform-Links
- Wird NICHT auf GitHub veröffentlicht – bleibt immer nur lokal

**Wichtige Schreibweisen:**
- Immer `SLOT-CAST` (mit Bindestrich, Großbuchstaben)
- Immer `all_in_gam3s` (Unterstriche, Kleinbuchstaben, Ziffer 3)

---

## 2. Systemvoraussetzungen

Folgendes benötigst du:

- **Windows 10 oder neuer** (64-Bit)
- **Internetverbindung** für die erste Installation
- **Ca. 1 GB freier Speicherplatz**
- **Node.js** (Programm-Laufzeitumgebung) → Anleitung unten
- **Git** (Versionsverwaltung) → Anleitung unten
- **GitHub-Konto** (kostenlos) → Anleitung unten

---

## 3. Node.js installieren

Node.js ist die Technik, auf der die Creator-App läuft.

**Schritt-für-Schritt:**

1. Öffne deinen Browser und gehe zu: **https://nodejs.org/de/**
2. Klicke auf den großen grünen Button **"LTS herunterladen"** (LTS = Langzeitversion, empfohlen)
3. Öffne die heruntergeladene Datei (z.B. `node-v20.x.x-x64.msi`)
4. Folge dem Installations-Assistenten – klicke immer auf **"Weiter"** und dann **"Installieren"**
5. Am Ende klicke auf **"Fertig stellen"**

**Testen ob es funktioniert:**
1. Drücke die Windows-Taste, tippe `cmd` und drücke Enter
2. Es öffnet sich ein schwarzes Fenster (Eingabeaufforderung)
3. Tippe `node --version` und drücke Enter
4. Es sollte etwas wie `v20.x.x` erscheinen

**Wenn das funktioniert, ist Node.js korrekt installiert. ✓**

---

## 4. Git installieren und einrichten

Git ist das Programm, mit dem du deine Webseite auf GitHub hochlädst.

**Installation:**

1. Gehe zu: **https://git-scm.com/download/win**
2. Der Download startet automatisch (64-Bit)
3. Öffne die Installationsdatei und klicke durch den Assistenten
4. Alle Standard-Einstellungen sind korrekt – einfach immer **"Next"** klicken
5. Am Ende **"Install"** klicken und warten

**Git einrichten (einmalig):**

Nach der Installation musst du Git deinen Namen und deine E-Mail-Adresse mitteilen (das erscheint dann in der Commit-History auf GitHub):

1. Öffne die Windows-Eingabeaufforderung (`cmd`) oder das **Git Bash**-Programm (wurde mit Git installiert)
2. Tippe die folgenden Befehle (ersetze die Beispielwerte durch deine echten Daten):

```
git config --global user.name "Dein Name"
git config --global user.email "deine@email.de"
```

3. Drücke nach jeder Zeile Enter

**Testen:**
```
git --version
```
Es sollte `git version 2.x.x` erscheinen. ✓

---

## 5. GitHub-Konto und Repository

**Konto erstellen (falls noch nicht vorhanden):**

1. Gehe zu: **https://github.com**
2. Klicke auf **"Sign up"** (oben rechts)
3. Wähle einen Benutzernamen (dieser erscheint später in deiner Webseiten-Adresse!)
4. Gib deine E-Mail und ein Passwort ein
5. Folge dem Verifizierungsprozess

**Neues Repository erstellen:**

1. Melde dich bei GitHub an
2. Klicke oben rechts auf das **"+"**-Symbol → **"New repository"**
3. **Repository name:** `slotcast` (oder einen anderen Namen deiner Wahl)
4. **Description:** `SLOT-CAST | Der all_in_gam3s Podcast`
5. Wähle **"Public"** (damit GitHub Pages kostenlos funktioniert)
6. **WICHTIG:** Setze KEINEN Haken bei "Add a README file" (das machen wir selbst)
7. Klicke auf **"Create repository"**
8. Notiere dir die Repository-URL, sie sieht so aus:
   ```
   https://github.com/dein-benutzername/slotcast
   ```

**GitHub-Anmeldung einrichten (einmalig):**

Damit Git-Push ohne ständige Passworteingabe funktioniert, richte einen Personal Access Token ein:

1. Gehe auf GitHub → Dein Profilbild (oben rechts) → **Settings**
2. Scrolle ganz nach unten → **Developer settings**
3. **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)**
4. **Note:** `slotcast-push`
5. **Expiration:** Wähle eine Laufzeit (z.B. "No expiration" für dauerhaften Zugang)
6. Setze einen Haken bei **`repo`** (das gibt Zugriff auf deine Repositories)
7. Klicke **"Generate token"**
8. **WICHTIG:** Kopiere den Token sofort und speichere ihn sicher (er wird nur einmal angezeigt!)

Beim ersten `git push` wirst du nach Benutzername und Passwort gefragt. Als **Passwort** gibst du den eben erstellten Token ein.

---

## 6. Projekt auf deinen Computer laden

**Option A: Wenn du dieses Projekt als ZIP-Datei erhalten hast:**

1. Entpacke die ZIP-Datei in einen Ordner deiner Wahl, z.B. `C:\Projekte\slotcast`
2. Öffne die Eingabeaufforderung in diesem Ordner:
   - Navigiere im Explorer zu dem Ordner
   - Halte `Shift` gedrückt und klicke mit der rechten Maustaste in den Ordner
   - Wähle **"Eingabeaufforderung hier öffnen"** (oder "PowerShell-Fenster hier öffnen")
3. Verbinde den Ordner mit deinem GitHub-Repository:
```
git init
git remote add origin https://github.com/dein-benutzername/slotcast.git
git add .
git commit -m "Erster Commit: SLOT-CAST Podcast-Webseite"
git push -u origin main
```

**Option B: Wenn du das Projekt von GitHub klonen möchtest:**

1. Öffne die Eingabeaufforderung
2. Navigiere zu deinem Projektordner, z.B.:
```
cd C:\Projekte
```
3. Klone das Repository:
```
git clone https://github.com/dein-benutzername/slotcast.git
cd slotcast
```

---

## 7. Creator-App starten

Die Creator-App startest du einfach per Doppelklick:

1. Gehe im Windows Explorer in den Projektordner (z.B. `C:\Projekte\slotcast`)
2. **Doppelklicke** auf die Datei **`start-creator.bat`**
3. Ein schwarzes Fenster öffnet sich und führt automatisch folgende Schritte durch:
   - Prüft, ob Node.js vorhanden ist
   - Installiert die benötigten Pakete (nur beim ersten Start, dauert 1–3 Minuten)
   - Startet die Creator-App
   - Öffnet automatisch deinen Browser mit `http://localhost:3000`

**Was du siehst:**
- Im schwarzen Fenster laufen Texte durch – das ist normal
- Nach kurzer Zeit öffnet sich dein Browser mit der Creator-App
- Du siehst eine Seitenleiste links mit: Einstellungen, Plattformen, Vorschau, Veröffentlichen

**WICHTIG:** Das schwarze Fenster muss geöffnet bleiben, solange du die Creator-App nutzt!

**App beenden:**
- Klicke in das schwarze Fenster und drücke `Strg + C`
- Oder schließe das schwarze Fenster einfach

---

## 8. Einstellungen ausfüllen

Klicke in der Creator-App auf **"Einstellungen"** (⚙️).

**Podcast-Informationen:**
- **Vollständiger Titel:** `SLOT-CAST | Der all_in_gam3s Podcast`
- **Kurztitel:** `SLOT-CAST`
- **Beschreibung:** Schreibe 2–3 Sätze über deinen Podcast
- **Autor:** `all_in_gam3s`
- **Sprache:** Deutsch (de)

**RSS-Feed:**
- Die URL ist bereits vorausgefüllt: `https://anchor.fm/s/11248c624/podcast/rss`
- Klicke auf **"RSS-Feed testen"** um zu prüfen, ob der Feed erreichbar ist
- Du solltest sehen: "RSS-Feed erreichbar. X Episoden gefunden."

**Weitere Links:**
- **Beacons:** `https://beacons.ai/all_in_gam3s` (bereits ausgefüllt)
- **Twitch:** `https://twitch.tv/all_in_gam3s` (bereits ausgefüllt)

**SEO & Suchmaschinen:**
- **Basis-URL:** Trage hier später deine GitHub-Pages-Adresse ein, z.B.:
  `https://dein-benutzername.github.io/slotcast/`

Nach dem Ausfüllen klicke auf **"💾 Lokal speichern"**.

---

## 9. Logo und Cover hochladen

In der Creator-App unter **"Einstellungen"** findest du zwei Upload-Felder:

**Logo-Upload:**
- Klicke auf das Feld "Logo"
- Wähle dein Logo-Bild aus (PNG oder WEBP empfohlen)
- Maximale Größe: 5 MB
- Das Logo erscheint als Vorschau, wenn es hochgeladen wurde

**Cover-Bild:**
- Klicke auf das Feld "Cover-Bild"
- Lade das quadratische Podcast-Cover hoch (wird für Open-Graph-Vorschaubilder genutzt)
- Empfohlene Größe: mindestens 1400×1400 Pixel

**Wichtig:** Nach dem Upload klicke auf **"💾 Lokal speichern"**, damit die Dateipfade in der Konfiguration gespeichert werden.

Die Bilder werden in folgendem Ordner gespeichert:
`artifacts\slotcast-web\public\images\`

---

## 10. Plattformen verwalten

Klicke auf **"Plattformen"** (🎙️) in der Seitenleiste.

**Plattform-Link eintragen:**
1. Klicke auf das **✏️-Symbol** neben einer Plattform
2. Trage die URL zu deinem Podcast auf dieser Plattform ein
3. Beispiel für Spotify: `https://open.spotify.com/show/DEINE-PODCAST-ID`
4. Klicke **"Speichern"**
5. Klicke anschließend auf **"💾 Speichern"** oben in der Plattformverwaltung

**Plattform ohne Link:**
- Wenn du den Link für eine Plattform noch nicht hast, lass das Feld leer
- Die Plattform wird auf der Webseite als **"bald verfügbar"** angezeigt
- Du kannst den Link jederzeit nachtragen

**Reihenfolge ändern:**
- Greife eine Plattformkarte am **⠿-Symbol** (links) an
- Ziehe sie an die gewünschte Position
- Klicke dann auf **"💾 Speichern"**

**Plattform aktivieren/deaktivieren:**
- Klicke auf den kleinen Schalter rechts neben der Plattformkarte
- Grün = Aktiv (wird auf der Webseite angezeigt)
- Grau = Inaktiv (wird ausgeblendet)

**Neue Plattform hinzufügen:**
- Klicke auf **"+ Hinzufügen"**
- Trage Name und Link ein
- Klicke **"Hinzufügen"**

**Bekannte Plattform-Links findest du so:**
| Plattform | Wo du den Link findest |
|-----------|----------------------|
| **Spotify** | Spotify for Podcasters → Dein Podcast → "RSS-Feed-URL" → Dann suche deinen Podcast auf open.spotify.com |
| **YouTube Music** | YouTube → Dein Kanal → Teilen → Link kopieren |
| **Amazon Music** | music.amazon.de → Suche deinen Podcast → Link aus der Adressleiste kopieren |
| **Castbox** | castbox.fm → Suche "SLOT-CAST" → Link aus Adressleiste |
| **Goodpods** | goodpods.com → Suche deinen Podcast → Link aus Adressleiste |
| **Pocket Casts** | pocketcasts.com → Suche deinen Podcast → Link aus Adressleiste |
| **Podimo** | podimo.com → Suche deinen Podcast → Link aus Adressleiste |

---

## 11. Vorschau ansehen

Klicke auf **"Vorschau"** (👁️) in der Seitenleiste.

Du siehst eine Simulation, wie deine Webseite auf verschiedenen Geräten aussieht:
- **📱 Smartphone** (390px) – wie auf einem iPhone
- **📋 Tablet** (768px) – wie auf einem iPad
- **🖥️ Desktop** (1280px) – wie auf einem Computer-Monitor

**Vorschau aktualisieren:**
- Klicke auf **"↺ Neu laden"** nachdem du Änderungen gespeichert hast

**Hinweis:** Die Vorschau zeigt deine gespeicherten Daten. Episoden werden erst nach dem ersten RSS-Fetch angezeigt.

---

## 12. Änderungen lokal speichern

Bevor du auf GitHub veröffentlichst, musst du deine Änderungen lokal speichern.

**Was "lokal speichern" bedeutet:**
- Die Daten werden in JSON-Dateien auf deinem Computer gespeichert
- Diese Dateien liegen im Ordner: `artifacts\slotcast-web\public\data\`
- Es wird NOCH NICHTS auf die Webseite übertragen

**Dateien, die gespeichert werden:**
- `config.json` – Alle Einstellungen (Titel, Beschreibung, etc.)
- `platforms.json` – Plattformliste mit Links
- `episodes.json` – Episodendaten (vom RSS-Feed)
- `legal.json` – Impressum und Datenschutz

**So speicherst du:**
1. In den **Einstellungen**: Klicke auf "💾 Lokal speichern"
2. In den **Plattformen**: Klicke auf "💾 Speichern"
3. Fertig – die Dateien sind gespeichert

---

## 13. RSS-Feed aktualisieren

Der RSS-Feed enthält alle Episodendaten. Dieser muss regelmäßig aktualisiert werden.

**Manuell (über die Creator-App):**
1. Klicke auf **"Veröffentlichen"** (🚀) in der Seitenleiste
2. Klicke auf **"📡 RSS-Feed jetzt abrufen"**
3. Warte kurz – du siehst eine Erfolgsmeldung: "RSS-Feed erfolgreich aktualisiert"
4. Die neuen Episodendaten sind jetzt in `episodes.json` gespeichert

**Automatisch (GitHub Actions):**
- GitHub holt den RSS-Feed automatisch alle **6 Stunden**
- Bei jedem Deployment wird der Feed ebenfalls aktualisiert
- Du musst nichts tun – das passiert im Hintergrund

**Manuell auf GitHub:**
1. Gehe zu deinem GitHub-Repository
2. Klicke auf den Tab **"Actions"**
3. Klicke links auf **"RSS-Feed aktualisieren"**
4. Klicke auf **"Run workflow"** → **"Run workflow"**

---

## 14. Auf GitHub veröffentlichen

**Vorbereitung (einmalig):**
1. Stelle sicher, dass Git korrekt eingerichtet ist (Schritt 4)
2. Stelle sicher, dass das GitHub-Repository korrekt verbunden ist (Schritt 6)

**So veröffentlichst du Änderungen:**

1. Starte die Creator-App (`start-creator.bat` doppelklicken)
2. Mache deine Änderungen (Plattformen, Einstellungen, etc.)
3. Klicke auf **"💾 Lokal speichern"** bzw. **"💾 Speichern"**
4. Klicke auf **"Veröffentlichen"** (🚀) in der Seitenleiste
5. (Optional) Klicke auf **"📡 RSS-Feed jetzt abrufen"** um aktuelle Episoden zu laden
6. (Empfohlen) Klicke auf **"💾 Sicherung erstellen"**
7. Prüfe den **Git-Status** – er zeigt, welche Dateien sich geändert haben
8. Trage eine **Beschreibung der Änderungen** ein, z.B.:
   - "Spotify-Link hinzugefügt"
   - "Neue Folge: Podcast-Titel hier"
   - "Logo und Cover aktualisiert"
9. Klicke auf **"🚀 Auf GitHub veröffentlichen"**
10. Warte auf die Erfolgsmeldung

**Was dann passiert:**
- Deine Änderungen werden zu GitHub hochgeladen
- GitHub Actions startet automatisch (dauert 1–3 Minuten)
- Deine Webseite wird auf GitHub Pages aktualisiert

**Wo du den Fortschritt sehen kannst:**
1. Gehe zu deinem GitHub-Repository
2. Klicke auf den Tab **"Actions"**
3. Du siehst eine Liste der laufenden und abgeschlossenen Aktionen
4. Grüne Häkchen = Erfolgreich, Rotes X = Fehler

---

## 15. GitHub Pages einrichten

**Einmalig nach dem ersten Push:**

1. Gehe zu deinem GitHub-Repository
2. Klicke auf **"Settings"** (Einstellungen-Tab oben)
3. Scrolle im linken Menü zu **"Pages"**
4. Unter **"Build and deployment"**:
   - **Source:** "GitHub Actions" auswählen
5. Klicke **"Save"**

**Das war's!** Beim nächsten Push wird deine Webseite automatisch gebaut und veröffentlicht.

**Deine Webseiten-Adresse:**
Nach der Einrichtung ist deine Webseite erreichbar unter:
```
https://dein-benutzername.github.io/slotcast/
```

**Diese Adresse in die Creator-App eintragen:**
1. Öffne die Creator-App
2. Gehe zu **"Einstellungen"**
3. Trage die URL unter **"Basis-URL"** ein
4. Klicke **"💾 Lokal speichern"**
5. Klicke auf **"Veröffentlichen"** und push die Änderung

**Sitemap und robots.txt anpassen:**
Die Dateien `artifacts/slotcast-web/public/sitemap.xml` und `robots.txt` enthalten Platzhalter (`YOUR_GITHUB_USERNAME`, `YOUR_REPO_NAME`). Ersetze diese mit deinen echten Werten:
1. Öffne `artifacts\slotcast-web\public\sitemap.xml` im Texteditor
2. Ersetze `YOUR_GITHUB_USERNAME` durch deinen GitHub-Benutzernamen
3. Ersetze `YOUR_REPO_NAME` durch `slotcast` (oder deinen Repository-Namen)
4. Speichere die Datei
5. Veröffentliche die Änderung über die Creator-App

---

## 16. GitHub Actions verstehen

GitHub Actions ist ein automatisches System, das verschiedene Aufgaben für dich erledigt.

**Was die Actions tun:**

**"Deploy SLOT-CAST to GitHub Pages"** (`deploy-pages.yml`):
- Startet bei jedem Push auf den `main`-Branch
- Holt den RSS-Feed
- Baut die Webseite
- Veröffentlicht sie auf GitHub Pages

**"RSS-Feed aktualisieren"** (`fetch-rss.yml`):
- Läuft automatisch alle 6 Stunden
- Aktualisiert die Episodenliste
- Commitet die Änderungen und startet ein neues Deployment

**Manuell starten:**
1. GitHub → Repository → Tab "Actions"
2. Klicke auf den gewünschten Workflow
3. Klicke **"Run workflow"** (rechts oben)

**Was bedeuten die farbigen Symbole?**
- 🟡 Gelb/Orange: Workflow läuft gerade
- ✅ Grün: Erfolgreich abgeschlossen
- ❌ Rot: Fehler aufgetreten (Klicke drauf für Details)

---

## 17. Eigene Domain einrichten (optional)

Wenn du lieber `www.slotcast.de` statt `dein-name.github.io/slotcast` haben möchtest:

**Voraussetzungen:**
- Du hast eine Domain gekauft (z.B. bei IONOS, Strato, All-Inkl)
- Du hast Zugriff auf die DNS-Einstellungen deiner Domain

**Schritt 1: GitHub Pages konfigurieren**
1. GitHub → Repository → Settings → Pages
2. Unter "Custom domain": Trage deine Domain ein, z.B. `podcast.deinedomain.de`
3. Klicke **"Save"**
4. Aktiviere **"Enforce HTTPS"** (sobald der Haken erscheint)

**Schritt 2: DNS-Einstellungen bei deinem Domain-Anbieter**

Für eine Subdomain (z.B. `podcast.deinedomain.de`) füge einen CNAME-Eintrag hinzu:
```
Typ:  CNAME
Name: podcast
Wert: dein-benutzername.github.io
TTL:  3600
```

Für die Hauptdomain (`deinedomain.de`) füge A-Records für GitHub's IP-Adressen hinzu:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**Schritt 3: Creator-App aktualisieren**
1. Öffne die Creator-App
2. Einstellungen → **"Basis-URL"**: Trage deine Domain ein, z.B. `https://podcast.deinedomain.de`
3. Speichern und veröffentlichen

**Wartezeit:** DNS-Änderungen können bis zu 24 Stunden dauern, bis sie weltweit wirksam sind.

---

## 18. Fehlerbehebung

### Creator-App öffnet sich nicht

**Problem:** Doppelklick auf `start-creator.bat` tut nichts oder zeigt Fehler.

**Lösung 1:** Prüfe Node.js:
```
node --version
```
Wenn kein Output kommt, installiere Node.js neu (Schritt 3).

**Lösung 2:** Port 3000 ist belegt:
1. Öffne die Eingabeaufforderung
2. Tippe: `netstat -ano | findstr :3000`
3. Wenn etwas angezeigt wird, starte den Computer neu und versuche es erneut.

**Lösung 3:** Als Administrator ausführen:
- Rechtsklick auf `start-creator.bat` → "Als Administrator ausführen"

---

### RSS-Feed Test schlägt fehl

**Problem:** "Verbindungsfehler" oder "Zeitüberschreitung" beim RSS-Test.

**Lösung 1:** Prüfe deine Internetverbindung.

**Lösung 2:** Prüfe die URL direkt im Browser:
- Öffne: `https://anchor.fm/s/11248c624/podcast/rss`
- Wenn die Seite einen XML-Feed zeigt, ist die URL korrekt
- Wenn eine Fehlermeldung kommt, hat Anchor die URL geändert

**Lösung 3:** Neue RSS-URL bei Spotify for Podcasters finden:
1. Gehe zu: `podcasters.spotify.com`
2. Melde dich an
3. Dein Podcast → Einstellungen → RSS-Feed-URL kopieren

---

### Git-Push schlägt fehl: "Authentication failed"

**Problem:** Beim Veröffentlichen erscheint "Authentifizierung fehlgeschlagen".

**Lösung:** Neuen Personal Access Token erstellen:
1. GitHub → Settings → Developer settings → Personal access tokens
2. Erstelle einen neuen Token (Schritt 5)
3. Bei der nächsten Passworteingabe: Gib den neuen Token als Passwort ein

**Windows Credential Manager leeren:**
1. Startmenü → "Anmeldeinformationsverwaltung" suchen und öffnen
2. "Windows-Anmeldeinformationen" → Suche nach "github.com"
3. Lösche den vorhandenen Eintrag
4. Versuche erneut zu pushen und gib diesmal den Token ein

---

### Git-Push schlägt fehl: "rejected - fetch first"

**Problem:** GitHub hat Änderungen, die du lokal noch nicht hast.

**Lösung:** Öffne die Eingabeaufforderung im Projektordner und tippe:
```
git pull origin main
```
Danach versuche es erneut in der Creator-App.

---

### Webseite zeigt "404 Not Found"

**Problem:** Die Webseite ist nicht erreichbar.

**Lösung 1:** Prüfe ob GitHub Pages aktiviert ist:
- GitHub → Repository → Settings → Pages
- "Source" muss auf "GitHub Actions" stehen

**Lösung 2:** Prüfe ob der Workflow erfolgreich war:
- GitHub → Actions → Letzter "Deploy"-Workflow
- Wenn rot, klicke drauf und lies die Fehlermeldung

**Lösung 3:** Warte noch etwas – nach dem ersten Setup kann es bis zu 10 Minuten dauern.

---

### Episoden werden nicht angezeigt

**Problem:** Die Webseite zeigt keine Episoden.

**Lösung 1:** RSS-Feed manuell abrufen:
1. Creator-App → Veröffentlichen → "📡 RSS-Feed jetzt abrufen"
2. Dann veröffentlichen

**Lösung 2:** GitHub Actions manuell starten:
- GitHub → Actions → "RSS-Feed aktualisieren" → "Run workflow"

---

### Plattform-Icons werden nicht angezeigt

**Problem:** Die SVG-Icons der Plattformen fehlen auf der Webseite.

**Lösung:** Die Icon-Dateien sollten im Ordner `artifacts\slotcast-web\public\icons\` liegen. Prüfe, ob die Dateien vorhanden sind (z.B. `spotify.svg`, `youtube.svg`, etc.).

---

## 19. Tägliche Nutzung

**Wenn du eine neue Folge veröffentlicht hast:**

1. Warte, bis die neue Folge im RSS-Feed von Anchor/Spotify verfügbar ist (kann einige Stunden dauern)
2. Starte die Creator-App (`start-creator.bat`)
3. Gehe zu **"Veröffentlichen"**
4. Klicke auf **"📡 RSS-Feed jetzt abrufen"**
5. Trage als Beschreibung ein: `Neue Folge: [Titel der Folge]`
6. Klicke auf **"🚀 Auf GitHub veröffentlichen"**
7. Fertig! Die Webseite aktualisiert sich automatisch innerhalb von 2–3 Minuten

**Alternativ:** Einfach abwarten. GitHub Actions holt den RSS-Feed alle 6 Stunden automatisch.

**Wenn du einen Plattform-Link ergänzen möchtest:**

1. Creator-App starten
2. **"Plattformen"** → ✏️ neben der Plattform klicken
3. Link eintragen → Speichern
4. **"Veröffentlichen"** → Sicherung erstellen → Auf GitHub veröffentlichen

**Wenn du Impressum oder Datenschutz ändern möchtest:**

Öffne die Datei `artifacts\slotcast-web\public\data\legal.json` im Texteditor (z.B. Notepad++):
1. Finde den entsprechenden Abschnitt (`impressum` oder `datenschutz`)
2. Ändere die Texte in den `"text"`-Feldern
3. Speichere die Datei
4. Veröffentliche die Änderung über die Creator-App

---

## 20. Produktivstart-Checkliste

Hake alles ab, bevor deine Webseite live geht:

**Installation & Einrichtung:**
- [ ] Node.js installiert und getestet (`node --version`)
- [ ] Git installiert und konfiguriert (Name und E-Mail)
- [ ] GitHub-Konto erstellt
- [ ] Personal Access Token erstellt und gespeichert
- [ ] Repository erstellt und mit lokalem Projekt verbunden
- [ ] Ersten Push durchgeführt (`git push -u origin main`)

**GitHub Pages:**
- [ ] GitHub Pages aktiviert (Settings → Pages → Source: GitHub Actions)
- [ ] Ersten Deployment-Workflow abgewartet (grüner Haken bei Actions)
- [ ] Webseite unter `https://dein-name.github.io/slotcast/` geöffnet

**Inhalte:**
- [ ] Podcast-Titel und Beschreibung eingetragen
- [ ] RSS-Feed-URL getestet
- [ ] Logo hochgeladen
- [ ] Cover-Bild hochgeladen
- [ ] Basis-URL in den Einstellungen eingetragen
- [ ] Sitemap.xml angepasst (YOUR_GITHUB_USERNAME ersetzt)
- [ ] Impressum ausgefüllt (echter Name und Adresse)
- [ ] Datenschutzerklärung geprüft

**Plattformen:**
- [ ] YouTube-Link eingetragen (bereits vorhanden)
- [ ] Spotify-Link eingetragen (sobald verfügbar)
- [ ] Alle anderen Plattform-Links eingetragen oder als "bald verfügbar" gelassen

**RSS & Episoden:**
- [ ] RSS-Feed einmal manuell abgerufen
- [ ] Episoden werden auf der Webseite angezeigt
- [ ] GitHub Actions "RSS-Feed aktualisieren" einmal manuell gestartet

---

## 21. Zentrale Übersicht aller einzutragenden Angaben

Diese Angaben musst du noch eintragen. Öffne die Creator-App und fülle alles aus.

### Pflichtangaben (für den Betrieb der Webseite)

| Feld | Wo einzutragen | Beispiel / Hinweis |
|------|---------------|-------------------|
| **Podcast-Beschreibung** | Creator-App → Einstellungen | "Der Gaming-Podcast von all_in_gam3s..." |
| **Basis-URL** | Creator-App → Einstellungen → SEO | `https://dein-name.github.io/slotcast/` |
| **Logo** | Creator-App → Einstellungen → Bilder | PNG empfohlen, transparent |
| **Cover-Bild** | Creator-App → Einstellungen → Bilder | Min. 1400×1400px, JPG/PNG |

### Impressum (gesetzliche Pflicht!)

Öffne: `artifacts\slotcast-web\public\data\legal.json`

| Feld | Wo | Hinweis |
|------|-----|---------|
| **Vollständiger Name** | legal.json → impressum → content[0].text | Echter Name, keine Pseudonyme |
| **Straße und Hausnummer** | legal.json → impressum → content[0].text | Meldeadresse |
| **PLZ und Ort** | legal.json → impressum → content[0].text | Meldeadresse |
| **E-Mail-Adresse** | legal.json → impressum → content[0].text | Erreichbare E-Mail |

> **Rechtlicher Hinweis:** Das Impressum ist in Deutschland gesetzlich vorgeschrieben (§ 5 TMG), wenn du eine "geschäftsmäßige" Webseite betreibst. Da ein öffentlicher Podcast als geschäftsmäßig gilt, **musst du deine echten Kontaktdaten angeben**. Kein Pseudonym, keine Postfachadresse.

### Plattform-Links

| Plattform | Status | Einzutragen in |
|-----------|--------|---------------|
| **Spotify** | Noch kein Link | Creator-App → Plattformen → ✏️ |
| **YouTube** | ✅ `@all_in_gam3s` | Bereits eingetragen |
| **YouTube Music** | Noch kein Link | Creator-App → Plattformen → ✏️ |
| **Amazon Music** | Noch kein Link | Creator-App → Plattformen → ✏️ |
| **Castbox** | Noch kein Link | Creator-App → Plattformen → ✏️ |
| **Goodpods** | Noch kein Link | Creator-App → Plattformen → ✏️ |
| **Pocket Casts** | Noch kein Link | Creator-App → Plattformen → ✏️ |
| **Podimo** | Noch kein Link | Creator-App → Plattformen → ✏️ |

### Sitemap

Öffne: `artifacts\slotcast-web\public\sitemap.xml`

Ersetze:
- `YOUR_GITHUB_USERNAME` → deinen GitHub-Benutzernamen
- `YOUR_REPO_NAME` → `slotcast` (oder deinen Repository-Namen)

---

## Dateistruktur-Übersicht

```
slotcast/
│
├── 📄 start-creator.bat           ← Doppelklick zum Starten der Creator-App
├── 📄 README.md                   ← Diese Anleitung
├── 📄 .gitignore                  ← Dateien, die nicht auf GitHub kommen
│
├── 📁 artifacts/slotcast-web/     ← Die öffentliche Webseite
│   └── 📁 public/
│       ├── 📁 data/               ← JSON-Konfigurationsdateien
│       │   ├── config.json        ← Allgemeine Einstellungen
│       │   ├── platforms.json     ← Plattformliste
│       │   ├── episodes.json      ← Episoden (vom RSS-Feed)
│       │   └── legal.json         ← Impressum & Datenschutz
│       ├── 📁 icons/              ← Plattform-Icons (SVG)
│       └── 📁 images/             ← Logo und Cover-Bild
│
├── 📁 packages/creator-app/       ← Die lokale Creator-App
│   └── 📁 backups/                ← Hier werden Sicherungen gespeichert
│
├── 📁 scripts/
│   └── 📄 fetch-rss.mjs           ← RSS-Fetch-Skript
│
└── 📁 .github/workflows/
    ├── 📄 deploy-pages.yml        ← Automatisches Deployment
    └── 📄 fetch-rss.yml           ← Automatische RSS-Aktualisierung
```

---

## Kontakt & Hilfe

Wenn etwas nicht funktioniert:
1. Lies zuerst den Abschnitt [Fehlerbehebung](#18-fehlerbehebung)
2. Prüfe die GitHub Actions (Repository → Actions-Tab) auf Fehlermeldungen
3. Starte den Computer neu und versuche es erneut

---

*Viel Erfolg mit SLOT-CAST | Der all_in_gam3s Podcast!*
