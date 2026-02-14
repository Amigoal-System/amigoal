# Amigoal Test Agent - Dokumentation

## Übersicht
Der Test-Agent ist ein automatisiertes Test-Framework, das Testfälle aus Markdown-Dateien liest und ausführt. Aktuell werden **121 Testfälle** für alle 12 Benutzerrollen unterstützt.

## Test-Abdeckung

### Rollen (12 Rollen)
1. ✅ **Super-Admin** (11 Tests)
2. ✅ **Club-Admin** (11 Tests)
3. ✅ **Vorstand (Board)** (10 Tests)
4. ✅ **Trainer (Coach)** (10 Tests)
5. ✅ **Spieler (Player)** (10 Tests)
6. ✅ **Eltern (Parent)** (10 Tests)
7. ✅ **Sponsor** (10 Tests)
8. ✅ **Scouting** (10 Tests)
9. ✅ **Anbieter** (10 Tests)
10. ✅ **Schiedsrichter (Referee)** (10 Tests)
11. ✅ **Verbandsmitarbeiter (Federation)** (10 Tests)
12. ✅ **Fan** (10 Tests)

**Total: 121 Testfälle**

## Verwendung

### 1. Test-Dateien
Testfälle werden in Markdown-Dateien definiert:
- `test-cases.md` - Rollen 1-6 (61 Tests)
- `test-cases-1.md` - Rollen 7-12 (60 Tests)

### 2. Test-Agent ausführen

```bash
# Alle Tests ausführen
node test-agent.js

# Spezifische Datei
node test-agent.js test-cases.md

# Mehrere Dateien
node test-agent.js test-cases.md test-cases-1.md
```

### 3. Test-Report
Ein JSON-Report wird automatisch generiert:
```
test-report-{timestamp}.json
```

## Test-Format

Testfälle werden im Markdown-Format definiert:

```markdown
## 1. Super-Admin

### 1.1 Login & Dashboard
- [ ] **Testfall: Exklusiver Login**
    - **Schritte:** 1. Navigiere zur Haupt-Loginseite. 2. Versuche dich anzumelden.
    - **Erwartetes Ergebnis:** Login schlägt fehl.

- [ ] **Testfall: Dashboard-Daten**
    - **Schritte:** 1. Lade das Dashboard.
    - **Erwartetes Ergebnis:** Statistiken werden korrekt angezeigt.
```

## Zukünftige Erweiterungen

### Phase 1: Manuelle Tests (Aktuell)
- ✅ Testfälle dokumentiert
- ✅ Test-Agent kann Tests parsen und anzeigen
- ✅ Test-Reports generieren

### Phase 2: Halb-Automatisiert
- 🔄 Test-Checklisten für manuelle Tester
- 🔄 Test-Daten vorbereiten
- 🔄 Screenshots automatisch erstellen

### Phase 3: Voll-Automatisiert
- 🔄 Playwright Integration
- 🔄 E2E Tests für kritische Pfade
- 🔄 CI/CD Integration

## Test-Dateien hinzufügen

Neue Test-Dateien können einfach erstellt werden:

1. Neue `.md` Datei erstellen
2. Testfälle im gleichen Format definieren
3. Test-Agent ausführen:
   ```bash
   node test-agent.js neue-tests.md
   ```

## Beispiel-Ausgabe

```
🚀 Amigoal Test Agent
================================================================================

📋 Loading test cases from: test-cases.md
================================================================================
Found 61 test cases

🎭 Role: Super-Admin
--------------------------------------------------------------------------------

  📝 Test: Exklusiver Login
     Steps: 1. Navigiere zur Haupt-Loginseite...
     Expected: Login schlägt fehl...
    ⏸️ Status: PENDING

📊 TEST SUMMARY
================================================================================
Total Tests: 121
✅ Passed: 0
❌ Failed: 0
⏸️ Pending: 121

Success Rate: 0.00%
```
