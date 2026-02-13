
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { PlayerSuggestion } from '@/ai/flows/playerPlacement.types';

export const usePlayerSuggestions = (teamName?: string) => {
    const db = useFirestore();
    const [suggestions, setSuggestions] = useState<PlayerSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!db || !teamName) {
            setIsLoading(false);
            setSuggestions([]);
            return;
        }

        setIsLoading(true);
        const q = query(
            collection(db, 'playerSuggestions'), 
            where('teamName', '==', teamName),
            where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedSuggestions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlayerSuggestion));
            setSuggestions(fetchedSuggestions);
            setIsLoading(false);
        }, (error) => {
            console.error("Failed to fetch player suggestions:", error);
            toast({ title: "Fehler", description: "Spielervorschläge konnten nicht geladen werden.", variant: "destructive" });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [db, teamName, toast]);
    
    const updateSuggestionStatus = async (suggestionId: string, status: 'accepted' | 'declined' | 'invited') => {
        if (!db) return;
        const suggestionRef = doc(db, 'playerSuggestions', suggestionId);
        try {
            await updateDoc(suggestionRef, { status: status });
        } catch (error) {
             console.error("Failed to update suggestion status:", error);
             toast({ title: "Fehler", description: "Status konnte nicht aktualisiert werden.", variant: "destructive" });
        }
    }

    return {
        suggestions,
        isLoading,
        updateSuggestionStatus,
    };
};
