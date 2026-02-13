
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { ClubPlayerSearchSchema, type ClubPlayerSearch } from './clubPlayerSearches.types';
import type { admin } from 'firebase-admin';


export const getAllClubPlayerSearches = ai.defineFlow(
  {
    name: 'getAllClubPlayerSearches',
    outputSchema: z.array(ClubPlayerSearchSchema),
  },
  async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    
    let query: admin.firestore.Query = db.collection("clubPlayerSearches");
    
    const snapshot = await query.where('status', '==', 'open').orderBy('createdAt', 'desc').get();
    if (snapshot.empty) return [];
    
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as ClubPlayerSearch[];
  }
);


export const addClubPlayerSearch = ai.defineFlow(
  {
    name: 'addClubPlayerSearch',
    inputSchema: ClubPlayerSearchSchema.omit({ id: true, createdAt: true }),
    outputSchema: ClubPlayerSearchSchema,
  },
  async (searchData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    
    const fullData = {
        ...searchData,
        createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("clubPlayerSearches").add(fullData);
    return { id: docRef.id, ...fullData };
  }
);
