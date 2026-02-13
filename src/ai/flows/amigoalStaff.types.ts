
import { z } from 'zod';

const HistoryItemSchema = z.object({
  date: z.string(),
  action: z.string(),
  details: z.string(),
  author: z.string().optional(), // Who made the change
});

export const AmigoalStaffSchema = z.object({
  id: z.string().optional(),
  ownerId: z.string().optional(), // ID of the provider if this is their staff
  name: z.string(),
  position: z.string().optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional(),
  avatar: z.string().url().optional().nullable(),
  address: z.object({
      street: z.string().optional(),
      zip: z.string().optional(),
      city: z.string().optional(),
  }).optional(),
  birthdate: z.string().optional(),
  ahvNumber: z.string().optional(),
  roles: z.array(z.string()),
  status: z.enum(['Aktiv', 'Inaktiv', 'Gesperrt']).default('Aktiv'),
  
  employment: z.object({
    mitarbeiterNummer: z.string().optional(),
    anstellungsart: z.enum(['Intern', 'Extern', 'Freelance', 'Auf Abruf']).optional(),
    entryDate: z.string().optional(),
    exitDate: z.string().optional().nullable(),
    workload: z.number().optional(), // in percent
    salary: z.number().optional(),
  }).optional(),

  skills: z.object({
    qualifications: z.array(z.string()).optional(),
    knowhow: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
  }).optional(),
  
  notes: z.string().optional(),
  agreements: z.string().optional(),
  history: z.array(HistoryItemSchema).optional(),
});

export type AmigoalStaff = z.infer<typeof AmigoalStaffSchema>;
export type HistoryItem = z.infer<typeof HistoryItemSchema>;
