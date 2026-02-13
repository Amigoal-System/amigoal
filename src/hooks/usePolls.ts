
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { createPoll, deletePoll, voteOnPoll } from '@/ai/flows/polls';
import type { Poll, PollOption } from '@/ai/flows/polls.types';
import { useTeam } from './use-team';
import { useFirestore, useCollection, useUser } from '@/firebase';
import { collection } from 'firebase/firestore';


export const usePolls = () => {
    const db = useFirestore();
    const { data: polls, isLoading: isLoadingCollection } = useCollection<Poll>(db ? collection(db, 'polls') : null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useUser();
    const { toast } = useToast();

    useEffect(() => {
        setIsLoading(isLoadingCollection);
    }, [isLoadingCollection]);


    const handleCreatePoll = async (pollData: Omit<Poll, 'id' | 'createdAt' | 'createdBy'>) => {
        if (!user?.displayName || !db) return;
        createPoll(db, { ...pollData, createdBy: user.displayName });
        toast({ title: "Umfrage erstellt!" });
    };
    
    const handleDeletePoll = async (pollId: string) => {
        if (!db) return;
        deletePoll(db, pollId);
        toast({ title: "Umfrage gelöscht." });
    };

    const handleVote = async (pollId: string, optionId: number) => {
        if (!user?.uid || !db) return;
        voteOnPoll(db, { pollId, optionId, userId: user.uid });
        toast({ title: "Stimme abgegeben!" });
    };


    return {
        polls: polls || [],
        isLoading,
        addPoll: handleCreatePoll,
        deletePoll: handleDeletePoll,
        vote: handleVote,
    };
};
