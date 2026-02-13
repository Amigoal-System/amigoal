
'use server';
/**
 * @fileOverview Genkit flows for managing teams using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { TeamSchema, CreateTeamSchema, type Team, type CreateTeamInput } from './teams.types';

export const getAllTeams = ai.defineFlow(
  {
    name: 'getAllTeams',
    inputSchema: z.string().optional().nullable(), // clubId, can be optional for super-admin
    outputSchema: z.array(TeamSchema),
  },
  async (clubId) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    
    let query: FirebaseFirestore.Query = db.collection("teams");
    if (clubId) {
      query = query.where('clubId', '==', clubId);
    }
    
    const snapshot = await query.get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Team[];
  }
);


export const createTeam = ai.defineFlow(
  {
    name: 'createTeam',
    inputSchema: CreateTeamSchema,
    outputSchema: TeamSchema,
  },
  async (teamData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");

    const docRef = await db.collection("teams").add(teamData);
    return { id: docRef.id, ...teamData };
  }
);

export const updateTeam = ai.defineFlow(
    {
        name: 'updateTeam',
        inputSchema: TeamSchema.partial().extend({ id: z.string() }),
        outputSchema: z.void(),
    },
    async ({ id, ...teamData }) => {
        const db = await getDb();
        if (!db) throw new Error("Database service is not available.");
        const teamRef = db.collection('teams').doc(id);
        await teamRef.update(teamData);
    }
);
