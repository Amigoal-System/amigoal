
'use server';
/**
 * @fileOverview Genkit flows for managing matches using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { MatchSchema, type Match } from './matches.types';
import type { admin } from 'firebase-admin';

// Flow to get all matches for a club or all matches for super-admin
export const getAllMatches = ai.defineFlow(
  {
    name: 'getAllMatches',
    inputSchema: z.object({
        clubId: z.string().optional().nullable(),
    }).optional(),
    outputSchema: z.array(MatchSchema),
  },
  async (input) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    try {
      let matchesQuery: admin.firestore.Query = db.collection("matches");
      
      // If a clubId is provided, filter by it. Otherwise, super-admin sees all.
      if (input?.clubId) {
          matchesQuery = matchesQuery.where('clubId', '==', input.clubId);
      }
      
      const snapshot = await matchesQuery.orderBy('date', 'desc').get();
      if (snapshot.empty) return [];
      
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Match[];
    } catch (error) {
      console.error("[getAllMatches] Error fetching matches:", error);
      // In case of an index error, this might still fail, but we try to be robust.
      if ((error as any).code === 5) {
          return [];
      }
      throw error;
    }
  }
);
