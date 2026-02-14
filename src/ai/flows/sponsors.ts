
'use server';
/**
 * @fileOverview Genkit flows for managing sponsors using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { SponsorSchema, type Sponsor } from './sponsors.types';
import { getRbacContext, hasModuleAccess } from '@/lib/rbac';

async function getCurrentContext() {
    return await getRbacContext();
}

// Flow to get all sponsors with RBAC
export const getAllSponsors = ai.defineFlow(
  {
    name: 'getAllSponsors',
    inputSchema: z.string().optional().nullable(), // optional clubId
    outputSchema: z.array(SponsorSchema),
  },
  async (requestedClubId) => {
    const context = await getCurrentContext();
    
    // RBAC: Check if user has access to Sponsoring module
    if (!hasModuleAccess(context.role, 'Sponsoring')) {
      console.warn(`[getAllSponsors] User ${context.email} with role ${context.role} denied access to Sponsoring module`);
      throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, Sponsoren anzuzeigen.");
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    try {
      let query: FirebaseFirestore.Query = db.collection("sponsors");
      
      // RBAC: Filter by clubId for non-super-admins
      if (context.role !== 'Super-Admin') {
          if (!context.clubId) {
              return [];
          }
          query = query.where('clubId', '==', context.clubId);
      } else if (requestedClubId) {
          query = query.where('clubId', '==', requestedClubId);
      }
      
      const snapshot = await query.get();
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Sponsor[];
    } catch (error: any) {
      if (error.code === 5) {
        console.warn("[getAllSponsors] 'sponsors' collection not found. Seeding should handle this.");
        return []; // Return empty array if collection doesn't exist, as seeder will create it.
      }
      console.error("[getAllSponsors] Error fetching sponsors:", error);
      throw error;
    }
  }
);

// Flow to add a new sponsor
export const addSponsor = ai.defineFlow(
  {
    name: 'addSponsor',
    inputSchema: SponsorSchema.omit({ id: true }),
    outputSchema: SponsorSchema,
  },
  async (sponsorData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    const docRef = await db.collection("sponsors").add(sponsorData);
    return { id: docRef.id, ...sponsorData };
  }
);

// Flow to update a sponsor
export const updateSponsor = ai.defineFlow(
  {
    name: 'updateSponsor',
    inputSchema: SponsorSchema,
    outputSchema: z.void(),
  },
  async (sponsor) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    const { id, ...sponsorData } = sponsor;
    if (!id) throw new Error("Sponsor ID is required for updating.");
    await db.collection("sponsors").doc(id).update(sponsorData);
  }
);

// Flow to delete a sponsor
export const deleteSponsor = ai.defineFlow(
  {
    name: 'deleteSponsor',
    inputSchema: z.string(), // Sponsor ID
    outputSchema: z.void(),
  },
  async (sponsorId) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    await db.collection("sponsors").doc(sponsorId).delete();
  }
);
