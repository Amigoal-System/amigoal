
'use server';
/**
 * @fileOverview Genkit flows for managing disciplinary cards using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { CardSchema, type Card } from './cards.types';

// Flow to get all cards
export const getAllCards = ai.defineFlow(
  {
    name: 'getAllCards',
    inputSchema: z.void().optional().nullable(),
    outputSchema: z.array(CardSchema),
  },
  async () => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    try {
        const snapshot = await db.collection("cards").get();
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Card[];
    } catch (error: any) {
        console.error("Error fetching all cards:", error);
        // In case the collection doesn't exist, return empty array
        return [];
    }
  }
);


// Flow to get all cards for a specific member
export const getCardsForMember = ai.defineFlow(
  {
    name: 'getCardsForMember',
    inputSchema: z.string(), // memberId
    outputSchema: z.array(CardSchema),
  },
  async (memberId) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    try {
      const cardsCollectionRef = db.collection("cards").where('memberId', '==', memberId);
      const snapshot = await cardsCollectionRef.get();
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Card[];
    } catch (error: any) {
      console.error("[getCardsForMember] Error fetching cards:", error);
      throw error;
    }
  }
);

// Flow to archive a card (mark as paid/handled)
export const archiveCard = ai.defineFlow(
  {
    name: 'archiveCard',
    inputSchema: z.object({ 
        cardId: z.string(),
        paidBy: z.enum(['Club', 'Spieler', 'Spieler (Rechnung)'])
    }),
    outputSchema: z.void(),
  },
  async ({ cardId, paidBy }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    const cardRef = db.collection("cards").doc(cardId);
    await cardRef.update({
      status: 'Archiviert',
      paidBy: paidBy,
    });
  }
);
