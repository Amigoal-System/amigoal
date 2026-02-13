'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2, CreditCard, Banknote } from 'lucide-react';
import { TwintIcon } from '@/components/icons';

export default function SaasPaymentsPage() {
    const [twintLink, setTwintLink] = useState(process.env.NEXT_PUBLIC_AMIGOAL_TWINT_LINK || '');
    const [stripeSecretKey, setStripeSecretKey] = useState('');
    const [paypalClientId, setPaypalClientId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    
    const handleSave = () => {
        setIsLoading(true);
        // In a real app, this would securely save to a backend/environment config
        console.log("Saving SaaS payment settings:", { twintLink, stripeSecretKey, paypalClientId });
        setTimeout(() => {
            toast({ title: 'Einstellungen gespeichert!' });
            setIsLoading(false);
        }, 1000);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>SaaS-Zahlungseinstellungen</CardTitle>
                <CardDescription>
                    Konfigurieren Sie hier die globalen Zahlungsmethoden, die Vereinen für die Bezahlung der Amigoal-Gebühren zur Verfügung stehen.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Card>
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TwintIcon className="h-6 w-6"/> TWINT</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <Label htmlFor="twintLink">Amigoal TWINT QR-Code Link</Label>
                        <Input 
                            id="twintLink"
                            placeholder="https://qr.twint.ch/..." 
                            value={twintLink}
                            onChange={e => setTwintLink(e.target.value)}
                        />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CreditCard className="h-6 w-6"/> Stripe (Kreditkarten)</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                        <Input 
                            id="stripeSecretKey"
                            type="password"
                            placeholder="sk_test_..." 
                            value={stripeSecretKey}
                            onChange={e => setStripeSecretKey(e.target.value)}
                        />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Banknote className="h-6 w-6"/> PayPal</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <Label htmlFor="paypalClientId">PayPal Client ID</Label>
                        <Input 
                            id="paypalClientId"
                            placeholder="AZ..." 
                            value={paypalClientId}
                            onChange={e => setPaypalClientId(e.target.value)}
                        />
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
