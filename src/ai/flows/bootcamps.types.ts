/**
 * @fileOverview Types for the bootcamps.
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
    gender: z.string().optional(),
    status: z.enum(['pending', 'confirmed', 'cancelled']).default('pending'),
    evaluation: z.object({
        positiveNotes: z.string().optional(),
        negativeNotes: z.string().optional(),
        speed: z.number().min(0).max(5).optional().default(0),
        maturity: z.number().min(0).max(5).optional().default(0),
        shootingPower: z.number().min(0).max(5).optional().default(0),
        passingAccuracy: z.number().min(0).max(5).optional().default(0),
        understanding: z.number().min(0).max(5).optional().default(0),
    }).optional(),
    attendance: z.record(z.boolean()).optional(),
});
export type Registration = z.infer<typeof RegistrationSchema>;

const ProgramItemSchema = z.object({
    id: z.string(),
    time: z.string(),
    activity: z.string(),
    location: z.string().optional(),
    focus: z.string().optional(),
});
export type ProgramItem = z.infer<typeof ProgramItemSchema>;

const DailyProgramSchema = z.object({
    id: z.string(),
    day: z.string(),
    schedule: z.array(ProgramItemSchema),
});
export type DailyProgram = z.infer<typeof DailyProgramSchema>;


export const BootcampStaffSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
});
export type BootcampStaff = z.infer<typeof BootcampStaffSchema>;

const FinancialsSchema = z.object({
    siblingDiscountPercentage: z.number().optional(),
    couponConfig: z.object({
        code: z.string().optional(),
        discountType: z.enum(['percentage', 'fixed']).optional(),
        discountValue: z.number().optional(),
        maxUsage: z.number().optional(),
    }).optional(),
}).optional();

// Make the price field more flexible to accept both number and string
const OfferSchema = z.object({
    price: z.union([z.number(), z.string()]).optional(),
    priceType: z.enum(['pro Person', 'pro Team', 'pauschal', 'Auf Anfrage']).default('pro Person'),
    details: z.string().optional(),
});

export const BootcampSchema = z.object({
    id: z.string().optional(),
    type: z.literal('bootcamp').default('bootcamp'),
    name: z.string(),
    location: z.string(),
    region: z.string().optional(),
    dateRange: DateRangeSchema.optional(),
    status: z.enum(['Entwurf', 'Online', 'In Durchführung', 'Abgeschlossen']),
    maxParticipants: z.number().optional(),
    registrations: z.array(RegistrationSchema).optional(),
    waitlist: z.array(RegistrationSchema).optional(),
    registrationDeadline: z.string().optional(), // ISO string
    focus: z.union([z.string(), z.array(z.string())]).optional(),
    offer: OfferSchema.optional(),
    source: z.string().optional(),
    description: z.string().optional(),
    featured: z.boolean().optional(),
    galleryImages: z.array(z.string()).optional(), // URLs of uploaded images
    program: z.array(DailyProgramSchema).optional(),
    staff: z.array(BootcampStaffSchema).optional(),
    financials: FinancialsSchema,
    featuredImage: z.string().optional().nullable(),
});
export type Bootcamp = z.infer<typeof BootcampSchema>;
