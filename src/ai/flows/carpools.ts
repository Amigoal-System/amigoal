
'use server';
/**
 * @fileOverview Genkit flows for managing carpools using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { CarpoolSchema, type Carpool } from './carpools.types';
import { firestore } from 'firebase-admin';

// Flow to get carpools for a specific match
export const getCarpoolsForMatch = ai.defineFlow(
  {
    name: 'getCarpoolsForMatch',
    inputSchema: z.string(), // matchId
    outputSchema: z.array(CarpoolSchema),
  },
  async (matchId) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    try {
      const carpoolsCollectionRef = db.collection("carpools").where('matchId', '==', matchId);
      const snapshot = await carpoolsCollectionRef.get();
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Carpool[];
    } catch (error: any) {
      console.error("[getCarpoolsForMatch] Error fetching carpools:", error);
      throw error;
    }
  }
);

// Flow to add a new carpool
export const addCarpool = ai.defineFlow(
  {
    name: 'addCarpool',
    inputSchema: CarpoolSchema.omit({ id: true }),
    outputSchema: CarpoolSchema,
  },
  async (carpoolData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");

    const docRef = await db.collection("carpools").add(carpoolData);
    return { id: docRef.id, ...carpoolData };
  }
);

// Flow to update a carpool (e.g., add or remove a passenger)
export const updateCarpool = ai.defineFlow(
  {
    name: 'updateCarpool',
    inputSchema: CarpoolSchema,
    outputSchema: z.void(),
  },
  async (carpool) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    const { id, ...carpoolData } = carpool;
    if (!id) throw new Error("Carpool ID is required for updating.");
    await db.collection("carpools").doc(id).update(carpoolData);
  }
);
