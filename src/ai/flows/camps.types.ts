
/**
 * @fileOverview Types for the camps and bootcamps.
 */
import { z } from 'zod';

const DateRangeSchema = z.object({
    from: z.string(), // Storing as ISO string
    to: z.string(),
});

export const RegistrationSchema = z.object({
    userId: z.string(),
    name: z.string(),
    role: z.string(),
});
export type Registration = z.infer<typeof RegistrationSchema>;

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

export const CampSchema = z.object({
    id: z.string().optional(),
    type: z.enum(['camp', 'bootcamp']),
    name: z.string(),
    location: z.string(),
    region: z.string().optional(),
    date: DateRangeSchema.optional(), // For training camps
    dateRange: DateRangeSchema.optional(), // For bootcamps
    budget: z.number().optional(),
    status: z.enum(['Anfrage', 'Entwurf', 'Online', 'In Durchführung', 'Abgeschlossen']),
    minParticipants: z.number().optional(),
    participants: z.number().optional(), // For bootcamps
    maxParticipants: z.number().optional(),
    registrations: z.array(RegistrationSchema).optional(),
    waitlist: z.array(RegistrationSchema).optional(),
    registrationDeadline: z.string().optional(), // ISO string
    focus: z.union([z.string(), z.array(z.string())]).optional(), // For bootcamps
    offer: z.object({
        price: z.string(),
        details: z.string(),
    }).optional(),
    source: z.string().optional(),
    description: z.string().optional(),
    featured: z.boolean().optional(), // For featured bootcamps
    requestDetails: CampRequestSchema.optional(), // To store original request data
    galleryImages: z.array(z.string()).optional(), // URLs of uploaded images
});
export type Camp = z.infer<typeof CampSchema>;


export const SportsFacilitySchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  location: z.string(),
  features: z.array(z.string()),
});
export type SportsFacility = z.infer<typeof SportsFacilitySchema>;
