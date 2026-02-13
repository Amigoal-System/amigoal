
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getConfiguration, updateConfiguration } from '@/ai/flows/configurations';
import type { SponsorshipPackage, Configuration } from '@/ai/flows/configurations.types';

export const useSponsorTypes = () => {
  const [config, setConfig] = useState<Configuration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedConfig = await getConfiguration();
      setConfig(fetchedConfig || { teamCategories: {}, leagueStructures: {}, sponsorshipPackages: [] });
    } catch (error) {
      console.error('Failed to fetch config:', error);
      toast({ title: 'Fehler beim Laden der Konfiguration', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const sponsorTypes = config?.sponsorshipPackages || [];

  const saveSponsorTypes = async (types: SponsorshipPackage[]) => {
    if (!config) return;
    const newConfig = { ...config, sponsorshipPackages: types };
    try {
      await updateConfiguration(newConfig);
      setConfig(newConfig);
      toast({
        title: 'Gespeichert',
        description: 'Die Sponsoring-Pakete wurden erfolgreich aktualisiert.',
      });
    } catch (error) {
      console.error('Failed to save sponsor types:', error);
      toast({ title: 'Fehler beim Speichern', variant: 'destructive' });
    }
  };
  
  const addSponsorType = async (newType: Omit<SponsorshipPackage, 'id'>) => {
      const currentTypes = sponsorTypes;
      const newId = currentTypes.length > 0 ? Math.max(...currentTypes.map(t => t.id)) + 1 : 1;
      const updatedTypes = [...currentTypes, {...newType, id: newId}];
      await saveSponsorTypes(updatedTypes);
      return updatedTypes; // Return the new list
  }
  
  const updateSponsorType = (updatedType: SponsorshipPackage) => {
      const updatedTypes = sponsorTypes.map(t => t.id === updatedType.id ? updatedType : t);
      saveSponsorTypes(updatedTypes);
  }

  const deleteSponsorType = (typeId: number) => {
    const updatedTypes = sponsorTypes.filter(type => type.id !== typeId);
    saveSponsorTypes(updatedTypes);
  };

  return {
    sponsorTypes,
    isLoading,
    addSponsorType,
    updateSponsorType,
    deleteSponsorType,
    saveSponsorTypes: () => saveSponsorTypes(sponsorTypes), // Pass current state
  };
};
