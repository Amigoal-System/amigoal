
/**
 * @fileOverview Types for the watchlist flow.
 */
import { z } from 'zod';

export const WatchlistPlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  birthYear: z.string(),
  position: z.string(),
  teamName: z.string(),
  avatarUrl: z.string().url().optional(),
  scoutRating: z.number().min(0).max(10).optional(),
  potential: z.number().min(0).max(5).optional(),
  scoutNotes: z.string().optional(),
  addedBy: z.string(), // Scout's user ID
  addedAt: z.string(),
});
export type WatchlistPlayer = z.infer<typeof WatchlistPlayerSchema>;

export const initialWatchlistPlayers: WatchlistPlayer[] = [
    {
        id: 'wl-101',
        name: 'Jamal Musiala',
        birthYear: '2003',
        position: 'Mittelfeld',
        teamName: 'Junioren A1',
        avatarUrl: 'https://placehold.co/100x100?text=JM',
        scoutRating: 9,
        potential: 4.8,
        scoutNotes: 'Sehr kreativ, muss an der Defensive arbeiten.',
        addedBy: 'serra.juni@barcelona.com',
        addedAt: new Date().toISOString()
    },
    {
        id: 'wl-102',
        name: 'Florian Wirtz',
        birthYear: '2003',
        position: 'Mittelfeld',
        teamName: 'Junioren A1',
        avatarUrl: 'https://placehold.co/100x100?text=FW',
        scoutRating: 8,
        potential: 4.7,
        scoutNotes: 'Exzellente Spielübersicht.',
        addedBy: 'serra.juni@barcelona.com',
        addedAt: new Date().toISOString()
    }
];
