
'use server';
/**
 * @fileOverview Genkit flows for managing polls using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { PollSchema, type Poll } from './polls.types';
import { firestore } from 'firebase-admin';
import { getRbacContext, hasModuleAccess } from '@/lib/rbac';

async function getCurrentContext() {
    return await getRbacContext();
}

// Flow to get all polls
export const getAllPolls = ai.defineFlow(
  {
    name: 'getAllPolls',
    inputSchema: z.void().optional().nullable(),
    outputSchema: z.array(PollSchema),
  },
  async () => {
    const context = await getCurrentContext();
    
    // RBAC: Check if user has access to Polls module
    if (!hasModuleAccess(context.role, 'Polls')) {
      console.warn(`[getAllPolls] User ${context.email} with role ${context.role} denied access to Polls module`);
      throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, Umfragen anzuzeigen.");
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    
    try {
        const snapshot = await db.collection("polls").orderBy('createdAt', 'desc').get();
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Poll[];
    } catch (error) {
        console.error("Error fetching polls:", error);
        return [];
    }
  }
);

// Flow to create a new poll
export const createPoll = ai.defineFlow(
  {
    name: 'createPoll',
    inputSchema: z.object({
        question: z.string(),
        options: z.array(z.object({ text: z.string(), votes: z.number() })),
        clubId: z.string().optional().nullable(),
        createdBy: z.string().optional().nullable(),
    }),
    outputSchema: z.string(),
  },
  async ({ question, options, clubId, createdBy }) => {
    const context = await getCurrentContext();
    
    // RBAC: Check if user has access to Polls module
    if (!hasModuleAccess(context.role, 'Polls')) {
      console.warn(`[createPoll] User ${context.email} with role ${context.role} denied access to Polls module`);
      throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, Umfragen zu erstellen.");
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    
    const newPoll = {
        question,
        options,
        createdAt: new Date().toISOString(),
        voters: [],
        clubId: clubId || context.clubId,
        createdBy: createdBy || context.userId,
    };
    
    const docRef = await db.collection("polls").add(newPoll);
    return docRef.id;
  }
);

// Flow to vote on a poll
export const voteOnPoll = ai.defineFlow(
  {
    name: 'voteOnPoll',
    inputSchema: z.object({
        pollId: z.string(),
        optionIndex: z.number(),
    }),
    outputSchema: z.string(),
  },
  async ({ pollId, optionIndex }) => {
    const context = await getCurrentContext();
    
    // RBAC: Check if user has access to Polls module
    if (!hasModuleAccess(context.role, 'Polls')) {
      console.warn(`[voteOnPoll] User ${context.email} with role ${context.role} denied access to Polls module`);
      throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, abzustimmen.");
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    
    const pollRef = db.collection("polls").doc(pollId);
    
    await pollRef.update({
        [`options.${optionIndex}.votes`]: firestore.FieldValue.increment(1),
        voters: firestore.FieldValue.arrayUnion(context.userId),
    });
    
    return "Vote recorded successfully";
  }
);

// Flow to delete a poll
export const deletePoll = ai.defineFlow(
  {
    name: 'deletePoll',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (pollId) => {
    const context = await getCurrentContext();
    
    // RBAC: Only admins can delete polls
    if (context.role !== 'Super-Admin' && context.role !== 'Club-Admin' && context.role !== 'Board') {
      console.warn(`[deletePoll] User ${context.email} with role ${context.role} denied access to delete polls`);
      throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, Umfragen zu löschen.");
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    
    await db.collection("polls").doc(pollId).delete();
    return "Poll deleted successfully";
  }
);
