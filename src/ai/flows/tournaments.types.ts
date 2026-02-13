

/**
 * @fileOverview Types for the tournament management flows.
 */
import { z } from 'zod';

export const TournamentPlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type TournamentPlayer = z.infer<typeof TournamentPlayerSchema>;

export const TournamentTeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  payment: z.enum(['Bezahlt', 'Offen', 'Ausstehend']),
  contact: z.string().optional(),
  email: z.string().email().optional(),
  players: z.array(TournamentPlayerSchema).optional(),
});
export type TournamentTeam = z.infer<typeof TournamentTeamSchema>;

export const TournamentMatchSchema = z.object({
  id: z.string(),
  time: z.string(),
  field: z.number(),
  teamA: z.string(),
  teamB: z.string(),
  scoreA: z.number().nullable(),
  scoreB: z.number().nullable(),
  status: z.enum(['pending', 'live', 'finished']),
  group: z.string().optional(),
});
export type TournamentMatch = z.infer<typeof TournamentMatchSchema>;

export const TournamentHelperSchema = z.object({
    id: z.string(),
    name: z.string(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    notes: z.string().optional(),
});
export type TournamentHelper = z.infer<typeof TournamentHelperSchema>;

export const TournamentShiftSchema = z.object({
    id: z.string(),
    time: z.string(),
    needed: z.number(),
    assigned: z.array(z.string()), // Changed to array of helper IDs
});
export type TournamentShift = z.infer<typeof TournamentShiftSchema>;

export const TournamentStationSchema = z.object({
    id: z.string(),
    name: z.string(),
    shifts: z.array(TournamentShiftSchema),
});
export type TournamentStation = z.infer<typeof TournamentStationSchema>;

export const TournamentSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(), // e.g., "10. & 11. August 2024"
  status: z.enum(['In Planung', 'Geplant', 'Abgeschlossen']),
  teams: z.array(TournamentTeamSchema).optional(),
  matches: z.array(TournamentMatchSchema).optional(),
  helpers: z.array(TournamentHelperSchema).optional(),
  stations: z.array(TournamentStationSchema).optional(),
});
export type Tournament = z.infer<typeof TournamentSchema>;


// --- Mock Data ---

export const initialTournaments: Tournament[] = [
    { 
      id: 'sommer-cup-2024', 
      name: 'Zürcher Sommer-Cup 2024', 
      date: '10. & 11. August 2024', 
      status: 'Geplant',
      teams: [
        { id: 't1', name: 'FC Junior Lions', category: 'Junioren D', payment: 'Bezahlt', contact: 'Peter Lustig', email: 'peter@lustig.de', players: [] },
        { id: 't2', name: 'Red Star Kids', category: 'Junioren E', payment: 'Offen', contact: 'Erika Muster', email: 'erika@muster.ch', players: [] },
        { id: 't3', name: 'Blue Stars Talents', category: 'Junioren D', payment: 'Bezahlt', contact: 'Max Power', email: 'max@power.com', players: [] },
        { id: 't4', name: 'Grasshopper U10', category: 'Junioren E', payment: 'Bezahlt', contact: 'Urs Meier', email: 'urs@meier.ch', players: [] },
      ],
      helpers: [
        { id: 'h1', name: 'Peter Lustig', phone: '079 123 45 67', email: 'peter@lustig.de', notes: 'Erfahren am Grill' },
        { id: 'h2', name: 'Erika Muster', phone: '078 987 65 43', email: 'erika@muster.ch', notes: 'Kann nur Vormittags' },
      ],
      stations: [
        { 
          id: 's1',
          name: 'Grillstand', 
          shifts: [
            { id: 'sh1', time: '10:00 - 12:00', needed: 2, assigned: ['h1'] },
            { id: 'sh2', time: '12:00 - 14:00', needed: 2, assigned: [] },
          ]
        },
      ],
      matches: [
        { id: 'm1', time: '10:00', field: 1, teamA: 'FC Junior Lions', teamB: 'Red Star Kids', scoreA: null, scoreB: null, status: 'pending', group: 'A' },
        { id: 'm2', time: '10:00', field: 2, teamA: 'Blue Stars Talents', teamB: 'Grasshopper U10', scoreA: null, scoreB: null, status: 'pending', group: 'B' },
      ]
    },
    { id: 'hallenmasters-2025', name: 'Hallenmasters 2025', date: '18. & 19. Januar 2025', status: 'In Planung' },
    { id: 'junioren-tag-2024', name: 'Grosser Junioren-Tag', date: '14. September 2024', status: 'Abgeschlossen' },
];
