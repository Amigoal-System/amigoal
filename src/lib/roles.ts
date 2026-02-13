import {
    IconLayoutDashboard,
    IconWeight,
    IconTrophy,
    IconListDetails,
    IconFileText,
    IconUserCircle,
    IconSettings,
    IconCreditCard,
    IconShieldCheck,
    IconBuilding,
    IconHeartHandshake,
    IconUserSearch,
    IconBriefcase,
    IconFlask,
    IconCoins,
    IconWorld,
    IconChartBar,
    IconBuildingArch,
    IconCalendarEvent,
    IconUserBolt,
    IconLayoutList,
    IconBox,
    IconMapPin,
    IconKey,
    IconComponents,
    IconActivity,
    IconGavel,
    IconRefresh,
    IconRoad,
    IconTargetArrow,
    IconArchive,
    IconGift,
    IconDeviceGamepad2,
    IconPalette,
    IconMail,
    IconBackpack,
    IconVideo,
    IconFilePencil,
    IconHelpCircle,
    IconPhoto,
} from "@tabler/icons-react";
import {
    MessageSquare,
    Languages,
    ClipboardList,
    Car,
    Mountain,
    ShoppingCart,
    Wallet,
    UserSquare,
    Library,
    Search,
    Ticket,
    Award,
    Database,
    Users as UsersIcon,
    Percent,
    User,
    Bell,
} from "lucide-react";
import React from 'react';


export type NavItem = {
  href: string;
  label: string;
  icon: string;
  module: string;
  section: string;
};

