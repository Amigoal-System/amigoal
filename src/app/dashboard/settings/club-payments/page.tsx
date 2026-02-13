'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, CreditCard, Banknote } from 'lucide-react';
import { useClub } from '@/hooks/useClub';
import { updateClub } from '@/ai/flows/clubs';
import type { Club } from '@/ai/flows/clubs.types';
import { TwintIcon } from '@/components/icons';

export default function ClubPaymentsPage() {
    const { club, isLoading: isLoadingClub, refetchClub } = useClub();
    const [paymentConfig, setPaymentConfig] = useState(club?.paymentConfig || {});
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (club) {
            setPaymentConfig(club.paymentConfig || {});
        }
    }, [club]);
    
    const handleInputChange = (field: string, value: string) => {
        setPaymentConfig(prev => ({...prev, [field]: value}));
    };

    const handleSave = async () => {
        if (!club) return;
        setIsLoading(true);
        try {
            const updatedClubData = { ...club, paymentConfig };
            await updateClub(updatedClubData as Club);
            await refetchClub();
            toast({ title: 'Zahlungseinstellungen gespeichert!' });
        } catch (error) {
            toast({ title: 'Fehler beim Speichern', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isLoadingClub) {
        return <div>Lade Vereinseinstellungen...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Zahlungseinstellungen (für Mitglieder)</CardTitle>
                <CardDescription>
                    Konfigurieren Sie hier die Zahlungsmethoden, die Ihren Mitgliedern für die Bezahlung von Beiträgen zur Verfügung stehen sollen.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Card>
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TwintIcon className="h-6 w-6"/> TWINT</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <Label htmlFor="twintLink">TWINT QR-Code Link</Label>
                        <Input 
                            id="twintLink"
                            placeholder="https://qr.twint.ch/..." 
                            value={paymentConfig.twintLink || ''}
                            onChange={e => handleInputChange('twintLink', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Fügen Sie hier den Link von Ihrem TWINT QR-Sticker ein.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-6 w-6"/> Stripe (Kreditkarten)</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <Label htmlFor="stripeAccountId">Stripe Account ID</Label>
                        <Input 
                            id="stripeAccountId"
                            placeholder="acct_..." 
                            value={paymentConfig.stripeAccountId || ''}
                            onChange={e => handleInputChange('stripeAccountId', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Verbinden Sie Ihren Stripe-Account, um Kreditkartenzahlungen zu akzeptieren.</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Banknote className="h-6 w-6"/> PayPal</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <Label htmlFor="paypalEmail">PayPal E-Mail</Label>
                        <Input 
                            id="paypalEmail"
                            type="email"
                            placeholder="ihre-paypal@email.com" 
                            value={paymentConfig.paypalEmail || ''}
                            onChange={e => handleInputChange('paypalEmail', e.target.value)}
                        />
                         <p className="text-xs text-muted-foreground">Geben Sie die E-Mail-Adresse Ihres PayPal-Kontos an.</p>
                    </CardContent>
                </Card>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                    Speichern
                </Button>
            </CardFooter>
        </Card>
    );
}
