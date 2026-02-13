
export type DunningLevel = {
    id: string;
    name: string;
    days: number;
    fee: number;
    subject: string;
    body: string;
};

export const DUNNING_LEVELS_KEY = "amigoal_dunning_levels";

export const defaultSaasDunningLevels: DunningLevel[] = [
    { id: 'saas_reminder', name: 'Zahlungserinnerung', days: 7, fee: 0, subject: 'Zahlungserinnerung: Amigoal Abonnement', body: 'Sehr geehrte/r {CLUB_MANAGER},\n\ngerne erinnern wir Sie an die offene Rechnung für Ihr Amigoal-Abonnement für den Verein {CLUB_NAME}.\n\nBitte begleichen Sie den Betrag in den nächsten Tagen.\n\nSportliche Grüsse,\nIhr Amigoal Team' },
    { id: 'saas_dunning_1', name: '1. Mahnung', days: 21, fee: 20, subject: '1. Mahnung: Ihr Amigoal Abonnement', body: 'Sehr geehrte/r {CLUB_MANAGER},\n\nleider konnten wir für Ihr Abonnement für den Verein {CLUB_NAME} noch keinen Zahlungseingang feststellen. Wir müssen Ihnen hiermit eine Mahngebühr von CHF {FEE} verrechnen.\n\nSportliche Grüsse,\nIhr Amigoal Team' },
];

export const defaultClubDunningLevels: DunningLevel[] = [
    { id: 'member_reminder', name: 'Erinnerung Mitgliederbeitrag', days: 14, fee: 0, subject: 'Erinnerung: Offener Mitgliederbeitrag', body: 'Hallo {MEMBER_NAME},\n\nwir möchten dich freundlich an den offenen Mitgliederbeitrag für die Saison {SAISON} in Höhe von {AMOUNT} erinnern.\n\nSportliche Grüsse,\nDein Verein' },
    { id: 'member_dunning_1', name: '1. Mahnung Mitgliederbeitrag', days: 30, fee: 10, subject: '1. Mahnung: Offener Mitgliederbeitrag', body: 'Hallo {MEMBER_NAME},\n\nleider ist dein Mitgliederbeitrag immer noch ausstehend. Wir müssen dir hiermit eine Mahngebühr von CHF {FEE} verrechnen.\n\nSportliche Grüsse,\nDein Verein' },
];

export const allDefaultDunningLevels: DunningLevel[] = [
    ...defaultSaasDunningLevels,
    ...defaultClubDunningLevels
]