export const allNavItems: NavItem[] = [
    // Allgemein
    { href: '/dashboard', label: 'Dashboard', icon: 'IconLayoutDashboard', module: 'Dashboard', section: 'Allgemein' },
    
    // Plattform-Management
    { href: '/dashboard/clubs', label: 'Vereine', icon: 'IconBuilding', module: 'Vereine', section: 'Plattform-Management' },
    { href: '/dashboard/users', label: 'Benutzer', icon: 'UsersIcon', module: 'Benutzer', section: 'Plattform-Management' },
    { href: '/dashboard/staff', label: 'Amigoal Staff', icon: 'UserCog', module: 'Staff', section: 'Plattform-Management' },
    { href: '/dashboard/leads', label: 'Leads', icon: 'IconTargetArrow', module: 'Leads', section: 'Plattform-Management' },
    { href: '/dashboard/investor-leads', label: 'Investor Leads', icon: 'UserSquare', module: 'Investor Leads', section: 'Plattform-Management' },
    { href: '/dashboard/referrals', label: 'Referrals', icon: 'IconGift', module: 'Referrals', section: 'Plattform-Management' },
    { href: '/dashboard/player-placement', label: 'Spieler-Vermittlung', icon: 'IconUserSearch', module: 'Spieler-Vermittlung', section: 'Plattform-Management' },
    
    // Plattform-Inhalte
    { href: '/dashboard/saas-website', label: 'SaaS Webseite', icon: 'IconWorld', module: 'SaaS Website', section: 'Plattform-Inhalte' },
    { href: '/dashboard/saas-website-builder', label: 'SaaS Website Builder', icon: 'IconPalette', module: 'SaaS Website Builder', section: 'Plattform-Inhalte' },
    { href: '/dashboard/blog-management', label: 'Blog', icon: 'IconFilePencil', module: 'Blog Management', section: 'Plattform-Inhalte' },
    { href: '/dashboard/highlights', label: 'Highlights', icon: 'IconVideo', module: 'Highlights', section: 'Plattform-Inhalte' },
    { href: '/dashboard/faq', label: 'FAQ', icon: 'IconHelpCircle', module: 'FAQ Management', section: 'Plattform-Inhalte' },
    { href: '/dashboard/flyer-generator', label: 'Flyer Generator', icon: 'IconPhoto', module: 'Flyer Generator', section: 'Plattform-Inhalte' },

    // Finanz- & Vertrags-Cockpit
    { href: '/dashboard/saas-contracts', label: 'SaaS-Verträge', icon: 'IconFileText', module: 'SaaS Contracts', section: 'Finanz- & Vertrags-Cockpit' },
    { href: '/dashboard/saas-invoices', label: 'SaaS Abrechnungen', icon: 'IconGavel', module: 'SaaS Invoices', section: 'Finanz- & Vertrags-Cockpit' },
    { href: '/dashboard/sponsoring/marketplace', label: 'Sponsoring Marktplatz', icon: 'IconHeartHandshake', module: 'Sponsoring Marketplace', section: 'Finanz- & Vertrags-Cockpit' },
    { href: '/dashboard/investors', label: 'Investoren', icon: 'UsersIcon', module: 'Investors', section: 'Finanz- & Vertrags-Cockpit' },
    { href: '/dashboard/coupons', label: 'Coupons', icon: 'Percent', module: 'Coupons', section: 'Finanz- & Vertrags-Cockpit' },

    // Event-Management
    { href: '/dashboard/training-camp', label: 'Trainingslager', icon: 'IconBackpack', module: 'Training Camp', section: 'Event-Management' },
    { href: '/dashboard/saas-bootcamp', label: 'Bootcamps', icon: 'Mountain', module: 'SaaS Bootcamps', section: 'Event-Management' },
    { href: '/dashboard/tournaments', label: 'Turniere', icon: 'Tournament', module: 'Tournaments', section: 'Event-Management' },

    // Plattform-Aktivität
    { href: '/dashboard/matches', label: 'Spiele', icon: 'IconTrophy', module: 'Match', section: 'Plattform-Aktivität' },
    { href: '/dashboard/polls', label: 'Umfragen', icon: 'ClipboardList', module: 'Polls', section: 'Plattform-Aktivität' },
    { href: '/dashboard/events', label: 'Plattform-Events', icon: 'IconCalendarEvent', module: 'Events', section: 'Plattform-Aktivität' },
    
    // Globale Konfiguration
    { href: '/dashboard/settings', label: 'Einstellungen', icon: 'IconSettings', module: 'Settings', section: 'Globale Konfiguration' },
    { href: '/dashboard/settings/leaguestructures', label: 'Ligen & Verbände', icon: 'IconBuildingArch', module: 'Settings', section: 'Globale Konfiguration' },
    { href: '/dashboard/settings/categories', label: 'Mannschaftskategorien', icon: 'IconBox', module: 'Settings', section: 'Globale Konfiguration' },
    { href: '/dashboard/settings/roles-matrix', label: 'Rollen & Rechte', icon: 'IconKey', module: 'Settings', section: 'Globale Konfiguration' },
    { href: '/dashboard/settings/notifications', label: 'Benachrichtigungen', icon: 'Bell', module: 'Settings', section: 'Globale Konfiguration' },
    
    // System & Entwicklung
    { href: '/dashboard/components-overview', label: 'Komponenten', icon: 'IconComponents', module: 'Komponenten', section: 'System & Entwicklung' },
    { href: '/dashboard/status', label: 'System Status', icon: 'IconActivity', module: 'System Status', section: 'System & Entwicklung' },
    { href: '/dashboard/roadmap', label: 'Roadmap', icon: 'IconRoad', module: 'Roadmap', section: 'System & Entwicklung' },
    { href: '/dashboard/all-pages', label: 'Alle Seiten', icon: 'Library', module: 'All Pages', section: 'System & Entwicklung' },
    { href: '/dashboard/test-db', label: 'DB Test', icon: 'Database', module: 'DB Test', section: 'System & Entwicklung' },

    // Vereins-Cockpit (für andere Rollen)
    { href: '/dashboard/members', label: 'Mitglieder', icon: 'IconUserBolt', module: 'Members', section: 'Vereins-Cockpit' },
    { href: '/dashboard/teams', label: 'Mannschaften', icon: 'UsersIcon', module: 'Teams', section: 'Vereins-Cockpit' },
    { href: '/dashboard/wall-of-fame', label: 'Wall of Fame', icon: 'Award', module: 'Wall of Fame', section: 'Vereins-Cockpit' },
    { href: '/dashboard/website', label: 'Webseite', icon: 'IconWorld', module: 'Website', section: 'Vereins-Cockpit' },
    { href: '/dashboard/club-strategy', label: 'Vereinsstrategie', icon: 'IconRoad', module: 'Club Strategy', section: 'Vereins-Cockpit' },
    { href: '/dashboard/documents', label: 'Dokumente', icon: 'IconFileText', module: 'Documents', section: 'Vereins-Cockpit' },
    { href: '/dashboard/facility', label: 'Anlage', icon: 'IconBuildingArch', module: 'Facility', section: 'Vereins-Cockpit' },
    
    // Training & Spielbetrieb
    { href: '/dashboard/training', label: 'Training', icon: 'IconWeight', module: 'Training', section: 'Training & Spielbetrieb' },
    { href: '/dashboard/training-prep', label: 'Trainingsvorbereitung', icon: 'ClipboardList', module: 'Training Prep', section: 'Training & Spielbetrieb' },
    { href: '/dashboard/live-ticker', label: 'Live Ticker', icon: 'IconDeviceGamepad2', module: 'Live Ticker', section: 'Training & Spielbetrieb' },
    { href: '/dashboard/match-prep', label: 'Spielvorbereitung', icon: 'IconFlask', module: 'Match Prep.', section: 'Training & Spielbetrieb' },
    { href: '/dashboard/scouting', label: 'Scouting', icon: 'IconUserSearch', module: 'Scouting', section: 'Training & Spielbetrieb' },
    { href: '/dashboard/statistics', label: 'Leistungen', icon: 'IconChartBar', module: 'Statistics', section: 'Training & Spielbetrieb' },
    { href: '/dashboard/rules', label: 'Verhalten & Bussen', icon: 'IconGavel', module: 'Rules', section: 'Training & Spielbetrieb' },
    { href: '/dashboard/medical-center', label: 'Medical Center', icon: 'IconFirstAidKit', module: 'Medical Center', section: 'Training & Spielbetrieb' },

    // Scouting
    { href: '/dashboard/scouting/watchlist', label: 'Watchlist', icon: 'IconUserSearch', module: 'Watchlist', section: 'Scouting' },
    { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: 'IconListDetails', module: 'Leaderboard', section: 'Scouting' },
    { href: '/dashboard/scouting/reports', label: 'Berichte', icon: 'IconFileText', module: 'Reports', section: 'Scouting' },

    // Travel & Events (Club View)
    { href: '/dashboard/training-camp', label: 'Trainingslager', icon: 'IconBackpack', module: 'Travel & Events', section: 'Travel & Events' },
    { href: '/dashboard/bootcamp', label: 'Bootcamps', icon: 'Mountain', module: 'Bootcamps', section: 'Travel & Events' },
    
    // Anbieter-Cockpit
    { href: '/dashboard/bootcamp', label: 'Meine Bootcamps', icon: 'Mountain', module: 'Bootcamps', section: 'Anbieter-Cockpit' },
    { href: '/dashboard/training-camp', label: 'Meine Trainingslager', icon: 'IconBackpack', module: 'Training Camp', section: 'Anbieter-Cockpit' },
    { href: '/dashboard/tournaments', label: 'Meine Turniere', icon: 'Trophy', module: 'Tournaments', section: 'Anbieter-Cockpit' },
    { href: '/dashboard/provider/requests', label: 'Anfragen & Buchungen', icon: 'IconBriefcase', module: 'Provider Requests', section: 'Anbieter-Cockpit' },
    { href: '/dashboard/provider/facilities', label: 'Anlagen & Ressourcen', icon: 'IconBuildingArch', module: 'Provider Facilities', section: 'Anbieter-Cockpit' },
    { href: '/dashboard/provider/billing', label: 'Abrechnungen', icon: 'Wallet', module: 'Provider Billing', section: 'Anbieter-Cockpit' },
    { href: '/dashboard/staff', label: 'Mein Staff', icon: 'UsersIcon', module: 'Staff', section: 'Anbieter-Cockpit' },
    { href: '/dashboard/settings/evaluation-attributes', label: 'Bewertungs-Attribute', icon: 'IconSettings', module: 'Bewertungs-Attribute', section: 'Anbieter-Cockpit' },
    
    // Finanzen
    { href: '/dashboard/invoices', label: 'Mitgliederbeiträge', icon: 'IconCreditCard', module: 'Invoices', section: 'Finanzen' },
    { href: '/dashboard/expenses', label: 'Spesen', icon: 'IconCreditCard', module: 'Expenses', section: 'Finanzen' },
    { href: '/dashboard/sponsoring', label: 'Sponsoren', icon: 'IconHeartHandshake', module: 'Sponsoring', section: 'Finanzen' },
    { href: '/dashboard/team-cash', label: 'Mannschaftskasse', icon: 'Wallet', module: 'Team Cash', section: 'Finanzen' },
    { href: '/dashboard/contract', label: 'Verträge', icon: 'IconFileText', module: 'Contract', section: 'Finanzen' },
    { href: '/dashboard/ticketing', label: 'Ticketing', icon: 'Ticket', module: 'Ticketing', section: 'Finanzen' },
    { href: '/dashboard/tokenization', label: 'Tokenization', icon: 'IconCoins', module: 'Tokenization', section: 'Finanzen' },

    // Shop & Material
    { href: '/dashboard/shop', label: 'Shop', icon: 'ShoppingCart', module: 'Shop', section: 'Shop & Material' },
    { href: '/dashboard/inventory', label: 'Inventar', icon: 'IconArchive', module: 'Inventory', section: 'Shop & Material' },

    // Buchhaltung
    { href: '/dashboard/chart-of-accounts', label: 'Kontenplan', icon: 'IconBox', module: 'Chart of Accounts', section: 'Buchhaltung' },
    { href: '/dashboard/season-transition', label: 'Saisonübergang', icon: 'IconRefresh', module: 'Season Transition', section: 'Buchhaltung' },
    
    // Kommunikation
    { href: '/dashboard/events', label: 'Events', icon: 'IconCalendarEvent', module: 'Events', section: 'Kommunikation' },
    { href: '/dashboard/tasks', label: 'Aufgaben', icon: 'IconLayoutList', module: 'Tasks', section: 'Kommunikation' },
    { href: '/dashboard/chat', label: 'Chat', icon: 'MessageSquare', module: 'Chat', section: 'Kommunikation' },
    { href: '/dashboard/newsletter', label: 'Newsletter', icon: 'IconMail', module: 'Newsletter', section: 'Kommunikation' },
    { href: '/dashboard/polls', label: 'Umfragen', icon: 'ClipboardList', module: 'Polls', section: 'Kommunikation' },
    
    // Zusätzliches
    { href: '/dashboard/profile', label: 'Profil', icon: 'IconUserCircle', module: 'Profile', section: 'Zusätzliches' },
    { href: '/dashboard/js-verband', label: 'J&S / Verband', icon: 'IconShieldCheck', module: 'J&S / Verband', section: 'Zusätzliches' },
    { href: '/dashboard/checkout', label: 'Checkout', icon: 'ShoppingCart', module: 'Checkout', section: 'Zusätzliches' },
];

