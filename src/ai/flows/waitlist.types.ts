
/**
 * @fileOverview Types for the waitlist flow.
 */
import { z } from 'zod';

export const WaitlistPlayerSchema = z.object({
  id: z.string().optional(),
  salutation: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  birthYear: z.string(),
  position: z.string(),
  previousClub: z.string().optional(),
  region: z.string().optional(),
  contactName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  addedAt: z.string(),
  status: z.enum(['new', 'contacted', 'placed']),
});
export type WaitlistPlayer = z.infer<typeof WaitlistPlayerSchema>;

export const initialWaitlistPlayers: WaitlistPlayer[] = [
    {
        id: 'waitlist-1',
        salutation: 'Unbekannt',
        firstName: 'Alex',
        lastName: 'Huber',
        birthYear: '2012',
        position: 'Mittelfeld',
        previousClub: 'FC Beispielstadt',
        region: 'Zürich',
        contactName: 'Peter Huber',
        email: 'peter.huber@example.com',
        phone: '0791234567',
        addedAt: new Date().toISOString(),
        status: 'new'
    },
    {
        id: 'waitlist-2',
        salutation: 'Unbekannt',
        firstName: 'Mia',
        lastName: 'Keller',
        birthYear: '2014',
        position: 'Sturm',
        region: 'Winterthur',
        contactName: 'Sandra Keller',
        email: 's.keller@example.com',
        phone: '0781234567',
        addedAt: new Date().toISOString(),
        status: 'new'
    },
];
