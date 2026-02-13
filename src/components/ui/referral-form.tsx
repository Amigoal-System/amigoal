
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';
import { addReferral } from '@/ai/flows/referrals';

export const ReferralForm = ({ onFormSubmit }) => {
    const [referrerName, setReferrerName] = useState('');
    const [referrerEmail, setReferrerEmail] = useState('');
    const [referredClubName, setReferredClubName] = useState('');
    const [referredClubContact, setReferredClubContact] = useState('');
    const [referredClubEmail, setReferredClubEmail] = useState('');
    const [referredClubPhone, setReferredClubPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const userEmail = localStorage.getItem('amigoal_email');
        if (userEmail) {
            setReferrerEmail(userEmail);
        }
    }, []);

    const handleSubmit = async () => {
        if (!referrerName || !referrerEmail || !referredClubName || !referredClubContact || !referredClubEmail) {
            toast({
                title: "Fehlende Informationen",
                description: "Bitte füllen Sie alle erforderlichen Felder aus.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await addReferral({
                referrerName,
                referrerEmail,
                referredClubName,
                referredClubContact,
                referredClubEmail,
                referredClubPhone,
            });
            toast({
                title: "Empfehlung gesendet!",
                description: `Vielen Dank! Ihre Empfehlung für ${referredClubName} wurde übermittelt.`,
            });
            onFormSubmit();
        } catch (error) {
            console.error("Failed to submit referral:", error);
             toast({
                title: "Fehler",
                description: "Ihre Empfehlung konnte nicht gesendet werden.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full">
             <CardHeader>
                <CardTitle>Verein direkt empfehlen</CardTitle>
                <CardDescription>Geben Sie die Daten des Vereins ein, den Sie empfehlen möchten.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Ihre Daten</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="referrerName">Ihr Name</Label>
                        <Input id="referrerName" value={referrerName} onChange={(e) => setReferrerName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="referrerEmail">Ihre E-Mail</Label>
                        <Input id="referrerEmail" type="email" value={referrerEmail} onChange={(e) => setReferrerEmail(e.target.value)} />
                    </div>
                </div>
                 <h3 className="text-sm font-semibold text-muted-foreground pt-4 border-t">Daten des zu empfehlenden Vereins</h3>
                <div className="space-y-2">
                    <Label htmlFor="referredClubName">Name des Vereins</Label>
                    <Input id="referredClubName" value={referredClubName} onChange={(e) => setReferredClubName(e.target.value)} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="referredClubContact">Kontaktperson</Label>
                        <Input id="referredClubContact" value={referredClubContact} onChange={(e) => setReferredClubContact(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="referredClubEmail">Kontakt E-Mail</Label>
                        <Input id="referredClubEmail" type="email" value={referredClubEmail} onChange={(e) => setReferredClubEmail(e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="referredClubPhone">Telefon Kontakt (optional)</Label>
                    <Input id="referredClubPhone" value={referredClubPhone} onChange={(e) => setReferredClubPhone(e.target.value)} />
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                    <Send className="mr-2 h-4 w-4"/> Empfehlung senden
                </Button>
            </CardFooter>
        </Card>
    )
}
