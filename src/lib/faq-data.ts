
import { HelpCircle, DollarSign, Tag, Rocket, Info, Users, UserPlus, Upload, Wallet, Calendar } from "lucide-react";
import React from "react";
import type { FAQ } from '@/ai/flows/faqs.types';

// This file can be removed once all components use the dynamic data from the hook.
// For now, it serves as a fallback.

export const DEMO_FAQS: FAQ[] = [
  {
    id: "1",
    question: "Was ist Amigoal?",
    answer: "Amigoal ist eine All-in-One-Plattform zur Verwaltung von Fussballvereinen, die die Kommunikation, Organisation und Administration für Vereine, Trainer, Spieler und Eltern vereinfacht.",
    category: "Allgemein",
    icon: "Info",
  },
  {
    id: "2",
    question: "Für wen ist Amigoal gedacht?",
    answer: "Amigoal richtet sich an alle Beteiligten im Vereinsleben: Vorstandsmitglieder, Trainer, Spieler, Eltern, Sponsoren und sogar Fans.",
    category: "Allgemein",
    icon: "Users",
  },
  {
    id: "3",
    question: "Wie kann ich ein neues Mitglied hinzufügen?",
    answer: "Als Club-Admin können Sie im Dashboard unter 'Mitglieder' über den Button 'Neues Mitglied' ganz einfach neue Personen erfassen und der richtigen Mannschaft zuweisen.",
    category: "Mitgliederverwaltung",
    icon: "UserPlus",
  },
  {
    id: "4",
    question: "Kann ich bestehende Mitgliederdaten importieren?",
    answer: "Ja, wir bieten eine Importfunktion für bestehende Mitgliederlisten im CSV-Format an. Kontaktieren Sie unseren Support für weitere Informationen und Unterstützung beim Import.",
    category: "Mitgliederverwaltung",
    icon: "Upload",
  },
  {
    id: "5",
    question: "Wie werden die Mitgliedsbeiträge verwaltet?",
    answer: "Unter 'Finanzen' > 'Mitgliedschaft' können Sie Rechnungen für die Saison erstellen, den Zahlungsstatus verfolgen und automatische Mahnungen für überfällige Beiträge einrichten.",
    category: "Finanzen",
    icon: "Wallet",
  },
  {
    id: "6",
    question: "Welche Zahlungsmethoden werden akzeptiert?",
    answer: "Wir unterstützen alle gängigen Zahlungsmethoden wie Kreditkarten, TWINT und Banküberweisungen. Alle Zahlungen werden sicher über unsere Partner abgewickelt.",
    category: "Finanzen",
    icon: "DollarSign",
  },
   {
    id: "7",
    question: "Gibt es eine kostenlose Testversion?",
    answer: "Ja! Wir bieten eine 14-tägige kostenlose Testversion mit vollem Zugriff auf alle Funktionen an. Für den Start der Testphase ist keine Kreditkarte erforderlich.",
    category: "Preise",
    icon: "Tag",
  },
  {
    id: "8",
    question: "Wo sehe ich die nächsten Trainings- und Spieltermine?",
    answer: "In Ihrem persönlichen Dashboard finden Sie eine Übersicht der nächsten Termine. Eine vollständige Liste aller Events finden Sie im Menüpunkt 'Events'.",
    category: "Training & Spiele",
    icon: "Calendar",
  },
  {
    id: "9",
    question: "Wie kann ich den Support kontaktieren?",
    answer: "Unser Support-Team ist rund um die Uhr über unser Hilfe-Center, per E-Mail oder Live-Chat erreichbar. Wir antworten in der Regel innerhalb von 2 Stunden.",
    category: "Support",
    icon: "HelpCircle",
  },
  {
    id: "10",
    question: "Wie starte ich?",
    answer: "Die ersten Schritte sind einfach! Registrieren Sie sich für ein Konto und folgen Sie unserer Kurzanleitung. Wir führen Sie durch jeden Schritt des Prozesses.",
    category: "Erste Schritte",
    icon: "Rocket",
  },
];
