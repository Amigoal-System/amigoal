/**
 * @fileOverview Types for the investor leads flow.
 */
import { z } from 'zod';

const HistoryItemSchema = z.object({
  date: z.string(),
  text: z.string(),
});

export const InvestorLeadSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  company: z.string().optional(),
  email: z.string().email(),
  message: z.string().optional(),
  status: z.enum(['Interessent', 'Kontaktiert', 'Präsentiert', 'Verhandlung', 'Abgeschlossen', 'Abgelehnt', 'Archiviert']),
  createdAt: z.string(), // ISO date string
  history: z.array(HistoryItemSchema).optional(),
});
export type InvestorLead = z.infer<typeof InvestorLeadSchema>;
export type HistoryItem = z.infer<typeof HistoryItemSchema>;
