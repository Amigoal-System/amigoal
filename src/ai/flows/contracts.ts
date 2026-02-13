
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { ContractSchema, type Contract } from './contracts.types';
import type { admin } from 'firebase-admin';
import { getRbacContext, hasModuleAccess } from '@/lib/rbac';

async function getCurrentContext() {
    return await getRbacContext();
}

// Flow to get all contracts for a specific member with RBAC
export const getContractsForMember = ai.defineFlow(
  {
    name: 'getContractsForMember',
    inputSchema: z.string(), // memberId
    outputSchema: z.array(ContractSchema),
  },
  async (requestedMemberId) => {
    const context = await getCurrentContext();
    
    // RBAC: Check if user has access to Contract module
    if (!hasModuleAccess(context.role, 'Contract')) {
      console.warn(`[getContractsForMember] User ${context.email} with role ${context.role} denied access to Contract module`);
      throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, Verträge anzuzeigen.");
    }

    const db = await getDb();
    if (!db) {
      console.error("[getContractsForMember] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    
    // RBAC: Users can only see their own contracts, or admins can see club contracts
    if (context.role !== 'Super-Admin' && context.role !== 'Club-Admin' && context.role !== 'Board') {
        if (context.userId !== requestedMemberId) {
            console.warn(`[getContractsForMember] User ${context.email} tried to access contracts for member ${requestedMemberId}`);
            return [];
        }
    }
    
    try {
      const contractsCollectionRef: admin.firestore.Query = db.collection(`members/${requestedMemberId}/contracts`);
      const snapshot = await contractsCollectionRef.orderBy('from', 'desc').get();
      if (snapshot.empty) {
        console.log(`[getContractsForMember] No contracts found for member ${requestedMemberId}.`);
        return [];
      }
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Contract[];
    } catch (error: any) {
      if (error.code === 5) {
        console.warn(`[getContractsForMember] 'contracts' subcollection not found for member ${requestedMemberId}.`);
        return [];
      }
      console.error(`[getContractsForMember] Error fetching contracts for member ${requestedMemberId}:`, error);
      throw error;
    }
  }
);
