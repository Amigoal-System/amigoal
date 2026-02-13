

import { z } from 'zod';

const HistoryItemSchema = z.object({
  date: z.string(),
  user: z.string(),
});

const AgreementSchema = z.object({
    financial: z.string().optional(),
    other: z.string().optional(),
}).optional();

// Using .or(z.literal('')) allows an empty string to pass validation,
// which is what an empty HTML input provides. It is then transformed
// to null before final parsing to match the nullable database schema.
const optionalUrl = z.union([z.string().url(), z.literal('')]).transform(val => val === '' ? null : val).nullable();
const optionalEmail = z.union([z.string().email(), z.literal('')]).transform(val => val === '' ? null : val).nullable();

export const MedicalContactSchema = z.object({
  id: z.string().optional(),
  salutation: z.string().optional(),
  title: z.string().optional().nullable(),
  firstName: z.string(),
  lastName: z.string(),
  contactPerson: z.string().optional(),
  specialty: z.string(),
  address: z.object({
    street: z.string().optional(),
    zip: z.string().optional(),
    city: z.string().optional(),
  }).optional(),
  phone: z.string().optional(),
  email: optionalEmail,
  website: optionalUrl,
  instagram: z.string().optional().nullable(),
  linkedin: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  notes: z.string().optional(),
  history: z.array(HistoryItemSchema).optional(),
  agreement: AgreementSchema,
});

export type MedicalContact = z.infer<typeof MedicalContactSchema>;
export type MedicalContactHistoryItem = z.infer<typeof HistoryItemSchema>;
