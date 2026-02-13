
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { useFirestore } from '@/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import type { SponsorshipProposal } from '@/ai/flows/proposeSponsorshipMatch';

export const useSponsorshipProposals = () => {
    const db = useFirestore();
    const [proposals, setProposals] = useState<SponsorshipProposal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!db) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const proposalsQuery = query(collection(db, 'sponsorshipProposals'));

        const unsubscribe = onSnapshot(
            proposalsQuery,
            (snapshot) => {
                const fetchedProposals = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id
                })) as SponsorshipProposal[];
                setProposals(fetchedProposals);
                setIsLoading(false);
            },
            (error) => {
                console.error("Failed to fetch sponsorship proposals:", error);
                toast({
                    title: "Fehler",
                    description: "Sponsoring-Vorschläge konnten nicht geladen werden.",
                    variant: "destructive"
                });
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [db, toast]);
    
    return {
        proposals,
        isLoading,
    };
};