export const moduleOrder = [
    'Dashboard', 
    // Plattform-Management
    'Vereine', 
    'Benutzer',
    'Staff', 
    'Leads', 
    'Investor Leads',
    'Referrals', 
    'Spieler-Vermittlung',
    // Finanz- & Vertrags-Cockpit
    'SaaS Contracts',
    'SaaS Invoices',
    'Sponsoring Marketplace', 
    'Investors',
    'Coupons',
    // Plattform-Inhalte
    'SaaS Website',
    'SaaS Website Builder',
    'Blog Management',
    'Highlights',
    'FAQ Management',
    'Flyer Generator',
    // Web3
    'Tokenization', 
    'Token Catalog',
    // System
    'Komponenten', 
    'System Status', 
    'Roadmap', 
    'All Pages', 
    'DB Test',
    // Vereins-Cockpit
    'Members', 
    'Teams', 
    'Wall of Fame', 
    'Documents', 
    'Facility', 
    'Shop', 
    'Inventory', 
    'Website', 
    'Club Strategy', 
    // Training & Spielbetrieb
    'Training', 
    'Training Prep', 
    'Match', 
    'Tournaments', 
    'Live Ticker', 
    'Match Prep.', 
    'Scouting', 
    'Statistics',
    'Rules', 
    'Medical Center',
    // Scouting
    'Watchlist',
    'Leaderboard',
    'Reports',
    // Travel & Events / Event-Management
    'Travel & Events', 
    'Bootcamps',
    'SaaS Bootcamps',
    'Training Camp',
    // Anbieter-Cockpit
    'Provider Requests', 
    'Provider Facilities', 
    'Provider Billing',
    'Bewertungs-Attribute',
    // Finanzen
    'Invoices', 
    'Expenses',
    'Sponsoring',
    'Team Cash', 
    'Contract',
    'Ticketing',
    'Tokenization',
    // Buchhaltung
    'Chart of Accounts', 
    'Season Transition',
    // Kommunikation
    'Events', 
    'Tasks', 
    'Chat', 
    'Newsletter', 
    'Polls',
    // Globale Config
    'Settings', 
    // Zusätzliches
    'Profile', 
    'J&S / Verband', 
    'Checkout',
];

