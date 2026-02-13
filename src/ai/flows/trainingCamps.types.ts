/**
 * @fileOverview Types for the training camps and sports facilities.
 */
import { z } from 'zod';
import type { SportsFacility, Review } from './providers.types';

const DateRangeSchema = z.object({
    from: z.string(), // Storing as ISO string
    to: z.string(),
});

export const CampRequestSchema = z.object({
    clubName: z.string(),
    contactPerson: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    wishes: z.string().optional(),
    destination: z.string().optional(),
    dates: DateRangeSchema.optional(),
    participants: z.string().optional(),
    budget: z.string().optional(),
    facility: z.string().optional(),
});
export type CampRequest = z.infer<typeof CampRequestSchema>;

export const TrainingCampSchema = z.object({
    id: z.string().optional(),
    type: z.literal('camp').default('camp'),
    name: z.string(),
    location: z.string(),
    date: DateRangeSchema.optional(),
    budget: z.number().optional(),
    status: z.enum(['Anfrage', 'Entwurf', 'Online', 'In Durchführung', 'Abgeschlossen']),
    source: z.string().optional(),
    requestDetails: CampRequestSchema.optional(),
});
export type TrainingCamp = z.infer<typeof TrainingCampSchema>;

export type { SportsFacility, Review };
export { SportsFacilitySchema } from './providers.types';
