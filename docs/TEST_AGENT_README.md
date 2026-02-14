# Test Agent - Amigoal Automated Testing

## Übersicht
Der Test-Agent ist ein automatisiertes Test-Framework für die Amigoal-Plattform. Er liest Testfälle aus Markdown-Dateien und führt sie aus.

## Verwendung

### 1. Test-Dateien erstellen
Testfälle werden in Markdown-Dateien mit folgendem Format definiert:

```markdown
## 1. Super-Admin

### 1.1 Login & Dashboard
- [ ] **Testfall: Exklusiver Login**
    - **Schritte:** 1. Navigiere zur Haupt-Loginseite. 2. Versuche dich anzumelden.
    - **Erwartetes Ergebnis:** Login schlägt fehl. Fehlermeldung erscheint.
```

### 2. Test-Agent ausführen

```bash
# Alle Test-Dateien ausführen
node test-agent.js

# Spezifische Datei ausführen
node test-agent.js /root/amigoal/test-cases.md

# Mehrere Dateien ausführen
node test-agent.js test-cases.md test-cases-1.md
```

### 3. Test-Report
Nach der Ausführung wird ein JSON-Report generiert:
- `test-report-{timestamp}.json`

## Test-Dateien

- **test-cases.md** - Haupt-Testfälle (Super-Admin bis Fan)
- **test-cases-1.md** - Erweiterte Testfälle
- Weitere Dateien können hinzugefügt werden

## Test-Struktur

### Rollen
1. Super-Admin
2. Club-Admin
3. Vorstand (Board)
4. Trainer (Coach)
5. Spieler (Player)
6. Eltern (Parent)
7. Sponsor
8. Scouting
9. Anbieter (Bootcamp, Trainingslager, Turnier)
10. Schiedsrichter (Referee)
11. Verbandsmitarbeiter (Federation)
12. Fan

### Test-Typen
- **Login & Dashboard** - Authentifizierung und Übersicht
- **Plattform-Management** - Administration
- **Finanzen** - Buchhaltung und Spesen
- **Kommunikation** - Chat, Newsletter, Umfragen
- **Training & Spiel** - Trainingsplanung, Taktik
- **Events** - Turniere, Camps
- **Scouting** - Spieler-Suche und Watchlist

## Zukünftige Erweiterungen

### Automatisierung mit Playwright
```javascript
// Beispiel für echte Browser-Automation
const { chromium } = require('playwright');

async function runTest(test) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    
    // Test ausführen
    await page.goto('https://amigoal.app');
    await page.fill('[name="email"]', 'super.admin@amigoal.ch');
    await page.fill('[name="password"]', 'password');
    await page.click('[type="submit"]');
    
    // Assertions
    const dashboard = await page.isVisible('[data-testid="dashboard"]');
    
    await browser.close();
    return { status: dashboard ? 'passed' : 'failed' };
}
```

### CI/CD Integration
```yaml
# .github/workflows/test.yml
name: Run Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Test Agent
        run: node test-agent.js
```
