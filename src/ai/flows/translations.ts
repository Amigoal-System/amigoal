
'use server';
/**
 * @fileOverview Genkit flows for managing translations stored in Firebase Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';

// Generic schema for any JSON object
const JsonSchema: z.ZodType<Record<string, any>> = z.record(z.any());

// Flow to get a translation document for a specific language
export const getTranslation = ai.defineFlow(
  {
    name: 'getTranslation',
    inputSchema: z.string(), // language code e.g., 'de'
    outputSchema: JsonSchema,
  },
  async (lang) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    const docRef = db.collection('translations').doc(lang);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      return docSnap.data() as Record<string, any>;
    } else {
      // Return an empty object if no translation file exists for the language yet
      return {};
    }
  }
);

// Flow to update a translation document
export const updateTranslation = ai.defineFlow(
  {
    name: 'updateTranslation',
    inputSchema: z.object({
      lang: z.string(),
      data: JsonSchema,
    }),
    outputSchema: z.void(),
  },
  async ({ lang, data }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    const docRef = db.collection('translations').doc(lang);
    await docRef.set(data, { merge: true }); // Using set with merge to create or overwrite
  }
);
