
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { useToast } from '@/hooks/use-toast';
import { Send, Handshake, Loader2 } from 'lucide-react';
import { addProvider } from '@/ai/flows/providers';
import { useRouter } from 'next/navigation';

export const ProviderRegistrationModal = ({ isOpen, onOpenChange, providerType }) => {
    const [formData, setFormData] = useState({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();


    useEffect(() => {
        if (!isOpen) {
            setFormData({ companyName: '', contactName: '', email: '', phone: '' });
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!formData.companyName || !formData.contactName || !formData.email) {
            toast({
                title: "Fehlende Informationen",
                description: "Bitte füllen Sie mindestens Firmenname, Ansprechpartner und E-Mail aus.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await addProvider({
                name: formData.companyName,
                contact: formData.contactName,
                email: formData.email,
                phone: formData.phone,
                type: providerType, // Set the type based on the context
                regions: [],
                facilities: [],
                commission: '10%', // Default commission
                website: null,
                instagram: null,
                facebook: null,
            });

            toast({
                title: "Anfrage gesendet!",
                description: "Vielen Dank für Ihr Interesse. Wir werden uns in Kürze mit Ihnen in Verbindung setzen.",
            });
            onOpenChange(false);
            router.push('/de/register/bootcamp-provider'); // Redirect to a generic provider registration page
        } catch (error) {
             console.error("Failed to submit provider registration:", error);
              toast({
                title: "Fehler",
                description: "Ihre Anfrage konnte nicht übermittelt werden.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Handshake className="h-6 w-6"/>
                        Als {providerType} registrieren
                    </DialogTitle>
                    <DialogDescription>
                        Hinterlassen Sie Ihre Kontaktdaten. Unser Partnership-Manager wird sich bei Ihnen melden, um Ihren Account zu aktivieren.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="companyName">Name Ihrer Firma</Label>
                        <Input id="companyName" value={formData.companyName} onChange={e => setFormData(p => ({...p, companyName: e.target.value}))} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="contactName">Ansprechperson</Label>
                        <Input id="contactName" value={formData.contactName} onChange={e => setFormData(p => ({...p, contactName: e.target.value}))} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-Mail</Label>
                            <Input id="email" type="email" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefon (optional)</Label>
                            <Input id="phone" type="tel" value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                         {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                         Anfrage senden
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
