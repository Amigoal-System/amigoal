
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { getCardsForMember, archiveCard as archiveCardFlow, getAllCards } from '@/ai/flows/cards';
import type { Card } from '@/ai/flows/cards.types';

export const useCards = (memberId?: string) => {
    const [cards, setCards] = useState<Card[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchCards = useCallback(async () => {
        setIsLoading(true);
        try {
            let fetchedData;
            if (memberId) {
                fetchedData = await getCardsForMember(memberId);
            } else {
                fetchedData = await getAllCards(null); // Pass null to satisfy the new signature
            }
            setCards(fetchedData);
        } catch (error) {
            console.error("Failed to fetch cards:", error);
            toast({ title: "Fehler", description: "Bussen konnten nicht geladen werden.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [memberId, toast]);

    useEffect(() => {
        fetchCards();
    }, [fetchCards]);

    const archiveCard = async (cardId: string, paidBy: 'Club' | 'Spieler' | 'Spieler (Rechnung)') => {
        try {
            await archiveCardFlow({ cardId, paidBy });
            toast({ title: "Karte archiviert" });
            fetchCards();
        } catch (error) {
            console.error("Failed to archive card:", error);
            toast({ title: "Fehler", description: "Karte konnte nicht archiviert werden.", variant: "destructive" });
        }
    };

    return {
        cards,
        isLoading,
        archiveCard,
        refetchCards: fetchCards,
    };
};
