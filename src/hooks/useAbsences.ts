'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { setAbsence } from '@/ai/flows/absences';
import type { Absence } from '@/ai/flows/absences.types';

export const useAbsences = (memberIds: string | string[]) => {
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const db = useFirestore();

    useEffect(() => {
        if (!db || !memberIds || memberIds.length === 0) {
            setAbsences([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const ids = Array.isArray(memberIds) ? memberIds : [memberIds];
        
        // Firestore 'in' query supports up to 30 items. 
        // For larger groups, multiple queries would be needed.
        if (ids.length > 30) {
            console.warn("Absence query limited to 30 members for performance reasons.");
            ids.splice(30);
        }

        const q = query(collection(db, 'absences'), where('memberId', 'in', ids));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Absence));
            setAbsences(fetchedData);
            setIsLoading(false);
        }, (error) => {
            console.error("Failed to fetch absences:", error);
            toast({ title: "Fehler", description: "Anwesenheiten konnten nicht geladen werden.", variant: "destructive" });
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [db, JSON.stringify(memberIds), toast]);


    const addOrUpdateAbsence = async (absenceData: Omit<Absence, 'id' | 'createdAt'>) => {
        if (!db) return;
        try {
            await setAbsence(db, absenceData);
            // The onSnapshot listener will update the state automatically.
        } catch (error) {
            console.error("Failed to set absence:", error);
            toast({ title: "Fehler", description: "Status konnte nicht gespeichert werden.", variant: "destructive" });
        }
    };
    
    const getAbsenceStatus = (eventId: string | undefined, memberId?: string): Absence['status'] | 'pending' => {
        const idToCompare = memberId || (Array.isArray(memberIds) ? memberIds[0] : memberIds);
        if (!eventId || !idToCompare) return 'pending';
        const absence = absences.find(a => a.eventId === eventId && a.memberId === idToCompare);
        return absence ? absence.status : 'pending';
    }

    return {
        absences,
        isLoading,
        addAbsence: addOrUpdateAbsence,
        getAbsenceStatus
    };
};
