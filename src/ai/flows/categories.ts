'use server';
/**
 * @fileOverview Genkit flows for managing team categories using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { TeamCategorySchema, type TeamCategory } from './categories.types';
import type firebaseAdmin from 'firebase-admin';

// Flow to get all team categories, optionally filtered by country
export const getAllCategories = ai.defineFlow(
  {
    name: 'getAllCategories',
    inputSchema: z.string().optional().nullable(), // countryCode
    outputSchema: z.array(TeamCategorySchema),
  },
  async (countryCode) => {
    const db = await getDb();
    if (!db) {
      console.error("[getAllCategories] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    try {
      let collectionRef: firebaseAdmin.firestore.Query = db.collection("teamCategories");
      if (countryCode) {
        collectionRef = collectionRef.where('countryCode', '==', countryCode);
      }
      const snapshot = await collectionRef.orderBy('order').get();
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as TeamCategory[];
    } catch (error: any) {
      if (error.code === 5) { // Collection not found
        console.warn("[getAllCategories] 'teamCategories' collection not found.");
        return [];
      }
      console.error("[getAllCategories] Error fetching categories:", error);
      throw error;
    }
  }
);

// Flow to add a new category
export const addCategory = ai.defineFlow(
  {
    name: 'addCategory',
    inputSchema: TeamCategorySchema.omit({ id: true }),
    outputSchema: TeamCategorySchema,
  },
  async (categoryData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    const docRef = await db.collection("teamCategories").add(categoryData);
    return { id: docRef.id, ...categoryData };
  }
);

// Flow to update a category
export const updateCategory = ai.defineFlow(
  {
    name: 'updateCategory',
    inputSchema: TeamCategorySchema,
    outputSchema: z.void(),
  },
  async (category) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    const { id, ...categoryData } = category;
    if (!id) throw new Error("Category ID is required for updating.");
    await db.collection("teamCategories").doc(id).update(categoryData);
  }
);

// Flow to delete a category
export const deleteCategory = ai.defineFlow(
  {
    name: 'deleteCategory',
    inputSchema: z.string(), // ID
    outputSchema: z.void(),
  },
  async (categoryId) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    await db.collection("teamCategories").doc(categoryId).delete();
  }
);
