
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { getAllMatches } from '@/ai/flows/matches';
import type { Match } from '@/ai/flows/matches.types';

export const useMatches = () => {
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchMatches = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedData = await getAllMatches();
            setMatches(fetchedData);
        } catch (error) {
            console.error("Failed to fetch matches:", error);
            toast({ title: "Fehler", description: "Spiele konnten nicht geladen werden.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchMatches();
    }, [fetchMatches]);

    return {
        matches,
        isLoading,
        refetchMatches: fetchMatches,
    };
};
