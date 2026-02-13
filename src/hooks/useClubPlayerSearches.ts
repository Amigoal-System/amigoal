
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { getAllClubPlayerSearches, addClubPlayerSearch } from '@/ai/flows/clubPlayerSearches';
import type { ClubPlayerSearch } from '@/ai/flows/clubPlayerSearches.types';

export const useClubPlayerSearches = () => {
    const [searches, setSearches] = useState<ClubPlayerSearch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchSearches = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAllClubPlayerSearches();
            setSearches(data);
        } catch (error) {
            console.error("Failed to fetch club player searches:", error);
            toast({ title: "Fehler", description: "Gesuche konnten nicht geladen werden.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchSearches();
    }, [fetchSearches]);

    const handleAddSearch = async (newSearchData: Omit<ClubPlayerSearch, 'id' | 'createdAt'>) => {
        try {
            await addClubPlayerSearch(newSearchData);
            toast({ title: "Gesuch hinzugefügt" });
            fetchSearches();
        } catch (error) {
            console.error("Failed to add search:", error);
            toast({ title: "Fehler beim Hinzufügen", variant: "destructive" });
        }
    };

    return {
        searches,
        isLoading,
        addSearch: handleAddSearch,
        refetchSearches: fetchSearches,
    };
};
