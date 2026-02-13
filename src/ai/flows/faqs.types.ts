
/**
 * @fileOverview Types for the FAQs flow.
 */
import { z } from 'zod';

// We store the icon name as a string, and map it to the component on the client-side.
export const FaqSchema = z.object({
  id: z.string().optional(),
  question: z.string(),
  answer: z.string(),
  category: z.string(),
  icon: z.string().optional(), // Storing icon name as a string
});

export type FAQ = z.infer<typeof FaqSchema>;

// This data will now be used for seeding, not directly in the app.
export const initialFaqs: Omit<FAQ, 'id'>[] = [
    {
        question: "Was ist Amigoal?",
        answer: "Amigoal ist eine All-in-One-Plattform zur Verwaltung von Fussballvereinen, die die Kommunikation, Organisation und Administration für Vereine, Trainer, Spieler und Eltern vereinfacht.",
        category: "Allgemein",
        icon: "Info",
    },
    {
        question: "Für wen ist Amigoal gedacht?",
        answer: "Amigoal richtet sich an alle Beteiligten im Vereinsleben: Vorstandsmitglieder, Trainer, Spieler, Eltern, Sponsoren und sogar Fans.",
        category: "Allgemein",
        icon: "Users",
    },
    {
        question: "Wie kann ich ein neues Mitglied hinzufügen?",
        answer: "Als Club-Admin können Sie im Dashboard unter 'Mitglieder' über den Button 'Neues Mitglied' ganz einfach neue Personen erfassen und der richtigen Mannschaft zuweisen.",
        category: "Mitgliederverwaltung",
        icon: "UserPlus",
    },
    {
        question: "Kann ich bestehende Mitgliederdaten importieren?",
        answer: "Ja, wir bieten eine Importfunktion für bestehende Mitgliederlisten im CSV-Format an. Kontaktieren Sie unseren Support für weitere Informationen und Unterstützung beim Import.",
        category: "Mitgliederverwaltung",
        icon: "Upload",
    },
    {
        question: "Wie werden die Mitgliedsbeiträge verwaltet?",
        answer: "Unter 'Finanzen' > 'Mitgliedschaft' können Sie Rechnungen für die Saison erstellen, den Zahlungsstatus verfolgen und automatische Mahnungen für überfällige Beiträge einrichten.",
        category: "Finanzen",
        icon: "Wallet",
    },
    {
        question: "Welche Zahlungsmethoden werden akzeptiert?",
        answer: "Wir unterstützen alle gängigen Zahlungsmethoden wie Kreditkarten, TWINT und Banküberweisungen. Alle Zahlungen werden sicher über unsere Partner abgewickelt.",
        category: "Finanzen",
        icon: "DollarSign",
    },
    {
        question: "Gibt es eine kostenlose Testversion?",
        answer: "Ja! Wir bieten eine 14-tägige kostenlose Testversion mit vollem Zugriff auf alle Funktionen an. Für den Start der Testphase ist keine Kreditkarte erforderlich.",
        category: "Preise",
        icon: "Tag",
    },
    {
        question: "Wo sehe ich die nächsten Trainings- und Spieltermine?",
        answer: "In Ihrem persönlichen Dashboard finden Sie eine Übersicht der nächsten Termine. Eine vollständige Liste aller Events finden Sie im Menüpunkt 'Events'.",
        category: "Training & Spiele",
        icon: "Calendar",
    },
    {
        question: "Wie kann ich den Support kontaktieren?",
        answer: "Unser Support-Team ist rund um die Uhr über unser Hilfe-Center, per E-Mail oder Live-Chat erreichbar. Wir antworten in der Regel innerhalb von 2 Stunden.",
        category: "Support",
        icon: "HelpCircle",
    },
    {
        question: "Wie starte ich?",
        answer: "Die ersten Schritte sind einfach! Registrieren Sie sich für ein Konto und folgen Sie unserer Kurzanleitung. Wir führen Sie durch jeden Schritt des Prozesses.",
        category: "Erste Schritte",
        icon: "Rocket",
    },
];
