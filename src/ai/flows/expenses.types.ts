
/**
 * @fileOverview Types for the expenses flow.
 */
import { z } from 'zod';

export const ExpenseSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['Schiedsrichter', 'Material', 'Spesen']),
  description: z.string(),
  date: z.string(), // ISO date string
  sum: z.number(),
  status: z.enum(['Offen', 'Genehmigt', 'Abgelehnt', 'Ausbezahlt']),
  submittedBy: z.string(), // User ID or name
  receiptUrl: z.string().url().optional(),
});

export type Expense = z.infer<typeof ExpenseSchema>;

export const initialExpenses: Expense[] = [
    { id: '1', type: 'Schiedsrichter', description: 'Spiel vs FC City', date: '2024-07-20', sum: 90.00, status: 'Ausbezahlt', submittedBy: 'Pep Guardiola' },
    { id: '2', type: 'Material', description: 'Neue Bälle (10x)', date: '2024-07-22', sum: 250.00, status: 'Genehmigt', submittedBy: 'Pep Guardiola' },
    { id: '3', type: 'Spesen', description: 'Autofahrt Auswärtsspiel', date: '2024-07-20', sum: 45.50, status: 'Offen', submittedBy: 'Zinedine Zidane' },
];
