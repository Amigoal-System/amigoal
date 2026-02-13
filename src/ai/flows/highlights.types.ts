/**
 * @fileOverview Types for the highlights flow.
 */
import { z } from 'zod';

const TaggedPlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type TaggedPlayer = z.infer<typeof TaggedPlayerSchema>;

export const HighlightSchema = z.object({
  id: z.string().optional(),
  user: z.string(),
  team: z.string(),
  type: z.string(),
  videoUrl: z.string().url(),
  videoDataUri: z.string().optional(), // For upload, not stored in DB
  dataAiHint: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']),
  submittedAt: z.string(), // ISO date string
  likes: z.number().default(0),
  comments: z.number().default(0),
  shares: z.number().default(0),
  scoutRating: z.number().nullable().default(null),
  taggedPlayers: z.array(TaggedPlayerSchema).optional().default([]), // New field for tagged players
});
export type Highlight = z.infer<typeof HighlightSchema>;

export const initialHighlights: Highlight[] = [
    { id: '1', user: 'L. Messi', team: 'Junioren A1', type: 'Tor', videoUrl: 'https://placehold.co/1280x720.png', dataAiHint: "soccer goal", status: 'approved', submittedAt: '2024-07-28T10:00:00Z', likes: 125, comments: 12, shares: 5, scoutRating: 4.5, taggedPlayers: [{id: '101', name: 'Lionel Messi'}] },
    { id: '2', user: 'C. Ronaldo', team: '1. Mannschaft', type: 'Skill', videoUrl: 'https://placehold.co/1280x720.png', dataAiHint: "soccer skill", status: 'pending', submittedAt: '2024-07-29T11:00:00Z', likes: 98, comments: 8, shares: 3, scoutRating: 4.8, taggedPlayers: [] },
    { id: '3', user: 'Neymar Jr', team: 'Junioren B1', type: 'Assist', videoUrl: 'https://placehold.co/1280x720.png', dataAiHint: "soccer assist", status: 'approved', submittedAt: '2024-07-27T12:00:00Z', likes: 76, comments: 5, shares: 2, scoutRating: 3.9, taggedPlayers: [] },
    { id: '4', user: 'K. Mbappé', team: 'Junioren A1', type: 'Tor', videoUrl: 'https://placehold.co/1280x720.png', dataAiHint: "amazing goal", status: 'rejected', submittedAt: '2024-07-26T14:00:00Z', likes: 150, comments: 25, shares: 10, scoutRating: 3.2, taggedPlayers: [] },
    { id: '5', user: 'A. Davies', team: 'Junioren C2', type: 'Dribbling', videoUrl: 'https://placehold.co/1280x720.png', dataAiHint: "soccer dribbling", status: 'pending', submittedAt: '2024-07-30T09:00:00Z', likes: 88, comments: 7, shares: 1, scoutRating: null, taggedPlayers: [] },
    { id: '6', user: 'P. Foden', team: 'Senioren', type: 'Freistoss', videoUrl: 'https://placehold.co/1280x720.png', dataAiHint: "free kick", status: 'pending', submittedAt: '2024-07-30T15:00:00Z', likes: 112, comments: 15, shares: 4, scoutRating: null, taggedPlayers: [] },
];
