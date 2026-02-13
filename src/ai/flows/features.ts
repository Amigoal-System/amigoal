
'use server';
/**
 * @fileOverview Genkit flows for managing roadmap features using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { FeatureSchema, type Feature } from './features.types';


// Flow to get all features
export const getAllFeatures = ai.defineFlow(
  {
    name: 'getAllFeatures',
    outputSchema: z.array(FeatureSchema),
  },
  async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    const snapshot = await db.collection("features").get();
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Feature[];
  }
);

// Flow to add a new feature
export const addFeature = ai.defineFlow(
  {
    name: 'addFeature',
    inputSchema: FeatureSchema.omit({ id: true }),
    outputSchema: FeatureSchema,
  },
  async (featureData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    const docRef = await db.collection("features").add(featureData);
    return { id: docRef.id, ...featureData };
  }
);

// Flow to update a feature
export const updateFeature = ai.defineFlow(
  {
    name: 'updateFeature',
    inputSchema: FeatureSchema,
    outputSchema: z.void(),
  },
  async (feature) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    const { id, ...featureData } = feature;
    if (!id) throw new Error("Feature ID is required for updating.");
    await db.collection("features").doc(id).update(featureData);
  }
);

// Flow to delete a feature
export const deleteFeature = ai.defineFlow(
  {
    name: 'deleteFeature',
    inputSchema: z.string(), // Feature ID
    outputSchema: z.void(),
  },
  async (featureId) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    await db.collection("features").doc(featureId).delete();
  }
);
