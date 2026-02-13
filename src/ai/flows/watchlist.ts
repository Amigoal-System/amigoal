
'use server';
/**
 * @fileOverview Genkit flows for managing the scout's watchlist.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { WatchlistPlayerSchema, type WatchlistPlayer } from './watchlist.types';

// Flow to get all players from the watchlist for a specific scout
export const getWatchlist = ai.defineFlow(
  {
    name: 'getWatchlist',
    inputSchema: z.string(), // Scout's user ID
    outputSchema: z.array(WatchlistPlayerSchema),
  },
  async (scoutId) => {
    const db = await getDb();
    if (!db) {
      console.error("[getWatchlist] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    try {
        const watchlistRef = db.collection("watchlist").where('addedBy', '==', scoutId);
        const snapshot = await watchlistRef.get();
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as WatchlistPlayer[];
    } catch (error: any) {
        if (error.code === 5) {
            console.error("[getWatchlist] Firestore collection 'watchlist' not found.");
            throw new Error("The 'watchlist' collection does not exist.");
        }
        console.error("[getWatchlist] Error fetching watchlist:", error);
        throw error;
    }
  }
);

// Flow to add a player to the watchlist
export const addPlayerToWatchlist = ai.defineFlow(
  {
    name: 'addPlayerToWatchlist',
    inputSchema: WatchlistPlayerSchema.omit({ id: true, addedAt: true }),
    outputSchema: WatchlistPlayerSchema.optional(),
  },
  async (playerData) => {
    const db = await getDb();
    if (!db) {
      console.error("[addPlayerToWatchlist] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    try {
        const fullPlayerData = {
            ...playerData,
            addedAt: new Date().toISOString(),
        };
        const docRef = await db.collection("watchlist").add(fullPlayerData);
        return { id: docRef.id, ...fullPlayerData };
    } catch(error: any) {
        if (error.code === 5) {
            console.error("[addPlayerToWatchlist] Firestore collection 'watchlist' not found.");
            throw new Error("The 'watchlist' collection does not exist.");
        }
        throw error;
    }
  }
);

// Flow to update a watchlist player
export const updateWatchlistPlayer = ai.defineFlow(
  {
    name: 'updateWatchlistPlayer',
    inputSchema: WatchlistPlayerSchema,
    outputSchema: z.void(),
  },
  async (player) => {
    const db = await getDb();
    if (!db) {
      console.error("[updateWatchlistPlayer] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    const { id, ...playerData } = player;
    if (!id) throw new Error("Player ID is required for updating.");
    await db.collection("watchlist").doc(id).update(playerData);
  }
);

// Flow to remove a player from the watchlist
export const removePlayerFromWatchlist = ai.defineFlow(
  {
    name: 'removePlayerFromWatchlist',
    inputSchema: z.string(), // ID
    outputSchema: z.void(),
  },
  async (playerId) => {
    const db = await getDb();
    if (!db) {
      console.error("[removePlayerFromWatchlist] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    if (!playerId) throw new Error("Player ID is required for deletion.");
    await db.collection("watchlist").doc(playerId).delete();
  }
);
