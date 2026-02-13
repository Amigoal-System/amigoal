'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2 } from 'lucide-react';
import { ScrollArea } from './scroll-area';
import { Badge } from './badge';


export const TournamentTeamDetailModal = ({ isOpen, onOpenChange, team, onSave }) => {
    const [formData, setFormData] = useState(null);
    const [newPlayerName, setNewPlayerName] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            if (team) {
                setFormData(team);
            } else {
                // Default structure for a new team
                setFormData({
                    name: '',
                    category: '',
                    contact: '',
                    email: '',
                    payment: 'Offen',
                    players: []
                });
            }
        }
    }, [team, isOpen]);
    
    if (!isOpen || !formData) return null;

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(p => ({...p, [id]: value}));
    };
    
    const handleAddPlayer = () => {
        if (newPlayerName.trim()) {
            setFormData(p => ({...p, players: [...p.players, newPlayerName.trim()]}));
            setNewPlayerName('');
        }
    }
    
    const handleRemovePlayer = (playerIndex) => {
        setFormData(p => ({...p, players: p.players.filter((_, i) => i !== playerIndex)}));
    }

    const handleSave = () => {
        if(!formData.name || !formData.category) {
            toast({
                title: "Fehlende Angaben",
                description: "Teamname und Kategorie sind Pflichtfelder.",
                variant: "destructive"
            });
            return;
        }
        onSave(formData);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{formData.id ? 'Team bearbeiten' : 'Neues Team hinzufügen'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="name">Teamname</Label>
                            <Input id="name" value={formData.name} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Kategorie</Label>
                            <Input id="category" value={formData.category} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contact">Kontaktperson</Label>
                            <Input id="contact" value={formData.contact} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Kontakt-E-Mail</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="payment">Startgeld-Status</Label>
                         <Select value={formData.payment} onValueChange={(val) => setFormData(p => ({...p, payment: val}))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Bezahlt">Bezahlt</SelectItem>
                                <SelectItem value="Offen">Offen</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Spielerliste ({formData.players.length})</Label>
                        <ScrollArea className="h-40 w-full rounded-md border p-2">
                            {formData.players.map((player, index) => (
                                <div key={index} className="flex justify-between items-center p-1.5 hover:bg-muted rounded-md">
                                    <span className="text-sm">{player}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemovePlayer(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </div>
                            ))}
                        </ScrollArea>
                         <div className="flex gap-2">
                            <Input 
                                placeholder="Neuer Spieler..."
                                value={newPlayerName}
                                onChange={(e) => setNewPlayerName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                            />
                            <Button onClick={handleAddPlayer}>
                                <PlusCircle className="mr-2 h-4 w-4"/>Hinzufügen
                            </Button>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Abbrechen</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>Speichern</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