export const moduleDescriptions: Record<string, string> = {
    'Dashboard': 'Zentrale Übersicht je nach Rolle.',
    'Vereine': 'Alle Vereine auf der Plattform verwalten.',
    'Benutzer': 'Alle Benutzer der Plattform verwalten.',
    'Staff': 'Verwaltung des internen Amigoal-Personals.',
    'Leads': 'Potenzielle neue Vereine erfassen und nachverfolgen.',
    'Investor Leads': 'Potenzielle Investoren erfassen und nachverfolgen.',
    'Referrals': 'Partnerprogramme und Empfehlungen verwalten.',
    'Spieler-Vermittlung': 'Warteliste für Spieler ohne Verein.',
    'SaaS Contracts': 'Verträge zwischen Amigoal und Partnern.',
    'Sponsoring Marketplace': 'Sponsoren und Vereine zusammenbringen.',
    'Investors': 'Verwaltung der Investoren und Finanzierungsrunden.',
    'SaaS Newsletter': 'Globale Kommunikation und Newsletter-Versand.',
    'Coupons': 'Verwaltung von Rabatt-Coupons für die Plattform.',
    'SaaS Website': 'Verwaltung der Haupt-Webseite der Amigoal-Plattform.',
    'SaaS Website Builder': 'Visueller Editor zur Bearbeitung der SaaS Webseite.',
    'Blog Management': 'Verwaltung der Blog-Beiträge des Vereins.',
    'Highlights': 'Verwaltung der öffentlichen Video-Highlights.',
    'FAQ Management': 'Verwaltung der globalen FAQ-Seite.',
    'Flyer Generator': 'Erstellung von Match-Flyern für Vereine.',
    'Tokenization': 'Belohnungssystem mit AMIGO-Tokens.',
    'Token Catalog': 'Prämienkatalog für eingelöste Tokens.',
    'Komponenten': 'Übersicht über alle UI-Komponenten.',
    'System Status': 'Live-Status der System-Services und APIs.',
    'Roadmap': 'Planung und Übersicht der Produktentwicklung.',
    'All Pages': 'Übersicht aller existierenden Seiten und deren Berechtigungen.',
    'DB Test': 'Seite zum Testen der Datenbankverbindung.',
    'Members': 'Detaillierte Verwaltung aller Mitgliederprofile.',
    'Teams': 'Erstellen und Verwalten aller Mannschaften.',
    'Wall of Fame': 'Seite für die "Wall of Fame" der Ehrenmitglieder.',
    'Documents': 'Zentrale Ablage für Vereinsdokumente und Verträge.',
    'Facility': 'Grafische Belegungsplanung von Plätzen und Garderoben.',
    'Shop': 'Verwaltung des Vereins-Shops.',
    'Inventory': 'Verwaltung des Trainingsmaterials und Inventars.',
    'Website': 'Verwaltung der Vereinswebseite.',
    'Club Strategy': 'Definition der strategischen Ausrichtung des Vereins.',
    'Training': 'Planung und Durchführung von Trainingseinheiten.',
    'Training Prep': 'Detaillierte Vorbereitung von Trainings mit Übungen.',
    'Match': 'Verwaltung aller Spiele und Resultate.',
    'Tournaments': 'Organisation und Verwaltung von Turnieren.',
    'Live Ticker': 'Echtzeit-Erfassung von Spielereignissen.',
    'Match Prep.': 'Taktiktafel zur visuellen Spielvorbereitung.',
    'Scouting': 'Beobachtung und Verwaltung von potenziellen Neuzugängen.',
    'Statistics': 'Leistungsdaten und Anwesenheitsstatistiken.',
    'Rules': 'Definition und Nachverfolgung von Teamregeln.',
    'Medical Center': 'Verwaltung von Verletzungen und Reha-Plänen.',
    'Watchlist': 'Persönliche Liste von beobachteten Spielern.',
    'Leaderboard': 'Rangliste der Top-Talente.',
    'Reports': 'Detaillierte Scouting-Berichte erstellen.',
    'Training Camp': 'Organisation von Trainingslagern.',
    'Bootcamps': 'Verwaltung der eigenen Bootcamps.', 
    'SaaS Bootcamps': 'Verwaltung aller Bootcamps auf der Plattform.',
    'Provider Requests': 'Anfragen von Vereinen für Camps einsehen und bearbeiten.',
    'Provider Facilities': 'Eigene Anlagen und Ressourcen für Camps verwalten.',
    'Provider Billing': 'Übersicht der Abrechnungen und Einnahmen.',
    'Bewertungs-Attribute': 'Eigene Bewertungskriterien für Teilnehmer festlegen.',
    'Invoices': 'Erstellung und Verwaltung von Mitgliederbeiträgen und Rechnungen.',
    'Expenses': 'Einreichung und Genehmigung von Spesen.',
    'Sponsoring': 'Verwaltung von Sponsoren, Paketen und Leistungen.',
    'Team Cash': 'Verwaltung der internen Mannschaftskasse.',
    'Contract': 'Verwaltung von Spieler- und Staff-Verträgen.',
    'Ticketing': 'Verkauf und Verwaltung von Eintrittskarten.',
    'Chart of Accounts': 'Finanz-Cockpit für die Plattform-Buchhaltung.',
    'Season Transition': 'Werkzeuge für den Übergang in eine neue Saison.',
    'Events': 'Zentraler Kalender für alle Vereinstermine.',
    'Tasks': 'Zuweisung und Verfolgung von Aufgaben.',
    'Chat': 'Direkte und Gruppen-Kommunikation.',
    'Newsletter': 'Verwaltung von Vereins-Newslettern.',
    'Polls': 'Erstellung und Verwaltung von Umfragen.',
    'SaaS Invoices': 'Rechnungsstellung für SaaS-Abonnements an Vereine.',
    'Settings': 'Allgemeine Einstellungen für den Verein oder die Plattform.',
    'Profile': 'Verwaltung des eigenen Benutzerprofils.',
    'J&S / Verband': 'Schnittstellen und Berichte für J&S und Verbände.',
    'Checkout': 'Warenkorb und Bezahlvorgang für den Shop.',
    'Travel & Events': 'Organisation von Reisen und Trainingslagern'
};

