
import { z } from 'zod';

const GoalSchema = z.object({
  id: z.string(),
  label: z.string(),
  current: z.number(),
  target: z.number(),
  icon: z.string(),
});

const FinancialsSchema = z.object({
  salary: z.number(),
  goalBonus: z.number(),
  assistBonus: z.number(),
  cleanSheetBonus: z.number().optional(),
});

export const ContractSchema = z.object({
  id: z.string().optional(),
  memberId: z.string(),
  name: z.string(),
  from: z.string(),
  to: z.string(),
  status: z.enum(["Aktiv", "Abgelaufen", "Entwurf"]),
  clauses: z.array(z.string()),
  financials: FinancialsSchema,
  goals: z.array(GoalSchema),
});

export type Contract = z.infer<typeof ContractSchema>;
