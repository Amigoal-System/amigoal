# Amigoal: Technische Dokumentation

## 1. Einleitung
Dieses Dokument bietet eine detaillierte technische Übersicht über die Amigoal-Anwendung. Es richtet sich an Entwickler, die die Architektur verstehen, das Projekt lokal aufsetzen oder es erweitern möchten.

## 2. Projektübersicht
Amigoal ist eine umfassende SaaS-Plattform für die Verwaltung von Fussballvereinen, entwickelt mit einem modernen Tech-Stack. Die Plattform bietet rollenbasierte Dashboards für alle Beteiligten im Vereinsleben, von der Vereinsadministration über Trainer und Spieler bis hin zu externen Partnern wie Sponsoren und Anbietern.

## 3. Technologiestack
Die Anwendung basiert auf einem modernen, serverseitig gerenderten Ansatz mit Next.js und nutzt Firebase für Backend-Dienste sowie Genkit für KI-Funktionen.

### 3.1 Kerntechnologien
| Technologie          | Version | Zweck                                       |
| -------------------- | ------- | ------------------------------------------- |
| Next.js              | 14.2.x  | Full-Stack-Framework (React)                |
| React                | 18.x    | UI-Bibliothek                               |
| TypeScript           | 5.x     | Typsicherheit                               |
| Tailwind CSS         | 3.4.x   | Utility-first CSS-Framework                 |
| shadcn/ui            | -       | UI-Komponenten                              |
| Firebase             | 12.x    | Backend-Dienste (Auth, Firestore, Storage)  |
| Genkit (Google AI)   | 1.x     | KI-Flows & serverseitige Logik              |
| Node.js              | 20.x    | Serverseitige Laufzeitumgebung              |
| `firebase-admin`     | 12.x    | Firebase-Zugriff auf dem Server             |

### 3.2 Analyse & Empfehlungen
*   **Next.js:** Die aktuelle Version ist solide. Ein Upgrade auf Next.js 15 wäre zu prüfen, um von den neuesten React-Compiler-Optimierungen und weiteren Performance-Verbesserungen zu profitieren.
*   **Firebase:** Die Verwendung der modularen v9+ SDKs ist bereits umgesetzt und Best Practice.
*   **Genkit:** Die Nutzung der v1.x API ist aktuell und sollte beibehalten werden.

**Empfehlung:** Ein zeitnahes Upgrade auf die jeweils neueste stabile Version von Next.js wird empfohlen, um die Performance und Entwicklererfahrung zu optimieren.

## 4. Projektstruktur
Die Ordnerstruktur ist darauf ausgelegt, eine klare Trennung zwischen UI-Komponenten, Logik, Konfiguration und serverseitigen Funktionen zu gewährleisten.

```
/
├── src/
│   ├── app/                    # Next.js App Router: Seiten & Layouts
│   │   ├── [lang]/             # Sprach-Routing (i18n)
│   │   │   ├── dashboard/      # Geschützter Dashboard-Bereich
│   │   │   └── ...             # Öffentliche Seiten (Login, Register etc.)
│   │   └── layout.tsx          # Root-Layout
│   ├── ai/                     # Genkit AI-Flows
│   │   ├── flows/              # Serverseitige Logik & KI-Funktionen
│   │   └── genkit.ts           # Genkit Initialisierung
│   ├── components/             # Wiederverwendbare React-Komponenten
│   │   ├── dashboards/         # Spezifische Dashboard-Seiten
│   │   └── ui/                 # Basis-UI-Komponenten (shadcn/ui)
│   ├── firebase/               # Firebase Client-Konfiguration & Hooks
│   │   ├── auth/
│   │   ├── firestore/
│   │   └── ...
│   ├── hooks/                  # Client-seitige React-Hooks (z.B. useTeam)
│   ├── lib/                    # Hilfsfunktionen & Typdefinitionen
│   │   ├── firebase/           # Firebase-Initialisierung (Client & Server)
│   │   └── ...
│   ├── services/               # Serverseitige Dienste (z.B. E-Mail)
│   └── locales/                # Sprachdateien für i18n
├── docs/
│   └── backend.json          # Schema-Definition für Firestore & Entitäten
├── .env.local                  # Lokale Umgebungsvariablen (Keys)
├── firestore.rules             # Firestore-Sicherheitsregeln
├── next.config.ts              # Next.js Konfiguration
└── package.json                # Abhängigkeiten & Skripte
```

## 5. Architektur & Datenfluss

### 5.1 Frontend (Next.js App Router)
- **Server Components:** Der Grossteil der Komponenten wird standardmässig als React Server Component (RSC) gerendert, um die an den Client gesendete JavaScript-Menge zu minimieren.
- **Client Components (`'use client'`):** Komponenten, die Interaktivität oder State (z.B. `useState`, `useEffect`) benötigen, werden explizit mit `'use client'` markiert.
- **Daten-Hooks:** Client-Komponenten nutzen benutzerdefinierte Hooks (z.B. `useMembers`, `useTeams`), die serverseitige Genkit-Flows aufrufen, um Daten zu laden. Dies geschieht über von Next.js generierte RPC-Endpunkte (Server Actions).

### 5.2 Backend (Genkit & Server Actions)
- **Genkit-Flows:** Die gesamte serverseitige Geschäftslogik ist in Genkit-Flows gekapselt (`/src/ai/flows`). Diese sind mit `'use server';` markiert.
- **Datenbank-Interaktion:** Flows interagieren über das `firebase-admin` SDK mit Firestore, um Daten zu lesen oder zu schreiben (z.B. `getAllClubs`, `addMember`).
- **Aufruf durch Clients:** Client-Komponenten rufen diese Flows wie asynchrone Funktionen auf. Next.js kümmert sich im Hintergrund um die RPC-Kommunikation.