export const rolesConfig: Record<string, string[]> = {
    'Super-Admin': Array(moduleOrder.length).fill('Voll'),
    'Club-Admin': [
        'Voll', // Dashboard
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', // Plattform-Management (8) + SaaS Contracts
        'Kein', 'Kein', 'Kein', 'Kein', // Finanz-Cockpit (4)
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', // Plattform-Inhalte (6)
        'Voll', 'Voll', // Web3 (2)
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', // System (5)
        'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', // Vereins-Cockpit (9)
        'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', // Training & Spielbetrieb (10)
        'Kein', 'Kein', 'Kein', // Scouting (3)
        'Voll', 'Voll', 'Kein', 'Voll', // Travel & Events (4)
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', // Anbieter (5)
        'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', // Finanzen (6)
        'Voll', 'Voll', // Buchhaltung (2)
        'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', // Kommunikation (6)
        'Kein', 'Kein', 'Voll', 'Kein', // Globale Config (4)
        'Voll', 'Voll', 'Kein' // Zusätzliches (3)
    ],
     'Manager': [
        'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein',
        'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll',
        'Limit', 'Limit', 'Limit', 'Limit', 'Limit', 'Limit', 'Kein', 'Limit', 'Limit', 'Limit',
        'Kein', 'Kein', 'Kein',
        'Voll', 'Kein', 'Kein', 'Voll', 'Kein', 'Kein', 'Kein', 'Kein',
        'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Limit',
        'Voll', 'Voll',
        'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll',
        'Kein', 'Kein', 'Voll',
        'Voll', 'Voll', 'Kein'
    ],
    'Coach': [
        'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein',
        'Limit', 'Voll', 'Voll', 'Limit', 'Kein', 'Kein', 'Kein', 'Kein', 'Voll',
        'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll',
        'Kein', 'Kein', 'Kein',
        'Voll', 'Kein', 'Kein', 'Voll', 'Kein', 'Kein', 'Kein', 'Kein',
        'Limit', 'Voll', 'Voll', 'Voll', 'Voll', 'Limit',
        'Kein', 'Kein',
        'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll',
        'Kein', 'Kein', 'Voll',
        'Voll', 'Voll', 'Kein'
    ],
    'Player': [
        'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein',
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Voll', 'Kein', 'Kein', 'Kein',
        'Voll', 'Kein', 'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Voll', 'Voll', 'Voll',
        'Kein', 'Kein', 'Kein',
        'Voll', 'Kein', 'Kein', 'Voll', 'Kein', 'Kein', 'Kein', 'Kein',
        'Limit', 'Kein', 'Kein', 'Voll', 'Voll', 'Kein',
        'Kein', 'Kein',
        'Voll', 'Voll', 'Voll', 'Voll', 'Kein', 'Voll',
        'Kein', 'Kein', 'Voll',
        'Voll', 'Kein', 'Kein'
    ],
    'Parent': [
        'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein',
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein',
        'Limit', 'Kein', 'Limit', 'Kein', 'Kein', 'Kein', 'Kein', 'Limit', 'Kein', 'Kein',
        'Kein', 'Kein', 'Kein',
        'Voll', 'Kein', 'Kein', 'Voll', 'Kein', 'Kein', 'Kein', 'Kein',
        'Voll', 'Limit', 'Kein', 'Limit', 'Kein', 'Kein',
        'Kein', 'Kein',
        'Voll', 'Voll', 'Voll', 'Kein', 'Voll', 'Voll',
        'Kein', 'Kein', 'Voll',
        'Voll', 'Kein', 'Kein'
    ],
    'Sponsor': [
        'Voll', // Dashboard
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', // Plattform-Management
        'Kein', 'Kein', 'Kein', 'Kein', // Finanz-Cockpit
        'Kein', 'Kein', 'Kein', 'Voll', 'Kein', 'Kein', // Plattform-Inhalte (Highlights are now visible)
        'Voll', 'Kein', // Web3
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', // System
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Voll', 'Kein', 'Kein', 'Kein', // Vereins-Cockpit
        'Kein', 'Kein', 'Limit', 'Kein', 'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', // Training & Spielbetrieb
        'Kein', 'Kein', 'Kein', // Scouting
        'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', // Travel & Events
        'Kein', 'Kein', 'Voll', 'Kein', 'Kein', 'Limit', // Finanzen
        'Kein', 'Kein', // Buchhaltung
        'Limit', 'Kein', 'Voll', 'Kein', 'Limit', 'Kein', // Kommunikation
        'Kein', 'Kein', 'Voll', 'Kein', // Globale Config
        'Voll', 'Kein', 'Kein' // Zusätzliches
    ],
    'Referee': [
        'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein',
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein',
        'Limit', 'Kein', 'Voll', 'Voll', 'Kein', 'Kein', 'Kein', 'Limit', 'Limit', 'Kein',
        'Kein', 'Kein', 'Kein',
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein',
        'Limit', 'Limit', 'Kein', 'Kein', 'Kein', 'Kein',
        'Kein', 'Kein',
        'Voll', 'Voll', 'Voll', 'Kein', 'Voll', 'Kein',
        'Kein', 'Kein', 'Voll', 'Voll',
        'Kein', 'Kein', 'Kein'
    ],
    'Federation': [
        'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein',
        'Limit', 'Voll', 'Voll', 'Limit', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein',
        'Limit', 'Kein', 'Voll', 'Limit', 'Kein', 'Kein', 'Kein', 'Voll', 'Limit', 'Voll',
        'Kein', 'Kein', 'Kein',
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein',
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein',
        'Kein', 'Kein',
        'Voll', 'Voll', 'Voll', 'Kein', 'Voll', 'Kein',
        'Kein', 'Kein', 'Voll', 'Voll',
        'Voll', 'Kein', 'Kein'
    ],
    'Scouting': [
        'Voll', // Dashboard
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', // Plattform-Management
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', // Finanz-Cockpit
        'Kein', 'Kein', 'Kein', 'Voll', 'Kein', 'Kein', // Plattform-Inhalte
        'Voll', 'Kein', // Web3
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', // System
        'Limit', 'Limit', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', // Vereins-Cockpit
        'Limit', 'Kein', 'Voll', 'Limit', 'Limit', 'Kein', 'Voll', 'Limit', 'Kein', 'Limit', // Training & Spielbetrieb
        'Voll', 'Voll', 'Voll', // Scouting
        'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', // Travel & Events
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', // Finanzen
        'Kein', 'Kein', // Buchhaltung
        'Voll', 'Limit', 'Voll', 'Kein', 'Kein', 'Voll', // Kommunikation
        'Kein', 'Kein', 'Kein', 'Kein', // Globale Config
        'Voll', 'Kein', 'Kein' // Zusätzliches
    ],
    'Supplier': [
        'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein',
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Voll', 'Voll', 'Kein', 'Kein',
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein',
        'Kein', 'Kein', 'Kein',
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein',
        'Kein', 'Kein', 'Kein', 'Limit', 'Kein', 'Kein',
        'Kein', 'Kein',
        'Voll', 'Voll', 'Voll', 'Kein', 'Kein', 'Kein',
        'Kein', 'Kein', 'Voll',
        'Kein', 'Kein', 'Kein'
    ],
    'Fan': [
        'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', // Plattform-Management + Dashboard
        'Kein', 'Kein', 'Kein', 'Kein', // Finanz-Cockpit
        'Kein', 'Kein', 'Kein', 'Voll', 'Kein', 'Kein', // Plattform-Inhalte
        'Voll', 'Kein', // Web3
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', // System
        'Kein', 'Limit', 'Kein', 'Kein', 'Kein', 'Voll', 'Kein', 'Kein', 'Kein', // Vereins-Cockpit
        'Kein', 'Kein', 'Limit', 'Limit', 'Voll', 'Kein', 'Kein', 'Limit', 'Kein', 'Kein', // Training & Spielbetrieb
        'Kein', 'Kein', 'Kein', // Scouting
        'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', // Travel & Events
        'Kein', 'Kein', 'Voll', 'Kein', 'Kein', 'Limit', // Finanzen
        'Kein', 'Kein', // Buchhaltung
        'Voll', 'Voll', 'Voll', 'Voll', 'Kein', 'Voll', // Kommunikation
        'Kein', 'Kein', 'Voll', 'Kein', // Globale Config
        'Voll', 'Kein', 'Kein' // Zusätzliches
    ],
    'Board': [
        'Voll', // Dashboard
        'Kein', 'Kein', 'Voll', 'Kein', 'Kein', 'Kein', 'Voll', // Plattform-Management
        'Kein', 'Kein', 'Voll', 'Kein', 'Kein', // Finanz-Cockpit
        'Kein', 'Kein', 'Kein', 'Voll', 'Kein', 'Kein', // Plattform-Inhalte
        'Kein', 'Kein', // Web3
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', // System
        'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', // Vereins-Cockpit
        'Limit', 'Limit', 'Limit', 'Kein', 'Kein', 'Kein', 'Voll', 'Limit', 'Voll', 'Voll', // Training & Spielbetrieb
        'Voll', 'Kein', 'Voll', // Scouting
        'Voll', 'Kein', 'Kein', 'Voll', 'Kein', 'Kein', 'Kein', 'Kein', // Travel & Events
        'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', // Finanzen
        'Voll', 'Voll', // Buchhaltung
        'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', // Kommunikation
        'Kein', 'Kein', 'Voll', 'Kein', // Globale Config
        'Voll', 'Voll', 'Kein' // Zusätzliches
    ],
    'Facility Manager': [
        'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein',
        'Kein', 'Kein', 'Kein', 'Kein', 'Voll', 'Voll', 'Kein', 'Kein', 'Kein',
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein',
        'Kein', 'Kein', 'Kein',
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein',
        'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein',
        'Kein', 'Kein',
        'Voll', 'Voll', 'Voll', 'Kein', 'Kein', 'Kein',
        'Kein', 'Kein', 'Voll',
        'Voll', 'Voll', 'Kein'
    ],
    'Trainingslager-Anbieter': ['Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Voll', 'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Voll', 'Voll', 'Voll', 'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Voll', 'Voll', 'Voll', 'Kein', 'Kein', 'Voll', 'Kein', 'Kein', 'Kein', 'Voll', 'Voll', 'Kein'],
    'Bootcamp-Anbieter': ['Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Voll', 'Voll', 'Kein', 'Kein', 'Kein', 'Voll', 'Voll', 'Voll', 'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Voll', 'Voll', 'Voll', 'Kein', 'Kein', 'Voll', 'Kein', 'Kein', 'Kein', 'Voll', 'Voll', 'Kein'],
    'Turnieranbieter': ['Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Voll', 'Voll', 'Voll', 'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Voll', 'Voll', 'Voll', 'Kein', 'Kein', 'Voll', 'Kein', 'Kein', 'Kein', 'Voll', 'Voll', 'Kein'],
    'Administration': Array(moduleOrder.length).fill('Kein'),
    'Finanzen': Array(moduleOrder.length).fill('Kein'),
    'Techniker': Array(moduleOrder.length).fill('Kein'),
};

