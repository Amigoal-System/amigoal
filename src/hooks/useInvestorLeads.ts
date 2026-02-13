
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { getAllInvestorLeads, addInvestorLead as addInvestorLeadFlow, updateInvestorLead as updateInvestorLeadFlow } from '@/ai/flows/investorLeads';
import type { InvestorLead } from '@/ai/flows/investorLeads.types';

export const useInvestorLeads = () => {
    const [leads, setLeads] = useState<InvestorLead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchLeads = useCallback(async (includeArchived = false) => {
        setIsLoading(true);
        try {
            const data = await getAllInvestorLeads({ includeArchived });
            setLeads(data);
        } catch (error) {
            console.error("Failed to fetch investor leads", error);
            toast({ title: "Fehler beim Laden", variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const addInvestorLead = async (leadData: Omit<InvestorLead, 'id' | 'createdAt' | 'status' | 'history'>) => {
        await addInvestorLeadFlow(leadData);
        await fetchLeads();
    };
    
    const updateInvestorLead = async (leadId: string, status: InvestorLead['status'], note?: string) => {
         try {
            await updateInvestorLeadFlow({ id: leadId, status, note });
            await fetchLeads(); // Refetch to apply changes
        } catch (error) {
            console.error("Failed to update lead status:", error);
            toast({ title: "Fehler beim Aktualisieren", variant: "destructive" });
        }
    }


    return {
        leads,
        isLoading,
        addInvestorLead,
        updateInvestorLead,
        refetchLeads: fetchLeads,
    };
};
