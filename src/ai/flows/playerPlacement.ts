
'use server';
/**
 * @fileOverview A flow for suggesting a player to a club.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { PlayerSuggestionSchema, type PlayerSuggestion } from './playerPlacement.types';
import { sendMail } from '@/services/email';
import { firestore } from 'firebase-admin';

const SuggestPlayerInputSchema = z.object({
  playerIdentifier: z.string().describe("The identifier for the player (e.g., email or ID from the waitlist)."),
  playerName: z.string().describe("The name of the player."),
  clubId: z.string().describe("The ID of the club the player is being suggested to."),
  clubName: z.string().describe("The name of the club."),
  teamName: z.string().describe("The specific team within the club."),
});
export type SuggestPlayerInput = z.infer<typeof SuggestPlayerInputSchema>;

const SuggestPlayerOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type SuggestPlayerOutput = z.infer<typeof SuggestPlayerOutputSchema>;


const suggestPlayerToClubFlow = ai.defineFlow(
    {
        name: 'suggestPlayerToClubFlow',
        inputSchema: SuggestPlayerInputSchema,
        outputSchema: SuggestPlayerOutputSchema,
    },
    async ({ playerIdentifier, playerName, clubId, clubName, teamName }) => {
        const db = await getDb();
        if (!db) {
            return { success: false, message: 'Database not available.' };
        }

        try {
            const suggestionData: Omit<PlayerSuggestion, 'id'> = {
                playerIdentifier,
                playerName,
                clubId,
                clubName,
                teamName,
                status: 'pending',
                createdAt: new Date().toISOString(),
            };

            await db.collection('playerSuggestions').add(suggestionData);

            // Find the team and decrement openSpots
            const teamsRef = db.collection('teams');
            const q = teamsRef.where('name', '==', teamName).where('clubId', '==', clubId);
            const querySnapshot = await q.get();

            if (!querySnapshot.empty) {
                const teamDoc = querySnapshot.docs[0];
                const teamRef = db.collection('teams').doc(teamDoc.id);
                await teamRef.update({
                    openSpots: firestore.FieldValue.increment(-1)
                });
            }


            console.log(`[Flow] Suggestion for player ${playerIdentifier} to ${clubName} (${teamName}) created.`);
            
            return {
                success: true,
                message: `Vorschlag für ${playerName} wurde an ${clubName} (${teamName}) gesendet.`,
            };
        } catch (error: any) {
            console.error("Error creating player suggestion:", error);
            return { success: false, message: 'Fehler beim Erstellen des Vorschlags.' };
        }
    }
);

export async function suggestPlayerToClub(input: SuggestPlayerInput): Promise<SuggestPlayerOutput> {
  return suggestPlayerToClubFlow(input);
}


// --- New Flow for Trial Invitation ---

const InvitePlayerInputSchema = z.object({
    playerName: z.string(),
    playerEmail: z.string().email(),
    teamName: z.string(),
    clubName: z.string(),
    trialDate: z.string(), // ISO date string
});
type InvitePlayerInput = z.infer<typeof InvitePlayerInputSchema>;

export const invitePlayerToTrial = ai.defineFlow(
    {
        name: 'invitePlayerToTrial',
        inputSchema: InvitePlayerInputSchema,
        outputSchema: z.void(),
    },
    async (input) => {
        const { playerName, playerEmail, teamName, clubName, trialDate } = input;
        
        // 1. Send Email to Player/Parents
        const formattedDate = new Date(trialDate).toLocaleDateString('de-CH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        await sendMail({
            to: playerEmail,
            subject: `Einladung zum Probetraining bei ${clubName}`,
            html: `
                <h1>Hallo ${playerName},</h1>
                <p>Gute Neuigkeiten! Der Trainer der Mannschaft <strong>${teamName}</strong> vom Verein <strong>${clubName}</strong> möchte dich gerne zu einem Probetraining einladen.</p>
                <p><strong>Datum:</strong> ${formattedDate}</p>
                <p>Bitte bestätige deine Teilnahme direkt im Amigoal-Portal. Du wirst dort eine neue Benachrichtigung finden.</p>
                <br/>
                <p>Sportliche Grüsse,</p>
                <p>Dein Amigoal Team</p>
            `
        });

        // 2. Create In-App Notification (as a Task for simplicity)
        const db = await getDb();
        if (db) {
            await db.collection('tasks').add({
                title: `Einladung zum Probetraining: ${teamName}`,
                description: `Du wurdest zu einem Probetraining am ${formattedDate} eingeladen.`,
                status: 'To Do',
                priority: 'High',
                dueDate: trialDate,
                assignee: playerName, // This would be a user ID in a real app
                from: 'Coach',
                createdAt: new Date().toISOString(),
                clubId: clubName, // simplified
            });
        }
    }
);
