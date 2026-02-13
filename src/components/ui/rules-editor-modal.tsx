
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from './button';
import { Input } from './input';
import { Checkbox } from './checkbox';
import { PlusCircle, Trash2, Save, GripVertical } from 'lucide-react';
import type { ClubRule } from '@/ai/flows/configurations.types';
import { ScrollArea } from './scroll-area';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

export const RulesEditorModal = ({ isOpen, onOpenChange, rules, onSave, title }) => {
    const [localRules, setLocalRules] = useState<Partial<ClubRule>[]>([]);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        if (isOpen) {
            const initialRules = JSON.parse(JSON.stringify(rules || []));
            setLocalRules(initialRules);
            const initialCategories = Array.from(new Set(initialRules.map(r => r.category).filter(Boolean)));
            if (!initialCategories.includes('Allgemein')) {
                initialCategories.unshift('Allgemein');
            }
            setAvailableCategories(initialCategories);
        }
    }, [isOpen, rules]);

    const handleRuleChange = (id: string, field: 'text', value: string) => {
        setLocalRules(prev => prev.map(rule => rule.id === id ? { ...rule, [field]: value } : rule));
    };
    
    const handleCategoryChange = (id: string, value: string) => {
        setLocalRules(prev => prev.map(rule => rule.id === id ? { ...rule, category: value } : rule));
    };

    const handleMandatoryChange = (id: string, isMandatory: boolean) => {
        setLocalRules(prev => prev.map(rule => rule.id === id ? { ...rule, mandatory: isMandatory } : rule));
    };

    const addRule = () => {
        setLocalRules(prev => [...prev, { id: `new-${Date.now()}`, text: '', category: 'Allgemein', mandatory: false }]);
    };

    const removeRule = (id: string) => {
        setLocalRules(prev => prev.filter(rule => rule.id !== id));
    };

    const handleAddNewCategory = () => {
        if (newCategory.trim() && !availableCategories.includes(newCategory.trim())) {
            setAvailableCategories(prev => [...prev, newCategory.trim()]);
            setNewCategory('');
        }
    };
    
    const handleSave = () => {
        const finalRules = localRules
            .filter(rule => rule.text?.trim())
            .map((rule, index) => ({
                ...rule,
                id: rule.id?.startsWith('new-') ? `${Date.now()}-${index}` : rule.id,
            } as ClubRule));
        onSave(finalRules);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="py-4 space-y-3">
                        {localRules.map((rule) => (
                            <div key={rule.id} className="flex items-start gap-2 p-3 border rounded-lg bg-muted/50">
                                <div className="flex-grow space-y-2">
                                     <Input
                                        value={rule.text}
                                        onChange={(e) => handleRuleChange(rule.id!, 'text', e.target.value)}
                                        placeholder="Regeltext eingeben..."
                                    />
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id={`mandatory-${rule.id}`}
                                                checked={rule.mandatory}
                                                onCheckedChange={(checked) => handleMandatoryChange(rule.id!, !!checked)}
                                            />
                                            <label htmlFor={`mandatory-${rule.id}`} className="text-xs font-medium">Zwingend</label>
                                        </div>
                                         <Select value={rule.category || 'Allgemein'} onValueChange={(val) => handleCategoryChange(rule.id!, val)}>
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableCategories.map(cat => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeRule(rule.id!)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <div className="flex flex-col gap-4 border-t pt-4">
                     <Button variant="outline" className="w-full" onClick={addRule}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Neue Regel hinzufügen
                    </Button>
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Neue Kategorie hinzufügen..." 
                            value={newCategory} 
                            onChange={e => setNewCategory(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddNewCategory()}
                        />
                        <Button onClick={handleAddNewCategory} disabled={!newCategory.trim()}>Hinzufügen</Button>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Speichern</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
