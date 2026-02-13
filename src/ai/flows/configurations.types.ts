

/**
 * @fileOverview Types for the configurations flow.
 */
import { z } from 'zod';
import type { DunningLevel } from '@/lib/types/dunning';
import { defaultSaasDunningLevels, defaultClubDunningLevels } from '@/lib/types/dunning';
import { rolesConfig as defaultRolesConfigFromLib, sectionOrder } from '@/lib/roles';

export const LeagueGroupSchema = z.object({
    id: z.string(),
    name: z.string(),
});
export type LeagueGroup = z.infer<typeof LeagueGroupSchema>;

export const LeagueSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number(),
  groups: z.array(LeagueGroupSchema).optional(),
});
export type League = z.infer<typeof LeagueSchema>;

export const AssociationSchema = z.object({
  id: z.string(),
  name: z.string(),
  leagues: z.array(LeagueSchema),
});
export type Association = z.infer<typeof AssociationSchema>;


export const JSSettingsSchema = z.object({
    compensationPerParticipant: z.number().optional().default(6.90),
    minTrainingDurationMinutes: z.number().optional().default(60),
    minParticipantsPerTraining: z.number().optional().default(5),
    minAge: z.number().optional().default(5),
    maxAge: z.number().optional().default(20),
    contactInfo: z.object({
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
    }).optional(),
});
export type JSSettings = z.infer<typeof JSSettingsSchema>;

export const CountryLeagueStructureSchema = z.object({
    id: z.string(),
    countryName: z.string(),
    currency: z.string().default('CHF'),
    associations: z.array(AssociationSchema),
    jsSettings: JSSettingsSchema.optional(),
});
export type CountryLeagueStructure = z.infer<typeof CountryLeagueStructureSchema>;

export const SponsorshipPackageSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(),
  description: z.string(),
  baseAmount: z.number(),
  benefits: z.array(z.string()),
});
export type SponsorshipPackage = z.infer<typeof SponsorshipPackageSchema>;

export const ContractTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  benefits: z.array(z.string()),
});
export type ContractType = z.infer<typeof ContractTypeSchema>;

const BrandingSettingsSchema = z.object({
    primary: z.object({ h: z.number(), s: z.number(), l: z.number() }),
    background: z.object({ h: z.number(), s: z.number(), l: z.number() }),
    accent: z.object({ h: z.number(), s: z.number(), l: z.number() }),
    bodyFont: z.string(),
    headlineFont: z.string(),
    logo: z.string().url().optional().nullable(),
});

const DunningSettingsSchema = z.object({
    saas: z.any().optional(), // Array of DunningLevel
    club: z.any().optional(), // Array of DunningLevel
}).optional();

export const SaasPackageSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.string(),
  description: z.string().optional(),
  maxUsers: z.number().optional(),
  isPopular: z.boolean().optional(),
});
export type SaasPackage = z.infer<typeof SaasPackageSchema>;

export const ClubRuleSchema = z.object({
  id: z.string(),
  text: z.string(),
  category: z.string().optional(),
  mandatory: z.boolean(),
});
export type ClubRule = z.infer<typeof ClubRuleSchema>;

// This import is now local to this file as it's part of the default config
import { initialTeamCategories } from './categories.types';

export const TeamCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number(),
});
export type TeamCategory = z.infer<typeof TeamCategorySchema>;

export const PublicPageSchema = z.object({
    id: z.string(),
    title: z.string(),
    icon: z.string(),
    href: z.string(),
    enabled: z.boolean(),
});
export type PublicPage = z.infer<typeof PublicPageSchema>;

const NotificationSettingSchema = z.object({
    id: z.string(),
    label: z.string(),
    inApp: z.boolean(),
    email: z.boolean(),
});
export type NotificationSetting = z.infer<typeof NotificationSettingSchema>;

