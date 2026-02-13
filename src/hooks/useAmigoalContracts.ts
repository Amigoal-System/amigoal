
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { 
    getAllAmigoalContracts,
    addAmigoalContract,
    updateAmigoalContract,
    deleteAmigoalContract
} from '@/ai/flows/amigoalContracts';
import type { AmigoalContract } from '@/ai/flows/amigoalContracts.types';

export const useAmigoalContracts = () => {
    const [contracts, setContracts] = useState<AmigoalContract[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchContracts = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedData = await getAllAmigoalContracts();
            setContracts(fetchedData);
        } catch (error) {
            console.error("Failed to fetch Amigoal contracts:", error);
            toast({ title: "Fehler", description: "Verträge konnten nicht geladen werden.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    const handleAddContract = async (newContractData: Omit<AmigoalContract, 'id'>) => {
        try {
            await addAmigoalContract(newContractData);
            toast({ title: "Vertrag erstellt." });
            await fetchContracts();
        } catch (error) {
            console.error("Failed to add contract:", error);
            toast({ title: "Fehler beim Erstellen", variant: "destructive" });
        }
    };

    const handleUpdateContract = async (updatedContract: AmigoalContract) => {
        try {
            await updateAmigoalContract(updatedContract);
            toast({ title: "Vertrag aktualisiert." });
            await fetchContracts();
        } catch (error) {
            console.error("Failed to update contract:", error);
            toast({ title: "Fehler beim Speichern", variant: "destructive" });
        }
    };

    const handleDeleteContract = async (contractId: string) => {
        try {
            await deleteAmigoalContract(contractId);
            toast({ title: "Vertrag gelöscht." });
            await fetchContracts();
        } catch (error) {
            console.error("Failed to delete contract:", error);
            toast({ title: "Fehler beim Löschen", variant: "destructive" });
        }
    };

    return {
        contracts,
        isLoading,
        addContract: handleAddContract,
        updateContract: handleUpdateContract,
        deleteContract: handleDeleteContract,
        refetchContracts: fetchContracts,
    };
};