// Set 'Club Strategy' to 'Kein' for Super-Admin
const superAdminClubStrategyIndex = moduleOrder.indexOf('Club Strategy');
if (superAdminClubStrategyIndex !== -1) {
    rolesConfig['Super-Admin'][superAdminClubStrategyIndex] = 'Kein';
}

export const sectionOrder: Record<string, string[]> = {
  'Super-Admin': ['Allgemein', 'Plattform-Management', 'Plattform-Inhalte', 'Finanz- & Vertrags-Cockpit', 'Event-Management', 'Plattform-Aktivität', 'Globale Konfiguration', 'System & Entwicklung'],
  'Club-Admin': ['Allgemein', 'Vereins-Cockpit', 'Training & Spielbetrieb', 'Finanzen', 'Buchhaltung', 'Travel & Events', 'Kommunikation', 'Shop & Material', 'Globale Konfiguration', 'Zusätzliches'],
  'Manager': ['Allgemein', 'Vereins-Cockpit', 'Finanzen', 'Buchhaltung', 'Kommunikation', 'Zusätzliches'],
  'Coach': ['Allgemein', 'Training & Spielbetrieb', 'Vereins-Cockpit', 'Finanzen', 'Kommunikation', 'Travel & Events', 'Zusätzliches'],
  'Player': ['Allgemein', 'Training & Spielbetrieb', 'Shop & Material', 'Travel & Events', 'Finanzen', 'Kommunikation', 'Zusätzliches'],
  'Parent': ['Allgemein', 'Training & Spielbetrieb', 'Travel & Events', 'Finanzen', 'Kommunikation', 'Zusätzliches'],
  'Sponsor': ['Allgemein', 'Sponsoring', 'Shop & Material', 'Kommunikation', 'Globale Konfiguration'],
  'Referee': ['Allgemein', 'Training & Spielbetrieb', 'Finanzen', 'Kommunikation'],
  'Federation': ['Allgemein', 'Vereins-Cockpit', 'Training & Spielbetrieb', 'Globale Konfiguration', 'Zusätzliches'],
  'Scouting': ['Allgemein', 'Training & Spielbetrieb', 'Scouting', 'Highlights', 'Kommunikation', 'Zusätzliches'],
  'Supplier': ['Allgemein', 'Shop & Material', 'Kommunikation'],
  'Fan': ['Allgemein', 'Kommunikation', 'Shop & Material', 'Finanzen', 'Zusätzliches'],
  'Board': ['Allgemein', 'Vereins-Cockpit', 'Training & Spielbetrieb', 'Finanzen', 'Buchhaltung', 'Kommunikation', 'Globale Konfiguration', 'Zusätzliches'],
  'Facility Manager': ['Allgemein', 'Vereins-Cockpit', 'Kommunikation'],
  'Administration': ['Allgemein', 'Plattform-Management', 'Globale Konfiguration'],
  'Finanzen': ['Allgemein', 'Plattform-Management', 'Globale Konfiguration'],
  'Techniker': ['Allgemein', 'System & Entwicklung'],
  'Bootcamp-Anbieter': ['Allgemein', 'Anbieter-Cockpit', 'Zusätzliches'],
  'Trainingslager-Anbieter': ['Allgemein', 'Anbieter-Cockpit', 'Zusätzliches'],
  'Turnieranbieter': ['Allgemein', 'Anbieter-Cockpit', 'Zusätzliches'],
};

