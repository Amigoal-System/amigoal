
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Save, Trash2, Loader2 } from 'lucide-react';
import { getConfiguration, updateConfiguration } from '@/ai/flows/configurations';
import type { Configuration, TeamCategory } from '@/ai/flows/configurations.types';
import { useToast } from '@/hooks/use-toast';
import { useTeam } from '@/hooks/use-team';
import { useClub } from '@/hooks/useClub';
import { updateClub } from '@/ai/flows/clubs';


export default function CategoriesPage() {
  const { club, isLoading: isLoadingClub, refetchClub } = useClub();
  const { currentUserRole } = useTeam();
  const [categories, setCategories] = useState<TeamCategory[]>([]);
  const [defaultCategories, setDefaultCategories] = useState<TeamCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isSuperAdmin = currentUserRole === 'Super-Admin';

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
        const config = await getConfiguration();
        const countryCode = club?.country || 'CH';
        const globalCats = (config?.teamCategories as any)?.[countryCode] || [];
        setDefaultCategories(globalCats);

        if (isSuperAdmin) {
            setCategories(globalCats);
        } else if (club) {
             if (club?.teamCategories && club.teamCategories.length > 0) {
                setCategories(club.teamCategories);
            } else {
                setCategories(globalCats);
            }
        } else {
            // Club admin context but club is not loaded yet
            return;
        }

    } catch (error) {
        console.error("Failed to load categories:", error);
        toast({ title: "Fehler", description: "Kategorien konnten nicht geladen werden.", variant: "destructive"});
    } finally {
        setIsLoading(false);
    }
  }, [club, isSuperAdmin, toast]);


  useEffect(() => {
    // For super admin, load immediately. For club admin, wait for club data.
    if (isSuperAdmin || club) {
        loadCategories();
    }
  }, [club, isSuperAdmin, loadCategories]);


  const handleCategoryChange = (id: string, field: 'name' | 'order', value: string | number) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, [field]: value } : cat));
  };
  
  const addCategory = () => {
    const newOrder = categories.length > 0
        ? Math.max(...categories.map(c => c.order || 0)) + 1
        : 1;
    setCategories(prev => [...prev, { id: `new-${Date.now()}`, name: '', order: newOrder }]);
  };
  
  const removeCategory = (id: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== id));
  };
  
  const handleReset = () => {
    setCategories(defaultCategories);
    toast({ title: "Zurückgesetzt", description: "Die Kategorien wurden auf den Amigoal-Standard zurückgesetzt." });
  };
  
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const finalCategories = categories
        .filter(rule => rule.name?.trim())
        .map((rule, index) => ({
            ...rule,
            id: rule.id?.startsWith('new-') ? `${Date.now()}-${index}` : rule.id,
        } as TeamCategory));

      if (isSuperAdmin) {
        const currentConfig = await getConfiguration();
        const countryCode = club?.country || 'CH';
        currentConfig.teamCategories[countryCode] = finalCategories;
        await updateConfiguration(currentConfig);
      } else if (club) {
        await updateClub({ ...club, teamCategories: finalCategories });
        await refetchClub();
      }
      
      toast({ title: "Kategorien gespeichert!", description: "Die Änderungen wurden erfolgreich übernommen." });
    } catch(error) {
        console.error(error);
        toast({ title: "Fehler beim Speichern", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };


  if (isLoading || (!isSuperAdmin && isLoadingClub)) {
    return <div className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Lade Konfiguration...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mannschaftskategorien</CardTitle>
        <CardDescription>
          Verwalten Sie hier die Mannschaftskategorien für {isSuperAdmin ? 'die Plattform (Standard).' : 'Ihren Verein.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
           <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Reihenfolge</TableHead>
                        <TableHead className="text-right">Aktion</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {categories.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell>
                                <Input value={category.name} onChange={(e) => handleCategoryChange(category.id, 'name', e.target.value)} />
                            </TableCell>
                            <TableCell>
                                <Input type="number" value={category.order} onChange={(e) => handleCategoryChange(category.id, 'order', parseInt(e.target.value))} className="w-20" />
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => removeCategory(category.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <Button variant="outline" className="mt-4 w-full" onClick={addCategory}>
                <PlusCircle className="mr-2 h-4 w-4"/> Kategorie hinzufügen
            </Button>
      </CardContent>
       <CardFooter className="justify-between">
            <Button variant="ghost" onClick={handleReset}>Auf Standard zurücksetzen</Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" /> Änderungen speichern
            </Button>
      </CardFooter>
    </Card>
  );
}
