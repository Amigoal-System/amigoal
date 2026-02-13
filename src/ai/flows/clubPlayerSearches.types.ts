
import { z } from 'zod';

export const ClubPlayerSearchSchema = z.object({
  id: z.string().optional(),
  clubId: z.string(),
  clubName: z.string(),
  position: z.string(),
  ageGroup: z.string(),
  description: z.string().optional(),
  status: z.enum(['open', 'filled', 'closed']),
  createdAt: z.string(),
});

export type ClubPlayerSearch = z.infer<typeof ClubPlayerSearchSchema>;

export const initialClubPlayerSearches: Omit<ClubPlayerSearch, 'id'>[] = [
    {
        clubId: 'k4rGugGDcUtdnA0epIb0', // FC Albania
        clubName: 'FC Albania',
        position: 'Mittelstürmer',
        ageGroup: 'Junioren A',
        description: 'Suchen dringend einen kopfballstarken Stürmer für die kommende Saison.',
        status: 'open',
        createdAt: new Date().toISOString(),
    },
    {
        clubId: 'someOtherClubId', // FC Awesome
        clubName: 'FC Awesome',
        position: 'Torwart',
        ageGroup: 'Junioren C',
        description: 'Wir benötigen einen talentierten Torwart mit guten Reflexen.',
        status: 'open',
        createdAt: new Date().toISOString(),
    },
];
