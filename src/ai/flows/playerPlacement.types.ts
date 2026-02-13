
import { z } from 'zod';

export const PlayerSuggestionSchema = z.object({
  id: z.string().optional(),
  playerIdentifier: z.string(),
  playerName: z.string(),
  clubId: z.string(),
  clubName: z.string(),
  teamName: z.string(),
  status: z.enum(['pending', 'accepted', 'declined', 'invited']),
  createdAt: z.string(),
});

export type PlayerSuggestion = z.infer<typeof PlayerSuggestionSchema>;
