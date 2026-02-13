
/**
 * @fileOverview Types for the cards (disciplinary) flow.
 */
import { z } from 'zod';

export const CardSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  team: z.string(),
  opponentClub: z.string(),
  date: z.string(),
  gameId: z.string(),
  gameMinute: z.string(),
  cards: z.array(z.enum(['yellow', 'red'])),
  reason: z.string(),
  cost: z.number(),
  avatar: z.string().url().optional(),
  playerNr: z.string(),
  status: z.enum(['Offen', 'Bezahlt', 'Archiviert']),
  paidBy: z.enum(['Club', 'Spieler', 'Spieler (Rechnung)']).optional(),
  memberId: z.string(),
});
export type Card = z.infer<typeof CardSchema>;

export const initialCards: Card[] = [
  { id: '1', name: 'Lionel Messi', team: '1. Mannschaft', opponentClub: 'FC City', date: '20.07.2024', gameId: '123456', gameMinute: "78'", cards: ['yellow'], reason: 'Reklamieren', cost: 15, avatar: 'https://placehold.co/40x40.png?text=LM', playerNr: '10', status: 'Offen', memberId: '101' },
  { id: '2', name: 'Cristiano Ronaldo', team: '1. Mannschaft', opponentClub: 'FC United', date: '22.07.2024', gameId: '1234568', gameMinute: "90'", cards: ['red'], reason: 'Tätlichkeit', cost: 50, avatar: 'https://placehold.co/40x40.png?text=CR', playerNr: '7', status: 'Bezahlt', paidBy: 'Spieler', memberId: '102' },
  { id: '3', name: 'Neymar Jr', team: 'Junioren A1', opponentClub: 'FC Kickers', date: '18.07.2024', gameId: '1234569', gameMinute: "45'", cards: ['yellow'], reason: 'Unsportlichkeit', cost: 10, avatar: 'https://placehold.co/40x40.png?text=NJ', playerNr: '11', status: 'Offen', memberId: '201' },
];
