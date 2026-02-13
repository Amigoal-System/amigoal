
'use server';
/**
 * @fileOverview Genkit flows for managing training camps using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { TrainingCampSchema, SportsFacilitySchema, CampRequestSchema, type TrainingCamp } from './trainingCamps.types';
import { firestore } from 'firebase-admin';
import { sendMail } from '@/services/email';

// --- Training Camps ---

export const getAllTrainingCamps = ai.defineFlow(
  {
    name: 'getAllTrainingCamps',
    inputSchema: z.object({
        source: z.string().optional(), // 'all', a specific provider name, or undefined for club-specific
    }).optional().nullable(),
    outputSchema: z.array(TrainingCampSchema),
  },
  async (input) => {
    const db = await getDb();
    if (!db) {
      console.error("[getAllTrainingCamps] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    
    try {
        let query: firestore.Query = db.collection("trainingCamps");
        
        if (input?.source && input.source !== 'all') {
             query = query.where('source', '==', input.source);
        }
        
        const snapshot = await query.orderBy('status').get();
        const allCamps = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as TrainingCamp[];

        if (input?.source === 'all') {
            const onlineCamps = allCamps.filter(camp => camp.status === 'Online');
            if (onlineCamps.length > 0) return onlineCamps;
            // Fallback for public page: if no "Online" camps are found, get all non-request camps.
            return allCamps.filter(camp => camp.status !== 'Anfrage');
        }

        return allCamps;

    } catch (error: any) {
        if (error.code === 5) {
            console.error(`[getAllTrainingCamps] Firestore collection 'trainingCamps' not found.`);
            return [];
        }
        console.error("[getAllTrainingCamps] Error fetching training camps:", error);
        throw error;
    }
  }
);

export const addTrainingCamp = ai.defineFlow(
  {
    name: 'addTrainingCamp',
    inputSchema: TrainingCampSchema.omit({ id: true }),
    outputSchema: TrainingCampSchema.optional(),
  },
  async (campData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");

    const docRef = await db.collection("trainingCamps").add(campData);
    return { id: docRef.id, ...campData };
  }
);

export const updateTrainingCamp = ai.defineFlow(
  {
    name: 'updateTrainingCamp',
    inputSchema: TrainingCampSchema,
    outputSchema: z.void(),
  },
  async (camp) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    const { id, ...campData } = camp;
    if (!id) throw new Error("Camp ID is required for updating.");
    await db.collection("trainingCamps").doc(id).update(campData);
  }
);

export const requestTrainingCamp = ai.defineFlow(
    {
        name: 'requestTrainingCamp',
        inputSchema: CampRequestSchema,
        outputSchema: z.void()
    },
    async (requestData) => {
        const db = await getDb();
        if (!db) throw new Error("Database service not available");

        const newCampRequest: Partial<TrainingCamp> = {
            type: 'camp',
            name: `Anfrage: ${requestData.clubName}`,
            location: requestData.destination || 'Unbekannt',
            status: 'Anfrage',
            source: requestData.clubName,
            requestDetails: requestData
        };

        await db.collection('trainingCamps').add(newCampRequest);
        
        const adminEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@amigoal.ch';
        
        // Notify Super-Admin
        await sendMail({
            to: adminEmail,
            subject: `Neue Trainingslager-Anfrage von ${requestData.clubName}`,
            html: `<h1>Neue Anfrage für ein Trainingslager</h1>...`
        });

        // Notify Club
        await sendMail({
            to: requestData.email,
            subject: `Ihre Trainingslager-Anfrage bei Amigoal`,
            html: `<h1>Anfrage erhalten!</h1>...`
        });
    }
);

export const deleteAllTrainingCampsForProvider = ai.defineFlow({
    name: 'deleteAllTrainingCampsForProvider',
    inputSchema: z.string(), // provider name (source)
    outputSchema: z.void(),
}, async (providerName) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const snapshot = await db.collection('trainingCamps').where('source', '==', providerName).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
});
