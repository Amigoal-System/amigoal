
'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AmigoalLogo } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Check, Star, Globe, Instagram, Facebook, Loader2, BadgeCheck, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BorderGlide, BorderGlideCard, BorderGlideContent, BorderGlideHeader, BorderGlideFooter, BorderGlideTitle, BorderGlideDescription } from '@/components/ui/border-glide';
import confetti from 'canvas-confetti';
import { getFirebaseServices } from '@/lib/firebase/client';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import PasswordField from '@/components/ui/password-field';
import { addBootcampProvider } from '@/ai/flows/bootcampProviders';
import { addTrainingCampProvider } from '@/ai/flows/trainingCampProviders';
import { sendMail } from '@/services/email';
import { validateCoupon } from '@/ai/flows/coupons';
import type { Coupon } from '@/ai/flows/coupons.types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';


const benefits = [
    "Reichweite zu tausenden von Spielern & Vereinen",
    "Einfache Verwaltung von Anmeldungen",
    "Sichere Online-Zahlungsabwicklung über Amigoal (5% pro Transaktion)",
    "Professionelle Darstellung Ihrer Camps",
    "Marketing-Unterstützung durch Amigoal (optional)"
];

const SuccessRedirectModal = ({ isOpen, onOpenChange, redirectUrl }) => {
    const [progress, setProgress] = useState(100);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            setProgress(100); // Reset on open
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev <= 0) {
                        clearInterval(interval);
                        router.push(redirectUrl);
                        return 0;
                    }
                    return prev - (100 / 300); // 3 seconds countdown (100% over 300 * 10ms ticks)
                });
            }, 10);
            return () => clearInterval(interval);
        }
    }, [isOpen, redirectUrl, router]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                 <div className="text-center py-10">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4"/>
                    <h3 className="text-xl font-bold">Registrierung erfolgreich!</h3>
                    <p className="text-muted-foreground mt-2">
                        Ihr Anbieter-Konto wurde erstellt und Ihre <strong>7-tägige Testphase</strong> hat begonnen.
                    </p>
                    <div className="mt-6 space-y-2">
                        <p className="text-sm text-muted-foreground">Sie werden weitergeleitet...</p>
                         <Progress value={100 - progress} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default function BootcampProviderRegisterPage() {
    const [formData, setFormData] = useState({
        organizationName: '',
        contactName: '',
        email: '',
        password: '',
        website: '',
        instagram: '',
        facebook: ''
    });
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const lang = params.lang;

    const providerTypeParam = searchParams.get('type') || 'bootcamp';
    const providerType = providerTypeParam.charAt(0).toUpperCase() + providerTypeParam.slice(1);
    const pageTitle = providerType === 'Bootcamp' ? 'Bootcamp-Anbieter' : providerType === 'Trainingslager' ? 'Trainingslager-Anbieter' : 'Turnier-Anbieter';
    
    const checkoutUrl = useMemo(() => {
        let path = `/${lang}/dashboard/checkout?package=provider`;
        if (appliedCoupon) {
            path += `&coupon=${appliedCoupon.code}`;
        }
        return path;
    }, [lang, appliedCoupon]);

    const basePrice = 49.00;
    const finalPrice = useMemo(() => {
        if (!appliedCoupon) return basePrice;
        if (appliedCoupon.discountType === 'percentage') {
            return basePrice * (1 - appliedCoupon.discountValue / 100);
        }
        if (appliedCoupon.discountType === 'fixed') {
            return Math.max(0, basePrice - appliedCoupon.discountValue);
        }
        return basePrice;
    }, [appliedCoupon, basePrice]);

    const handleApplyCoupon = async (codeToApply?: string) => {
        const code = codeToApply || couponCode;
        if (!code.trim()) return;

        setIsCheckingCoupon(true);
        const validCoupon = await validateCoupon({ code: code });
        if (validCoupon) {
            setAppliedCoupon(validCoupon);
            toast({ title: 'Gutschein angewendet!', description: 'Der Rabatt wird nun angezeigt.' });
        } else {
            setAppliedCoupon(null);
            toast({ title: 'Ungültiger Gutschein', description: 'Der eingegebene Code ist ungültig oder abgelaufen.', variant: 'destructive' });
        }
        setIsCheckingCoupon(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const { auth } = getFirebaseServices();

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            const providerRole = `${providerType}-Anbieter`;
            const providerFlowType = providerType as 'Bootcamp' | 'Turnier' | 'Trainingslager';

            const providerData = {
                name: formData.organizationName,
                contact: formData.contactName,
                email: formData.email,
                phone: '',
                website: formData.website || null,
                instagram: formData.instagram || null,
                facebook: formData.facebook || null,
                regions: [],
                facilities: [],
                commission: '5%',
                type: providerFlowType,
            };

            if (providerType === 'Bootcamp') {
                await addBootcampProvider(providerData);
            } else if (providerType === 'Trainingslager') {
                await addTrainingCampProvider(providerData);
            }
            
            const adminEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@amigoal.ch';
            const subjectSuffix = providerType;
            
            await sendMail({
                to: adminEmail,
                subject: `Neue Anbieter-Registrierung: ${subjectSuffix}`,
                html: `<h1>Neue Registrierung: ${formData.organizationName}</h1>...`
            });

            await sendMail({
                to: formData.email,
                subject: `Willkommen bei Amigoal als ${subjectSuffix}!`,
                html: `<h1>Hallo ${formData.contactName},</h1><p>Ihr Anbieter-Konto wurde erfolgreich erstellt.</p>...`
            });

            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 }
            });

            localStorage.setItem('amigoal_email', user.email!);
            localStorage.setItem('amigoal_active_role', providerRole);
            
            setShowSuccessModal(true);

        } catch (error: any) {
            console.error("Registration failed:", error);
            let description = "Ein unbekannter Fehler ist aufgetreten.";
            if (error.code === 'auth/email-already-in-use') {
                description = "Diese E-Mail-Adresse wird bereits verwendet.";
            } else if (error.code === 'auth/weak-password') {
                description = "Das Passwort muss mindestens 6 Zeichen lang sein.";
            } else if (error.message?.includes('Schema validation failed')) {
                description = "Die eingegebenen Daten sind ungültig. Bitte überprüfen Sie Ihre Eingaben, insbesondere die URLs.";
            }
            toast({
                title: 'Registrierung fehlgeschlagen',
                description,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    return (
        <>
            <div className="flex items-center justify-center min-h-screen bg-background p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl w-full">
                    <Card className="w-full">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <AmigoalLogo className="h-16 w-16" />
                            </div>
                            <CardTitle className="text-2xl font-headline">Als {pageTitle} registrieren</CardTitle>
                            <CardDescription>Starten Sie und präsentieren Sie Ihre Angebote der Amigoal-Community.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="organizationName">Name der Organisation / Schule</Label>
                                    <Input id="organizationName" placeholder="z.B. Elite Soccer Academy" required value={formData.organizationName} onChange={handleInputChange} disabled={isLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactName">Ihr Name</Label>
                                    <Input id="contactName" placeholder="Max Mustermann" required value={formData.contactName} onChange={handleInputChange} disabled={isLoading} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Ihre E-Mail</Label>
                                    <Input id="email" type="email" placeholder="max@example.com" required value={formData.email} onChange={handleInputChange} disabled={isLoading} />
                                </div>
                                <PasswordField 
                                    id="password"
                                    label="Passwort"
                                    placeholder="Passwort wählen..."
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full"
                                />
                                <div className="space-y-2 pt-4 border-t">
                                    <Label htmlFor="website">Website & Social Media (optional)</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                        <Input id="website" placeholder="https://..." value={formData.website} onChange={handleInputChange} disabled={isLoading} className="pl-9"/>
                                    </div>
                                    <div className="relative">
                                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                        <Input id="instagram" placeholder="https://instagram.com/..." value={formData.instagram} onChange={handleInputChange} disabled={isLoading} className="pl-9"/>
                                    </div>
                                    <div className="relative">
                                        <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                        <Input id="facebook" placeholder="https://facebook.com/..." value={formData.facebook} onChange={handleInputChange} disabled={isLoading} className="pl-9"/>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-4">
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin mr-2"/> : null}
                                    {isLoading ? 'Registriere...' : 'Kostenlose 7-Tage-Testphase starten'}
                                </Button>
                                <Button variant="link" asChild>
                                    <Link href={`/${lang}/bootcamp`}>Zurück zur Übersicht</Link>
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                    
                    <BorderGlide>
                        <BorderGlideCard>
                            <BorderGlideContent>
                                <BorderGlideHeader>
                                    <div className="flex justify-between items-center">
                                        <BorderGlideTitle>Anbieter-Paket</BorderGlideTitle>
                                        <Badge className="text-sm bg-yellow-400 text-black hover:bg-yellow-500">
                                            <Star className="mr-1.5 h-4 w-4 fill-current"/> Bestseller
                                        </Badge>
                                    </div>
                                    <BorderGlideDescription>Alles was Sie brauchen, um erfolgreich durchzustarten.</BorderGlideDescription>
                                </BorderGlideHeader>
                                <div className="flex-1 space-y-6 my-6">
                                    <div className="text-center">
                                        {appliedCoupon && <p className="text-xl font-bold line-through text-muted-foreground">CHF {basePrice.toFixed(2)}</p>}
                                        <p className="text-4xl font-bold">CHF {finalPrice.toFixed(2)}</p>
                                        <p className="text-muted-foreground">pro Monat</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="coupon-code">Gutscheincode</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="coupon-code"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="z.B. SOMMER24"
                                                disabled={isCheckingCoupon || !!appliedCoupon}
                                            />
                                            <Button onClick={() => handleApplyCoupon()} disabled={isCheckingCoupon || !!appliedCoupon}>
                                                {isCheckingCoupon ? <Loader2 className="animate-spin" /> : 'Anwenden'}
                                            </Button>
                                        </div>
                                        {appliedCoupon && (
                                            <p className="text-sm font-medium text-green-600 flex items-center gap-1.5"><BadgeCheck className="h-4 w-4"/> Gutschein "{appliedCoupon.code}" angewendet!</p>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <p className="font-semibold text-sm">Ihre Vorteile:</p>
                                        {benefits.map((benefit, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm">{benefit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <BorderGlideFooter>
                                    <p className="text-xs text-muted-foreground">Das Paket kann jederzeit gekündigt werden. Keine Mindestlaufzeit.</p>
                                </BorderGlideFooter>
                            </BorderGlideContent>
                        </BorderGlideCard>
                    </BorderGlide>
                </div>
            </div>
            <SuccessRedirectModal 
                isOpen={showSuccessModal} 
                onOpenChange={setShowSuccessModal}
                redirectUrl={`/${lang}/dashboard`}
            />
        </>
    );
}
