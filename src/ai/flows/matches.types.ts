/**
 * @fileOverview Types for the matches flow.
 */
import { z } from 'zod';

export const MatchEventSchema = z.object({
  id: z.string(),
  minute: z.number(),
  type: z.enum(['goal', 'yellow-card', 'red-card', 'substitution', 'comment']),
  team: z.enum(['home', 'away']),
  playerIn: z.string().optional(),
  playerOut: z.string().optional(),
  scorer: z.string().optional(),
  assistant: z.string().optional(),
  comment: z.string().optional(),
  cardedPlayer: z.string().optional(),
});
export type MatchEvent = z.infer<typeof MatchEventSchema>;

export const PlayerRatingSchema = z.object({
  playerId: z.string(),
  userId: z.string(), // ID of the user who gave the rating (fan, scout, etc.)
  role: z.string(), // Role of the user
  rating: z.number().min(1).max(10),
  comment: z.string().optional(),
  coachApproved: z.boolean().optional(),
});
export type PlayerRating = z.infer<typeof PlayerRatingSchema>;

export const PlayerFeelingSchema = z.object({
    performance: z.number().min(1).max(10),
    feeling: z.enum(['Top', 'Gut', 'Mittel', 'Schlecht']),
});
export type PlayerFeeling = z.infer<typeof PlayerFeelingSchema>;

export const MatchSchema = z.object({
  id: z.string().optional(),
  clubId: z.string(),
  date: z.string(),
  homeTeam: z.string(),
  awayTeam: z.string(),
  homeTeamLogo: z.string().optional().nullable(),
  awayTeamLogo: z.string().optional().nullable(),
  location: z.string(),
  competition: z.enum(['Meisterschaft', 'Cup', 'Testspiel']),
  status: z.enum(['Anstehend', 'Live', 'Halbzeit', 'Beendet', 'Abgesagt']),
  homeScore: z.number().default(0),
  awayScore: z.number().default(0),
  events: z.array(MatchEventSchema).optional(),
  lineup: z.array(z.string()).optional(), // Array of player IDs
  bench: z.array(z.string()).optional(), // Array of player IDs
  playerRatings: z.array(PlayerRatingSchema).optional(),
  playerFeelings: z.record(z.string(), PlayerFeelingSchema).optional(), // Keyed by playerID
});

export type Match = z.infer<typeof MatchSchema>;

export const initialMatches: Omit<Match, 'id' | 'clubId'>[] = [
  {
    date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    homeTeam: 'FC Amigoal',
    awayTeam: 'FC Rivalen',
    homeTeamLogo: null,
    awayTeamLogo: 'https://placehold.co/80x80.png?text=FCR',
    location: 'Heim',
    competition: 'Meisterschaft',
    status: 'Anstehend',
    homeScore: 0,
    awayScore: 0,
    events: [],
    lineup: [],
    bench: [],
  },
  {
    date: new Date().toISOString(),
    homeTeam: 'FC Amigoal',
    awayTeam: 'FC City',
    homeTeamLogo: null,
    awayTeamLogo: 'https://placehold.co/80x80.png?text=FCC',
    location: 'Auswärts',
    competition: 'Meisterschaft',
    status: 'Live',
    homeScore: 1,
    awayScore: 0,
    events: [
        { id: 'evt1', minute: 23, type: 'goal', team: 'home', scorer: 'Lionel Messi', comment: 'Traumtor per Freistoss!' },
    ],
    lineup: [],
    bench: [],
  },
   {
    date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
    homeTeam: 'FC Amigoal',
    awayTeam: 'United FC',
    homeTeamLogo: null,
    awayTeamLogo: 'https://placehold.co/80x80.png?text=UFC',
    location: 'Heim',
    competition: 'Cup',
    status: 'Beendet',
    homeScore: 2,
    awayScore: 0,
    events: [],
    lineup: [],
    bench: [],
  },
];
