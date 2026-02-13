/**
 * @fileOverview Types for the Team Cash management flow.
 */

import {z} from 'genkit';

export const TeamIdSchema = z.string().describe("The unique identifier for a team.");
export type TeamId = z.infer<typeof TeamIdSchema>;

export const TransactionSchema = z.object({
  id: z.number().describe('The unique identifier for the transaction.'),
  type: z.enum(['Einzahlung', 'Auszahlung', 'Busse']).describe('The type of the transaction.'),
  description: z.string().describe('A brief description of the transaction.'),
  amount: z.number().describe('The transaction amount (positive for income, negative for expense).'),
  date: z.string().describe('The date of the transaction in YYYY-MM-DD format.'),
  memberId: z.number().optional().describe("The ID of the member this transaction is associated with, if any."),
});
export type Transaction = z.infer<typeof TransactionSchema>;

export const MemberBalanceSchema = z.object({
  id: z.number().describe("The member's unique ID."),
  name: z.string().describe("The member's name."),
  balance: z.number().describe("The member's current balance (negative for debt)."),
});
export type MemberBalance = z.infer<typeof MemberBalanceSchema>;

export const KeeperSchema = z.object({
    id: z.number(),
    name: z.string(),
}).optional().nullable();
export type Keeper = z.infer<typeof KeeperSchema>;

export const TeamCashDataSchema = z.object({
  balance: z.number().describe("The team's current cash box balance."),
  transactions: z.array(TransactionSchema).describe('A list of all transactions.'),
  members: z.array(MemberBalanceSchema).describe("A list of all members and their balances."),
  keeper: KeeperSchema,
});
export type TeamCashData = z.infer<typeof TeamCashDataSchema>;

export const MemberDebtSchema = z.object({
    memberId: z.number().describe("The ID of the member settling their debt."),
});
export type MemberDebt = z.infer<typeof MemberDebtSchema>;

export const initialTeamCashData: Record<string, TeamCashData> = {
    '1. Mannschaft': {
        keeper: { id: 101, name: 'Lionel Messi' },
        balance: 255.50,
        transactions: [
            { id: 1, type: 'Einzahlung', description: 'Strafenkatalog Jan', amount: 120.00, date: '2024-07-20', memberId: 101 },
            { id: 2, type: 'Auszahlung', description: 'Pizza für Team-Event', amount: -80.00, date: '2024-07-22' },
            { id: 3, type: 'Einzahlung', description: 'Zusatzbeitrag Trainingslager', amount: 250.00, date: '2024-07-15' },
             { id: 4, type: 'Busse', description: 'Zu spät zum Training', amount: -20.00, date: '2024-07-18', memberId: 101 },
             { id: 5, type: 'Busse', description: 'Handy in Garderobe', amount: -15.50, date: '2024-07-19', memberId: 103 },
        ],
        members: [
            { id: 101, name: 'Lionel Messi', balance: -20.00 },
            { id: 102, name: 'Cristiano Ronaldo', balance: 0 },
            { id: 103, name: 'Neymar Jr', balance: -15.50 },
            { id: 104, name: 'Kylian Mbappé', balance: 0 },
        ]
    },
    'Junioren A1': {
        keeper: { id: 201, name: 'Jamal Musiala' },
        balance: 80.00,
        transactions: [
            { id: 1, type: 'Einzahlung', description: 'Sammelaktion', amount: 100.00, date: '2024-07-18' },
            { id: 2, type: 'Auszahlung', description: 'Neue Bälle', amount: -20.00, date: '2024-07-19' },
        ],
        members: [
             { id: 201, name: 'Jamal Musiala', balance: 0 },
             { id: 202, name: 'Florian Wirtz', balance: 0 },
        ]
    },
    'Junioren C2': {
        keeper: { id: 301, name: 'Toni Kroos' },
        balance: 120.00,
        transactions: [
            { id: 1, type: 'Einzahlung', description: 'Kuchenverkauf', amount: 150.00, date: '2024-07-21' },
            { id: 2, type: 'Auszahlung', description: 'Kinobesuch', amount: -30.00, date: '2024-07-23' },
            { id: 3, type: 'Busse', description: 'Material nicht versorgt', amount: -5.00, date: '2024-07-22', memberId: 301 },
            { id: 4, type: 'Busse', description: 'Material nicht versorgt', amount: -10.00, date: '2024-07-22', memberId: 303 },
        ],
        members: [
             { id: 301, name: 'Toni Kroos', balance: -5.00 },
             { id: 302, name: 'Ilkay Gündogan', balance: 0 },
             { id: 303, name: 'Thomas Müller', balance: -10.00 },
        ]
    }
};