**Beispiel Datenfluss:**
1.  Ein Client Component (z.B. `MembersPage.tsx`) benötigt eine Liste aller Mitglieder.
2.  Es ruft den Hook `useMembers()` auf.
3.  Der Hook ruft die Server Action `getAllMembers()` aus `/src/ai/flows/members.ts` auf.
4.  Der `getAllMembers`-Flow auf dem Server nutzt das `firebase-admin` SDK, um die Daten aus Firestore zu lesen.
5.  Die Daten werden als JSON an den Client zurückgegeben und im State des Hooks gespeichert, was zu einem Re-Render der Komponente führt.

### 5.3 Datenbank (Firebase Firestore)
- **Struktur:** Die Firestore-Struktur wird durch `docs/backend.json` definiert. Dieses "Schema" dient als Vorlage und Referenz für die Datenmodellierung.
- **Sicherheit:** Der Datenzugriff wird durch `firestore.rules` geregelt. Diese Regeln stellen sicher, dass Benutzer nur auf die Daten zugreifen können, für die sie autorisiert sind (z.B. ein Club-Admin nur auf die Daten seines Vereins).

## 6. Authentifizierung & Rollen
- **Firebase Auth:** Die Authentifizierung erfolgt über Firebase Authentication. Unterstützt werden E-Mail/Passwort und OAuth-Anbieter wie Google.
- **Login-Flow:** Der Login-Prozess ist abstrahiert. Ein Benutzer gibt einen Identifier (Username oder E-Mail) ein. Der serverseitige Flow `getEmailForLogin` löst diesen Identifier zur korrekten E-Mail-Adresse auf, bevor der eigentliche Firebase-Login-Versuch stattfindet.
- **Rollenmanagement:** Nach dem Login werden die Rollen des Benutzers aus der `members`-Collection (für Vereinsmitglieder) oder einer speziellen Collection (für Super-Admins) geladen. Der `useTeam`-Hook stellt die aktive Rolle und andere Benutzerdaten im gesamten Dashboard zur Verfügung.
- **Super-Admin 2FA:** Das Super-Admin-Konto ist zusätzlich durch eine Zwei-Faktor-Authentifizierung (2FA) via Authenticator-App geschützt.

## 7. Setup & Lokale Entwicklung

1.  **Repository klonen:** Klonen Sie das Projekt-Repository.
2.  **Umgebungsvariablen:** Benennen Sie `.env.example` in `.env.local` um und füllen Sie die erforderlichen Keys aus:
    *   **Firebase Project Config:** Diese öffentlichen Keys finden Sie in den Projekteinstellungen Ihrer Firebase-Konsole.
    *   **Firebase Service Account Key:** Ein privater Key für den Server-Zugriff. Erstellen Sie diesen in der Firebase-Konsole (`Diensteinstellungen > Dienstkonten`) und **kodieren Sie den gesamten JSON-Inhalt als Base64-String**, bevor Sie ihn in `.env.local` einfügen.
    *   **Google AI / Gemini API Key:** Erforderlich für die KI-Funktionen.
3.  **Abhängigkeiten installieren:** Führen Sie `npm install` im Projektverzeichnis aus.
4.  **Entwicklungsserver starten:** Starten Sie die Anwendung mit `npm run dev`.
5.  **Seed-Skript:** Beim ersten Start im Entwicklungsmodus wird automatisch das Seed-Skript (`src/ai/flows/seed.ts`) ausgeführt, um die Datenbank mit initialen Demo-Daten zu befüllen.

## 8. Modul-Übersicht

| Modul                  | Kurzbeschreibung                                                                    | Hauptordner / Dateien                                     |
| ---------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Benutzer & Teams**     | Kernverwaltung von Mitgliedern, Rollen und Mannschaftsstrukturen.                     | `/ai/flows/members.ts`, `/ai/flows/teams.ts`, `/hooks/useMembers.ts` |
| **Finanzen**           | Mitgliederbeiträge, Spesen, Mannschaftskasse und Sponsoring-Verwaltung.         | `/ai/flows/sponsors.ts`, `/ai/flows/expenses.ts`                |
| **Training & Spiel**   | Planung von Trainings, Taktiktafel, Live-Ticker und KI-Spielanalyse.              | `/components/dashboards/pages/MatchPrepPage.tsx`          |
| **Turnier-Management** | Eigenständiges Modul zur kompletten Organisation von Turnieren inkl. POS-System.      | `/components/dashboards/pages/TournamentsPage.tsx`        |
| **Travel & Events**    | Verwaltung von Trainingslagern und Bootcamps in Zusammenarbeit mit Anbietern.       | `/ai/flows/camps.ts`, `/ai/flows/bootcamps.ts`             |
| **Kommunikation**      | Interner Chat, Newsletter-Tool und Event-Kalender.                                | `/ai/flows/chat.ts`, `/ai/flows/newsletter.ts`             |
| **SaaS-Admin**         | Super-Admin-Tools zur Verwaltung der gesamten Plattform (Vereine, Leads, System). | `/components/dashboards/SuperAdminDashboard.tsx`          |

## 9. Deployment
Die Anwendung ist für das Deployment auf Firebase App Hosting konfiguriert. Die Einstellungen dazu finden sich in `apphosting.yaml`. Ein Push in den `main`-Branch löst normalerweise einen automatischen Build und ein Deployment aus.
