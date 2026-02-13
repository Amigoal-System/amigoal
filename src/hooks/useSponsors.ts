
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { getAllSponsors, addSponsor as addSponsorFlow, updateSponsor as updateSponsorFlow, deleteSponsor as deleteSponsorFlow } from '@/ai/flows/sponsors'; 
import type { Sponsor } from '@/ai/flows/sponsors.types';

export const useSponsors = () => {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchSponsors = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedSponsors = await getAllSponsors();
            setSponsors(fetchedSponsors);
        } catch (error) {
            console.error('Failed to fetch sponsors:', error);
            toast({
                title: "Fehler beim Laden",
                description: "Die Sponsoren-Daten konnten nicht geladen werden.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchSponsors();
    }, [fetchSponsors]);

    const addSponsor = async (newSponsorData: Omit<Sponsor, 'id'>) => {
        try {
            await addSponsorFlow(newSponsorData);
            toast({ title: "Sponsor hinzugefügt" });
            await fetchSponsors();
        } catch (error) {
            console.error('Failed to add sponsor:', error);
            toast({ title: "Fehler beim Hinzufügen", variant: "destructive" });
        }
    };

    const updateSponsor = async (updatedSponsor: Sponsor) => {
        try {
            await updateSponsorFlow(updatedSponsor);
            toast({ title: "Sponsor aktualisiert" });
            await fetchSponsors();
        } catch (error) {
            console.error('Failed to update sponsor:', error);
            toast({ title: "Fehler beim Speichern", variant: "destructive" });
        }
    };

    const deleteSponsor = async (sponsorId: string) => {
        try {
            await deleteSponsorFlow(sponsorId);
            toast({ title: "Sponsor gelöscht" });
            await fetchSponsors();
        } catch (error) {
            console.error('Failed to delete sponsor:', error);
            toast({ title: "Fehler beim Löschen", variant: "destructive" });
        }
    };

    return {
        sponsors,
        isLoading,
        addSponsor,
        updateSponsor,
        deleteSponsor,
        refetchSponsors: fetchSponsors,
    };
};
