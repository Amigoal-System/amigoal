
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';

export const deleteAllUsers = ai.defineFlow(
  {
    name: 'deleteAllUsers',
    inputSchema: z.void().optional().nullable(),
    outputSchema: z.object({ deletedCount: z.number() }),
  },
  async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }

    const membersCollectionRef = db.collection("members");
    const snapshot = await membersCollectionRef.get();

    if (snapshot.empty) {
      return { deletedCount: 0 };
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return { deletedCount: snapshot.size };
  }
);
