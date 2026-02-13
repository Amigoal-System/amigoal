
'use client';

import { z } from 'zod';

const FeedbackTalkSchema = z.object({
    id: z.union([z.string(), z.number()]),
    date: z.string(),
    topic: z.string(),
    summary: z.string(),
    participants: z.string().optional(),
    status: z.enum(['Entwurf', 'Bestätigung ausstehend', 'Bestätigt']),
});

export const CoachSchema = z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().url().optional(),
    teams: z.array(z.string()).optional(),
    roles: z.array(z.string()),
    memberSince: z.string().optional(),
    diplomas: z.array(z.string()).optional(),
    courses: z.array(z.string()).optional(),
    history: z.array(z.object({
        period: z.string(),
        club: z.string(),
        team: z.string(),
    })).optional(),
    info: z.object({
        birthday: z.string(),
        nationality: z.string(),
        languages: z.string(),
    }).optional(),
    contract: z.object({
        from: z.string(),
        to: z.string(),
        salary: z.string(),
        winBonus: z.string(),
        drawBonus: z.string(),
        trainingBonus: z.string(),
        clauses: z.array(z.string()),
    }).optional(),
    attendance: z.object({
        training: z.number().min(0).max(100),
        games: z.number().min(0).max(100),
        totalTrainings: z.number(),
        attendedTrainings: z.number(),
        totalGames: z.number(),
        attendedGames: z.number(),
    }).optional(),
    seasonGoals: z.array(z.object({
        name: z.string(),
        value: z.number(),
        target: z.number(),
        type: z.enum(['rank', 'lessIsBetter', 'percentage']),
    })).optional(),
    playerRatings: z.object({
        overall: z.number(),
        totalCount: z.number(),
        breakdown: z.array(z.object({
            team: z.string(),
            rating: z.number(),
            count: z.number(),
            type: z.string(),
        })),
        distribution: z.array(z.object({
            stars: z.number(),
            count: z.number(),
        })),
    }).optional(),
    adminRating: z.number().min(0).max(5).optional(),
    feedbackTalks: z.array(FeedbackTalkSchema).optional(),
    upcomingTrainings: z.array(z.object({
        id: z.number(),
        team: z.string(),
        date: z.string(),
        time: z.string(),
    })).optional(),
    upcomingMatches: z.array(z.object({
        id: z.number(),
        team: z.string(),
        date: z.string(),
        opponent: z.string(),
    })).optional(),
});

export type Coach = z.infer<typeof CoachSchema>;

// Mock data that conforms to the schema
export const initialCoachData: Coach = {
    id: 'pep-guardiola',
    name: "Pep Guardiola",
    avatar: "https://placehold.co/128x128.png?text=PG",
    teams: ["1. Mannschaft", "Junioren A1"],
    roles: ["Trainer", "Spieler", "Schiedsrichter"],
    memberSince: "2016-07-01",
    diplomas: ["UEFA Pro Lizenz", "DFB-A-Lizenz", "J+S Leiter"],
    courses: ["Taktik-Workshop (2023)", "Leadership im Sport (2022)"],
    history: [
        { period: '2016 - Heute', club: 'Amigoal FC', team: '1. Mannschaft & Junioren A1'},
        { period: '2013 - 2016', club: 'FC Bayern München', team: '1. Mannschaft'},
        { period: '2008 - 2012', club: 'FC Barcelona', team: '1. Mannschaft'},
        { period: '2007 - 2008', club: 'FC Barcelona B', team: 'B-Mannschaft'},
    ],
    info: {
        birthday: "1971-01-18",
        nationality: "Spanisch",
        languages: "Spanisch, Katalanisch, Deutsch, Englisch, Italienisch"
    },
    contract: {
        from: "2024-07-01",
        to: "2026-06-30",
        salary: "CHF 120,000 / Jahr",
        winBonus: "CHF 500",
        drawBonus: "CHF 150",
        trainingBonus: "CHF 50",
        clauses: [
            "Automatische Verlängerung um ein Jahr bei Klassenerhalt.",
            "Spieler ist verpflichtet, an allen offiziellen Sponsorenterminen teilzunehmen.",
            "Bildrechte für Vereinsmarketing liegen beim Club."
        ]
    },
    attendance: {
        training: 98,
        games: 100,
        totalTrainings: 40,
        attendedTrainings: 39,
        totalGames: 18,
        attendedGames: 18,
    },
    seasonGoals: [
        { name: 'Meisterschaft', value: 1, target: 1, type: 'rank' },
        { name: 'Gegentore', value: 22, target: 20, type: 'lessIsBetter' },
        { name: 'Spielerentwicklung', value: 85, target: 90, type: 'percentage' }
    ],
    playerRatings: {
        overall: 4.5,
        totalCount: 26,
        breakdown: [
            { team: '1. Mannschaft', rating: 4.6, count: 18, type: 'Spieler' },
            { team: 'Junioren A1', rating: 4.3, count: 8, type: 'Spieler & Eltern' },
        ],
        distribution: [
            { stars: 5, count: 18 },
            { stars: 4, count: 6 },
            { stars: 3, count: 2 },
            { stars: 2, count: 0 },
            { stars: 1, count: 0 },
        ]
    },
    adminRating: 4,
    feedbackTalks: [
        { id: 1, date: '2024-05-20', topic: 'Saisonplanung 24/25', summary: 'Ziele und Kaderplanung besprochen. Guter Austausch.', participants: 'Pep Guardiola, Sportchef', status: 'Bestätigt' },
        { id: 2, date: '2023-12-15', topic: 'Halbjahresgespräch', summary: 'Leistungsanalyse der Hinrunde. Sehr zufrieden.', participants: 'Pep Guardiola, Sportchef', status: 'Bestätigt' },
        { id: 3, date: '2024-07-29', topic: 'Vorbereitung Trainingslager', summary: 'Planung und Organisation für das Trainingslager in Spanien.', participants: 'Pep Guardiola', status: 'Entwurf' },
    ],
    upcomingTrainings: [
        { id: 1, team: '1. Mannschaft', date: '2024-08-05', time: '18:30 - 20:00'},
        { id: 2, team: 'Junioren A1', date: '2024-08-06', time: '19:00 - 20:30'},
        { id: 3, team: '1. Mannschaft', date: '2024-08-07', time: '18:30 - 20:00'},
    ],
    upcomingMatches: [
        { id: 1, team: '1. Mannschaft', date: '2024-08-10', opponent: 'FC Rivalen'},
        { id: 2, team: 'Junioren A1', date: '2024-08-11', opponent: 'FC City'},
    ]
};
