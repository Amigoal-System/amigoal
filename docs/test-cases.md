# Amigoal - Detaillierte Test-Checkliste

Dieses Dokument dient als umfassende Checkliste für das manuelle Testen aller Funktionen und Benutzerrollen der Amigoal-Plattform. Jeder Testfall beschreibt die Schritte und das erwartete Ergebnis.

---

## Inhaltsverzeichnis

1.  [Super-Admin](#1-super-admin)
2.  [Club-Admin](#2-club-admin)
3.  [Vorstand (Board)](#3-vorstand-board)
4.  [Trainer (Coach)](#4-trainer-coach)
5.  [Spieler (Player)](#5-spieler-player)
6.  [Eltern (Parent)](#6-eltern-parent)
7.  [Sponsor](#7-sponsor)
8.  [Scouting](#8-scouting)
9.  [Anbieter (Bootcamp, Trainingslager, Turnier)](#9-anbieter-bootcamp-trainingslager-turnier)
10. [Schiedsrichter (Referee)](#10-schiedsrichter-referee)
11. [Verbandsmitarbeiter (Federation)](#11-verbandsmitarbeiter-federation)
12. [Fan](#12-fan)

---

## 1. Super-Admin

### 1.1 Login & Dashboard
- [ ] **Testfall: Exklusiver Login**
    - **Schritte:** 1. Navigiere zur Haupt-Loginseite (`/`). 2. Versuche, dich mit `super.admin@amigoal.ch` anzumelden.
    - **Erwartetes Ergebnis:** Login schlägt fehl. Es muss eine Fehlermeldung erscheinen.
    - **Schritte:** 1. Navigiere zu `/saas-superlogin`. 2. Melde dich mit `super.admin@amigoal.ch` an.
    - **Erwartetes Ergebnis:** Login ist erfolgreich. Das Super-Admin Dashboard wird angezeigt.

- [ ] **Testfall: Dashboard-Daten**
    - **Schritte:** 1. Lade das Super-Admin Dashboard.
    - **Erwartetes Ergebnis:** Alle Statistik-Karten (Aktive Vereine, Benutzer, Leads etc.) zeigen plausible Zahlen an. Neue Leads und Spieler auf der Warteliste werden korrekt angezeigt.

### 1.2 Plattform-Management
- [ ] **Testfall: Neuen Verein erstellen**
    - **Schritte:** 1. Navigiere zu "Vereine". 2. Klicke auf "Neuen Verein hinzufügen". 3. Fülle alle Pflichtfelder aus (Name, Manager, Login-Benutzername, E-Mail). 4. Speichern.
    - **Erwartetes Ergebnis:** Der Verein erscheint in der Vereinsliste. Der neue Club-Admin-Account wird in Firebase Auth erstellt. Eine Willkommens-E-Mail wird (simuliert) an die E-Mail des Club-Admins gesendet.

- [ ] **Testfall: Vereine bearbeiten und sperren**
    - **Schritte:** 1. Klicke auf "Bearbeiten" bei einem bestehenden Verein. 2. Ändere den Namen des Managers. 3. Speichern.
    - **Erwartetes Ergebnis:** Die Daten in der Liste werden aktualisiert.
    - **Schritte:** 1. Nutze das Aktionsmenü, um einen Verein zu "sperren".
    - **Erwartetes Ergebnis:** Der Status des Vereins ändert sich auf "Gesperrt". Der zugehörige Club-Admin-Account in Firebase Auth wird deaktiviert.

- [ ] **Testfall: Benutzer durchsuchen und filtern**
    - **Schritte:** 1. Navigiere zu "Benutzer". 2. Gib den Namen eines existierenden Benutzers in das Suchfeld ein.
    - **Erwartetes Ergebnis:** Die Liste filtert sich und zeigt nur den gesuchten Benutzer an.
    - **Schritte:** 1. Wähle einen Filter (z.B. "Bezahlt").
    - **Erwartetes Ergebnis:** Die Liste zeigt nur Mitglieder mit dem entsprechenden Status.

### 1.3 Finanz- & Vertrags-Cockpit
- [ ] **Testfall: SaaS-Vertrag erstellen**
    - **Schritte:** 1. Navigiere zu "SaaS-Verträge". 2. Klicke auf "Neuen Vertrag erstellen". 3. Fülle die Daten für einen Partner aus. 4. Speichern.
    - **Erwartetes Ergebnis:** Der neue Vertrag erscheint in der Liste.

- [ ] **Testfall: Mahnung für Verein auslösen**
    - **Schritte:** 1. Navigiere zu "SaaS Abrechnungen". 2. Wähle einen überfälligen Verein aus. 3. Klicke auf "Mahnen". 4. Wähle eine Mahnstufe und bestätige.
    - **Erwartetes Ergebnis:** Eine Mahn-E-Mail wird (simuliert) ausgelöst. Der Status in der Übersicht wird aktualisiert.

- [ ] **Testfall: Sponsoring-Match vorschlagen**
    - **Schritte:** 1. Navigiere zum "Sponsoring Marktplatz". 2. Wähle einen sponsorensuchenden Verein aus. 3. Wähle im Modal einen passenden Sponsor aus. 4. Klicke auf "Match vorschlagen".
    - **Erwartetes Ergebnis:** Eine Benachrichtigung wird (simuliert) an Verein und Sponsor gesendet. Der Status des Vereins/Sponsors ändert sich zu "Vorgeschlagen".

### 1.4 Globale Suche
- [ ] **Testfall: Globale Suche**
    - **Schritte:** 1. Gib den Namen eines Vereins, eines Mitglieds (aus einem beliebigen Verein) oder eines Vertrags in die globale Suchleiste im Header ein.
    - **Erwartetes Ergebnis:** Die Suchergebnisseite (`/dashboard/search`) wird geöffnet und zeigt relevante Treffer aus der gesamten Plattform an.

### 1.5 Systemkonfiguration
- [ ] **Testfall: Rollen-Matrix anpassen**
    - **Schritte:** 1. Navigiere zu "Einstellungen" -> "Rollen & Rechte". 2. Ändere die Berechtigung für die Rolle "Coach" für das Modul "Finanzen" von "Limit" auf "Kein". 3. Speichern. 4. Melde dich als Coach an.
    - **Erwartetes Ergebnis:** Der Menüpunkt "Finanzen" ist für den Coach nicht mehr sichtbar.

- [ ] **Testfall: Sponsoring-Paket hinzufügen**
    - **Schritte:** 1. Navigiere zu "Einstellungen" -> "Sponsoring Pakete". 2. Klicke auf "Neues Paket". 3. Fülle die Daten für ein "Matchball-Sponsoring" aus. 4. Speichern.
    - **Erwartetes Ergebnis:** Das neue Paket ist in der Liste sichtbar und kann von Vereinen verwendet werden.

---

## 2. Club-Admin

### 2.1 Login & Dashboard
- [ ] **Testfall: Login mit Club-Benutzername**
    - **Schritte:** 1. Navigiere zur Haupt-Loginseite. 2. Gib den spezifischen Club-Login-Benutzernamen ein (z.B. `admin@fcdietikon`). 3. Gib das Passwort ein und melde dich an.
    - **Erwartetes Ergebnis:** Login ist erfolgreich. Das Club-Admin Dashboard wird angezeigt. Die angezeigten Daten (Statistiken, Teams) beziehen sich korrekt auf den eigenen Verein.

### 2.2 Vereins-Cockpit
- [ ] **Testfall: Mitglied über den Wizard erstellen**
    - **Schritte:** 1. Navigiere zu "Mitglieder". 2. Klicke auf "Neues Mitglied". 3. Fülle alle Schritte des Wizards aus (Personalien, Rollen, Teams, Finanzen). 4. Schliesse den Wizard ab.
    - **Erwartetes Ergebnis:** Das neue Mitglied erscheint in der Mitgliederliste. Ein Auth-Benutzer wird erstellt und eine Willkommens-E-Mail (simuliert) versendet.

- [ ] **Testfall: Mitglieder per CSV importieren**
    - **Schritte:** 1. Navigiere zu "Mitglieder". 2. Klicke auf "Importieren". 3. Lade die CSV-Vorlage herunter. 4. Fülle die Vorlage mit 2-3 Test-Mitgliedern aus. 5. Lade die ausgefüllte CSV-Datei hoch und starte den Import.
    - **Erwartetes Ergebnis:** Die neuen Mitglieder erscheinen in der Mitgliederliste. Eine Erfolgsmeldung wird angezeigt.

- [ ] **Testfall: Vereins-Branding anpassen**
    - **Schritte:** 1. Navigiere zu "Einstellungen" -> "Branding". 2. Ändere die Primärfarbe des Vereins. 3. Lade ein neues Logo hoch. 4. Speichern.
    - **Erwartetes Ergebnis:** Das Farbschema der App passt sich sofort an. Das neue Logo wird im Header und an anderen Stellen angezeigt.

### 2.3 Finanzen
- [ ] **Testfall: Spesen genehmigen**
    - **Schritte:** 1. Melde dich als Trainer an und reiche eine Spese ein. 2. Melde dich als Club-Admin an. 3. Navigiere zu "Finanzen" -> "Spesen". 4. Öffne die eingereichte Spese. 5. Ändere den Status auf "Genehmigt" und speichere.
    - **Erwartetes Ergebnis:** Der Status der Spese wird aktualisiert. Der Trainer erhält eine Benachrichtigung.

- [ ] **Testfall: Neuen Sponsor erfassen**
    - **Schritte:** 1. Navigiere zu "Sponsoring". 2. Klicke auf "Neuen Sponsor hinzufügen". 3. Fülle alle Daten aus und weise ein Sponsoring-Paket zu. 4. Speichern.
    - **Erwartetes Ergebnis:** Der neue Sponsor erscheint in der Sponsorenliste.

### 2.4 Globale Suche
- [ ] **Testfall: Eingeschränkte Suche**
    - **Schritte:** 1. Gib den Namen eines Mitglieds aus einem **fremden** Verein in die globale Suche ein.
    - **Erwartetes Ergebnis:** Die Suche liefert keine Ergebnisse.
    - **Schritte:** 2. Gib den Namen eines Mitglieds aus dem **eigenen** Verein ein.
    - **Erwartetes Ergebnis:** Die Suche liefert korrekte Ergebnisse aus dem eigenen Verein.

### 2.5 Kommunikation
- [ ] **Testfall: Vereinsweite Umfrage erstellen**
    - **Schritte:** 1. Navigiere zu "Umfragen". 2. Klicke auf "Neue Umfrage". 3. Definiere eine Frage und mindestens zwei Antwortoptionen. 4. Setze die Sichtbarkeit auf "Mein Club". 5. Veröffentlichen.
    - **Erwartetes Ergebnis:** Die Umfrage ist für alle Mitglieder des Vereins im Dashboard sichtbar.

- [ ] **Testfall: Newsletter-Gruppe erstellen**
    - **Schritte:** 1. Navigiere zu "Newsletter". 2. Erstelle eine neue Gruppe namens "Vorstand". 3. Füge manuell die Vorstandsmitglieder hinzu. 4. Speichern.
    - **Erwartetes Ergebnis:** Die Gruppe "Vorstand" erscheint in der Gruppenliste mit der korrekten Mitgliederzahl.

- [ ] **Testfall: Event für den ganzen Verein erstellen**
    - **Schritte:** 1. Navigiere zu "Events". 2. Erstelle ein neues Event "Clubfest". 3. Definiere Datum, Zeit und Ort. 4. Speichern.
    - **Erwartetes Ergebnis:** Das Event erscheint im Kalender aller Vereinsmitglieder.

---

## 3. Vorstand (Board)

- [ ] **Testfall: Verhaltenskodex definieren**
    - **Schritte:** 1. Navigiere zu "Verhalten & Bussen". 2. Klicke auf "Vereinsregeln bearbeiten". 3. Füge eine neue Regel hinzu und speichere.
    - **Erwartetes Ergebnis:** Die neue Regel ist im Regelwerk sichtbar.

- [ ] **Testfall: Aufgabe an Trainer delegieren**
    - **Schritte:** 1. Navigiere zu "Aufgaben". 2. Erstelle eine neue Aufgabe. 3. Weise die Aufgabe einem spezifischen Trainer zu.
    - **Erwartetes Ergebnis:** Die Aufgabe erscheint in der Aufgabenliste. Der Trainer erhält eine Benachrichtigung und sieht die Aufgabe in seinem Dashboard.

- [ ] **Testfall: Highlight genehmigen**
    - **Schritte:** 1. Melde dich als Fan an und lade ein Video-Highlight hoch. 2. Melde dich als Vorstand an. 3. Navigiere zu "Highlights". 4. Wähle das ausstehende Highlight und klicke auf "Freigeben".
    - **Erwartetes Ergebnis:** Das Highlight erscheint auf der öffentlichen Highlight-Seite.

- [ ] **Testfall: Scout ernennen**
    - **Schritte:** 1. Navigiere zu "Mitglieder". 2. Wähle ein bestehendes Mitglied (z.B. einen Trainer) aus. 3. Bearbeite das Profil und füge die Rolle "Scouting" hinzu.
    - **Erwartetes Ergebnis:** Das Mitglied hat nun Zugriff auf das Scouting-Modul.

- [ ] **Testfall: Vereinsstrategie definieren**
    - **Schritte:** 1. Navigiere zu "Vereinsstrategie". 2. Klicke auf "Bearbeiten". 3. Ändere die Vision des Vereins und füge ein neues Ziel hinzu. 4. Speichern.
    - **Erwartetes Ergebnis:** Die neue Vision und das neue Ziel werden auf der Seite angezeigt.

- [ ] **Testfall: Saisonübergang initiieren**
    - **Schritte:** 1. Navigiere zu "Saisonübergang". 2. Bestätige den Finanzabschluss. 3. Überprüfe die Mannschafts-Promotionen und archiviere ein Test-Team. 4. Bestätige den Übergang.
    - **Erwartetes Ergebnis:** Der Prozess wird abgeschlossen und eine Erfolgsmeldung angezeigt. Das archivierte Team erscheint nicht mehr in der Hauptübersicht.

- [ ] **Testfall: Aufgabendelegation an Manager**
    - **Schritte:** 1. Navigiere zu "Aufgaben". 2. Erstelle eine Aufgabe "Jahresabschluss vorbereiten" und weise sie einem Manager mit Finanz-Fokus zu.
    - **Erwartetes Ergebnis:** Der Manager erhält eine Benachrichtigung über die neue Aufgabe.

- [ ] **Testfall: Sponsoring-Event organisieren**
    - **Schritte:** 1. Navigiere zu "Events". 2. Erstelle ein neues Event vom Typ "Networking" mit dem Titel "Sponsoren-Apéro". 3. Lade über die Teilnehmer-Auswahl alle Sponsoren ein.
    - **Erwartetes Ergebnis:** Das Event wird erstellt. Alle Mitglieder mit der Rolle "Sponsor" erhalten eine Einladung.

- [ ] **Testfall: Einsicht in Finanz-Dashboard**
    - **Schritte:** 1. Navigiere zum "Dashboard". 2. Überprüfe die Finanz-KPIs (Einnahmen, Ausgaben).
    - **Erwartetes Ergebnis:** Die Finanzdaten sind sichtbar und plausibel.

- [ ] **Testfall: Scouting-Berichte sichten**
    - **Schritte:** 1. Ein Scout erstellt einen neuen Bericht. 2. Melde dich als Vorstand an. 3. Navigiere zu "Scouting" -> "Berichte".
    - **Erwartetes Ergebnis:** Der neue Bericht ist sichtbar und kann geöffnet werden.

---

## 4. Trainer (Coach)

- [ ] **Testfall: Mannschaftswechsel**
    - **Schritte:** 1. Stelle sicher, dass der Coach mehreren Mannschaften zugewiesen ist. 2. Wähle im Dashboard eine andere Mannschaft aus.
    - **Erwartetes Ergebnis:** Alle angezeigten Daten (Termine, Spielerliste, Aufgaben etc.) aktualisieren sich und beziehen sich auf die neu ausgewählte Mannschaft.

- [ ] **Testfall: Spieler zum Probetraining einladen**
    - **Schritte:** 1. Der Super-Admin schlägt dem Trainer einen Spieler vor. 2. Im Coach-Dashboard erscheint die Benachrichtigung. 3. Klicke auf "Zum Probetraining einladen".
    - **Erwartetes Ergebnis:** Eine Einladung wird an den Spieler (bzw. seine Eltern) gesendet. Der Status des Vorschlags ändert sich.

- [ ] **Testfall: Anwesenheit im Training erfassen**
    - **Schritte:** 1. Öffne ein anstehendes Training. 2. Markiere einige Spieler als "Anwesend" und andere als "Abwesend". 3. Melde einen Spieler manuell als "Nicht abgemeldet" ab.
    - **Erwartetes Ergebnis:** Die Anwesenheitsliste wird gespeichert. Die Anwesenheitsstatistik des Spielers wird aktualisiert.

- [ ] **Testfall: KI-Spielanalyse generieren**
    - **Schritte:** 1. Navigiere zu einem vergangenen Spiel. 2. Klicke auf "Analysieren".
    - **Erwartetes Ergebnis:** Ein Modal öffnet sich und nach kurzer Ladezeit wird eine von der KI generierte Analyse des Spiels angezeigt.

- [ ] **Testfall: Training vorbereiten**
    - **Schritte:** 1. Navigiere zu "Trainingsvorbereitung". 2. Erstelle einen neuen Trainingsplan mit mindestens drei Übungen per Drag & Drop. 3. Speichern.
    - **Erwartetes Ergebnis:** Der Trainingsplan wird gespeichert und kann für zukünftige Trainings wiederverwendet werden.

- [ ] **Testfall: Aufstellung in Taktiktafel festlegen**
    - **Schritte:** 1. Navigiere zu "Spielvorbereitung". 2. Ziehe 11 Spieler aus der Liste auf das Spielfeld. 3. Speichere die Aufstellung.
    - **Erwartetes Ergebnis:** Die Aufstellung wird gespeichert und ist für die Spieler sichtbar.

- [ ] **Testfall: Spese einreichen**
    - **Schritte:** 1. Navigiere zu "Finanzen" -> "Spesen". 2. Erstelle eine neue Spese für "Materialkauf" mit einem Betrag und lade einen Quittungs-Beleg hoch. 3. Einreichen.
    - **Erwartetes Ergebnis:** Die Spese erscheint in der Übersicht mit dem Status "Offen".

- [ ] **Testfall: Spielerfeedback nach Spiel abgeben**
    - **Schritte:** 1. Wähle ein vergangenes Spiel. 2. Wähle einen Spieler aus, der gespielt hat. 3. Gib eine Bewertung (z.B. 1-5 Sterne) und einen kurzen Text als Feedback ein.
    - **Erwartetes Ergebnis:** Das Feedback wird gespeichert und ist für den Spieler in seinem Cockpit sichtbar.

- [ ] **Testfall: Verstärkungsbedarf melden**
    - **Schritte:** 1. Navigiere zum Mannschafts-Dashboard. 2. Finde den Bereich "Verstärkung" und melde einen Bedarf für die Position "Mittelstürmer".
    - **Erwartetes Ergebnis:** Der Vorstand/Sportchef erhält eine Benachrichtigung über den Bedarf.

- [ ] **Testfall: Verwarnung an Spieler & Eltern senden**
    - **Schritte:** 1. Navigiere zum Profil eines Spielers. 2. Erstelle einen neuen Eintrag im "Verhalten"-Tab als "Verwarnung". 3. Wähle aus, dass auch die Eltern benachrichtigt werden sollen.
    - **Erwartetes Ergebnis:** Spieler und Elternteil erhalten eine Benachrichtigung über den Vorfall.

---

## 5. Spieler (Player)

- [ ] **Testfall: Für Training abmelden mit Grund**
    - **Schritte:** 1. Gehe zur Trainingsübersicht. 2. Wähle ein anstehendes Training und klicke auf "Absagen". 3. Wähle den Grund "Krank" aus und bestätige.
    - **Erwartetes Ergebnis:** Die Absage wird gespeichert. Der Trainer sieht den aktualisierten Status und den Grund in seiner Übersicht.

- [ ] **Testfall: Fahrdienst anbieten**
    - **Schritte:** 1. Navigiere zu einem anstehenden Auswärtsspiel. 2. Klicke auf "Fahrdienst anbieten". 3. Gib die Anzahl der freien Plätze ein und bestätige.
    - **Erwartetes Ergebnis:** Dein Angebot ist für andere Teammitglieder in der Fahrdienst-Übersicht sichtbar.

- [ ] **Testfall: Vertragsziele einsehen**
    - **Schritte:** 1. Navigiere zum Modul "Vertrag".
    - **Erwartetes Ergebnis:** Der Spieler kann seine Vertragsdetails und den Fortschritt seiner vereinbarten Ziele (z.B. Anzahl Tore) einsehen.

- [ ] **Testfall: Eigene Leistung nach Spiel bewerten**
    - **Schritte:** 1. Öffne ein vergangenes Spiel, bei dem du gespielt hast. 2. Bewerte deine eigene Leistung auf einer Skala und gib optional einen Kommentar ein.
    - **Erwartetes Ergebnis:** Deine Bewertung wird gespeichert und ist für den Trainer einsehbar.

- [ ] **Testfall: Stärken und Schwächen eintragen**
    - **Schritte:** 1. Navigiere zu deinem Profil -> "Stärken & Schwächen". 2. Trage mindestens zwei Stärken und zwei Schwächen ein.
    - **Erwartetes Ergebnis:** Die Einträge werden gespeichert und sind für den Coach sichtbar.

- [ ] **Testfall: Highlight-Video hochladen**
    - **Schritte:** 1. Gehe zu "Highlights". 2. Klicke auf "Video hochladen". 3. Wähle eine Videodatei aus und gib einen Titel ein.
    - **Erwartetes Ergebnis:** Das Video wird hochgeladen und hat den Status "Ausstehend", bis es vom Vorstand genehmigt wird.

- [ ] **Testfall: Aufgebot bestätigen**
    - **Schritte:** 1. Der Trainer stellt ein Aufgebot für ein Spiel zusammen, in dem du bist. 2. Du erhältst eine Benachrichtigung. 3. Öffne das Spiel und klicke auf "Zusagen".
    - **Erwartetes Ergebnis:** Deine Zusage ist für den Trainer sichtbar.

- [ ] **Testfall: Schiedsrichter-Notiz zu Karte anhören**
    - **Schritte:** 1. Navigiere zu einer erhaltenen Karte in deinem Profil. 2. Falls eine Audio-Notiz vorhanden ist, klicke auf den "Play"-Button.
    - **Erwartetes Ergebnis:** Die Audio-Notiz des Schiedsrichters zum Vorfall wird abgespielt.

- [ ] **Testfall: Offene Rechnung einsehen**
    - **Schritte:** 1. Navigiere zu "Finanzen".
    - **Erwartetes Ergebnis:** Alle offenen Rechnungen (z.B. Mitgliederbeitrag) werden mit Betrag und Fälligkeitsdatum angezeigt.

- [ ] **Testfall: AMIGO-Token-Wallet prüfen**
    - **Schritte:** 1. Navigiere zu "Wallet".
    - **Erwartetes Ergebnis:** Der aktuelle Kontostand der AMIGO-Tokens wird angezeigt.

---

## 6. Eltern (Parent)

- [ ] **Testfall: Kind für Spiel abmelden**
    - **Schritte:** 1. Wähle im Dashboard das verknüpfte Kind aus. 2. Gehe zum nächsten Spiel und klicke auf "Absagen". 3. Gib eine Begründung ein.
    - **Erwartetes Ergebnis:** Die Absage wird gespeichert und ist für den Trainer sichtbar.

- [ ] **Testfall: Fahrdienst anbieten**
    - **Schritte:** 1. Navigiere zu einem anstehenden Auswärtsspiel des Kindes. 2. Klicke auf "Fahrt anbieten" und gib die Anzahl freier Plätze an.
    - **Erwartetes Ergebnis:** Dein Angebot ist für andere Eltern und Spieler des Teams sichtbar.

- [ ] **Testfall: Live-Ticker verfolgen**
    - **Schritte:** 1. Navigiere zum "Live-Ticker"-Modul, während ein Spiel des Kindes läuft.
    - **Erwartetes Ergebnis:** Die Spielereignisse werden in Echtzeit aktualisiert.

- [ ] **Testfall: Verwarnung für Kind einsehen**
    - **Schritte:** 1. Der Coach sendet eine Verwarnung an das Kind. 2. Melde dich als Elternteil an.
    - **Erwartetes Ergebnis:** Eine Benachrichtigung über die Verwarnung ist sichtbar. Die Details können eingesehen werden.

- [ ] **Testfall: Chat mit Trainer starten**
    - **Schritte:** 1. Navigiere zum "Chat"-Modul. 2. Wähle den Trainer der Mannschaft deines Kindes aus und schreibe eine Nachricht.
    - **Erwartetes Ergebnis:** Die Nachricht wird gesendet. Der Trainer erhält eine Benachrichtigung.

- [ ] **Testfall: Anwesenheitsstatistik des Kindes prüfen**
    - **Schritte:** 1. Navigiere zum Profil des Kindes. 2. Gehe zum Reiter "Leistungen" oder "Anwesenheit".
    - **Erwartetes Ergebnis:** Eine Statistik (z.B. 8 von 10 Trainings besucht) ist sichtbar.

- [ ] **Testfall: Offene Rechnung des Kindes bezahlen**
    - **Schritte:** 1. Navigiere zu "Finanzen". 2. Wähle eine offene Rechnung des Kindes aus. 3. Klicke auf "Bezahlen".
    - **Erwartetes Ergebnis:** Der Bezahlvorgang wird (simuliert) gestartet.

- [ ] **Testfall: Zwischen verknüpften Kindern wechseln**
    - **Schritte:** 1. Stelle sicher, dass du mit mehreren Kindern verknüpft bist. 2. Nutze den Kind-Wahlschalter im Dashboard.
    - **Erwartetes Ergebnis:** Alle angezeigten Daten (Termine, Finanzen etc.) beziehen sich auf das neu ausgewählte Kind.

- [ ] **Testfall: Highlight des Kindes liken**
    - **Schritte:** 1. Navigiere zu "Highlights". 2. Finde ein Highlight deines Kindes. 3. Klicke auf den "Gefällt mir"-Button.
    - **Erwartetes Ergebnis:** Der Like-Zähler erhöht sich. Die Aktion wird gespeichert.

- [ ] **Testfall: Fahrgemeinschaft suchen**
    - **Schritte:** 1. Navigiere zu einem Auswärtsspiel. 2. Klicke auf "Fahrt suchen".
    - **Erwartetes Ergebnis:** Eine Liste mit angebotenen Fahrten und freien Plätzen wird angezeigt.
