import { z } from 'zod';

export const AmigoalContractSchema = z.object({
  id: z.string().optional(),
  partnerId: z.string(), // e.g., clubId, providerId
  partnerName: z.string(),
  partnerType: z.enum(['Club', 'Provider', 'Scout', 'Other']),
  contractType: z.string(), // e.g., 'SaaS Subscription', 'Partnership Agreement'
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(['Active', 'Expired', 'Terminated', 'Draft']),
  monthlyFee: z.number().optional().nullable(),
  commissionRate: z.number().optional().nullable(),
  documentUrl: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type AmigoalContract = z.infer<typeof AmigoalContractSchema>;
