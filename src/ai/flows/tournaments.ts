
'use server';
/**
 * @fileOverview Genkit flows for managing tournaments using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { TournamentSchema, type Tournament, TournamentTeamSchema, type TournamentTeam } from './tournaments.types';
import { getRbacContext, hasModuleAccess } from '@/lib/rbac';

async function getCurrentContext() {
    return await getRbacContext();
}

// Flow to get all tournaments with RBAC
export const getAllTournaments = ai.defineFlow(
  {
    name: 'getAllTournaments',
    inputSchema: z.string().optional().nullable(), // clubId
    outputSchema: z.array(TournamentSchema),
  },
  async (requestedClubId) => {
    const context = await getCurrentContext();
    
    // RBAC: Check if user has access to Tournaments module
    if (!hasModuleAccess(context.role, 'Tournaments')) {
      console.warn(`[getAllTournaments] User ${context.email} with role ${context.role} denied access to Tournaments module`);
      throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, Turniere anzuzeigen.");
    }

    const db = await getDb();
    if (!db) {
      console.error("[getAllTournaments] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    try {
        let query = db.collection("tournaments");
        
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
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Tournament[];
    } catch (error: any) {
        if (error.code === 5) {
            console.error("[getAllTournaments] Firestore collection 'tournaments' not found.");
            throw new Error("The 'tournaments' collection does not exist.");
        }
        console.error("[getAllTournaments] Error fetching tournaments:", error);
        throw error;
    }
  }
);

// Flow to get a single tournament by ID
export const getTournamentById = ai.defineFlow(
  {
    name: 'getTournamentById',
    inputSchema: z.string(), // tournament ID
    outputSchema: TournamentSchema.optional(),
  },
  async (tournamentId) => {
    const db = await getDb();
    if (!db) {
      console.error("[getTournamentById] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    try {
        const tournamentDocRef = db.collection("tournaments").doc(tournamentId);
        const docSnap = await tournamentDocRef.get();
        if (docSnap.exists) {
          return { ...docSnap.data(), id: docSnap.id } as Tournament;
        }
        return undefined;
    } catch (error: any) {
        if (error.code === 5) {
            console.error(`[getTournamentById] Firestore collection 'tournaments' not found for ID ${tournamentId}.`);
            throw new Error(`Tournament with ID ${tournamentId} not found.`);
        }
        throw error;
    }
  }
);


// Flow to add a new tournament
export const addTournament = ai.defineFlow(
  {
    name: 'addTournament',
    inputSchema: TournamentSchema.omit({ id: true }),
    outputSchema: TournamentSchema.optional(),
  },
  async (tournamentData) => {
    const db = await getDb();
    if (!db) {
      console.error("[addTournament] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    try {
        const tournamentsCollectionRef = db.collection("tournaments");
        const docRef = await tournamentsCollectionRef.add(tournamentData);
        return { id: docRef.id, ...tournamentData };
    } catch(error: any) {
        if (error.code === 5) {
            console.error("[addTournament] Firestore collection 'tournaments' not found.");
            throw new Error("The 'tournaments' collection does not exist.");
        }
        throw error;
    }
  }
);

// Flow to update a tournament
export const updateTournament = ai.defineFlow(
  {
    name: 'updateTournament',
    inputSchema: TournamentSchema,
    outputSchema: z.void(),
  },
  async (tournament) => {
    const db = await getDb();
    if (!db) {
      console.error("[updateTournament] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    const { id, ...tournamentData } = tournament;
    if (!id) {
        throw new Error("Tournament ID is required for updating.");
    }
    const tournamentDoc = db.collection("tournaments").doc(id);
    await tournamentDoc.update(tournamentData);
  }
);

// Flow to add a team to a tournament
export const addTeamToTournament = ai.defineFlow(
  {
    name: 'addTeamToTournament',
    inputSchema: z.object({ tournamentId: z.string(), team: TournamentTeamSchema.omit({id: true}) }),
    outputSchema: TournamentTeamSchema.optional(),
  },
  async ({ tournamentId, team }) => {
    const db = await getDb();
    if (!db) {
      console.error("[addTeamToTournament] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    try {
        const tournament = await getTournamentById(tournamentId);
        if (!tournament) {
          throw new Error("Tournament not found");
        }
        const newTeam = { ...team, id: `team-${Date.now()}`};
        const updatedTeams = [...(tournament.teams || []), newTeam];
        await db.collection("tournaments").doc(tournamentId).update({ teams: updatedTeams });
        return newTeam;
    } catch(error: any) {
        if (error.code === 5) {
            console.error("[addTeamToTournament] Firestore collection 'tournaments' not found.");
            throw new Error("The 'tournaments' collection does not exist.");
        }
        throw error;
    }
  }
);
