
'use server';
/**
 * @fileOverview Genkit flows for managing the player waitlist.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { WaitlistPlayerSchema, type WaitlistPlayer } from './waitlist.types';
import { sendMail } from '@/services/email';

// Flow to get all players from the waitlist
export const getWaitlistPlayers = ai.defineFlow(
  {
    name: 'getWaitlistPlayers',
    inputSchema: z.void().optional().nullable(),
    outputSchema: z.array(WaitlistPlayerSchema),
  },
  async () => {
    const db = await getDb();
    if (!db) {
      console.error("[getWaitlistPlayers] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    try {
        const waitlistCollectionRef = db.collection("waitlist");
        const snapshot = await waitlistCollectionRef.orderBy('addedAt', 'desc').get();
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as WaitlistPlayer[];
    } catch (error: any) {
        if (error.code === 5) {
            console.error("[getWaitlistPlayers] Firestore collection 'waitlist' not found.");
            // For robustness, if the collection doesn't exist, we can assume it's empty.
            return [];
        }
        console.error("[getWaitlistPlayers] Error fetching waitlist:", error);
        throw error;
    }
  }
);

// Flow to add a player to the waitlist
export const addPlayerToWaitlist = ai.defineFlow(
  {
    name: 'addPlayerToWaitlist',
    inputSchema: WaitlistPlayerSchema.omit({ id: true, status: true, addedAt: true }),
    outputSchema: WaitlistPlayerSchema.optional(),
  },
  async (playerData) => {
    const db = await getDb();
    if (!db) {
      console.error("[addPlayerToWaitlist] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    try {
        const fullPlayerData = {
            ...playerData,
            addedAt: new Date().toISOString(),
            status: 'new' as const
        };
        const docRef = await db.collection("waitlist").add(fullPlayerData);
        
        const adminEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@amigoal.ch';
        
        // Notify Super-Admin
        await sendMail({
            to: adminEmail,
            subject: `Neuer Eintrag auf der Warteliste: ${playerData.firstName} ${playerData.lastName}`,
            html: `
                <h1>Neuer Spieler auf der Warteliste</h1>
                <p>Ein neuer Spieler wurde zur zentralen Warteliste hinzugefügt und kann nun an Vereine vermittelt werden.</p>
                <h3>Details:</h3>
                <ul>
                    <li><strong>Spieler:</strong> ${playerData.firstName} ${playerData.lastName} (Jg. ${playerData.birthYear})</li>
                    <li><strong>Position:</strong> ${playerData.position}</li>
                    <li><strong>Letzter Verein:</strong> ${playerData.previousClub || 'Keiner'}</li>
                    <li><strong>Region:</strong> ${playerData.region || 'N/A'}</li>
                    <li><strong>Kontaktperson:</strong> ${playerData.contactName} (${playerData.email})</li>
                    <li><strong>Telefon:</strong> ${playerData.phone || 'N/A'}</li>
                </ul>
                <p>Sie können diesen Eintrag nun im Super-Admin-Dashboard unter "Spieler-Vermittlung" einsehen und bearbeiten.</p>
            `
        });

        // Send confirmation email to the parent
        await sendMail({
            to: playerData.email,
            subject: `Eintrag auf der Amigoal-Warteliste für ${playerData.firstName} ${playerData.lastName}`,
            html: `
                <h1>Anfrage erhalten!</h1>
                <p>Hallo ${playerData.contactName},</p>
                <p>vielen Dank für Ihr Interesse. Ihr Kind, <strong>${playerData.firstName} ${playerData.lastName}</strong>, wurde erfolgreich auf unsere zentrale Warteliste gesetzt.</p>
                <p>Unser Netzwerk-Manager wird die Anfrage prüfen und sich bei passenden Vereinen in Ihrer Region melden. Sobald ein Verein Interesse an einem Probetraining hat, wird er sich direkt mit Ihnen in Verbindung setzen.</p>
                <br/>
                <p>Sportliche Grüsse,</p>
                <p>Ihr Amigoal Team</p>
            `
        });
        
        return { id: docRef.id, ...fullPlayerData };
    } catch(error: any) {
        if (error.code === 5) {
            console.error("[addPlayerToWaitlist] Firestore collection 'waitlist' not found.");
            throw new Error("The 'waitlist' collection does not exist.");
        }
        console.error("Error in addPlayerToWaitlist flow:", error);
        throw error;
    }
  }
);

// Flow to update a waitlist player
export const updateWaitlistPlayer = ai.defineFlow(
  {
    name: 'updateWaitlistPlayer',
    inputSchema: WaitlistPlayerSchema,
    outputSchema: z.void(),
  },
  async (player) => {
    const db = await getDb();
    if (!db) {
      console.error("[updateWaitlistPlayer] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    const { id, ...playerData } = player;
    if (!id) throw new Error("Player ID is required for updating.");
    await db.collection("waitlist").doc(id).update(playerData);
  }
);

// Flow to remove a player from the waitlist
export const removePlayerFromWaitlist = ai.defineFlow(
  {
    name: 'removePlayerFromWaitlist',
    inputSchema: z.string(), // ID
    outputSchema: z.void(),
  },
  async (playerId) => {
    const db = await getDb();
    if (!db) {
      console.error("[removePlayerFromWaitlist] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    if (!playerId) throw new Error("Player ID is required for deletion.");
    await db.collection("waitlist").doc(playerId).delete();
  }
);
