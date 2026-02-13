
'use server';
/**
 * @fileOverview Genkit flows for managing the adult player waitlist.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { AdultWaitlistPlayerSchema, type AdultWaitlistPlayer } from './adultWaitlist.types';
import { sendMail } from '@/services/email';

// Flow to get all players from the adult waitlist
export const getAdultWaitlistPlayers = ai.defineFlow(
  {
    name: 'getAdultWaitlistPlayers',
    inputSchema: z.void().optional().nullable(),
    outputSchema: z.array(AdultWaitlistPlayerSchema),
  },
  async () => {
    const db = await getDb();
    if (!db) {
      console.error("[getAdultWaitlistPlayers] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    try {
        const waitlistCollectionRef = db.collection("adultWaitlist");
        const snapshot = await waitlistCollectionRef.orderBy('addedAt', 'desc').get();
        if (snapshot.empty) return [];
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as AdultWaitlistPlayer[];
    } catch (error: any) {
        if (error.code === 5) {
            console.warn("[getAdultWaitlistPlayers] 'adultWaitlist' collection not found.");
            return [];
        }
        console.error("[getAdultWaitlistPlayers] Error fetching adult waitlist:", error);
        throw error;
    }
  }
);

// Flow to add a player to the adult waitlist
export const addAdultToWaitlist = ai.defineFlow(
  {
    name: 'addAdultToWaitlist',
    inputSchema: AdultWaitlistPlayerSchema.omit({ id: true, status: true, addedAt: true }),
    outputSchema: AdultWaitlistPlayerSchema.optional(),
  },
  async (playerData) => {
    const db = await getDb();
    if (!db) {
      console.error("[addAdultToWaitlist] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    try {
        const fullPlayerData = {
            ...playerData,
            addedAt: new Date().toISOString(),
            status: 'new' as const
        };
        const docRef = await db.collection("adultWaitlist").add(fullPlayerData);
        
        const adminEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@amigoal.ch';
        
        // Notify Super-Admin
        await sendMail({
            to: adminEmail,
            subject: `Neuer Erwachsener auf der Warteliste: ${playerData.firstName} ${playerData.lastName}`,
            html: `
                <h1>Neuer Eintrag auf der Erwachsenen-Warteliste</h1>
                <p>Eine neue Person wurde zur zentralen Warteliste für Erwachsene hinzugefügt.</p>
                <h3>Details:</h3>
                <ul>
                    <li><strong>Spieler:</strong> ${playerData.firstName} ${playerData.lastName} (Jg. ${playerData.birthYear})</li>
                    <li><strong>Position:</strong> ${playerData.position}</li>
                    <li><strong>Letzter Verein:</strong> ${playerData.previousClub || 'Keiner'}</li>
                    <li><strong>Region:</strong> ${playerData.region || 'N/A'}</li>
                    <li><strong>E-Mail:</strong> ${playerData.email}</li>
                    <li><strong>Telefon:</strong> ${playerData.phone || 'N/A'}</li>
                </ul>
            `
        });

        // Send confirmation email to the player
        await sendMail({
            to: playerData.email,
            subject: `Ihr Eintrag auf der Amigoal-Warteliste`,
            html: `
                <h1>Anfrage erhalten!</h1>
                <p>Hallo ${playerData.firstName},</p>
                <p>vielen Dank für Ihr Interesse. Sie wurden erfolgreich auf unsere zentrale Warteliste für Erwachsene gesetzt.</p>
                <p>Unser Netzwerk-Manager wird die Anfrage prüfen und sich bei passenden Vereinen in Ihrer Region melden. Sobald ein Verein Interesse an einem Probetraining hat, wird er sich direkt mit Ihnen in Verbindung setzen.</p>
                <br/>
                <p>Sportliche Grüsse,</p>
                <p>Ihr Amigoal Team</p>
            `
        });
        
        return { id: docRef.id, ...fullPlayerData };
    } catch(error: any) {
        if (error.code === 5) {
            console.error("[addAdultToWaitlist] Firestore collection 'adultWaitlist' not found.");
            throw new Error("The 'adultWaitlist' collection does not exist.");
        }
        console.error("Error in addAdultToWaitlist flow:", error);
        throw error;
    }
  }
);


// Flow to remove a player from the adult waitlist
export const removePlayerFromWaitlist = ai.defineFlow(
  {
    name: 'removeAdultFromWaitlist', // Renamed to avoid conflicts if flows were merged
    inputSchema: z.string(), // ID
    outputSchema: z.void(),
  },
  async (playerId) => {
    const db = await getDb();
    if (!db) {
      console.error("[removeAdultFromWaitlist] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    if (!playerId) throw new Error("Player ID is required for deletion.");
    await db.collection("adultWaitlist").doc(playerId).delete();
  }
);
