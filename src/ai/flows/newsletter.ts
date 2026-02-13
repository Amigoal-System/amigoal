
'use server';
/**
 * @fileOverview Genkit flows for managing newsletters (groups and campaigns).
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { NewsletterGroupSchema, NewsletterCampaignSchema, type NewsletterGroup, type NewsletterCampaign } from './newsletter.types';


// --- Newsletter Groups ---

export const getAllNewsletterGroups = ai.defineFlow(
  {
    name: 'getAllNewsletterGroups',
    inputSchema: z.string(), // clubId
    outputSchema: z.array(NewsletterGroupSchema),
  },
  async (clubId) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    try {
      const snapshot = await db.collection("newsletterGroups").where('clubId', '==', clubId).orderBy('name').get();
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as NewsletterGroup[];
    } catch (error) {
        console.error("Error fetching newsletter groups:", error);
        return [];
    }
  }
);

export const addNewsletterGroup = ai.defineFlow(
  {
    name: 'addNewsletterGroup',
    inputSchema: NewsletterGroupSchema.omit({ id: true }),
    outputSchema: NewsletterGroupSchema,
  },
  async (groupData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    
    const docRef = await db.collection("newsletterGroups").add(groupData);
    return { id: docRef.id, ...groupData };
  }
);

export const updateNewsletterGroup = ai.defineFlow(
  {
    name: 'updateNewsletterGroup',
    inputSchema: z.object({
        id: z.string(),
        data: NewsletterGroupSchema.partial(),
    }),
    outputSchema: z.void(),
  },
  async ({ id, data }) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    await db.collection("newsletterGroups").doc(id).update(data);
  }
);

export const deleteNewsletterGroup = ai.defineFlow(
  {
    name: 'deleteNewsletterGroup',
    inputSchema: z.string(), // Group ID
    outputSchema: z.void(),
  },
  async (groupId) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    await db.collection("newsletterGroups").doc(groupId).delete();
  }
);


// --- Newsletter Campaigns ---

export const getAllNewsletterCampaigns = ai.defineFlow(
  {
    name: 'getAllNewsletterCampaigns',
    inputSchema: z.string(), // clubId
    outputSchema: z.array(NewsletterCampaignSchema),
  },
  async (clubId) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    try {
        const snapshot = await db.collection("newsletterCampaigns").where('clubId', '==', clubId).orderBy('sentAt', 'desc').limit(10).get();
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as NewsletterCampaign[];
    } catch(error) {
        console.error("Error fetching newsletter campaigns:", error);
        return [];
    }
  }
);

export const addNewsletterCampaign = ai.defineFlow(
  {
    name: 'addNewsletterCampaign',
    inputSchema: NewsletterCampaignSchema.omit({ id: true }),
    outputSchema: NewsletterCampaignSchema,
  },
  async (campaignData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    
    const docRef = await db.collection("newsletterCampaigns").add(campaignData);
    return { id: docRef.id, ...campaignData };
  }
);
