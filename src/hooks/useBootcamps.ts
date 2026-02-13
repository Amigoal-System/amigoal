
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import {
    getAllBootcamps,
    addBootcamp,
    updateBootcamp,
} from '@/ai/flows/bootcamps';
import type { Bootcamp, Registration } from '@/ai/flows/bootcamps.types';

export const useBootcamps = (source?: 'all' | string) => {
    const [camps, setCamps] = useState<Bootcamp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchBootcamps = useCallback(async () => {
        if (!source) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const fetchedCamps = await getAllBootcamps({ source });
            setCamps(fetchedCamps || []);
        } catch (error) {
            console.error(`Failed to fetch bootcamps:`, error);
            toast({ title: `Fehler beim Laden der Bootcamps`, variant: "destructive" });
            setCamps([]);
        } finally {
            setIsLoading(false);
        }
    }, [source, toast]);


    useEffect(() => {
        fetchBootcamps();
    }, [fetchBootcamps]);

    const handleAddCamp = async (newCampData: any) => {
        setIsLoading(true);
        try {
            await addBootcamp(newCampData as Omit<Bootcamp, 'id'>);
            toast({ title: "Bootcamp erfolgreich hinzugefügt"});
            await fetchBootcamps();
        } catch (error) {
            console.error(`Failed to add bootcamp:`, error);
            toast({ title: "Fehler beim Hinzufügen", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCamp = async (updatedCamp: any) => {
        setIsLoading(true);
        try {
            await updateBootcamp(updatedCamp as Bootcamp);
            toast({ title: "Bootcamp erfolgreich aktualisiert"});
            await fetchBootcamps();
        } catch (error) {
            console.error(`Failed to update bootcamp:`, error);
            toast({ title: "Fehler beim Aktualisieren", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleRegistration = async (campId: string, user: Registration) => {
        // This logic needs to be implemented, potentially using a different flow.
        console.log("Toggling registration for", campId, "user", user);
    }

    return { camps, addCamp: handleAddCamp, updateCamp: handleUpdateCamp, toggleRegistration, isLoading, refetchBootcamps: fetchBootcamps };
}
