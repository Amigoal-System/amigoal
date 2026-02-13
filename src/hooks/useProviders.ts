
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { 
    getAllTrainingCampProviders,
    addTrainingCampProvider,
    updateTrainingCampProvider,
} from '@/ai/flows/trainingCampProviders';
import { 
    getAllBootcampProviders,
    addBootcampProvider,
    updateBootcampProvider,
} from '@/ai/flows/bootcampProviders';
import type { Provider } from '@/ai/flows/providers.types';

type ProviderType = 'Trainingslager' | 'Bootcamp' | 'Turnier' | 'all';

export const useProviders = (type: ProviderType) => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchProviders = useCallback(async () => {
        setIsLoading(true);
        try {
            let fetchedProviders: Provider[] = [];
            if (type === 'Trainingslager') {
                fetchedProviders = await getAllTrainingCampProviders();
            } else if (type === 'Bootcamp') {
                fetchedProviders = await getAllBootcampProviders();
            } else if (type === 'all') {
                const [trainingCamps, bootcamps] = await Promise.all([
                    getAllTrainingCampProviders(),
                    getAllBootcampProviders(),
                ]);
                fetchedProviders = [...trainingCamps, ...bootcamps];
            }
            setProviders(fetchedProviders);
        } catch (error) {
            console.error(`Failed to fetch providers of type ${type}:`, error);
            toast({ title: "Fehler beim Laden der Anbieter", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast, type]);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    const addProvider = async (newProviderData: Omit<Provider, 'id'>) => {
        try {
            if (newProviderData.type === 'Trainingslager') {
                await addTrainingCampProvider(newProviderData as any);
            } else if (newProviderData.type === 'Bootcamp') {
                await addBootcampProvider(newProviderData as any);
            } else {
                 throw new Error("Provider type is not supported for adding.");
            }
            toast({ title: "Anbieter hinzugefügt" });
            await fetchProviders();
        } catch (error) {
            console.error('Failed to add provider:', error);
            toast({ title: "Fehler beim Hinzufügen", variant: "destructive" });
            throw error;
        }
    };

    const updateProvider = async (updatedProviderData: Provider) => {
         try {
            if (updatedProviderData.type === 'Trainingslager') {
                await updateTrainingCampProvider(updatedProviderData);
            } else if (updatedProviderData.type === 'Bootcamp') {
                 await updateBootcampProvider(updatedProviderData);
            } else {
                 throw new Error("Provider type is not supported for updating.");
            }
            toast({ title: "Anbieter aktualisiert" });
            await fetchProviders();
        } catch (error) {
            console.error('Failed to update provider:', error);
            toast({ title: "Fehler beim Speichern", variant: "destructive" });
            throw error;
        }
    };

    return { providers, isLoading, addProvider, updateProvider, refetchProviders: fetchProviders };
};
