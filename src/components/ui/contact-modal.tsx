
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Shield, Loader2 } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { sendMail } from '@/services/email';

export const ContactModal = ({ isOpen, onOpenChange }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleSubmit = useCallback(async () => {
        if (!executeRecaptcha) {
            toast({
                title: "Fehler",
                description: "reCAPTCHA ist noch nicht bereit. Bitte versuchen Sie es in einem Moment erneut.",
                variant: "destructive",
            });
            return;
        }

        if (!name || !email || !message) {
            toast({
                title: "Fehlende Informationen",
                description: "Bitte füllen Sie alle Felder aus.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const token = await executeRecaptcha('contact_form');
            const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@amigoal.ch';

            // In a real app, the backend would verify the token.
            // Here, we proceed with sending the email via our server action.
            await sendMail({
                to: contactEmail,
                subject: `Kontaktanfrage von ${name}`,
                html: `
                    <p>Sie haben eine neue Kontaktanfrage erhalten:</p>
                    <ul>
                        <li><strong>Name:</strong> ${name}</li>
                        <li><strong>E-Mail:</strong> ${email}</li>
                        <li><strong>Nachricht:</strong></li>
                    </ul>
                    <p style="white-space: pre-wrap;">${message}</p>
                    <p><small>reCAPTCHA Token: ${token}</small></p>
                `
            });


            toast({
                title: "Nachricht gesendet!",
                description: "Vielen Dank für Ihre Kontaktaufnahme. Wir werden uns bald bei Ihnen melden.",
            });

            // Reset form and close modal
            onOpenChange(false);
        } catch (error) {
            console.error("Contact form submission failed:", error);
            toast({
                title: "Fehler",
                description: "Ihre Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [executeRecaptcha, name, email, message, onOpenChange, toast]);
    
    useEffect(() => {
        if (!isOpen) {
            setName('');
            setEmail('');
            setMessage('');
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Kontaktieren Sie uns</DialogTitle>
                    <DialogDescription>
                        Haben Sie Fragen oder Anregungen? Wir freuen uns auf Ihre Nachricht.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ihr Name" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">E-Mail</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ihre@email.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Nachricht</Label>
                        <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ihre Nachricht an uns..." />
                    </div>
                </div>
                 <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Shield className="w-3 h-3"/>
                    Diese Seite ist durch reCAPTCHA geschützt, um Spam zu verhindern.
                </p>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Abbrechen</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                        Nachricht senden
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
