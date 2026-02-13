
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { getAssociationMessages } from '@/ai/flows/associationMessages';
import type { AssociationMessage } from '@/ai/flows/associationMessages.types';

export const useAssociationMessages = (clubId?: string | null) => {
    const [messages, setMessages] = useState<AssociationMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchMessages = useCallback(async () => {
        if (!clubId) {
            setMessages([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const fetchedData = await getAssociationMessages(clubId);
            setMessages(fetchedData);
        } catch (error) {
            console.error("Failed to fetch association messages:", error);
            toast({ title: "Fehler", description: "Verbandsmeldungen konnten nicht geladen werden.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [clubId, toast]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    return {
        messages,
        isLoading,
        refetchMessages: fetchMessages,
    };
};
