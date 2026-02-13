
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { getAllFeatures, addFeature, updateFeature, deleteFeature } from '@/app/actions/features'; 
import type { Feature } from '@/ai/flows/features.types';

export const useFeatures = () => {
    const [features, setFeatures] = useState<Feature[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchFeatures = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedFeatures = await getAllFeatures();
            setFeatures(fetchedFeatures);
        } catch (error) {
            console.error('Failed to fetch features:', error);
            toast({
                title: "Fehler beim Laden",
                description: "Die Roadmap-Daten konnten nicht geladen werden.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchFeatures();
    }, [fetchFeatures]);

    const handleUpdateFeature = async (updatedFeature: Feature) => {
        // Optimistic update
        setFeatures(prevFeatures => prevFeatures.map(f => f.id === updatedFeature.id ? updatedFeature : f));
        
        try {
            await updateFeature(updatedFeature);
            toast({ title: "Feature aktualisiert" });
            // Optionally refetch to ensure consistency, though optimistic update handles UI.
            // fetchFeatures(); 
        } catch (error) {
            console.error('Failed to update feature:', error);
            toast({ title: "Fehler beim Speichern", variant: "destructive" });
            // Revert optimistic update on error
            fetchFeatures();
        }
    };
    
    return {
        features,
        setFeatures, // for optimistic updates from the component
        isLoading,
        updateFeature: handleUpdateFeature,
    };
};
