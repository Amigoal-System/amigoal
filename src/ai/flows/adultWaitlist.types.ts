
/**
 * @fileOverview Types for the adult waitlist flow.
 */
import { z } from 'zod';

export const AdultWaitlistPlayerSchema = z.object({
  id: z.string().optional(),
  salutation: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  birthYear: z.string(),
  position: z.string(),
  previousClub: z.string().optional(),
  region: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  addedAt: z.string(),
  status: z.enum(['new', 'contacted', 'placed']),
});
export type AdultWaitlistPlayer = z.infer<typeof AdultWaitlistPlayerSchema>;
