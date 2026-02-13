
'use server';
/**
 * @fileOverview Genkit flows for managing website prospects.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { ProspectSchema, type Prospect } from './prospects.types';

// Flow to get all prospects
export const getAllProspects = ai.defineFlow(
  {
    name: 'getAllProspects',
    inputSchema: z.void().optional().nullable(),
    outputSchema: z.array(ProspectSchema),
  },
  async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    try {
      const prospectsCollectionRef = db.collection("websiteProspects");
      const snapshot = await prospectsCollectionRef.get();
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Prospect[];
    } catch (error: any) {
      if (error.code === 5) {
        console.warn("[getAllProspects] 'websiteProspects' collection not found.");
        return [];
      }
      console.error("[getAllProspects] Error fetching prospects:", error);
      throw error;
    }
  }
);

// Flow to delete a prospect
export const deleteProspect = ai.defineFlow(
  {
    name: 'deleteProspect',
    inputSchema: z.string(), // Prospect ID
    outputSchema: z.void(),
  },
  async (prospectId) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    await db.collection("websiteProspects").doc(prospectId).delete();
  }
);
