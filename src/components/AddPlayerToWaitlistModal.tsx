
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';
import { addPlayerToWaitlist } from '@/ai/flows/waitlist';
import type { WaitlistPlayer } from '@/ai/flows/waitlist.types';
import { addAdultToWaitlist } from '@/ai/flows/adultWaitlist';
import type { AdultWaitlistPlayer } from '@/ai/flows/adultWaitlist.types';
import { Shield, Swords, Diamond, CircleUser, Loader2 } from 'lucide-react';
import { cantons } from '@/lib/cantons';

const positionOptions = [
    { value: 'Torwart', label: 'Torwart', icon: <CircleUser className="w-6 h-6" /> },
    { value: 'Verteidigung', label: 'Verteidigung', icon: <Shield className="w-6 h-6" /> },
    { value: 'Mittelfeld', label: 'Mittelfeld', icon: <Diamond className="w-6 h-6" /> },
    { value: 'Sturm', label: 'Sturm', icon: <Swords className="w-6 h-6" /> },
];

const initialJuniorState = {
    type: 'junior',
    salutation: 'Unbekannt',
    firstName: '',
    lastName: '',
    birthYear: '',
    contactName: '',
    email: '',
    phone: '',
    country: 'Schweiz',
    canton: '',
    region: '',
    position: '',
    hasPreviousClub: 'no',
    previousClubName: '',
};

const initialAdultState = {
    type: 'adult',
    salutation: 'Unbekannt',
    firstName: '',
    lastName: '',
    birthYear: '',
    email: '',
    phone: '',
    country: 'Schweiz',
    canton: '',
    region: '',
    position: '',
    hasPreviousClub: 'no',
    previousClubName: '',
}

