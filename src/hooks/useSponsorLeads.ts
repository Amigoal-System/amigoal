'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAllSponsorLeads, addSponsorLead as addSponsorLeadFlow } from '@/ai/flows/sponsorLeads';
import type { SponsorLead } from '@/ai/flows/sponsorLeads.types';

export const useSponsorLeads = () => {
    const [sponsorLeads, setSponsorLeads] = useState<SponsorLead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchSponsorLeads = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedLeads = await getAllSponsorLeads();
            setSponsorLeads(fetchedLeads); // Correctly set the fetched data
        } catch (error) {
            console.error('Failed to fetch sponsor leads:', error);
            toast({
                title: "Fehler beim Laden",
                description: "Die Sponsoren-Leads konnten nicht geladen werden.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchSponsorLeads();
    }, [fetchSponsorLeads]);

    const addSponsorLead = async (newLeadData: Omit<SponsorLead, 'id'>) => {
        try {
            await addSponsorLeadFlow(newLeadData);
            toast({ title: "Sponsor Lead hinzugefügt!" });
            await fetchSponsorLeads(); // Refetch to get the latest data
        } catch (error) {
            console.error('Failed to add sponsor lead:', error);
            toast({ title: "Fehler beim Hinzufügen", variant: "destructive" });
        }
    };

    return {
        sponsorLeads,
        isLoading,
        addSponsorLead: addSponsorLead,
        refetchSponsorLeads: fetchSponsorLeads,
    };
};
