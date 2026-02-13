
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { 
    getAllInvestors as getAllInvestorsFlow,
    addInvestor as addInvestorFlow,
    updateInvestor as updateInvestorFlow,
    deleteInvestor as deleteInvestorFlow
} from '@/ai/flows/investors';
import type { Investor } from '@/ai/flows/investors.types';

export const useInvestors = () => {
    const [investors, setInvestors] = useState<Investor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchInvestors = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedInvestors = await getAllInvestorsFlow();
            setInvestors(fetchedInvestors);
        } catch (error) {
            console.error('Failed to fetch investors:', error);
            toast({
                title: "Fehler beim Laden",
                description: "Die Investoren-Daten konnten nicht geladen werden.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchInvestors();
    }, [fetchInvestors]);
    
    const addInvestor = async (newInvestorData: Omit<Investor, 'id'>) => {
        try {
            await addInvestorFlow(newInvestorData);
            toast({title: "Investor erfolgreich erstellt."});
            await fetchInvestors(); // Refetch to get the new list with ID
        } catch (error) {
             console.error('Failed to add investor:', error);
            toast({ title: "Fehler beim Hinzufügen", variant: "destructive" });
        }
    };
    
    const updateInvestor = async (investorData: Investor) => {
        try {
            await updateInvestorFlow(investorData);
            toast({title: "Investor erfolgreich aktualisiert."});
            await fetchInvestors();
        } catch (error) {
             console.error('Failed to update investor:', error);
            toast({ title: "Fehler beim Speichern", variant: "destructive" });
        }
    }

    return {
        investors,
        isLoading,
        addInvestor,
        updateInvestor,
        refetchInvestors: fetchInvestors,
    };
};
