/**
 * @fileOverview Types for the leads flow.
 */
import { z } from 'zod';

export const LeadSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  contact: z.string(),
  email: z.string().email(),
  status: z.enum(['Interessent', 'Kontaktiert', 'Verhandlung', 'Gewonnen', 'Verloren', 'Onboarding']),
  lastContact: z.string(),
  type: z.enum(['Club', 'Bootcamp-Anbieter', 'Trainingslager-Anbieter']).default('Club'), // To distinguish lead types
  leadSource: z.string().optional(), // New field for lead source
  tags: z.array(z.string()).optional(),
  address: z.object({
      street: z.string().optional(),
      zip: z.string().optional(),
      city: z.string().optional(),
  }).optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  bestContactTime: z.string().optional(),
  website: z.string().optional(),
  notes: z.string().optional(),
  history: z.array(z.object({
      date: z.string(),
      text: z.string(),
  })).optional(),
});
export type Lead = z.infer<typeof LeadSchema>;

export const initialLeads: Lead[] = [
    { id: 'lead-1', name: 'FC Glattbrugg', contact: 'Walter Frosch', email: 'wf@fcglattbrugg.ch', status: 'Kontaktiert', lastContact: '2024-07-22', tags: ['potenziell', 'Zürich'], address: { street: 'Musterstrasse 1', zip: '8000', city: 'Zürich'}},
    { id: 'lead-2', name: 'FC Unterstrass', contact: 'Peter Keller', email: 'pk@fcunterstrass.ch', status: 'Interessent', lastContact: '2024-07-28', tags: ['potenziell', 'Zürich'] },
];
