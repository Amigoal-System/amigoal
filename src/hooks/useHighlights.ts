'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
    getAllHighlights,
    addHighlight,
    updateHighlight,
    deleteHighlight
} from '@/ai/flows/highlights'; 
import type { Highlight } from '@/ai/flows/highlights.types';

export const useHighlights = () => {
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchHighlights = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedHighlights = await getAllHighlights();
            setHighlights(fetchedHighlights);
        } catch (error) {
            console.error('Failed to fetch highlights:', error);
            toast({
                title: "Fehler beim Laden",
                description: "Die Highlights konnten nicht geladen werden.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchHighlights();
    }, [fetchHighlights]);

    const handleUpdateHighlight = async (updatedHighlight: Highlight) => {
        try {
            await updateHighlight(updatedHighlight);
            toast({
                title: "Highlight aktualisiert",
                description: `Der Status wurde auf "${updatedHighlight.status}" gesetzt.`
            });
            await fetchHighlights();
        } catch (error) {
            console.error('Failed to update highlight:', error);
            toast({
                title: "Fehler",
                description: "Das Highlight konnte nicht aktualisiert werden.",
                variant: "destructive"
            });
        }
    };
    
    const handleAddHighlight = async (newHighlightData: Omit<Highlight, 'id'>) => {
        try {
            await addHighlight(newHighlightData);
            toast({ title: "Highlight hinzugefügt" });
            await fetchHighlights();
        } catch(error) {
             console.error('Failed to add highlight:', error);
            toast({ title: "Fehler", description: "Das Highlight konnte nicht hinzugefügt werden.", variant: "destructive" });
        }
    }

    const handleDeleteHighlight = async (highlightId: string) => {
        const highlightToDelete = highlights.find(h => h.id === highlightId);
        try {
            await deleteHighlight(highlightId);
            toast({ title: "Highlight gelöscht" });
            await fetchHighlights();
        } catch (error) {
             console.error('Failed to delete highlight:', error);
             toast({ title: "Fehler", description: "Das Highlight konnte nicht gelöscht werden.", variant: "destructive" });
        }
    }

    return {
        highlights,
        isLoading,
        refetchHighlights: fetchHighlights,
        updateHighlight: handleUpdateHighlight,
        addHighlight: handleAddHighlight,
        deleteHighlight: handleDeleteHighlight,
    };
};
