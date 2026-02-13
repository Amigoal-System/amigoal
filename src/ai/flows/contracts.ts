
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { ContractSchema, type Contract } from './contracts.types';
import type { admin } from 'firebase-admin';

// Flow to get all contracts for a specific member
export const getContractsForMember = ai.defineFlow(
  {
    name: 'getContractsForMember',
    inputSchema: z.string(), // memberId
    outputSchema: z.array(ContractSchema),
  },
  async (memberId) => {
    const db = await getDb();
    if (!db) {
      console.error("[getContractsForMember] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    
    try {
      const contractsCollectionRef: admin.firestore.Query = db.collection(`members/${memberId}/contracts`);
      const snapshot = await contractsCollectionRef.orderBy('from', 'desc').get();
      if (snapshot.empty) {
        console.log(`[getContractsForMember] No contracts found for member ${memberId}.`);
        return [];
      }
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Contract[];
    } catch (error: any) {
      if (error.code === 5) {
        console.warn(`[getContractsForMember] 'contracts' subcollection not found for member ${memberId}.`);
        return [];
      }
      console.error(`[getContractsForMember] Error fetching contracts for member ${memberId}:`, error);
      throw error;
    }
  }
);
