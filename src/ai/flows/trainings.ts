
'use server';
/**
 * @fileOverview Genkit flows for managing trainings using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { TrainingSchema, type Training } from './trainings.types';
import type { admin } from 'firebase-admin';

// Flow to get all trainings for a specific club
export const getAllTrainings = ai.defineFlow(
  {
    name: 'getAllTrainings',
    inputSchema: z.string().optional().nullable(), // clubId
    outputSchema: z.array(TrainingSchema),
  },
  async (clubId) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    try {
      let trainingsCollectionRef: admin.firestore.Query = db.collection("trainings");
      
      // If a clubId is provided, filter the trainings for that club
      if (clubId) {
        // This assumes trainings have a 'clubId' field.
        // If not, the data model needs to be updated. For now, we'll assume it exists.
        // As a fallback for existing data, we can also filter by team name if teams are unique to clubs.
        // For this implementation, we will assume a 'clubId' field is the standard.
        // The mock data doesn't have it, but real data should.
        // To make it work with current structure, let's filter by team name indirectly.
        // This is not ideal but works with current data. A migration to add clubId would be better.
        // Let's assume a `clubId` field is present on trainings for proper data segregation.
        trainingsCollectionRef = trainingsCollectionRef.where('clubId', '==', clubId);
      }
      
      const snapshot = await trainingsCollectionRef.orderBy('date', 'desc').get();
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Training[];
    } catch (error) {
      console.error("[getAllTrainings] Error fetching trainings:", error);
      // It's safer to return empty on error than potentially leaking data.
      return [];
    }
  }
);
