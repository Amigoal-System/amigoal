
'use server';
/**
 * @fileOverview Genkit flows for managing FAQs.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { FaqSchema, type FAQ } from './faqs.types';

// Flow to get all FAQs
export const getAllFaqs = ai.defineFlow(
  {
    name: 'getAllFaqs',
    outputSchema: z.array(FaqSchema),
  },
  async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    const snapshot = await db.collection("faqs").get();
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as FAQ[];
  }
);

// Flow to add a new FAQ
export const addFaq = ai.defineFlow(
  {
    name: 'addFaq',
    inputSchema: FaqSchema.omit({ id: true }),
    outputSchema: FaqSchema,
  },
  async (faqData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    const docRef = await db.collection("faqs").add(faqData);
    return { id: docRef.id, ...faqData };
  }
);

// Flow to update an FAQ
export const updateFaq = ai.defineFlow(
  {
    name: 'updateFaq',
    inputSchema: FaqSchema,
    outputSchema: z.void(),
  },
  async (faq) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    const { id, ...faqData } = faq;
    if (!id) throw new Error("FAQ ID is required for updating.");
    await db.collection("faqs").doc(id).update(faqData);
  }
);

// Flow to delete an FAQ
export const deleteFaq = ai.defineFlow(
  {
    name: 'deleteFaq',
    inputSchema: z.string(), // FAQ ID
    outputSchema: z.void(),
  },
  async (faqId) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    await db.collection("faqs").doc(faqId).delete();
  }
);
