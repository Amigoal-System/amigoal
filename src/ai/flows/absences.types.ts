
/**
 * @fileOverview Types for the absences flow.
 */
import { z } from 'zod';

export const AbsenceSchema = z.object({
  id: z.string().optional(),
  eventId: z.string(),
  memberId: z.string(),
  status: z.enum(['confirmed', 'declined', 'confirmed_driving', 'confirmed_needs_ride']),
  reason: z.string().optional(),
  createdAt: z.string(), // ISO date string
});

export type Absence = z.infer<typeof AbsenceSchema>;

export const initialAbsences: Absence[] = [
    {
        id: 'absence-1',
        eventId: '1', // Corresponds to a training ID from trainings.types.ts
        memberId: '101', // Lionel Messi
        status: 'declined',
        reason: 'Krank',
        createdAt: new Date().toISOString(),
    },
];
