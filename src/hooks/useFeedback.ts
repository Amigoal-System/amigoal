'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { getFeedbackForMember } from '@/ai/flows/feedback';
import type { Feedback } from '@/ai/flows/feedback.types';

export const useFeedback = (memberId?: string) => {
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchFeedback = useCallback(async () => {
        if (!memberId) {
             setIsLoading(false);
             setFeedback([]);
             return;
        }
        setIsLoading(true);
        try {
            const fetchedData = await getFeedbackForMember(memberId);
            setFeedback(fetchedData);
        } catch (error) {
            console.error("Failed to fetch feedback:", error);
            toast({ title: "Fehler", description: "Feedback konnte nicht geladen werden.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [memberId, toast]);

    useEffect(() => {
        fetchFeedback();
    }, [fetchFeedback]);

    return {
        feedback,
        isLoading,
        refetchFeedback: fetchFeedback,
    };
};
