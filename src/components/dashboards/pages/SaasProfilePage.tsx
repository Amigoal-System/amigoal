
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Bell, Shield, Save, Key, QrCode, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { generateTfaSecret, enableTfa, disableTfa, getTfaStatus } from '@/ai/flows/tfa';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const TfaSetupModal = ({ isOpen, onOpenChange, qrCodeUrl, secret, onVerify }) => {
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async () => {
        setIsLoading(true);
        const success = await onVerify(token);
        if (!success) {
            // Toast is handled in the parent component
        }
        setIsLoading(false);
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Zwei-Faktor-Authentifizierung einrichten</AlertDialogTitle>
                    <AlertDialogDescription>
                        Scannen Sie diesen QR-Code mit Ihrer Authenticator-App (z.B. Google Authenticator) und geben Sie den 6-stelligen Code ein, um die Einrichtung abzuschliessen.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4 text-center">
                    {qrCodeUrl ? (
                        <Image src={qrCodeUrl} alt="2FA QR Code" width={200} height={200} className="mx-auto" />
                    ) : (
                        <div className="h-48 w-48 bg-muted animate-pulse rounded-lg mx-auto flex items-center justify-center">
                            <Loader2 className="animate-spin" />
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">Geheimer Schlüssel: {secret}</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tfa-token">Verifizierungscode</Label>
                    <Input id="tfa-token" value={token} onChange={(e) => setToken(e.target.value)} maxLength={6} placeholder="123456"/>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleVerify} disabled={token.length !== 6 || isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Aktivieren
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default function SaasProfilePage() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isTfaEnabled, setIsTfaEnabled] = useState(false);
    const [tfaSetupData, setTfaSetupData] = useState<{ secret: string; qrCodeUrl: string } | null>(null);
    const [isTfaModalOpen, setIsTfaModalOpen] = useState(false);
    const [isLoadingTfaStatus, setIsLoadingTfaStatus] = useState(true);

    const { toast } = useToast();

    const fetchTfaStatus = useCallback(async () => {
        setIsLoadingTfaStatus(true);
        const { isTfaEnabled } = await getTfaStatus();
        setIsTfaEnabled(isTfaEnabled);
        setIsLoadingTfaStatus(false);
    }, []);

    useEffect(() => {
        fetchTfaStatus();
    }, [fetchTfaStatus]);

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            toast({ title: 'Fehler', description: 'Die neuen Passwörter stimmen nicht überein.', variant: 'destructive' });
            return;
        }
        if (newPassword.length < 6) {
             toast({ title: 'Fehler', description: 'Das neue Passwort muss mindestens 6 Zeichen lang sein.', variant: 'destructive' });
            return;
        }

        const auth = getAuth();
        const user = auth.currentUser;

        if (user && user.email) {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            try {
                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, newPassword);
                toast({
                    title: 'Erfolg!',
                    description: 'Ihr Passwort wurde erfolgreich geändert.',
                });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } catch (error) {
                console.error("Password change error:", error);
                toast({
                    title: 'Fehler beim Ändern des Passworts',
                    description: 'Bitte überprüfen Sie Ihr aktuelles Passwort.',
                    variant: 'destructive',
                });
            }
        }
    };
    
    const handleEnableTfa = async () => {
        const data = await generateTfaSecret();
        if (data) {
            setTfaSetupData(data);
            setIsTfaModalOpen(true);
        }
    }
    
    const handleDisableTfa = async () => {
        await disableTfa();
        setIsTfaEnabled(false);
        toast({ title: '2FA deaktiviert' });
    }

    const handleVerifyAndEnableTfa = async (token: string) => {
        const { success } = await enableTfa({ token });
        if (success) {
            setIsTfaEnabled(true);
            setIsTfaModalOpen(false);
            toast({ title: '2FA erfolgreich aktiviert!', className: 'bg-green-100 text-green-800' });
            return true;
        } else {
             toast({ title: 'Verifizierung fehlgeschlagen', description: 'Der Code ist ungültig. Bitte versuchen Sie es erneut.', variant: 'destructive'});
             return false;
        }
    }

    return (
        <>
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Super-Admin Profil</h1>
                    <p className="text-muted-foreground">Verwalten Sie Ihr globales Administratorenkonto.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                 <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><User />Persönliche Informationen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <p className="text-sm">Name: Super Admin</p>
                             <p className="text-sm">E-Mail: super.admin@amigoal.ch</p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Key />Passwort ändern</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentPassword">Aktuelles Passwort</Label>
                                <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">Neues Passwort</Label>
                                    <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Neues Passwort bestätigen</Label>
                                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handlePasswordChange}>
                                <Save className="mr-2 h-4 w-4"/> Neues Passwort speichern
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2"><Shield />Zwei-Faktor-Authentifizierung (2FA)</CardTitle>
                             <CardDescription>Erhöhen Sie die Sicherheit Ihres Kontos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingTfaStatus ? (
                                <Loader2 className="animate-spin" />
                            ) : isTfaEnabled ? (
                                <div className="flex items-center justify-between p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg">
                                    <p className="font-semibold">2FA ist aktiviert.</p>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">Deaktivieren</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>2FA wirklich deaktivieren?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Dies reduziert die Sicherheit Ihres Kontos erheblich.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDisableTfa}>Ja, deaktivieren</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ) : (
                                 <div className="flex items-center justify-between p-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-lg">
                                    <p className="font-semibold">2FA ist nicht aktiviert.</p>
                                    <Button onClick={handleEnableTfa} variant="secondary">Jetzt einrichten</Button>
                                 </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
        <TfaSetupModal 
            isOpen={isTfaModalOpen}
            onOpenChange={setIsTfaModalOpen}
            qrCodeUrl={tfaSetupData?.qrCodeUrl}
            secret={tfaSetupData?.secret}
            onVerify={handleVerifyAndEnableTfa}
        />
        </>
    );
};
