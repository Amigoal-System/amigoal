# Amigoal Entwicklung - Agenten Konfiguration

## Übersicht
Diese Datei definiert die Agenten, die für die Fertigstellung des Amigoal-Projekts zuständig sind.

## Agent 1: Mitglieder & Vereinsverwaltung
**Zuständig für:**
- Members Management (CRUD, Rollen)
- Teams Management  
- Clubs Administration
- Wall of Fame
- Staff Verwaltung

**Zu überprüfen:**
- [ ] `src/ai/flows/members.ts` - RBAC ok
- [ ] `src/ai/flows/teams.ts` - RBAC ok
- [ ] `src/ai/flows/clubs.ts` - RBAC ok
- [ ] `src/components/dashboards/pages/MembersPage.tsx`
- [ ] `src/components/dashboards/pages/TeamsPage.tsx`

---

## Agent 2: Finanzen
**Zuständig für:**
- Mitgliederbeiträge (Invoices)
- Spesen (Expenses)
- Sponsoring
- Team Cash
- Verträge (Contracts)
- Rechnungsstellung

**Zu überprüfen:**
- [ ] `src/ai/flows/expenses.ts` - RBAC ok
- [ ] `src/ai/flows/sponsors.ts` - RBAC ok
- [ ] `src/components/dashboards/pages/InvoicesPage.tsx`
- [ ] `src/components/dashboards/pages/ContractManagementPage.tsx`

---

## Agent 3: Training & Spielbetrieb
**Zuständig für:**
- Trainingsplanung
- Spielvorbereitung (Match Prep)
- Live Ticker
- Taktiktafel
- Leistungsdaten/Statistiken
- Medical Center

**Zu überprüfen:**
- [ ] `src/ai/flows/trainings.ts`
- [ ] `src/ai/flows/matches.ts`
- [ ] `src/components/dashboards/pages/TrainingPrepPage.tsx`
- [ ] `src/components/dashboards/pages/LiveTickerPage.tsx`
- [ ] `src/components/dashboards/pages/MatchPrepPage.tsx`

---

## Agent 4: Turniere & Events
**Zuständig für:**
- Turnier-Management
- Trainingslager
- Bootcamps
- Events/Kalender
- Aufgaben (Tasks)

**Zu überprüfen:**
- [ ] `src/ai/flows/tournaments.ts`
- [ ] `src/ai/flows/camps.ts`
- [ ] `src/ai/flows/bootcamps.ts`
- [ ] `src/components/dashboards/pages/TournamentsPage.tsx`

---

## Agent 5: Kommunikation
**Zuständig für:**
- Chat System
- Newsletter
- Umfragen (Polls)
- Benachrichtigungen

**Zu überprüfen:**
- [ ] `src/ai/flows/chat.ts`
- [ ] `src/ai/flows/newsletter.ts`
- [ ] `src/ai/flows/polls.ts`
- [ ] `src/components/dashboards/pages/ChatPage.tsx`
- [ ] `src/components/dashboards/pages/NewsletterPage.tsx`

---

## Agent 6: Scouting & Spieler
**Zuständig für:**
- Scouting Berichte
- Watchlist
- Spieler-Vermittlung
- Highlights

**Zu überprüfen:**
- [ ] `src/ai/flows/watchlist.ts`
- [ ] `src/ai/flows/clubPlayerSearches.ts`
- [ ] `src/ai/flows/highlights.ts`
- [ ] `src/components/dashboards/pages/ScoutingReportsPage.tsx`
- [ ] `src/components/dashboards/pages/WatchlistPage.tsx`

---

## Agent 7: Super-Admin / Plattform
**Zuständig für:**
- Lead Management
- User Verwaltung
- Vereins-Onboarding
- Globale Konfiguration
- FAQ & Blog
- Rollen & Rechte Matrix

**Zu überprüfen:**
- [ ] `src/ai/flows/leads.ts`
- [ ] `src/ai/flows/users.ts`
- [ ] `src/components/dashboards/pages/LeadsPage.tsx`
- [ ] `src/components/dashboards/pages/UsersPage.tsx`
- [ ] `src/components/dashboards/pages/RolesMatrixPage.tsx`

---

## Noch zu erledigen (Global)
- [ ] RBAC in allen AI-Flows implementieren
- [ ] Firestore Security Rules aktualisieren
- [ ] Authentication Flow testen
- [ ] Deployment Konfiguration prüfen
