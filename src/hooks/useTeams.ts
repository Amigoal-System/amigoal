
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getConfiguration } from '@/ai/flows/configurations';
import type { TeamCategory, League } from '@/ai/flows/configurations.types';
import { useClub } from '@/hooks/useClub';
import { getAllTeams } from '@/ai/flows/teams';
import type { Team } from '@/ai/flows/teams.types';
import { useToast } from './use-toast';

interface CategorizedTeams {
    [category: string]: Team[];
}

export const useTeams = (clubId?: string | null) => {
    const { club, isLoading: isLoadingClub, refetchClub } = useClub();
    const [allTeams, setAllTeams] = useState<Team[]>([]);
    const [isLoadingTeams, setIsLoadingTeams] = useState(true);
    const [globalCategories, setGlobalCategories] = useState<TeamCategory[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const { toast } = useToast();

    const fetchTeamsAndCategories = useCallback(async () => {
        const idToFetch = clubId;
        if (!idToFetch) {
            setIsLoadingCategories(false);
            setIsLoadingTeams(false);
            setAllTeams([]);
            return;
        }

        setIsLoadingCategories(true);
        setIsLoadingTeams(true);

        try {
            const [fetchedTeams, config] = await Promise.all([
                getAllTeams(idToFetch),
                getConfiguration()
            ]);

            setAllTeams(fetchedTeams);
            const countryCode = club?.country || 'CH';
            if (config?.teamCategories) {
                setGlobalCategories((config.teamCategories as any)?.[countryCode] || []);
            } else {
                setGlobalCategories([]);
            }
        } catch(e) {
            console.error("Could not fetch teams or categories", e);
            toast({ title: 'Fehler beim Laden der Teamdaten', variant: 'destructive'});
        } finally {
            setIsLoadingCategories(false);
            setIsLoadingTeams(false);
        }
    }, [clubId, club?.country, toast]);


    useEffect(() => {
        fetchTeamsAndCategories();
    }, [fetchTeamsAndCategories]);

    const teamCategories = useMemo(() => {
        return club?.teamCategories && club.teamCategories.length > 0 ? club.teamCategories : globalCategories;
    }, [club, globalCategories]);

    const categorizedTeams = useMemo(() => {
        if (!allTeams || allTeams.length === 0) return {};

        const result: CategorizedTeams = {};
        
        const sortedCategories = [...teamCategories].sort((a, b) => (a.order || 99) - (b.order || 99));

        sortedCategories.forEach(category => {
            const teamsInCategory = allTeams.filter(team => team.category === category.name);
            if (teamsInCategory.length > 0) {
              result[category.name] = teamsInCategory;
            } else {
              // Ensure category is still created even if no teams are in it yet
              result[category.name] = [];
            }
        });
        
        // Handle "Aktive" separately if not in custom categories
        if (!result['Aktive']) {
            const activeTeams = allTeams.filter(team => team.category === 'Aktive');
            if (activeTeams.length > 0) {
                 result['Aktive'] = activeTeams;
            } else if (!teamCategories.some(c => c.name === 'Aktive')) {
                 result['Aktive'] = [];
            }
        }
        
        const categorizedTeamNames = Object.values(result).flat().map(t => t.name);
        const uncategorizedTeams = allTeams.filter(t => !categorizedTeamNames.includes(t.name));
        
        if (uncategorizedTeams.length > 0) {
             if (!result['Sonstige']) {
                result['Sonstige'] = [];
            }
            result['Sonstige'].push(...uncategorizedTeams);
        }

        return result;

    }, [allTeams, teamCategories]);

    const refetchTeams = () => {
        refetchClub();
        fetchTeamsAndCategories();
    }

    return {
        categorizedTeams,
        isLoading: isLoadingTeams || isLoadingCategories || isLoadingClub,
        refetchTeams,
    };
};
