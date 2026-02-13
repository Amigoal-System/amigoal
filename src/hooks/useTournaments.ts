
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { 
    getAllTournaments as getAllTournamentsFlow,
    addTournament as addTournamentFlow,
    updateTournament as updateTournamentFlow,
    addTeamToTournament,
} from '@/ai/flows/tournaments';
import type { Tournament, TournamentTeam } from '@/ai/flows/tournaments.types';

export const useTournaments = () => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchTournaments = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedData = await getAllTournamentsFlow(null); // Pass null to match new flow signature
            setTournaments(fetchedData);
        } catch (error) {
            console.error("Failed to fetch tournaments:", error);
            toast({ title: "Fehler", description: "Turniere konnten nicht geladen werden.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchTournaments();
    }, [fetchTournaments]);

    const addTournament = async (newTournamentData: Omit<Tournament, 'id'>) => {
        try {
            await addTournamentFlow(newTournamentData);
            toast({ title: "Turnier hinzugefügt" });
            fetchTournaments();
        } catch (error) {
            console.error("Failed to add tournament:", error);
            toast({ title: "Fehler beim Hinzufügen", variant: "destructive" });
        }
    };
    
    const updateTournament = async (updatedTournamentData: Tournament) => {
        try {
            await updateTournamentFlow(updatedTournamentData);
            toast({ title: "Turnier aktualisiert" });
            fetchTournaments();
        } catch (error) {
            console.error("Failed to update tournament:", error);
            toast({ title: "Fehler beim Speichern", variant: "destructive" });
        }
    };
    
    const handleAddTeam = async (tournamentId: string, newTeamData: Omit<TournamentTeam, 'id'>) => {
        try {
            await addTeamToTournament({ tournamentId, team: newTeamData });
            toast({ title: "Team hinzugefügt" });
            fetchTournaments();
        } catch (error) {
            console.error("Failed to add team:", error);
            toast({ title: "Fehler beim Hinzufügen des Teams", variant: "destructive" });
        }
    }

    return {
        tournaments,
        isLoading,
        addTournament,
        updateTournament,
        addTeamToTournament: handleAddTeam,
        refetchTournaments: fetchTournaments,
    };
};
