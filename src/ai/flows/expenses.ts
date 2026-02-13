
'use server';
/**
 * @fileOverview Genkit flows for managing expenses using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { ExpenseSchema, type Expense } from './expenses.types';

// Flow to get all expenses
export const getAllExpenses = ai.defineFlow(
  {
    name: 'getAllExpenses',
    outputSchema: z.array(ExpenseSchema),
  },
  async () => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    try {
      const expensesCollectionRef = db.collection("expenses");
      const snapshot = await expensesCollectionRef.orderBy('date', 'desc').get();
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Expense[];
    } catch (error) {
      console.error("[getAllExpenses] Error fetching expenses:", error);
      throw error;
    }
  }
);

// Flow to add a new expense
export const addExpense = ai.defineFlow(
  {
    name: 'addExpense',
    inputSchema: ExpenseSchema.omit({ id: true }),
    outputSchema: ExpenseSchema,
  },
  async (expenseData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    
    const docRef = await db.collection("expenses").add(expenseData);
    return { id: docRef.id, ...expenseData };
  }
);

// Flow to update an expense
export const updateExpense = ai.defineFlow(
  {
    name: 'updateExpense',
    inputSchema: ExpenseSchema.partial().extend({ id: z.string() }),
    outputSchema: z.void(),
  },
  async ({ id, ...expenseData }) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    await db.collection("expenses").doc(id).update(expenseData);
  }
);
