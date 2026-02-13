
import { z } from 'zod';

const AgreementSchema = z.object({
  capitalIncrease: z.string().optional(),
  preemptiveRight: z.string().optional(),
  tagAlongRight: z.string().optional(),
  antiDilution: z.string().optional(),
  term: z.string().optional(),
  noticePeriod: z.string().optional(),
}).optional();


export const InvestorSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  contact: z.string(),
  type: z.enum(['VC', 'Angel Investor', 'Family Office', 'Privatperson']),
  investment: z.number().optional(),
  equity: z.number().optional(),
  status: z.enum(['Active', 'Inactive', 'Prospect']),
  roles: z.array(z.string()).optional(),
  email: z.string().email(),
  agreement: AgreementSchema,
});

export type Investor = z.infer<typeof InvestorSchema>;
