
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './separator';
import { addPlayerToWaitlist } from '@/ai/flows/waitlist';
import type { WaitlistPlayer } from '@/ai/flows/waitlist.types';


export const AddPlayerToWaitlistModal = ({ isOpen, onOpenChange, onPlayerAdded }) => {
    const [formData, setFormData] = useState({
        childName: '',
        birthYear: '',
        parentName: '',
        parentEmail: '',
        phone: '',
        region: '',
        position: '',
        hasPreviousClub: 'no',
        previousClubName: '',
    });
    const { toast } = useToast();

    const resetForm = () => {
        setFormData({
            childName: '',
            birthYear: '',
            parentName: '',
            parentEmail: '',
            phone: '',
            region: '',
            position: '',
            hasPreviousClub: 'no',
            previousClubName: '',
        });
    }

    const handleSave = async (andAddAnother: boolean) => {
        if (!formData.childName || !formData.birthYear || !formData.parentName || !formData.parentEmail) {
            toast({
                title: "Fehlende Informationen",
                description: "Bitte füllen Sie mindestens die Felder für Name, Geburtsjahr und Elternkontakt aus.",
                variant: "destructive"
            });
            return;
        }

        const playerData: Omit<WaitlistPlayer, 'id' | 'status' | 'addedAt'> = {
            name: formData.childName,
            birthYear: formData.birthYear,
            position: formData.position || 'Unbekannt',
            previousClub: formData.hasPreviousClub === 'yes' ? formData.previousClubName : undefined,
            region: formData.region,
            contactName: formData.parentName,
            email: formData.parentEmail,
            phone: formData.phone
        };

        try {
            await addPlayerToWaitlist(playerData);
             toast({
                title: "Spieler hinzugefügt!",
                description: `${formData.childName} wurde auf die Warteliste gesetzt.`,
            });

            resetForm();

            if (andAddAnother) {
                // Just reset the form, modal stays open
            } else {
                onOpenChange(false);
            }
            onPlayerAdded(); // Notify parent to refetch
        } catch (error) {
             console.error("Failed to add to waitlist:", error);
            toast({
                title: "Fehler",
                description: "Der Spieler konnte nicht zur Warteliste hinzugefügt werden.",
                variant: "destructive",
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.id]: e.target.value}));
    };
    
    const handleSelectChange = (value: string) => {
        setFormData(prev => ({...prev, position: value}));
    }
    
    const handleRadioChange = (value: string) => {
        setFormData(prev => ({...prev, hasPreviousClub: value, previousClubName: value === 'no' ? '' : prev.previousClubName}));
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Spieler zur Warteliste hinzufügen</DialogTitle>
                    <DialogDescription>
                        Fügen Sie manuell einen Spieler hinzu, der einen Verein sucht.
                    </DialogDescription>
                </DialogHeader>
                 <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    {/* Player Info Section */}
                    <div className="space-y-4">
                         <h4 className="text-sm font-medium text-muted-foreground">Angaben zum Kind</h4>
                        <div className="space-y-2">
                            <Label htmlFor="childName">Name des Kindes</Label>
                            <Input id="childName" placeholder="Maxine Muster" required value={formData.childName} onChange={handleInputChange} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="birthYear">Geburtsjahr</Label>
                                <Input id="birthYear" type="number" placeholder="z.B. 2015" required value={formData.birthYear} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="position">Wunschposition</Label>
                                <Select value={formData.position} onValueChange={handleSelectChange}>
                                    <SelectTrigger id="position">
                                        <SelectValue placeholder="Position wählen..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Torwart">Torwart</SelectItem>
                                        <SelectItem value="Verteidigung">Verteidigung</SelectItem>
                                        <SelectItem value="Mittelfeld">Mittelfeld</SelectItem>
                                        <SelectItem value="Sturm">Sturm</SelectItem>
                                        <SelectItem value="Egal">Egal / Weiss nicht</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>War das Kind schon in einem Verein?</Label>
                            <RadioGroup value={formData.hasPreviousClub} onValueChange={handleRadioChange} className="flex gap-4 pt-1">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="yes" id="prev-yes" />
                                    <Label htmlFor="prev-yes">Ja</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id="prev-no" />
                                    <Label htmlFor="prev-no">Nein</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        {formData.hasPreviousClub === 'yes' && (
                            <div className="space-y-2">
                                <Label htmlFor="previousClubName">Name des letzten Vereins</Label>
                                <Input id="previousClubName" placeholder="z.B. FC Musterstadt" value={formData.previousClubName} onChange={handleInputChange} />
                            </div>
                        )}
                         <div className="space-y-2">
                            <Label htmlFor="region">Region / Wohnort (optional)</Label>
                            <Input id="region" placeholder="z.B. Zürich Kreis 5" value={formData.region} onChange={handleInputChange} />
                        </div>
                    </div>

                    <Separator />

                    {/* Parent Info Section */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-muted-foreground">Kontakt eines Elternteils</h4>
                        <div className="space-y-2">
                            <Label htmlFor="parentName">Name eines Elternteils</Label>
                            <Input id="parentName" placeholder="Erika Musterfrau" required value={formData.parentName} onChange={handleInputChange} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="parentEmail">E-Mail Adresse</Label>
                                <Input id="parentEmail" type="email" placeholder="erika@musterfrau.ch" required value={formData.parentEmail} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefonnummer</Label>
                                <Input id="phone" type="tel" placeholder="079 123 45 67" value={formData.phone} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="justify-between">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Schliessen</Button>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => handleSave(true)}>Speichern & Nächsten hinzufügen</Button>
                        <Button onClick={() => handleSave(false)}>Speichern & Schliessen</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
