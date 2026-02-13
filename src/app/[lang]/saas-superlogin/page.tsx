
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AmigoalLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { type Locale } from '@/i18n.config';
import { getFirebaseServices } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getTfaStatus } from '@/ai/flows/tfa';

export default function SaasSuperLoginPage() {
    const [email, setEmail] = useState('super.admin@amigoal.ch');
    const [password, setPassword] = useState('');
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const lang = params.lang as Locale;

    const handleLogin = async () => {
        if (email.toLowerCase() !== 'super.admin@amigoal.ch') {
            toast({
                title: 'Ungültiger Benutzer',
                description: 'Dieser Login-Bereich ist ausschliesslich für Super-Admins reserviert.',
                variant: 'destructive',
            });
            return;
        }

        try {
            const { auth } = getFirebaseServices();
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (user) {
                const { isTfaEnabled, isTfaNeeded } = await getTfaStatus();
                
                if (isTfaEnabled) {
                    // Don't set localStorage yet, redirect to 2FA page
                    router.push(`/${lang}/saas-2fa`);
                } else {
                    // Standard login without 2FA
                    localStorage.setItem('amigoal_email', user.email!);
                    localStorage.setItem('amigoal_active_role', 'Super-Admin');
                    localStorage.setItem('amigoal_login_identifier', user.email!);
                    router.push(`/${lang}/dashboard`);
                }
            }
        } catch (error) {
            console.error("Super-Admin login failed:", error);
            toast({
                title: "Anmeldung fehlgeschlagen",
                description: "Bitte überprüfen Sie Ihre Anmeldedaten.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
            <Card className="max-w-sm w-full">
                <CardHeader className="text-center">
                     <div className="flex justify-center mb-4">
                        <AmigoalLogo className="h-16 w-16" />
                    </div>
                    <CardTitle className="text-2xl font-headline">SaaS Super-Admin Login</CardTitle>
                    <CardDescription>
                        Anmeldung zur Verwaltung der Amigoal-Plattform.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">E-Mail</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="super.admin@amigoal.ch" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="password">Passwort</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                        />
                    </div>
                    <Button type="button" className="w-full" onClick={handleLogin}>
                        Anmelden
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
