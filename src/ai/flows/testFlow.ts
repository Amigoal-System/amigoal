
'use server';
/**
 * @fileOverview A simple flow for testing database connectivity.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';

const TestDataSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  value: z.number(),
  createdAt: z.string(),
});
export type TestData = z.infer<typeof TestDataSchema>;

// Flow to create a test document
export const createTestDocument = ai.defineFlow(
  {
    name: 'createTestDocument',
    inputSchema: TestDataSchema.omit({ id: true }),
    outputSchema: TestDataSchema,
  },
  async (data) => {
    const db = await getDb();
    if (!db) {
        throw new Error("[TestFlow] Database not initialized. Check server logs and your .env.local file. See FEHLERANALYSE.md for help.");
    }
    const testCollectionRef = db.collection("test-collection");
    const docRef = await testCollectionRef.add(data);
    return { id: docRef.id, ...data };
  }
);

// Flow to get all test documents
export const getTestDocuments = ai.defineFlow(
  {
    name: 'getTestDocuments',
    inputSchema: z.void().optional().nullable(),
    outputSchema: z.array(TestDataSchema),
  },
  async () => {
    const db = await getDb();
     if (!db) {
        console.error("[TestFlow] getTestDocuments: Database not available. See FEHLERANALYSE.md for help.");
        throw new Error("Database service is not available.");
    }
    try {
        const testCollectionRef = db.collection("test-collection");
        const snapshot = await testCollectionRef.get();
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as TestData[];
    } catch (error: any) {
        if (error.code === 5) {
            console.error("[getTestDocuments] Firestore collection 'test-collection' not found. See FEHLERANALYSE.md for help.");
            // For a test flow, it might be okay to return empty, but for robustness, we should be clear.
            throw new Error("The 'test-collection' does not exist in Firestore. Please create it or check permissions.");
        }
        console.error("[getTestDocuments] Error fetching test documents:", error);
        throw error;
    }
  }
);

// Flow to delete a test document
export const deleteTestDocument = ai.defineFlow(
  {
    name: 'deleteTestDocument',
    inputSchema: z.string(), // Expecting document ID
    outputSchema: z.void(),
  },
  async (docId) => {
    const db = await getDb();
    if (!db) {
        console.error("[TestFlow] deleteTestDocument: Database not available. See FEHLERANALYSE.md for help.");
        throw new Error("Database service is not available.");
    };
    const docRef = db.collection("test-collection").doc(docId);
    await docRef.delete();
  }
);
