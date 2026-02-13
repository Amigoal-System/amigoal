'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { getCarpoolsForMatch, addCarpool, updateCarpool } from '@/ai/flows/carpools';
import type { Carpool, Passenger } from '@/ai/flows/carpools.types';

export const useCarpool = (matchId?: string) => {
    const [carpools, setCarpools] = useState<Carpool[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchCarpools = useCallback(async () => {
        if (!matchId) {
            setIsLoading(false);
            setCarpools([]);
            return;
        }
        setIsLoading(true);
        try {
            const fetchedData = await getCarpoolsForMatch(matchId);
            setCarpools(fetchedData);
        } catch (error) {
            console.error("Failed to fetch carpools:", error);
            toast({ title: "Fehler", description: "Fahrgemeinschaften konnten nicht geladen werden.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [matchId, toast]);

    useEffect(() => {
        fetchCarpools();
    }, [fetchCarpools]);

    const handleAddCarpool = async (newCarpoolData: Omit<Carpool, 'id'>) => {
        try {
            await addCarpool(newCarpoolData);
            toast({ title: "Fahrt angeboten!", description: "Ihr Fahrdienst wurde erfolgreich eingetragen." });
            fetchCarpools();
        } catch (error) {
            console.error("Failed to add carpool:", error);
            toast({ title: "Fehler", description: "Fahrdienst konnte nicht erstellt werden.", variant: "destructive" });
        }
    };
    
    const handleAddPassenger = async (carpoolId: string, passenger: Passenger) => {
        const carpool = carpools.find(c => c.id === carpoolId);
        if (carpool && carpool.seatsAvailable > 0) {
            const updatedCarpool = {
                ...carpool,
                passengers: [...(carpool.passengers || []), passenger],
                seatsAvailable: carpool.seatsAvailable - 1,
            };
            try {
                await updateCarpool(updatedCarpool);
                toast({ title: "Platz angefragt!", description: `Ihre Anfrage wurde an ${carpool.driverName} gesendet.` });
                fetchCarpools();
            } catch (error) {
                console.error("Failed to add passenger:", error);
                toast({ title: "Fehler", description: "Platz konnte nicht angefragt werden.", variant: "destructive" });
            }
        }
    };

    return {
        carpools,
        isLoading,
        addCarpool: handleAddCarpool,
        addPassenger: handleAddPassenger,
        refetchCarpools: fetchCarpools,
    };
};
