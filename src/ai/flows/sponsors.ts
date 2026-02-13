
'use server';
/**
 * @fileOverview Genkit flows for managing sponsors using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { SponsorSchema, type Sponsor } from './sponsors.types';

// Flow to get all sponsors
export const getAllSponsors = ai.defineFlow(
  {
    name: 'getAllSponsors',
    outputSchema: z.array(SponsorSchema),
  },
  async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    try {
      const sponsorsCollectionRef = db.collection("sponsors");
      const snapshot = await sponsorsCollectionRef.get();
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
