import { z } from 'zod';

export const CommissionInvoiceSchema = z.object({
  id: z.string().optional(),
  providerId: z.string(),
  providerName: z.string(),
  bootcampId: z.string(),
  bootcampName: z.string(),
  registrationId: z.string(),
  customerName: z.string(),
  bookingAmount: z.number(),
  commissionAmount: z.number(),
  status: z.enum(['Offen', 'Bezahlt']),
  createdAt: z.string(), // ISO date string
});

export type CommissionInvoice = z.infer<typeof CommissionInvoiceSchema>;
