
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAllMembers, updateMember as updateMemberFlow, addMember as addMemberFlow, deleteMember as deleteMemberFlow } from '@/ai/flows/members'; 
import type { Member } from '@/ai/flows/members.types';

export const useMembers = (clubId?: string | null) => {
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchMembers = useCallback(async () => {
        // Do not fetch if clubId is not provided, unless the wildcard '*' is used.
        if (!clubId) {
            setMembers([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const fetchedMembers = await getAllMembers(clubId);
            setMembers(fetchedMembers);
        } catch (error) {
            console.error('Failed to fetch members:', error);
            // Avoid showing toast for super-admin view where missing collection is possible
            if (clubId !== '*') {
                 toast({
                    title: "Fehler beim Laden",
                    description: "Die Mitgliederdaten konnten nicht geladen werden.",
                    variant: "destructive"
                });
            }
        } finally {
            setIsLoading(false);
        }
    }, [toast, clubId]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const updateMember = async (updatedMember: Member) => {
        try {
            await updateMemberFlow(updatedMember);
            toast({
                title: "Mitglied aktualisiert",
                description: `Die Daten für ${updatedMember.firstName} ${updatedMember.lastName} wurden gespeichert.`
            });
            await fetchMembers(); // Refetch to ensure consistency
        } catch (error) {
            console.error('Failed to update member:', error);
            toast({
                title: "Fehler",
                description: "Die Mitgliedsdaten konnten nicht gespeichert werden.",
                variant: "destructive"
            });
        }
    };
    
    const addMember = async (newMemberData: Omit<Member, 'id'>) => {
        try {
            const newMember = await addMemberFlow(newMemberData);
            if(newMember) {
                toast({
                    title: "Mitglied hinzugefügt",
                    description: `${newMember.firstName} ${newMember.lastName} wurde erfolgreich zur Mitgliederliste hinzugefügt.`
                });
                await fetchMembers();
            } else {
                 throw new Error("addMember returned undefined");
            }
        } catch(error) {
             console.error('Failed to add member:', error);
            toast({
                title: "Fehler",
                description: "Das neue Mitglied konnte nicht gespeichert werden.",
                variant: "destructive"
            });
        }
    }

    const deleteMember = async (memberId: string) => {
        const memberToDelete = members.find(m => m.id === memberId);
        try {
            await deleteMemberFlow(memberId);
            toast({
                title: "Mitglied gelöscht",
                description: `${memberToDelete?.firstName} ${memberToDelete?.lastName} wurde entfernt.`
            });
             await fetchMembers();
        } catch (error) {
             console.error('Failed to delete member:', error);
             toast({
                title: "Fehler",
                description: "Das Mitglied konnte nicht gelöscht werden.",
                variant: "destructive"
            });
        }
    }

    return {
        members,
        isLoading,
        refetchMembers: fetchMembers,
        updateMember,
        addMember,
        deleteMember,
    };
};

    