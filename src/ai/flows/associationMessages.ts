
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { AssociationMessageSchema, type AssociationMessage } from './associationMessages.types';
import type { admin } from 'firebase-admin';

export const getAssociationMessages = ai.defineFlow(
  {
    name: 'getAssociationMessages',
    inputSchema: z.string().optional().nullable(), // clubId
    outputSchema: z.array(AssociationMessageSchema),
  },
  async (clubId) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    
    let query: admin.firestore.Query = db.collection("associationMessages");
    
    if (clubId) {
      query = query.where('clubId', '==', clubId);
    }
    
    const snapshot = await query.orderBy('date', 'desc').get();
    if (snapshot.empty) return [];
    
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as AssociationMessage[];
  }
);
