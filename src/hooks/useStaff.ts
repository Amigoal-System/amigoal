
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { 
    getAllStaff,
    addStaff as addStaffFlow,
    updateStaff as updateStaffFlow,
    deleteStaff as deleteStaffFlow
} from '@/ai/flows/amigoalStaff';
import type { AmigoalStaff } from '@/ai/flows/amigoalStaff.types';
import { useTeam } from './use-team';

// Pass ownerId to the hook
export const useStaff = (ownerId?: string | null) => {
    const [staff, setStaff] = useState<AmigoalStaff[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchStaff = useCallback(async () => {
        // If no ownerId is provided, we can't fetch specific staff.
        // We could default to something, but it's better to be explicit.
        if (ownerId === undefined) { 
             setIsLoading(false);
             return;
        }

        setIsLoading(true);
        try {
            // Pass the ownerId to the flow. 
            // A null ownerId for a Super-Admin means "fetch internal staff"
            // A provider's name/ID means "fetch my staff"
            const fetchedStaff = await getAllStaff(ownerId);
            setStaff(fetchedStaff);
        } catch (error) {
            console.error('Failed to fetch staff:', error);
            toast({
                title: "Fehler beim Laden",
                description: "Die Staff-Daten konnten nicht geladen werden.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast, ownerId]);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);
    
    const addStaff = async (newStaffData: Omit<AmigoalStaff, 'id'>) => {
        try {
            // The flow will handle whether to create an auth user or not
            await addStaffFlow({ ...newStaffData, ownerId: ownerId ?? undefined });
            toast({title: "Mitarbeiter erfolgreich erstellt."});
            await fetchStaff();
        } catch (error) {
             console.error('Failed to add staff:', error);
            toast({ title: "Fehler beim Hinzufügen", variant: "destructive" });
             throw error;
        }
    };
    
    const updateStaff = async (staffData: AmigoalStaff) => {
        try {
            await updateStaffFlow(staffData);
            toast({title: "Mitarbeiter erfolgreich aktualisiert."});
            await fetchStaff();
        } catch (error) {
             console.error('Failed to update staff:', error);
            toast({ title: "Fehler beim Speichern", variant: "destructive" });
             throw error;
        }
    }

     const deleteStaff = async (staffId: string) => {
        try {
            await deleteStaffFlow(staffId);
            toast({title: "Mitarbeiter gelöscht."});
            await fetchStaff();
        } catch (error) {
            console.error('Failed to delete staff:', error);
            toast({ title: "Fehler beim Löschen", variant: "destructive" });
             throw error;
        }
    }


    return {
        staff,
        isLoading,
        addStaff: addStaff,
        updateStaff: updateStaff,
        deleteStaff: deleteStaff,
        fetchStaff,
    };
};
