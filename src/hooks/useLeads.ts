
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { getAllLeads as getAllClubLeads, addLead as addLeadFlow, updateLead as updateLeadFlow, deleteLead as deleteLeadFlow, deleteLeads as deleteLeadsFlow } from '@/ai/flows/leads';
import { getAllBootcampProviders } from '@/ai/flows/bootcampProviders';
import { getAllTrainingCampProviders } from '@/ai/flows/trainingCampProviders';
import type { Lead } from '@/ai/flows/leads.types';

export const useLeads = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchLeads = useCallback(async (includeArchived = false) => {
        setIsLoading(true);
        try {
            const [clubLeads, bootcampProviders, trainingCampProviders] = await Promise.all([
                getAllClubLeads({ includeArchived }),
                getAllBootcampProviders(),
                getAllTrainingCampProviders(),
            ]);

            const bootcampLeads: Lead[] = bootcampProviders.map(p => ({
                id: p.id,
                name: p.name,
                contact: p.contact,
                email: p.email,
                phone: p.phone,
                website: p.website,
                type: 'Bootcamp-Anbieter',
                status: 'Interessent', // This is a simplification
                lastContact: new Date().toISOString(),
                tags: p.regions || [],
                address: {},
                mobile: '',
                bestContactTime: '',
                notes: '',
                history: [],
            }));
            
            const trainingCampLeads: Lead[] = trainingCampProviders.map(p => ({
                id: p.id,
                name: p.name,
                contact: p.contact,
                email: p.email,
                phone: p.phone,
                website: p.website,
                type: 'Trainingslager-Anbieter',
                status: 'Interessent',
                lastContact: new Date().toISOString(),
                tags: p.regions || [],
                address: {},
                mobile: '',
                bestContactTime: '',
                notes: '',
                history: [],
            }));

            const allLeads = [...clubLeads, ...bootcampLeads, ...trainingCampLeads].sort(
                (a, b) => new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime()
            );

            setLeads(allLeads);
        } catch (error) {
            console.error('Failed to fetch leads:', error);
            toast({
                title: "Fehler beim Laden",
                description: "Die Lead-Daten konnten nicht geladen werden.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const addLead = async (newLeadData: Omit<Lead, 'id'>) => {
        try {
            await addLeadFlow(newLeadData);
            await fetchLeads(); // Refetch to get the new lead with its ID
        } catch (error) {
            console.error('Failed to add lead:', error);
            toast({ title: "Fehler beim Hinzufügen", variant: "destructive" });
        }
    };

    const updateLead = async (updatedLead: Lead) => {
        try {
            await updateLeadFlow(updatedLead);
            await fetchLeads(); // Refetch to show updated data
        } catch (error) {
            console.error('Failed to update lead:', error);
            toast({ title: "Fehler beim Speichern", variant: "destructive" });
        }
    };

    const deleteLead = async (leadId: string) => {
        try {
            await deleteLeadFlow(leadId);
            toast({ title: "Lead gelöscht" });
            await fetchLeads();
        } catch (error) {
            console.error('Failed to delete lead:', error);
            toast({ title: "Fehler beim Löschen", variant: "destructive" });
        }
    };

    const deleteLeads = async (leadIds: string[]) => {
        try {
            await deleteLeadsFlow(leadIds);
            toast({ title: `${leadIds.length} Leads gelöscht` });
            await fetchLeads();
        } catch (error) {
             console.error('Failed to delete leads:', error);
            toast({ title: "Fehler beim Löschen mehrerer Leads", variant: "destructive" });
        }
    }

    return {
        leads,
        isLoading,
        addLead,
        updateLead,
        deleteLead,
        deleteLeads,
        refetchLeads: fetchLeads,
    };
};
