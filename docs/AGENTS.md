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

**Status:** ✅ RBAC implementiert
- [x] `src/ai/flows/members.ts` - RBAC ✅
- [x] `src/ai/flows/teams.ts` - RBAC ✅
- [x] `src/ai/flows/clubs.ts` - RBAC ✅

---

## Agent 2: Finanzen
**Zuständig für:**
- Mitgliederbeiträge (Invoices)
- Spesen (Expenses)
- Sponsoring
- Team Cash
- Verträge (Contracts)
- Rechnungsstellung

**Status:** ✅ RBAC implementiert
- [x] `src/ai/flows/expenses.ts` - RBAC ✅
- [x] `src/ai/flows/sponsors.ts` - RBAC ✅

---

## Agent 3: Training & Spielbetrieb
**Zuständig für:**
- Trainingsplanung
- Spielvorbereitung (Match Prep)
- Live Ticker
- Taktiktafel
- Leistungsdaten/Statistiken
- Medical Center

**Status:** ✅ RBAC implementiert
- [x] `src/ai/flows/trainings.ts` - RBAC ✅
- [x] `src/ai/flows/matches.ts` - RBAC ✅

---

## Agent 4: Turniere & Events
**Zuständig für:**
- Turnier-Management
- Trainingslager
- Bootcamps
- Events/Kalender
- Aufgaben (Tasks)

**Status:** ✅ RBAC implementiert
- [x] `src/ai/flows/tournaments.ts` - RBAC ✅
- [x] `src/ai/flows/camps.ts` - RBAC ✅
- [x] `src/ai/flows/events.ts` - RBAC ✅
- [x] `src/ai/flows/tasks.ts` - RBAC ✅

---

## Agent 5: Kommunikation
**Zuständig für:**
- Chat System
- Newsletter
- Umfragen (Polls)
- Benachrichtigungen

**Status:** ✅ RBAC implementiert
- [x] `src/ai/flows/newsletter.ts` - RBAC ✅

---

## Agent 6: Scouting & Spieler
**Zuständig für:**
- Scouting Berichte
- Watchlist
- Spieler-Vermittlung
- Highlights

**Status:** ⏳ Offen
- [ ] `src/ai/flows/watchlist.ts` - RBAC fehlt
- [ ] `src/ai/flows/clubPlayerSearches.ts` - RBAC fehlt
- [ ] `src/ai/flows/highlights.ts` - RBAC fehlt

---

## Agent 7: Super-Admin / Plattform
**Zuständig für:**
- Lead Management
- User Verwaltung
- Vereins-Onboarding
- Globale Konfiguration
- FAQ & Blog
- Rollen & Rechte Matrix

**Status:** ✅ RBAC implementiert
- [x] `src/ai/flows/leads.ts` - RBAC ✅

---

## RBAC Status (Global)
**Implementiert (15 Flows):**
- ✅ members.ts
- ✅ teams.ts
- ✅ clubs.ts
- ✅ expenses.ts
- ✅ sponsors.ts
- ✅ trainings.ts
- ✅ matches.ts
- ✅ events.ts
- ✅ tasks.ts
- ✅ newsletter.ts
- ✅ tournaments.ts
- ✅ camps.ts
- ✅ leads.ts

**Noch fehlend:**
- ❌ chat.ts
- ❌ polls.ts
- ❌ watchlist.ts
- ❌ clubPlayerSearches.ts
- ❌ highlights.ts
- ❌ users.ts
- ❌ investments.ts
- ❌ contracts.ts
- ❌ cards.ts
- ❌ categories.ts
- ❌ locations.ts
- ❌ coupons.ts
- ❌ referrals.ts

---

## Noch zu erledigen (Global)
- [ ] RBAC in restlichen AI-Flows implementieren
- [ ] Firestore Security Rules aktualisieren
- [ ] Authentication Flow testen
- [ ] Deployment Konfiguration prüfen
