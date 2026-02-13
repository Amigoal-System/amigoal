
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { getRbacContext, hasModuleAccess } from '@/lib/rbac';

async function getCurrentContext() {
    return await getRbacContext();
}

export const deleteAllUsers = ai.defineFlow(
  {
    name: 'deleteAllUsers',
    inputSchema: z.void().optional().nullable(),
    outputSchema: z.object({ deletedCount: z.number() }),
  },
  async () => {
    const context = await getCurrentContext();
    
    // RBAC: Only Super-Admin can delete all users
    if (context.role !== 'Super-Admin') {
      console.warn(`[deleteAllUsers] User ${context.email} with role ${context.role} denied access to delete all users`);
      throw new Error("Zugriff verweigert: Nur Super-Admin kann diese Aktion ausführen.");
    }

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
