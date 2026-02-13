
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAllClubs } from '@/ai/flows/clubs';
import type { Club } from '@/ai/flows/clubs.types';
import { useTeam } from './use-team';

export const useClub = () => {
    const { clubName } = useTeam();
    const [club, setClub] = useState<Club | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchClub = useCallback(async () => {
        if (!clubName) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const allClubs = await getAllClubs({ includeArchived: true });
            const currentClub = allClubs.find(c => c.name === clubName);
            setClub(currentClub || null);
        } catch (error) {
            console.error('Failed to fetch club:', error);
        } finally {
            setIsLoading(false);
        }
    }, [clubName]);

    useEffect(() => {
        fetchClub();
    }, [fetchClub]);

    return {
        club,
        isLoading,
        refetchClub: fetchClub,
    };
};
