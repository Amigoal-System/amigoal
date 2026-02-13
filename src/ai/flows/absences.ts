'use server';
/**
 * @fileOverview Genkit flows for managing absences using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { AbsenceSchema, type Absence } from './absences.types';


// Flow to get all absences for a member
export const getAbsencesForMember = ai.defineFlow(
  {
    name: 'getAbsencesForMember',
    inputSchema: z.string(), // memberId
    outputSchema: z.array(AbsenceSchema),
  },
  async (memberId) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    try {
      const absencesCollectionRef = db.collection("absences").where('memberId', '==', memberId);
      const snapshot = await absencesCollectionRef.get();
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Absence[];
    } catch (error) {
      console.error("[getAbsencesForMember] Error fetching absences:", error);
      throw error;
    }
  }
);


// Flow to add or update an absence
export const setAbsence = ai.defineFlow(
  {
    name: 'setAbsence',
    inputSchema: AbsenceSchema.omit({ id: true, createdAt: true }),
    outputSchema: AbsenceSchema,
  },
  async (absenceData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");

    const absenceQuery = await db.collection('absences')
      .where('eventId', '==', absenceData.eventId)
      .where('memberId', '==', absenceData.memberId)
      .limit(1)
      .get();

    if (!absenceQuery.empty) {
      // Update existing absence
      const docRef = absenceQuery.docs[0].ref;
      await docRef.update(absenceData);
      const updatedDoc = await docRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() } as Absence;
    } else {
      // Add new absence
      const newAbsence = {
        ...absenceData,
        createdAt: new Date().toISOString(),
      };
      const docRef = await db.collection("absences").add(newAbsence);
      return { id: docRef.id, ...newAbsence };
    }
  }
);
