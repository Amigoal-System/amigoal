/**
 * @fileOverview Types for the members flow.
 */
import { z } from 'zod';

const SuspensionSchema = z.object({
    isSuspended: z.boolean().default(false),
    reason: z.string().optional(),
    from: z.string().optional(), // ISO date string
    to: z.string().optional(),   // ISO date string
}).optional();

// Define the Zod schema for a single member which can be used for validation.
export const MemberSchema = z.object({
  id: z.string().optional(),
  salutation: z.enum(['Herr', 'Frau', 'Unbekannt']).optional(),
  firstName: z.string(),
  lastName: z.string(),
  teams: z.array(z.string()).optional(),
  team: z.string().optional().nullable(), // Legacy, can be removed later
  roles: z.array(z.string()),
  avatar: z.string().url().optional().nullable(),
  memberNr: z.string(),
  fee: z.object({
    season: z.string(),
    amount: z.number(),
    date: z.string(),
    paid: z.boolean(),
  }),
  status: z.enum(['Aktiv', 'Passiv', 'Ehemalig', 'Ausgetreten']),
  memberSince: z.string(),
  entryDate: z.string().optional(),
  exitDate: z.string().optional().nullable(),
  newsletterGroups: z.array(z.string()).optional(),
  position: z.string().optional(),
  geb: z.string().optional(),
  trikot: z.number().optional(),
  suspension: SuspensionSchema,
  phonePrivate: z.string().optional(),
  phoneMobile: z.string().optional(),
  phoneBusiness: z.string().optional(),
  nationality: z.string().optional(),
  maritalStatus: z.enum(['Ledig', 'Verheiratet', 'Geschieden', 'Verwitwet', 'Unbekannt']).optional(),
  leadSource: z.string().optional(),
  clubId: z.string().optional(),
  clubName: z.string().optional(),
  clubLoginUser: z.string().optional(),
  email: z.string().email().optional(),
  address: z.object({
    street: z.string().optional(),
    zip: z.string().optional(),
    city: z.string().optional(),
  }).optional(),
  alternativeEmail: z.string().email().optional().nullable(),
  jsNumber: z.string().optional().nullable(),
  ahvNumber: z.string().regex(/^756\.\d{4}\.\d{4}\.\d{2}$/, "Ungültiges AHV-Format").optional().nullable().or(z.literal('')),
  passportNumber: z.string().optional().nullable(),
});

export type Member = z.infer<typeof MemberSchema>;
