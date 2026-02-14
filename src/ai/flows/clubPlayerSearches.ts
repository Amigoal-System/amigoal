
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { ClubPlayerSearchSchema, type ClubPlayerSearch } from './clubPlayerSearches.types';
import type firebaseAdmin from 'firebase-admin';
import { getRbacContext, hasModuleAccess } from '@/lib/rbac';

async function getCurrentContext() {
    return await getRbacContext();
}

export const getAllClubPlayerSearches = ai.defineFlow(
  {
    name: 'getAllClubPlayerSearches',
    inputSchema: z.string().optional().nullable(), // clubId
    outputSchema: z.array(ClubPlayerSearchSchema),
  },
  async (requestedClubId) => {
    const context = await getCurrentContext();
    
    // RBAC: Check if user has access to Spieler-Vermittlung module
    if (!hasModuleAccess(context.role, 'Spieler-Vermittlung')) {
      console.warn(`[getAllClubPlayerSearches] User ${context.email} with role ${context.role} denied access to Spieler-Vermittlung module`);
      throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, Spieler-Vermittlung anzuzeigen.");
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    
    let query: firebaseAdmin.firestore.Query = db.collection("clubPlayerSearches");
    
    // RBAC: Filter by clubId for non-super-admins
    if (context.role !== 'Super-Admin') {
        if (!context.clubId) {
            return [];
        }
        query = query.where('clubId', '==', context.clubId);
    } else if (requestedClubId) {
        query = query.where('clubId', '==', requestedClubId);
    } else {
        // Super-admin sees all open searches
        query = query.where('status', '==', 'open');
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
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
