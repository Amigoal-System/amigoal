
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { PlusCircle, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getConfiguration, updateConfiguration } from '@/ai/flows/configurations';
import type { TeamCategory } from '@/ai/flows/configurations.types';
import { useClub } from '@/hooks/useClub';
import { updateClub } from '@/ai/flows/clubs';

export const CategoryManagerModal = ({ isOpen, onOpenChange, onUpdate }) => {
    const { club, isLoading: isLoadingClub, refetchClub } = useClub();
    const [categories, setCategories] = useState<Partial<TeamCategory>[]>([]);
    const [defaultCategories, setDefaultCategories] = useState<TeamCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const loadCategories = useCallback(async () => {
        if (club) {
            setIsLoading(true);
            try {
                const config = await getConfiguration();
                const countryCode = club.country || 'CH';
                const globalCats = (config?.teamCategories as any)?.[countryCode] || [];
                setDefaultCategories(globalCats);

                if (club?.teamCategories && club.teamCategories.length > 0) {
                    setCategories(club.teamCategories);
                } else {
                    setCategories(globalCats);
                }
            } catch (error) {
                console.error("Failed to load categories:", error);
                toast({ title: "Fehler", description: "Kategorien konnten nicht geladen werden.", variant: "destructive"});
            } finally {
                setIsLoading(false);
            }
        }
    }, [club, toast]);


    useEffect(() => {
        if(isOpen && club) {
           loadCategories();
        }
    }, [club, isOpen, loadCategories]);

    const handleCategoryChange = (id: string, field: 'name' | 'order', value: string | number) => {
        setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, [field]: value } : cat));
    };

    const addCategory = () => {
        const newOrder = categories.length > 0
            ? Math.max(...categories.map(c => c.order || 0)) + 1
            : 1;
        setCategories(prev => [...prev, { id: `new-${Date.now()}`, name: '', order: newOrder, countryCode: club?.country || 'CH' }]);
    };

    const removeCategory = (id: string) => {
        setCategories(prev => prev.filter(cat => cat.id !== id));
    };
    
    const handleSave = async (categoriesToSave: Partial<TeamCategory>[]) => {
        if (!club) return false;
        
        const finalCategories = categoriesToSave
            .filter(cat => cat.name?.trim())
            .map((cat, index) => ({
                ...cat,
                id: cat.id?.startsWith('new-') ? `${Date.now()}-${index}` : cat.id,
                countryCode: club.country || 'CH'
            } as TeamCategory));
        
        setIsLoading(true);
        try {
            await updateClub({ ...club, teamCategories: finalCategories });
            await refetchClub();
            if (onUpdate) onUpdate();
            return true; // Indicate success
        } catch (error) {
            console.error("Failed to save categories:", error);
            toast({ title: "Fehler beim Speichern", variant: "destructive" });
            return false; // Indicate failure
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleReset = async () => {
        const success = await handleSave(defaultCategories);
        if (success) {
            setCategories(defaultCategories);
            toast({ title: "Zurückgesetzt", description: "Die Kategorien wurden auf den Amigoal-Standard zurückgesetzt." });
        }
    };
    
    const handleSaveAndClose = async () => {
        const success = await handleSave(categories);
        if(success) {
            toast({ title: "Kategorien gespeichert!" });
            onOpenChange(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Mannschaftskategorien verwalten</DialogTitle>
                    <DialogDescription>
                        Passen Sie die Kategorien für die Mannschaftsübersicht an.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[60vh] overflow-y-auto">
                    {isLoading || isLoadingClub ? <p>Lade...</p> : (
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
                                            <Input
                                                value={category.name}
                                                onChange={(e) => handleCategoryChange(category.id!, 'name', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={category.order}
                                                onChange={(e) => handleCategoryChange(category.id!, 'order', parseInt(e.target.value, 10))}
                                                className="w-20"
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => removeCategory(category.id!)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                    <Button variant="outline" className="mt-4 w-full" onClick={addCategory}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Neue Kategorie
                    </Button>
                </div>
                <DialogFooter className="justify-between">
                     <Button variant="ghost" onClick={handleReset} disabled={isLoading}>Auf Standard zurücksetzen</Button>
                    <div>
                        <Button variant="outline" className="mr-2" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                        <Button onClick={handleSaveAndClose} disabled={isLoading}>
                            <Save className="mr-2 h-4 w-4" /> Speichern
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