export const ConfigurationSchema = z.object({
  leagueStructures: z.record(z.any()), // Use z.any() to simplify for Firestore
  sponsorshipPackages: z.array(SponsorshipPackageSchema).optional(),
  contractTypes: z.array(ContractTypeSchema).optional(),
  saasPackages: z.array(SaasPackageSchema).optional(),
  publicPages: z.array(PublicPageSchema).optional(),
  notificationSettings: z.array(NotificationSettingSchema).optional(),
  branding: BrandingSettingsSchema.optional(),
  dunningLevels: DunningSettingsSchema,
  rolesConfig: z.record(z.array(z.string())).optional(),
  sectionOrder: z.record(z.array(z.string())).optional(),
  clubRules: z.array(ClubRuleSchema).optional(),
  teamCategories: z.record(z.array(TeamCategorySchema)).optional(),
});
export type Configuration = z.infer<typeof ConfigurationSchema> & {
    dunningLevels?: {
        saas?: DunningLevel[];
        club?: DunningLevel[];
    }
};

export const defaultConfig: Configuration = {
  leagueStructures: {
    CH: { id: 'CH', countryName: 'Schweiz', currency: 'CHF', associations: [{ id: 'SFV', name: 'Schweizerischer Fussballverband', leagues: [{ id: 'super-league', name: 'Super League', level: 1, groups: [] }, { id: 'challenge-league', name: 'Challenge League', level: 2, groups: [] }] }], jsSettings: { compensationPerParticipant: 6.90, minTrainingDurationMinutes: 60, minParticipantsPerTraining: 5, minAge: 5, maxAge: 20 } },
    DE: { id: 'DE', countryName: 'Deutschland', currency: 'EUR', associations: [{ id: 'DFB', name: 'Deutscher Fussball-Bund', leagues: [{ id: '1-bundesliga', name: '1. Bundesliga', level: 1, groups: [] }, { id: '2-bundesliga', name: '2. Bundesliga', level: 2, groups: [] }] }], jsSettings: {} },
    IT: { id: 'IT', countryName: 'Italien', currency: 'EUR', associations: [{ id: 'FIGC', name: 'Federazione Italiana Giuoco Calcio', leagues: [{ id: 'serie-a', name: 'Serie A', level: 1, groups: [] }, { id: 'serie-b', name: 'Serie B', level: 2, groups: [] }] }], jsSettings: {} },
    GB: { id: 'GB', countryName: 'England', currency: 'GBP', associations: [{ id: 'FA', name: 'The Football Association', leagues: [{ id: 'premier-league', name: 'Premier League', level: 1, groups: [] }, { id: 'championship', name: 'Championship', level: 2, groups: [] }] }], jsSettings: {} },
    FR: { id: 'FR', countryName: 'Frankreich', currency: 'EUR', associations: [{ id: 'FFF', name: 'Fédération Française de Football', leagues: [{ id: 'ligue-1', name: 'Ligue 1', level: 1, groups: [] }] }] },
    ES: { id: 'ES', countryName: 'Spanien', currency: 'EUR', associations: [{ id: 'RFEF', name: 'Real Federación Española de Fútbol', leagues: [{ id: 'la-liga', name: 'La Liga', level: 1, groups: [] }] }] },
    PT: { id: 'PT', countryName: 'Portugal', currency: 'EUR', associations: [{ id: 'FPF', name: 'Federação Portuguesa de Futebol', leagues: [{ id: 'primeira-liga', name: 'Primeira Liga', level: 1, groups: [] }] }] },
    AL: { id: 'AL', countryName: 'Albanien', currency: 'ALL', associations: [{ id: 'FSHF', name: 'Federata Shqiptare e Futbollit', leagues: [{ id: 'kategoria-superiore', name: 'Kategoria Superiore', level: 1, groups: [] }] }] },
    XK: { id: 'XK', countryName: 'Kosovo', currency: 'EUR', associations: [{ id: 'FFK', name: 'Federata e Futbollit e Kosovës', leagues: [{ id: 'superliga', name: 'Superliga e Kosovës', level: 1, groups: [] }] }] },
    NL: { id: 'NL', countryName: 'Niederlande', currency: 'EUR', associations: [{ id: 'KNVB', name: 'Koninklijke Nederlandse Voetbalbond', leagues: [{ id: 'eredivisie', name: 'Eredivisie', level: 1, groups: [] }] }] },
    BE: { id: 'BE', countryName: 'Belgien', currency: 'EUR', associations: [{ id: 'RBFA', name: 'Royal Belgian Football Association', leagues: [{ id: 'jupiler-pro-league', name: 'Jupiler Pro League', level: 1, groups: [] }] }] },
    IE: { id: 'IE', countryName: 'Irland', currency: 'EUR', associations: [{ id: 'FAI', name: 'Football Association of Ireland', leagues: [{ id: 'premier-division', name: 'Premier Division', level: 1, groups: [] }] }] },
    SCO: { id: 'SCO', countryName: 'Schottland', currency: 'GBP', associations: [{ id: 'SFA', name: 'Scottish Football Association', leagues: [{ id: 'premiership', name: 'Scottish Premiership', level: 1, groups: [] }] }] },
    AT: { id: 'AT', countryName: 'Österreich', currency: 'EUR', associations: [{ id: 'ÖFB', name: 'Österreichischer Fußball-Bund', leagues: [{ id: 'bundesliga-at', name: 'Bundesliga', level: 1, groups: [] }] }] },
    HR: { id: 'HR', countryName: 'Kroatien', currency: 'EUR', associations: [{ id: 'HNS', name: 'Hrvatski nogometni savez', leagues: [{ id: 'hnl', name: 'HNL', level: 1, groups: [] }] }] },
  },
  sponsorshipPackages: [
    { id: 1, name: 'Hauptsponsor', color: '#3b82f6', description: 'Umfassendes Sponsoring des gesamten Vereins.', baseAmount: 25000, benefits: ['Logo auf Trikot (Brust)', 'Bandenwerbung prominent', 'Webseiten-Logo (Top)'] },
    { id: 2, name: 'Trikotsponsor', color: '#10b981', description: 'Präsenz auf den Trikots einer Mannschaft.', baseAmount: 10000, benefits: ['Logo auf Trikot (Ärmel)'] },
    { id: 3, name: 'Bandenwerbung', color: '#f97316', description: 'Werbung auf den Banden am Spielfeldrand.', baseAmount: 2500, benefits: ['1x Bande (5m)'] },
    { id: 4, name: 'Digital', color: '#8b5cf6', description: 'Sponsoring der digitalen Kanäle.', baseAmount: 3000, benefits: ['Logo auf Webseite', 'Social Media Post (1x pro Quartal)'] },
    { id: 5, name: 'Juniorenförderung', color: '#ef4444', description: 'Unterstützung einer Junioren-Mannschaft.', baseAmount: 1500, benefits: ['Erwähnung auf Teamseite', 'Logo auf Trainingsanzug'] },
    { id: 6, name: 'Matchball', color: '#d946ef', description: 'Sponsoring des Matchballs für ein Heimspiel.', baseAmount: 250, benefits: ['Erwähnung durch Speaker', 'Logo im Matchprogramm'] },
  ],
  contractTypes: [
      { id: 'jv-24', name: 'Juniorenvertrag 2024', description: 'Standardvertrag für alle Junioren.', benefits: ['Versicherungsschutz', 'Teilnahme an allen Trainings & Spiele'] },
      { id: 'av-24', name: 'Aktiv-Vertrag 24/25', description: 'Standardvertrag für Spieler der Aktivmannschaften.', benefits: ['Versicherungsschutz', 'Matchprämien gem. Reglement'] },
      { id: 'tv-24', name: 'Trainervertrag 24/25', description: 'Standardvertrag für alle lizenzierten Trainer.', benefits: ['Spesenentschädigung', 'Weiterbildungsmöglichkeiten'] },
  ],
  saasPackages: [
    { id: 'basic', name: 'Basis', price: 'CHF 49/Monat', description: 'Für kleine Vereine.', maxUsers: 100, isPopular: false },
    { id: 'pro', name: 'Pro', price: 'CHF 99/Monat', description: 'Für die meisten Vereine.', maxUsers: 500, isPopular: true },
    { id: 'enterprise', name: 'Enterprise', price: 'Auf Anfrage', description: 'Für grosse Organisationen.', maxUsers: 1000, isPopular: false },
  ],
  publicPages: [
    { id: 'sponsoring', title: "Sponsoring", icon: "Handshake", href: "/sponsoring", enabled: true },
    { id: 'highlights', title: "Highlights", icon: "Video", href: "/highlights", enabled: true },
    { id: 'tournaments', title: "Turnier organisieren", icon: "Trophy", href: "/tournaments", enabled: true },
    { id: 'camps', title: "Trainingslager", icon: "Mountain", href: "/camps", enabled: true },
    { id: 'bootcamps', title: "Bootcamps", icon: "Mountain", href: "/bootcamp", enabled: true },
    { id: 'tickets', title: "Tickets", icon: "Ticket", href: "/tickets", enabled: true },
    { id: 'waitlist', title: "Warteliste", icon: "UserPlus", href: "/waitlist", enabled: true },
  ],
  notificationSettings: [
    { id: 'new_club', label: 'Neuer Verein registriert sich', inApp: true, email: true },
    { id: 'new_lead', label: 'Neuer Lead (Vereinsanfrage)', inApp: true, email: true },
    { id: 'new_investor_lead', label: 'Neuer Investor Lead', inApp: true, email: true },
    { id: 'new_sponsorship_request', label: 'Neue Sponsoring-Anfrage', inApp: true, email: false },
    { id: 'new_camp_request', label: 'Neue Trainingslager-Anfrage', inApp: true, email: true },
    { id: 'system_error', label: 'Kritischer Systemfehler', inApp: false, email: true },
    { id: 'feedback', label: 'Neues Feedback von Nutzern', inApp: true, email: false },
  ],
  branding: {
    primary: { h: 217, s: 89, l: 61 },
    background: { h: 218, s: 93, l: 95 },
    accent: { h: 122, s: 53, l: 46 },
    bodyFont: "'PT Sans', sans-serif",
    headlineFont: "'PT Sans', sans-serif",
    logo: null,
  },
  dunningLevels: {
      saas: defaultSaasDunningLevels,
      club: defaultClubDunningLevels
  },
  rolesConfig: defaultRolesConfigFromLib,
  sectionOrder: sectionOrder,
  clubRules: [
    { id: 'c1', text: 'Pünktlichkeit bei allen Trainings und Spielen ist Pflicht.', mandatory: true, category: 'Allgemein' },
    { id: 'c2', text: 'Respektvoller Umgang mit Mitspielern, Trainern, Gegnern und Schiedsrichtern.', mandatory: true, category: 'Allgemein' },
    { id: 'c3', text: 'Das Vereinsmaterial ist sorgfältig zu behandeln.', mandatory: true, category: 'Material' },
    { id: 'c4', text: 'Teilnahme am jährlichen Sponsorenlauf ist für alle Aktivmitglieder obligatorisch.', mandatory: false, category: 'Events' },
  ],
  teamCategories: {
      'CH': [
        { id: '1', name: 'Junioren A', order: 1 },
        { id: '2', name: 'Junioren B', order: 2 },
        { id: '3', name: 'Junioren C', order: 3 },
        { id: '4', name: 'Junioren D', order: 4 },
        { id: '5', name: 'Junioren E', order: 5 },
        { id: '6', name: 'Junioren F', order: 6 },
        { id: '7', name: 'Junioren G', order: 7 },
      ]
  }
};
