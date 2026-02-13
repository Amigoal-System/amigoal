
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { 
    getAllNewsletterGroups,
    addNewsletterGroup,
    updateNewsletterGroup,
    deleteNewsletterGroup,
    getAllNewsletterCampaigns,
    addNewsletterCampaign
} from '@/ai/flows/newsletter';
import type { NewsletterGroup, NewsletterCampaign } from '@/ai/flows/newsletter.types';
import { useTeam } from './use-team';

export const useNewsletter = () => {
    const [groups, setGroups] = useState<NewsletterGroup[]>([]);
    const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const { currentUserRole, clubName } = useTeam();

    const getClubId = useCallback(() => {
        return currentUserRole === 'Super-Admin' ? 'amigoal_platform' : clubName || 'unknown_club';
    }, [currentUserRole, clubName]);

    const fetchAll = useCallback(async () => {
        const clubId = getClubId();
        if (clubId === 'unknown_club' && currentUserRole !== 'Super-Admin') {
             console.warn("Newsletter hook: Club name not available yet.");
             setIsLoading(false);
             return;
        }

        setIsLoading(true);
        try {
            const [fetchedGroups, fetchedCampaigns] = await Promise.all([
                getAllNewsletterGroups(clubId),
                getAllNewsletterCampaigns(clubId)
            ]);
            setGroups(fetchedGroups);
            setCampaigns(fetchedCampaigns);
        } catch (error) {
            console.error("Failed to fetch newsletter data:", error);
            toast({ title: "Fehler beim Laden", description: "Newsletter-Daten konnten nicht geladen werden.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast, getClubId, currentUserRole]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    const addGroup = async (name: string) => {
        const clubId = getClubId();
        try {
            await addNewsletterGroup({ name, memberIds: [], clubId });
            toast({ title: "Gruppe erstellt", description: `Die Gruppe "${name}" wurde hinzugefügt.` });
            await fetchAll();
        } catch (error) {
            console.error("Failed to add group:", error);
            toast({ title: "Fehler", description: "Gruppe konnte nicht erstellt werden.", variant: "destructive" });
        }
    };
    
    const updateGroup = async (groupId: string, data: Partial<NewsletterGroup>) => {
        try {
            await updateNewsletterGroup({ id: groupId, data });
            toast({ title: "Gruppe aktualisiert" });
            await fetchAll();
        } catch (error) {
            console.error("Failed to update group:", error);
            toast({ title: "Fehler", description: "Gruppe konnte nicht aktualisiert werden.", variant: "destructive" });
        }
    };
    
    const deleteGroup = async (groupId: string) => {
        try {
            await deleteNewsletterGroup(groupId);
            toast({ title: "Gruppe gelöscht" });
            await fetchAll();
        } catch (error) {
             console.error("Failed to delete group:", error);
            toast({ title: "Fehler", description: "Gruppe konnte nicht gelöscht werden.", variant: "destructive" });
        }
    };

    const addCampaign = async (campaignData: Omit<NewsletterCampaign, 'id' | 'clubId'>) => {
        const clubId = getClubId();
        try {
            await addNewsletterCampaign({...campaignData, clubId });
            // No toast here, as the component sending the email will give feedback
            await fetchAll();
        } catch (error) {
             console.error("Failed to add campaign:", error);
             toast({ title: "Fehler", description: "Kampagne konnte nicht gespeichert werden.", variant: "destructive" });
        }
    }

    return {
        groups,
        campaigns,
        addGroup,
        updateGroup,
        deleteGroup,
        addCampaign,
        isLoading,
        refetch: fetchAll
    };
};
