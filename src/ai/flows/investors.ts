
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { InvestorSchema, type Investor } from './investors.types';
import type { admin } from 'firebase-admin';

// Flow to get all investors
export const getAllInvestors = ai.defineFlow(
  {
    name: 'getAllInvestors',
    outputSchema: z.array(InvestorSchema),
  },
  async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    try {
      const collectionRef = db.collection("investors");
      const snapshot = await collectionRef.orderBy('name').get();
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Investor[];
    } catch (error: any) {
      if (error.code === 5) {
        console.warn("[getAllInvestors] 'investors' collection not found.");
        return [];
      }
      console.error("[getAllInvestors] Error fetching investors:", error);
      throw error;
    }
  }
);

// Flow to add a new investor
export const addInvestor = ai.defineFlow(
  {
    name: 'addInvestor',
    inputSchema: InvestorSchema.omit({ id: true }),
    outputSchema: InvestorSchema,
  },
  async (investorData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    
    const docRef = await db.collection("investors").add(investorData);
    return { id: docRef.id, ...investorData };
  }
);

// Flow to update an investor
export const updateInvestor = ai.defineFlow(
  {
    name: 'updateInvestor',
    inputSchema: InvestorSchema,
    outputSchema: z.void(),
  },
  async (investor) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    const { id, ...investorData } = investor;
    if (!id) throw new Error("Investor ID is required for updating.");
    await db.collection("investors").doc(id).update(investorData);
  }
);

// Flow to delete an investor
export const deleteInvestor = ai.defineFlow(
  {
    name: 'deleteInvestor',
    inputSchema: z.string(), // Investor ID
    outputSchema: z.void(),
  },
  async (investorId) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    await db.collection("investors").doc(investorId).delete();
  }
);
