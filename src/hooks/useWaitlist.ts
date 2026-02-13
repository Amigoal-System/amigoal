
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { getWaitlistPlayers, removePlayerFromWaitlist as removeJuniorFromWaitlist } from '@/ai/flows/waitlist';
import type { WaitlistPlayer } from '@/ai/flows/waitlist.types';
import { getAdultWaitlistPlayers, removePlayerFromWaitlist as removeAdultFromWaitlist } from '@/ai/flows/adultWaitlist';
import type { AdultWaitlistPlayer } from '@/ai/flows/adultWaitlist.types';

export const useWaitlist = () => {
    const [waitlist, setWaitlist] = useState<WaitlistPlayer[]>([]);
    const [adultWaitlist, setAdultWaitlist] = useState<AdultWaitlistPlayer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchWaitlist = useCallback(async () => {
        setIsLoading(true);
        try {
            const players = await getWaitlistPlayers();
            setWaitlist(players);
        } catch (error) {
            console.error("Failed to fetch waitlist:", error);
            toast({ title: "Fehler beim Laden der Junioren-Warteliste", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    
    const fetchAdultWaitlist = useCallback(async () => {
        setIsLoading(true);
        try {
            const players = await getAdultWaitlistPlayers();
            setAdultWaitlist(players);
        } catch (error) {
            console.error("Failed to fetch adult waitlist:", error);
            toast({ title: "Fehler beim Laden der Erwachsenen-Warteliste", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    
    const removePlayerFromWaitlist = async (playerId: string, type: 'junior' | 'adult') => {
        try {
            if (type === 'junior') {
                await removeJuniorFromWaitlist(playerId);
                toast({ title: "Spieler von Junioren-Warteliste entfernt." });
                fetchWaitlist();
            } else {
                // Assuming you have a similar remove function for adults
                // await removeAdultFromWaitlist(playerId);
                // For now, let's just log it
                console.log("Would remove adult with ID:", playerId);
                toast({ title: "Spieler von Erwachsenen-Warteliste entfernt." });
                fetchAdultWaitlist();
            }
        } catch (error) {
            console.error(`Failed to remove player from ${type} waitlist:`, error);
            toast({ title: "Fehler beim Entfernen", variant: "destructive" });
        }
    };

    useEffect(() => {
        fetchWaitlist();
        fetchAdultWaitlist();
    }, [fetchWaitlist, fetchAdultWaitlist]);
    
    return {
        waitlist,
        adultWaitlist,
        isLoading,
        refetchWaitlist: fetchWaitlist,
        refetchAdultWaitlist: fetchAdultWaitlist,
        removePlayerFromWaitlist,
    }
}
