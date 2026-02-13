'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { 
    getAllTrainingCamps,
    addTrainingCamp,
    updateTrainingCamp,
} from '@/ai/flows/trainingCamps';
import { 
    getAllBootcamps,
    addBootcamp,
    updateBootcamp,
} from '@/ai/flows/bootcamps';
import { 
    getAllFacilities as getAllFacilitiesFlow,
    addFacility as addFacilityFlow,
    updateFacility as updateFacilityFlow,
    deleteFacility as deleteFacilityFlow,
} from '@/ai/flows/camps';
import type { TrainingCamp, Registration } from '@/ai/flows/trainingCamps.types';
import type { Bootcamp } from '@/ai/flows/bootcamps.types';
import type { SportsFacility } from '@/ai/flows/camps.types';
import { useTeam } from './use-team';

type CampType = TrainingCamp | Bootcamp;

// A generic hook for both camps and bootcamps
export const useCamps = (type: 'camp' | 'bootcamp', sourceName?: string) => {
    const [camps, setCamps] = useState<CampType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    
    // The source is now determined by the component calling the hook,
    // not fetched from context here, which simplifies the hook.
    const source = sourceName;

    const fetchCamps = useCallback(async () => {
        if (!source) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            let fetchedCamps;
            if (type === 'camp') {
                fetchedCamps = await getAllTrainingCamps({ source });
            } else {
                fetchedCamps = await getAllBootcamps({ source });
            }
            setCamps(fetchedCamps || []);
        } catch (error) {
            console.error(`Failed to fetch ${type}s:`, error);
            toast({ title: `Fehler beim Laden der ${type}s`, variant: "destructive" });
            setCamps([]);
        } finally {
            setIsLoading(false);
        }
    }, [type, source, toast]);


    useEffect(() => {
        fetchCamps();
    }, [fetchCamps]);

    const addCamp = async (newCampData: any) => {
        setIsLoading(true);
        try {
            if (type === 'camp') {
                await addTrainingCamp(newCampData as Omit<TrainingCamp, 'id'>);
            } else {
                await addBootcamp(newCampData as Omit<Bootcamp, 'id'>);
            }
            toast({ title: "Erfolgreich hinzugefügt"});
            await fetchCamps();
        } catch (error) {
            console.error(`Failed to add ${type}:`, error);
            toast({ title: "Fehler beim Hinzufügen", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const updateCamp = async (updatedCamp: any) => {
        setIsLoading(true);
        try {
             if (type === 'camp') {
                await updateTrainingCamp(updatedCamp as TrainingCamp);
            } else {
                await updateBootcamp(updatedCamp as Bootcamp);
            }
            toast({ title: "Erfolgreich aktualisiert"});
            await fetchCamps();
        } catch (error) {
            console.error(`Failed to update ${type}:`, error);
            toast({ title: "Fehler beim Aktualisieren", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    const toggleRegistration = async (campId: string, user: Registration) => {
        // This is a simplified version and needs to be adapted
        // for the new separate data structures if needed.
        console.log("Toggling registration for", campId, "user", user);
    }

    return { camps, addCamp, updateCamp, toggleRegistration, isLoading, fetchCamps };
}

// ... useFacilities hook remains the same
export const useFacilities = () => {
    const [facilities, setFacilities] = useState<SportsFacility[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    
    const fetchFacilities = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedFacilities = await getAllFacilitiesFlow();
            setFacilities(fetchedFacilities);
        } catch (error) {
             console.error('Failed to fetch facilities:', error);
            toast({ title: "Fehler beim Laden der Anlagen", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchFacilities();
    }, [fetchFacilities]);

     const addFacility = async (newFacilityData: Omit<SportsFacility, 'id'>) => {
        try {
            await addFacilityFlow(newFacilityData);
            await fetchFacilities();
            toast({ title: "Anlage hinzugefügt"});
        } catch (error) {
            console.error('Failed to add facility:', error);
            toast({ title: "Fehler beim Hinzufügen der Anlage", variant: "destructive" });
        }
    };

    const updateFacility = async (updatedFacility: SportsFacility) => {
        try {
            await updateFacilityFlow(updatedFacility);
            await fetchFacilities();
            toast({ title: "Anlage aktualisiert"});
        } catch (error) {
            console.error('Failed to update facility:', error);
            toast({ title: "Fehler beim Aktualisieren der Anlage", variant: "destructive" });
        }
    };

     const deleteFacility = async (facilityId: string) => {
        try {
            await deleteFacilityFlow(facilityId);
            await fetchFacilities();
            toast({ title: "Anlage gelöscht" });
        } catch (error) {
            console.error('Failed to delete facility:', error);
            toast({ title: "Fehler beim Löschen der Anlage", variant: "destructive" });
        }
    };

    return { facilities, addFacility, updateFacility, deleteFacility, isLoading, fetchFacilities };
};
