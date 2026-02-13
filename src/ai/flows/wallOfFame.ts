
'use server';
/**
 * @fileOverview Genkit flows for managing the Wall of Fame.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { HonoraryMemberSchema, type HonoraryMember } from './wallOfFame.types';

// Flow to get all honorary members
const getAllHonoraryMembersFlow = ai.defineFlow(
  {
    name: 'getAllHonoraryMembersFlow',
    inputSchema: z.void().optional().nullable(),
    outputSchema: z.array(HonoraryMemberSchema),
  },
  async () => {
    const db = await getDb();
    if (!db) {
      console.error("[getAllHonoraryMembersFlow] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    try {
        const wallOfFameCollectionRef = db.collection("honoraryMembers");
        const snapshot = await wallOfFameCollectionRef.get();
        if (snapshot.empty) {
            return [];
        }
        const members = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as HonoraryMember[];
        return members;
    } catch (error: any) {
        if (error.code === 5) {
            console.error("[getAllHonoraryMembersFlow] Firestore collection 'honoraryMembers' not found.");
            throw new Error("The 'honoraryMembers' collection does not exist in Firestore.");
        }
        console.error("[getAllHonoraryMembersFlow] Error fetching honorary members:", error);
        throw error;
    }
  }
);

export async function getAllHonoraryMembers(): Promise<HonoraryMember[]> {
    return getAllHonoraryMembersFlow();
}

// Flow to update an honorary member
const updateHonoraryMemberFlow = ai.defineFlow(
  {
    name: 'updateHonoraryMemberFlow',
    inputSchema: HonoraryMemberSchema,
    outputSchema: z.void(),
  },
  async (member) => {
    const db = await getDb();
    if (!db) {
        console.error("Database not initialized. Cannot update honorary member.");
        throw new Error("Database service is not available.");
    }
    const { id, ...memberData } = member;
    if (!id) {
        throw new Error("Member ID is required for updating.");
    }
    const memberDoc = db.collection("honoraryMembers").doc(id);
    await memberDoc.update(memberData);
  }
);

export async function updateHonoraryMember(member: HonoraryMember): Promise<void> {
    return updateHonoraryMemberFlow(member);
}

// Flow to add a new honorary member
const addHonoraryMemberFlow = ai.defineFlow(
  {
    name: 'addHonoraryMemberFlow',
    inputSchema: HonoraryMemberSchema.omit({ id: true }),
    outputSchema: HonoraryMemberSchema.optional(),
  },
  async (memberData) => {
    const db = await getDb();
    if (!db) {
        console.error("Database not initialized. Cannot add honorary member.");
        throw new Error("Database service is not available.");
    }
    try {
        const wallOfFameCollectionRef = db.collection("honoraryMembers");
        const docRef = await wallOfFameCollectionRef.add(memberData);
        return { id: docRef.id, ...memberData };
    } catch (error: any) {
        if (error.code === 5) {
            console.error("[addHonoraryMemberFlow] Firestore collection 'honoraryMembers' not found.");
            throw new Error("The 'honoraryMembers' collection does not exist in Firestore.");
        }
        console.error("[addHonoraryMemberFlow] Error adding honorary member:", error);
        throw error;
    }
  }
);

export async function addHonoraryMember(memberData: Omit<HonoraryMember, 'id'>): Promise<HonoraryMember | undefined> {
    return addHonoraryMemberFlow(memberData);
}

// Flow to delete an honorary member
const deleteHonoraryMemberFlow = ai.defineFlow(
  {
    name: 'deleteHonoraryMemberFlow',
    inputSchema: z.string(), // Input is the member ID
    outputSchema: z.void(),
  },
  async (memberId) => {
     const db = await getDb();
     if (!db) {
        console.error("Database not initialized. Cannot delete honorary member.");
        throw new Error("Database service is not available.");
     }
     if (!memberId) {
        throw new Error("Member ID is required for deletion.");
    }
    const memberDoc = db.collection("honoraryMembers").doc(memberId);
    await memberDoc.delete();
  }
);

export async function deleteHonoraryMember(memberId: string): Promise<void> {
    return deleteHonoraryMemberFlow(memberId);
}
