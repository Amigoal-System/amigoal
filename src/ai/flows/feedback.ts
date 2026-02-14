
'use server';
/**
 * @fileOverview Genkit flows for managing feedback using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { FeedbackSchema, type Feedback } from './feedback.types';

// Flow to get all feedback for a specific member
export const getFeedbackForMember = ai.defineFlow(
  {
    name: 'getFeedbackForMember',
    inputSchema: z.string(), // memberId
    outputSchema: z.array(FeedbackSchema),
  },
  async (memberId) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    try {
      const feedbackCollectionRef = db.collection("feedback").where('memberId', '==', memberId);
      const snapshot = await feedbackCollectionRef.get();
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Feedback[];
    } catch (error: any) {
      console.error("[getFeedbackForMember] Error fetching feedback:", error);
      throw error;
    }
  }
);
