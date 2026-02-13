'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Handshake, Loader2, Package } from 'lucide-react';
import { addSponsorLead } from '@/ai/flows/sponsorLeads';
import { useSponsorTypes } from '@/hooks/useSponsorTypes';
import { Checkbox } from './checkbox';

export const SponsorInterestModal = ({ isOpen, onOpenChange }) => {
    const [formData, setFormData] = useState({
        company: '',
        contact: '',
        email: '',
        message: '',
        packages: [] as string[],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { sponsorTypes, isLoading: isLoadingTypes } = useSponsorTypes();

    const handleSubmit = async () => {
        if (!formData.company || !formData.contact || !formData.email) {
            toast({
                title: "Fehlende Informationen",
                description: "Bitte füllen Sie alle Pflichtfelder aus.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await addSponsorLead({
                company: formData.company,
                contact: formData.contact,
                email: formData.email,
                industry: 'Unbekannt', // Default value
                interest: formData.message,
                packages: formData.packages,
            });

            toast({
                title: "Anfrage gesendet!",
                description: "Vielen Dank für Ihr Interesse. Wir werden uns bald bei Ihnen melden.",
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Sponsor interest submission failed:", error);
            toast({
                title: "Fehler",
                description: "Ihre Anfrage konnte nicht übermittelt werden.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    useEffect(() => {
        if (!isOpen) {
            setFormData({ company: '', contact: '', email: '', message: '', packages: [] });
        }
    }, [isOpen]);

    const handlePackageToggle = (packageName: string) => {
        setFormData(prev => {
            const newPackages = prev.packages.includes(packageName)
                ? prev.packages.filter(p => p !== packageName)
                : [...prev.packages, packageName];
            return { ...prev, packages: newPackages };
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Handshake className="h-6 w-6"/>
                        Sponsoring-Anfrage
                    </DialogTitle>
                    <DialogDescription>
                        Hinterlassen Sie Ihre Kontaktdaten. Wir werden uns mit passenden Möglichkeiten bei Ihnen melden.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="space-y-2">
                        <Label htmlFor="company">Firma</Label>
                        <Input id="company" value={formData.company} onChange={(e) => setFormData(p => ({...p, company: e.target.value}))} placeholder="Ihr Firmenname" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="contact">Ansprechperson</Label>
                        <Input id="contact" value={formData.contact} onChange={(e) => setFormData(p => ({...p, contact: e.target.value}))} placeholder="Max Mustermann" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">E-Mail</Label>
                        <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(p => ({...p, email: e.target.value}))} placeholder="ihre@email.com" />
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t">
                        <Label className="flex items-center gap-2">
                            <Package className="h-4 w-4"/>
                            An welchen Paketen sind Sie interessiert? (optional)
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                            {isLoadingTypes ? <p>Lade Pakete...</p> : sponsorTypes.map(pkg => (
                                <div key={pkg.id} className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`pkg-${pkg.id}`} 
                                        checked={formData.packages.includes(pkg.name)}
                                        onCheckedChange={() => handlePackageToggle(pkg.name)}
                                    />
                                    <label
                                        htmlFor={`pkg-${pkg.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {pkg.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Nachricht (optional)</Label>
                        <Textarea id="message" value={formData.message} onChange={(e) => setFormData(p => ({...p, message: e.target.value}))} placeholder="Teilen Sie uns Ihre Wünsche oder Interessen mit..." />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Abbrechen</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                         Anfrage senden
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
