
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { getAllTrainings } from '@/ai/flows/trainings';
import type { Training } from '@/ai/flows/trainings.types';

export const useTrainings = (clubId?: string) => {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchTrainings = useCallback(async () => {
        if (!clubId) {
            setTrainings([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const fetchedData = await getAllTrainings(clubId);
            setTrainings(fetchedData);
        } catch (error) {
            console.error("Failed to fetch trainings:", error);
            toast({ title: "Fehler", description: "Trainings konnten nicht geladen werden.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [clubId, toast]);

    useEffect(() => {
        fetchTrainings();
    }, [fetchTrainings]);

    return {
        trainings,
        isLoading,
        refetchTrainings: fetchTrainings,
    };
};
