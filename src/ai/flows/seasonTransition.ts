
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { writeBatch, collection, query, where, getDocs, doc } from 'firebase/firestore';

const TransitionTeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  playerCount: z.number(),
  category: z.string(),
  newCategory: z.string(),
  action: z.string(),
});

export const performSeasonTransition = ai.defineFlow(
  {
    name: 'performSeasonTransition',
    inputSchema: z.array(TransitionTeamSchema),
    outputSchema: z.object({
      updatedTeams: z.number(),
      updatedMembers: z.number(),
      archivedTeams: z.number(),
    }),
  },
  async (teamsToTransition) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }

    const batch = db.batch();
    let updatedTeamsCount = 0;
    let updatedMembersCount = 0;
    let archivedTeamsCount = 0;
    
    // In Firestore, you can't query for documents where an array field contains a value.
    // A better data model would be a subcollection on the member document for teams, 
    // or a `clubId` on the member to fetch all members of a club first.
    // For this demo, we'll fetch all members and filter in memory, which is NOT scalable.
    const allMembersSnap = await db.collection("members").get();
    const allMembers = allMembersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    for (const team of teamsToTransition) {
      const teamRef = doc(db, 'teams', team.id);

      if (team.action === 'archive') {
        batch.update(teamRef, { status: 'Archiviert' });
        archivedTeamsCount++;
      } else if (team.action === 'promote') {
        const newTeamName = team.name.replace(team.category, team.newCategory);
        batch.update(teamRef, { category: team.newCategory, name: newTeamName });
        updatedTeamsCount++;
        
        // Find and update members of this team
        const teamMembers = allMembers.filter(m => m.teams && m.teams.includes(team.name));
        
        for (const member of teamMembers) {
           const memberRef = doc(db, "members", member.id);
           const updatedTeamsArray = member.teams.map(t => t === team.name ? newTeamName : t);
           batch.update(memberRef, { teams: updatedTeamsArray, team: updatedTeamsArray[0] || null }); // Also update legacy field
           updatedMembersCount++;
        }
      }
    }

    await batch.commit();

    return {
      updatedTeams: updatedTeamsCount,
      updatedMembers: updatedMembersCount,
      archivedTeams: archivedTeamsCount,
    };
  }
);
