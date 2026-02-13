
'use server';
/**
 * @fileOverview Genkit flows for managing expenses using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { ExpenseSchema, type Expense } from './expenses.types';
import { getRbacContext, hasModuleAccess } from '@/lib/rbac';

async function getCurrentContext() {
    return await getRbacContext();
}

// Flow to get all expenses with RBAC
export const getAllExpenses = ai.defineFlow(
  {
    name: 'getAllExpenses',
    inputSchema: z.string().optional().nullable(), // optional clubId
    outputSchema: z.array(ExpenseSchema),
  },
  async (requestedClubId) => {
    const context = await getCurrentContext();
    
    // RBAC: Check if user has access to Expenses module
    if (!hasModuleAccess(context.role, 'Expenses')) {
      console.warn(`[getAllExpenses] User ${context.email} with role ${context.role} denied access to Expenses module`);
      throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, Spesen anzuzeigen.");
    }

    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    
    try {
      let query = db.collection("expenses");
      
      // RBAC: Filter by clubId for non-super-admins
      if (context.role !== 'Super-Admin') {
          if (!context.clubId) {
              return [];
          }
          query = query.where('clubId', '==', context.clubId);
      } else if (requestedClubId) {
          query = query.where('clubId', '==', requestedClubId);
      }
      
      const snapshot = await query.orderBy('date', 'desc').get();
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