export const allPossibleRoles = Object.keys(rolesConfig);

export const roleToEmailMap: Record<string, string> = {
    'Super-Admin': 'super.admin@amigoal.ch',
    'Club-Admin': 'club.admin@fc-awesome',
    'Manager': 'marina.g@chelsea.com',
    'Coach': 'pep.guardiola@fc-awesome',
    'Player': 'lionel.messi@fc-awesome',
    'Parent': 'jorge.messi@intermiami.com',
    'Sponsor': 'coca.cola@sponsoring.com',
    'Referee': 'pierluigi.c@fifa.com',
    'Federation': 'gianni.i@fifa.com',
    'Scouting': 'serra.juni@barcelona.com',
    'Supplier': 'nike.sports@supplier.com',
    'Fan': 'max.mustermann@fan.com',
    'Marketing': 'marketing@amigoal.ch',
    'Board': 'karl-heinz.r@fc-awesome',
    'Facility Manager': 'john.smith@fc-awesome',
    'Trainingslager-Anbieter': 'provider@trainingslager.com',
    'Bootcamp-Anbieter': 'provider@bootcamp.com',
    'Turnieranbieter': 'provider@turnier.com',
    'Administration': 'admin@amigoal.ch',
    'Finanzen': 'finanzen@amigoal.ch',
    'Techniker': 'dev@amigoal.ch',
};
