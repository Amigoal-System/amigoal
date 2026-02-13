
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { getWatchlist, addPlayerToWatchlist, updateWatchlistPlayer, removePlayerFromWatchlist } from '@/ai/flows/watchlist';
import type { WatchlistPlayer } from '@/ai/flows/watchlist.types';

const getCurrentScoutId = () => {
    // In a real app, this would come from the user's session.
    return 'serra.juni@barcelona.com';
}

export const useWatchlist = () => {
    const [watchlist, setWatchlist] = useState<WatchlistPlayer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const scoutId = getCurrentScoutId();

    const fetchWatchlist = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getWatchlist(scoutId);
            setWatchlist(data);
        } catch (error) {
            console.error("Failed to fetch watchlist:", error);
            toast({ title: "Fehler beim Laden der Watchlist", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [scoutId, toast]);

    useEffect(() => {
        fetchWatchlist();
    }, [fetchWatchlist]);
    
    const handleAddPlayer = async (newPlayerData: Omit<WatchlistPlayer, 'addedAt' | 'addedBy'>) => {
        try {
            const fullPlayerData = { ...newPlayerData, addedBy: scoutId };
            await addPlayerToWatchlist(fullPlayerData);
            await fetchWatchlist();
        } catch (error) {
            console.error("Failed to add player to watchlist:", error);
             toast({ title: "Fehler beim Hinzufügen", variant: "destructive" });
        }
    };

    const handleUpdatePlayer = async (updatedPlayer: WatchlistPlayer) => {
        try {
            await updateWatchlistPlayer(updatedPlayer);
            await fetchWatchlist();
        } catch (error) {
             console.error("Failed to update player on watchlist:", error);
             toast({ title: "Fehler beim Speichern", variant: "destructive" });
        }
    };
    
    const handleRemovePlayer = async (playerId: string) => {
        try {
            await removePlayerFromWatchlist(playerId);
            await fetchWatchlist();
        } catch (error) {
            console.error("Failed to remove player from watchlist:", error);
            toast({ title: "Fehler beim Entfernen", variant: "destructive" });
        }
    }

    return {
        watchlist,
        isLoading,
        refetchWatchlist: fetchWatchlist,
        addPlayerToWatchlist: handleAddPlayer,
        updateWatchlistPlayer: handleUpdatePlayer,
        removePlayerFromWatchlist: handleRemovePlayer,
    }
}
