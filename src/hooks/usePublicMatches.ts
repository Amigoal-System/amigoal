
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { getAllClubs } from '@/ai/flows/clubs';
import { getAllMatches } from '@/ai/flows/matches';
import type { Club } from '@/ai/flows/clubs.types';
import type { Match } from '@/ai/flows/matches.types';

interface PublicMatch {
    match: {
        id: string;
        homeTeam: string;
        awayTeam: string;
        date: string;
        time: string;
        location: string;
        competition: string;
    };
    club: Club;
}

export const usePublicMatches = () => {
    const [publicMatches, setPublicMatches] = useState<PublicMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchPublicMatches = useCallback(async () => {
        setIsLoading(true);
        try {
            const [clubs, allMatches] = await Promise.all([
                getAllClubs({ includeArchived: false }),
                getAllMatches()
            ]);

            const ticketingClubs = clubs.filter(club => club.ticketingEnabled);
            const ticketingClubNames = new Set(ticketingClubs.map(c => c.name));

            const upcomingMatches = allMatches.filter(match => new Date(match.date) >= new Date());
            
            const matchesForSale = upcomingMatches
                .map(match => {
                    const homeTeamName = "FC Amigoal"; // This is a simplification; in a real app, match should have a clubId
                    if (ticketingClubNames.has(homeTeamName)) {
                        const club = ticketingClubs.find(c => c.name === homeTeamName);
                        if (club) {
                            return {
                                match: {
                                    id: match.id!,
                                    homeTeam: homeTeamName,
                                    awayTeam: match.opponent,
                                    date: match.date,
                                    time: '15:00', // Mock time, should be in match data
                                    location: match.location,
                                    competition: match.type,
                                },
                                club: club
                            };
                        }
                    }
                    return null;
                })
                .filter((m): m is PublicMatch => m !== null);

            setPublicMatches(matchesForSale);

        } catch (error) {
            console.error("Failed to fetch public matches:", error);
            toast({
                title: "Fehler beim Laden der Spiele",
                description: "Verfügbare Tickets konnten nicht geladen werden.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchPublicMatches();
    }, [fetchPublicMatches]);

    return { publicMatches, isLoading, refetchPublicMatches: fetchPublicMatches };
};
