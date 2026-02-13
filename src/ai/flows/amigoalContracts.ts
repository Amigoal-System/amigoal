
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { AmigoalContractSchema, type AmigoalContract } from './amigoalContracts.types';

export const getAllAmigoalContracts = ai.defineFlow(
  {
    name: 'getAllAmigoalContracts',
    outputSchema: z.array(AmigoalContractSchema),
  },
  async () => {
    const db = await getDb();
    if (!db) throw new Error('Database service is not available.');
    
    try {
        const snapshot = await db.collection('amigoalContracts').orderBy('partnerName').get();
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as AmigoalContract[];
    } catch(e) {
        console.error("Error fetching amigoal contracts:", e);
        if ((e as any).code === 5) return []; // Collection not found
        throw e;
    }
  }
);

export const addAmigoalContract = ai.defineFlow(
  {
    name: 'addAmigoalContract',
    inputSchema: AmigoalContractSchema.omit({ id: true }),
    outputSchema: AmigoalContractSchema,
  },
  async (contractData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    
    const docRef = await db.collection("amigoalContracts").add(contractData);
    return { id: docRef.id, ...contractData };
  }
);

export const updateAmigoalContract = ai.defineFlow(
  {
    name: 'updateAmigoalContract',
    inputSchema: AmigoalContractSchema,
    outputSchema: z.void(),
  },
  async (contract) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    const { id, ...contractData } = contract;
    if (!id) throw new Error("Contract ID is required for updating.");
    await db.collection("amigoalContracts").doc(id).update(contractData);
  }
);

export const deleteAmigoalContract = ai.defineFlow(
  {
    name: 'deleteAmigoalContract',
    inputSchema: z.string(), // ID
    outputSchema: z.void(),
  },
  async (contractId) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    await db.collection("amigoalContracts").doc(contractId).delete();
  }
);
