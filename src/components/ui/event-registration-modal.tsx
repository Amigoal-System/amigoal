'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2 } from 'lucide-react';
import { registerForEvent } from '@/ai/flows/events';

export const EventRegistrationModal = ({ event, isOpen, onOpenChange }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    if (!event) return null;

    const handleSubmit = async () => {
        if (!name || !email) {
            toast({
                title: "Fehlende Informationen",
                description: "Bitte geben Sie Ihren Namen und Ihre E-Mail-Adresse an.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await registerForEvent({
                eventId: event.id!,
                registration: {
                    name,
                    email,
                    status: 'Zusage'
                }
            });
            toast({
                title: "Anmeldung erfolgreich!",
                description: `Sie haben sich für "${event.title}" angemeldet. Eine Bestätigung wurde an Ihre E-Mail gesendet.`,
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Registration failed:", error);
            toast({
                title: "Fehler",
                description: "Ihre Anmeldung konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Anmeldung für: {event.title}</DialogTitle>
                    <DialogDescription>
                        Füllen Sie Ihre Daten aus, um Ihren Platz zu sichern.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Ihr Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Ihre E-Mail</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                        Anmelden
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