export const AddPlayerToWaitlistModal = ({ isOpen, onOpenChange, onPlayerAdded }) => {
    const [playerType, setPlayerType] = useState<'junior' | 'adult'>('junior');
    const [formData, setFormData] = useState(initialJuniorState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const resetForm = () => {
        setPlayerType('junior');
        setFormData(initialJuniorState);
    }
    
    const handlePlayerTypeChange = (value: 'junior' | 'adult') => {
        setPlayerType(value);
        setFormData(value === 'junior' ? initialJuniorState : initialAdultState);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const requiredFields = ['firstName', 'lastName', 'birthYear', 'email'];
        if (playerType === 'junior') requiredFields.push('contactName');

        if (requiredFields.some(field => !formData[field])) {
            toast({
                title: "Fehlende Informationen",
                description: "Bitte füllen Sie alle erforderlichen Felder aus.",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        const regionString = formData.country === 'Schweiz' && formData.canton ? formData.canton : formData.region;
        
        try {
            if (playerType === 'junior') {
                const juniorData: Omit<WaitlistPlayer, 'id' | 'status' | 'addedAt'> = {
                    salutation: formData.salutation,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    birthYear: formData.birthYear,
                    position: formData.position || 'Unbekannt',
                    previousClub: formData.hasPreviousClub === 'yes' ? formData.previousClubName : undefined,
                    region: regionString,
                    contactName: formData.contactName,
                    email: formData.email,
                    phone: formData.phone,
                };
                await addPlayerToWaitlist(juniorData);
            } else {
                 const adultData: Omit<AdultWaitlistPlayer, 'id' | 'status' | 'addedAt'> = {
                    salutation: formData.salutation,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    birthYear: formData.birthYear,
                    position: formData.position || 'Unbekannt',
                    previousClub: formData.hasPreviousClub === 'yes' ? formData.previousClubName : undefined,
                    region: regionString,
                    email: formData.email,
                    phone: formData.phone,
                };
                await addAdultToWaitlist(adultData);
            }
            
            toast({
                title: "Spieler hinzugefügt!",
                description: `${formData.firstName} wurde auf die Warteliste gesetzt.`,
            });

            resetForm();
            onOpenChange(false);
            if (onPlayerAdded) {
                onPlayerAdded();
            }
        } catch (error) {
            console.error("Failed to add player:", error);
            toast({
                title: "Fehler",
                description: "Der Spieler konnte nicht hinzugefügt werden.",
                variant: "destructive",
            });
        } finally {
             setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.id]: e.target.value}));
    };
    
    const handleSelectChange = (field: string, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
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
                <form onSubmit={handleSubmit}>
                    <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                        <div className="space-y-2">
                            <Label>Spielertyp</Label>
                            <RadioGroup value={playerType} onValueChange={handlePlayerTypeChange as any} className="flex gap-4 pt-1">
                                <div className="flex items-center space-x-2"><RadioGroupItem value="junior" id="type-junior" /><Label htmlFor="type-junior">Junior</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="adult" id="type-adult" /><Label htmlFor="type-adult">Erwachsener</Label></div>
                            </RadioGroup>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2 md:col-span-1">
                                <Label htmlFor="salutation">Anrede</Label>
                                <Select value={formData.salutation} onValueChange={(v) => handleSelectChange('salutation', v)} disabled={isSubmitting}>
                                    <SelectTrigger id="salutation"><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Herr">{playerType === 'junior' ? 'Junge' : 'Herr'}</SelectItem>
                                        <SelectItem value="Frau">{playerType === 'junior' ? 'Mädchen' : 'Frau'}</SelectItem>
                                        <SelectItem value="Unbekannt">Keine Angabe</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Vorname</Label>
                                <Input id="firstName" placeholder="Max" required value={formData.firstName} onChange={handleInputChange} disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Nachname</Label>
                                <Input id="lastName" placeholder="Mustermann" required value={formData.lastName} onChange={handleInputChange} disabled={isSubmitting} />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Wunschposition</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {positionOptions.map(opt => (
                                    <Button
                                        key={opt.value}
                                        type="button"
                                        variant={formData.position === opt.value ? 'default' : 'outline'}
                                        className="h-20 flex-col gap-1"
                                        onClick={() => handleSelectChange('position', opt.value)}
                                        disabled={isSubmitting}
                                    >
                                        {opt.icon}
                                        <span className="text-xs">{opt.label}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="birthYear">Geburtsjahr</Label>
                            <Input id="birthYear" type="number" placeholder="z.B. 2015" required value={formData.birthYear} onChange={handleInputChange} disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <Label>Schon in einem Verein gespielt?</Label>
                            <RadioGroup value={formData.hasPreviousClub} onValueChange={handleRadioChange} className="flex gap-4 pt-1" disabled={isSubmitting}>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="prev-yes" /><Label htmlFor="prev-yes">Ja</Label></div>
                                <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="prev-no" /><Label htmlFor="prev-no">Nein</Label></div>
                            </RadioGroup>
                        </div>

                        {formData.hasPreviousClub === 'yes' && (
                            <div className="space-y-2">
                                <Label htmlFor="previousClubName">Name des letzten Vereins</Label>
                                <Input id="previousClubName" placeholder="z.B. FC Musterstadt" value={formData.previousClubName} onChange={handleInputChange} disabled={isSubmitting}/>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Land</Label>
                                <Select value={formData.country} onValueChange={(v) => handleSelectChange('country', v)} disabled={isSubmitting}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Schweiz">Schweiz</SelectItem>
                                        <SelectItem value="Deutschland">Deutschland</SelectItem>
                                        <SelectItem value="Österreich">Österreich</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Kanton / Region</Label>
                                {formData.country === 'Schweiz' ? (
                                    <Select value={formData.canton} onValueChange={(v) => handleSelectChange('canton', v)} disabled={isSubmitting}>
                                        <SelectTrigger><SelectValue placeholder="Kanton wählen..."/></SelectTrigger>
                                        <SelectContent>
                                            {cantons.map(c => <SelectItem key={c.value} value={c.label}>{c.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <Input id="region" placeholder="z.B. Baden-Württemberg" value={formData.region} onChange={handleInputChange} disabled={isSubmitting}/>
                                )}
                            </div>
                        </div>
                        <Separator />
                        <h4 className="text-sm font-medium text-muted-foreground">{playerType === 'junior' ? 'Angaben eines Elternteils' : 'Kontaktangaben'}</h4>
                        {playerType === 'junior' && (
                             <div className="space-y-2">
                                <Label htmlFor="contactName">Name des Elternteils</Label>
                                <Input id="contactName" placeholder="Erika Musterfrau" required={playerType === 'junior'} value={formData.contactName || ''} onChange={handleInputChange} disabled={isSubmitting} />
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-Mail</Label>
                                <Input id="email" type="email" placeholder="max@muster.com" required value={formData.email} onChange={handleInputChange} disabled={isSubmitting} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input id="phone" type="tel" placeholder="079 123 45 67" value={formData.phone} onChange={handleInputChange} disabled={isSubmitting} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                            Zur Warteliste hinzufügen
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
