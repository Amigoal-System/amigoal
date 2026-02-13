
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { verifyTfaToken, getTfaStatus } from '@/ai/flows/tfa';
import { useToast } from '@/hooks/use-toast';
import { AmigoalLogo } from '@/components/icons';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getFirebaseServices } from '@/firebase';

export default function TwoFactorAuthPage() {
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const { toast } = useToast();
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const check2FA = async () => {
            const status = await getTfaStatus();
            if (!status?.isTfaNeeded) {
                router.push('/de/saas-superlogin');
            }
        };
        check2FA();
        inputsRef.current[0]?.focus();
    }, [router]);

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { value } = e.target;
        if (/^[0-9]$/.test(value) || value === '') {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode.join(''));

            if (value && index < 5) {
                inputsRef.current[index + 1]?.focus();
            }
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d{1,6}$/.test(pasteData)) {
            setCode(pasteData);
            pasteData.split('').forEach((char, index) => {
                if (inputsRef.current[index]) {
                    inputsRef.current[index]!.value = char;
                }
            });
            inputsRef.current[pasteData.length -1]?.focus();
        }
    };


    const handleSubmit = async () => {
        if (code.length !== 6) {
            setError('Bitte geben Sie einen 6-stelligen Code ein.');
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const { isValid, customToken } = await verifyTfaToken({ token: code });

            if (isValid && customToken) {
                 const { auth } = getFirebaseServices();
                await signInWithCustomToken(auth, customToken);
                toast({ title: 'Anmeldung erfolgreich!' });
                router.push('/de/dashboard');
            } else {
                setError('Ungültiger oder abgelaufener Code. Bitte versuchen Sie es erneut.');
                toast({ title: 'Anmeldung fehlgeschlagen', description: 'Der eingegebene Code ist ungültig.', variant: 'destructive' });
            }
        } catch (err) {
            setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const codeArray = code.padEnd(6, ' ').split('');

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
            <Card className="max-w-md w-full">
                <CardHeader className="text-center">
                    <AmigoalLogo className="h-16 w-16 mx-auto mb-4" />
                    <CardTitle>Zwei-Faktor-Authentifizierung</CardTitle>
                    <CardDescription>
                        Bitte geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center gap-2" onPaste={handlePaste}>
                        {codeArray.map((digit, index) => (
                            <Input
                                key={index}
                                ref={(el) => (inputsRef.current[index] = el)}
                                type="text"
                                maxLength={1}
                                value={digit.trim()}
                                onChange={(e) => handleCodeChange(e, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="w-12 h-14 text-center text-2xl font-mono"
                                disabled={isLoading}
                            />
                        ))}
                    </div>
                     {error && <p className="text-destructive text-sm text-center mt-4">{error}</p>}
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleSubmit} disabled={isLoading || code.length !== 6}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Bestätigen
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
