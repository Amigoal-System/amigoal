
'use server';
/**
 * @fileOverview Genkit flows for managing trainings using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { TrainingSchema, type Training } from './trainings.types';
import type { admin } from 'firebase-admin';
import { getRbacContext, hasModuleAccess } from '@/lib/rbac';

async function getCurrentContext() {
    return await getRbacContext();
}

// Flow to get all trainings for a specific club with RBAC
export const getAllTrainings = ai.defineFlow(
  {
    name: 'getAllTrainings',
    inputSchema: z.string().optional().nullable(), // clubId
    outputSchema: z.array(TrainingSchema),
  },
  async (requestedClubId) => {
    const context = await getCurrentContext();
    
    // RBAC: Check if user has access to Training module
    if (!hasModuleAccess(context.role, 'Training')) {
      console.warn(`[getAllTrainings] User ${context.email} with role ${context.role} denied access to Training module`);
      throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, Trainings anzuzeigen.");
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    try {
      let trainingsCollectionRef: admin.firestore.Query = db.collection("trainings");
      
      // RBAC: Filter by clubId for non-super-admins
      let effectiveClubId = requestedClubId;
      
      if (context.role !== 'Super-Admin') {
          if (!context.clubId) {
              return [];
          }
          effectiveClubId = context.clubId;
      }
      
      // If a clubId is provided, filter the trainings for that club
      if (effectiveClubId) {
        trainingsCollectionRef = trainingsCollectionRef.where('clubId', '==', effectiveClubId);
      }
      
      const snapshot = await trainingsCollectionRef.orderBy('date', 'desc').get();
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Training[];
    } catch (error) {
      console.error("[getAllTrainings] Error fetching trainings:", error);
      // It's safer to return empty on error than potentially leaking data.
      return [];
    }
  }
);
