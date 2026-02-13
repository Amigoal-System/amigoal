
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { 
    getAllBootcampProviders,
    addBootcampProvider,
    updateBootcampProvider,
} from '@/ai/flows/bootcampProviders';
import type { Provider } from '@/ai/flows/providers.types';

export const useBootcampProviders = () => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchProviders = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedProviders = await getAllBootcampProviders();
            setProviders(fetchedProviders);
        } catch (error) {
            console.error('Failed to fetch bootcamp providers:', error);
            toast({ title: "Fehler beim Laden der Anbieter", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    const addProvider = async (newProviderData: Omit<Provider, 'id'>) => {
        try {
            await addBootcampProvider(newProviderData);
            toast({ title: "Anbieter hinzugefügt" });
            await fetchProviders();
        } catch (error) {
            console.error('Failed to add provider:', error);
            toast({ title: "Fehler beim Hinzufügen", variant: "destructive" });
        }
    };

    const updateProvider = async (updatedProviderData: Provider) => {
        try {
            await updateBootcampProvider(updatedProviderData);
            toast({ title: "Anbieter aktualisiert" });
            await fetchProviders();
        } catch (error) {
            console.error('Failed to update provider:', error);
            toast({ title: "Fehler beim Speichern", variant: "destructive" });
        }
    };

    return { providers, isLoading, addProvider, updateProvider, refetchProviders: fetchProviders };
};
