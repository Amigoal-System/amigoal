
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTeam } from '@/hooks/use-team';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export const CreatePollModal = ({ isOpen, onOpenChange, onCreatePoll }) => {
    const { toast } = useToast();
    const { teams, clubName } = useTeam();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [target, setTarget] = useState<{level: string, id?: string}>({ level: 'club' });

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, '']);
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };
    
    const handleSave = () => {
        if (!title.trim() || options.some(opt => !opt.trim())) {
            toast({
                title: "Fehlende Angaben",
                description: "Bitte geben Sie einen Titel und Text für alle Optionen an.",
                variant: "destructive",
            });
            return;
        }

        const pollData = {
            title,
            description,
            options: options.map((opt, index) => ({ id: index + 1, text: opt, votes: 0 })),
            target,
            clubId: clubName,
        };
        onCreatePoll(pollData);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Neue Umfrage erstellen</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Titel der Umfrage</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Beschreibung (optional)</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Optionen</Label>
                        {options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                />
                                {options.length > 2 && (
                                    <Button variant="ghost" size="icon" onClick={() => removeOption(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                )}
                            </div>
                        ))}
                         <Button variant="outline" size="sm" onClick={addOption}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Option hinzufügen
                        </Button>
                    </div>
                     <div className="space-y-2 border-t pt-4">
                        <Label>Sichtbarkeit</Label>
                        <div className="flex gap-4">
                             <Select value={target.level} onValueChange={(val) => setTarget({level: val})}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">Öffentlich (Ganze Plattform)</SelectItem>
                                    <SelectItem value="club">Mein Club</SelectItem>
                                    <SelectItem value="team">Meine Mannschaft</SelectItem>
                                </SelectContent>
                            </Select>
                            {target.level === 'team' && (
                                <Select onValueChange={(val) => setTarget(p => ({...p, id: val}))}>
                                    <SelectTrigger><SelectValue placeholder="Team auswählen..."/></SelectTrigger>
                                    <SelectContent>
                                        {teams.map(team => <SelectItem key={team} value={team}>{team}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/>Umfrage erstellen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
