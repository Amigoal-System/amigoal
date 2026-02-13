
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { getAllClubs, addClub as addClubFlow, updateClub as updateClubFlow } from '@/ai/flows/clubs';
import type { Club } from '@/ai/flows/clubs.types';

export const useClubs = (includeArchived = false) => {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchClubs = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedClubs = await getAllClubs({ includeArchived });
            setClubs(fetchedClubs);
        } catch (error) {
            console.error('Failed to fetch clubs:', error);
            toast({
                title: "Fehler beim Laden",
                description: "Die Vereine konnten nicht geladen werden.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [includeArchived, toast]);

    useEffect(() => {
        fetchClubs();
    }, [fetchClubs]);

    return { clubs, isLoading, refetchClubs: fetchClubs };
};
