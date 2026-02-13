

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Trash2, CreditCard, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import confetti from 'canvas-confetti';
import { useToast } from '@/hooks/use-toast';
import { validateCoupon } from '@/ai/flows/coupons';
import type { Coupon } from '@/ai/flows/coupons.types';
import { TwintIcon } from '@/components/icons';
import { getAllClubs } from '@/ai/flows/clubs';
import type { Club } from '@/ai/flows/clubs.types';
import { BadgeCheck } from 'lucide-react';

const ProviderPackageDetails = ({ coupon, setCoupon, appliedCoupon, handleApplyCoupon, isCheckingCoupon }) => {
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

    return (
        <div>
            <h2 className="text-2xl font-bold font-headline mb-4">Zusammenfassung</h2>
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle>Anbieter-Paket</CardTitle>
                    <CardDescription>Bootcamp-Verwaltung & Reichweite</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="coupon">Coupon-Code</Label>
                        <div className="flex gap-2">
                            <Input id="coupon" placeholder="Gutscheincode eingeben" value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} />
                            <Button onClick={() => handleApplyCoupon(coupon)} disabled={isCheckingCoupon || !!appliedCoupon}>
                               {isCheckingCoupon ? <Loader2 className="animate-spin" /> : 'Anwenden'}
                            </Button>
                        </div>
                         {appliedCoupon && (
                            <p className="text-sm font-medium text-green-600 flex items-center gap-1.5"><BadgeCheck className="h-4 w-4"/> Gutschein "{appliedCoupon.code}" angewendet!</p>
                        )}
                    </div>
                    <Separator />
                    {appliedCoupon && (
                        <div className="flex justify-between font-semibold text-muted-foreground">
                            <span>Zwischentotal</span>
                            <span className="line-through">CHF {basePrice.toFixed(2)}</span>
                        </div>
                    )}
                    {appliedCoupon && (
                         <div className="flex justify-between font-semibold text-green-600">
                             <span>Rabatt ({appliedCoupon.code})</span>
                             <span>- {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : `CHF ${appliedCoupon.discountValue.toFixed(2)}`}</span>
                        </div>
                    )}
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>CHF {finalPrice.toFixed(2)} / Monat</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

const ShopCheckoutDetails = () => {
    const { items, removeItem } = useCart();
    const subtotal = items.reduce((acc, item) => {
        const price = parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
        return acc + (isNaN(price) ? 0 : price);
    }, 0);
    const shipping = items.length > 0 ? 7.00 : 0;
    const total = subtotal + shipping;
    
    return (
        <div className="space-y-6">
            <div>
                 <h2 className="text-2xl font-bold font-headline mb-4">Ihr Warenkorb ({items.length})</h2>
                 <Card>
                    <CardContent className="p-4 space-y-4">
                        {items.map((item, index) => (
                            <div key={`${'\'\'\''}{item.id}-${index}`} className="flex items-center gap-4">
                                <Image src={item.image} alt={item.name} width={80} height={80} className="rounded-md object-cover" />
                                <div className="flex-1">
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.price}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </div>
                        ))}
                         {items.length === 0 && <p className="text-center text-muted-foreground py-8">Ihr Warenkorb ist leer.</p>}
                    </CardContent>
                </Card>
            </div>
             <div>
                <h2 className="text-2xl font-bold font-headline mb-4">Zusammenfassung</h2>
                <Card className="bg-muted/50">
                    <CardContent className="p-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span>Zwischentotal</span>
                            <span>CHF {subtotal.toFixed(2)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span>Versand</span>
                            <span>CHF {shipping.toFixed(2)}</span>
                        </div>
                        <Separator/>
                        <div className="flex justify-between font-bold text-base">
                            <span>Total</span>
                            <span>CHF {total.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

const PaymentButton = ({ method, onClick, children, ...props }) => {
    return (
        <Button onClick={() => onClick(method)} className="w-full justify-start h-14" {...props}>
            {children}
        </Button>
    )
}


export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const packageType = searchParams.get('package');
    const couponFromUrl = searchParams.get('coupon');
    const lang = params.lang;
    const [coupon, setCoupon] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [club, setClub] = useState<Club | null>(null);
    const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

     useEffect(() => {
        if (couponFromUrl) {
            setCoupon(couponFromUrl);
            handleApplyCoupon(couponFromUrl);
        }
    }, [couponFromUrl]);

    const handleApplyCoupon = async (codeToApply?: string) => {
        const code = codeToApply || coupon;
        if (!code.trim()) return;
        setIsCheckingCoupon(true);
        try {
            const validCoupon = await validateCoupon({ code: code, scope: 'SaaS' });
            if (validCoupon) {
                setAppliedCoupon(validCoupon);
                toast({ title: 'Gutschein angewendet!', description: 'Der Rabatt wird bei der Abrechnung berücksichtigt.' });
            } else {
                setAppliedCoupon(null);
                toast({ title: 'Ungültiger Gutschein', description: 'Der eingegebene Code ist ungültig oder abgelaufen.', variant: 'destructive' });
            }
        } catch (error) {
            toast({ title: 'Fehler', description: 'Gutschein konnte nicht validiert werden.', variant: 'destructive'});
        } finally {
            setIsCheckingCoupon(false);
        }
    };
    
    // Fetch club data if it's a provider package checkout, as we might need payment info
    useEffect(() => {
        const fetchClubDataForPayment = async () => {
            if (packageType === 'provider') {
                // In a real app, we'd fetch the user's actual club data
                // For this demo, we'll fetch all and find one to simulate.
                const allClubs = await getAllClubs({ includeArchived: true });
                const userClub = allClubs.find(c => c.contactEmail === localStorage.getItem('amigoal_email'));
                setClub(userClub || { country: 'CH', paymentConfig: { twintLink: 'https://twint.ch' } });
            }
        };
        fetchClubDataForPayment();
    }, [packageType]);

    const handlePayment = (method: string) => {
        console.log("Processing payment...");

        // Simulate payment processing
        if (method === 'TWINT') {
            if (club?.paymentConfig?.twintLink) {
                window.open(club.paymentConfig.twintLink, '_blank');
            } else {
                 toast({ title: "TWINT nicht verfügbar", description: "Kein TWINT-Link für diesen Anbieter konfiguriert.", variant: "destructive" });
                 return;
            }
        }
        
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
        });
        
        if (packageType === 'provider') {
            localStorage.setItem('amigoal_has_bootcamp_module', 'true');
            toast({
                title: 'Paket aktiviert!',
                description: 'Ihr Anbieter-Paket ist jetzt aktiv. Sie werden weitergeleitet.',
            });
            router.push(`/${lang}/dashboard`);
        } else {
            toast({
                title: 'Bezahlung erfolgreich!',
                description: 'Ihre Bestellung wurde aufgegeben.',
            });
            router.push(`/${lang}/dashboard/shop`);
        }
    };
    
    const [step, setStep] = useState(1);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold font-headline mb-8">Kasse</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                <div className="space-y-8">
                    {packageType === 'provider' ? (
                        <ProviderPackageDetails 
                            coupon={coupon} 
                            setCoupon={setCoupon}
                            appliedCoupon={appliedCoupon}
                            handleApplyCoupon={handleApplyCoupon}
                            isCheckingCoupon={isCheckingCoupon}
                        />
                    ) : <ShopCheckoutDetails />}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Sichere Bezahlung</CardTitle>
                        <CardDescription>Geben Sie Ihre Zahlungsdetails ein.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {club?.country === 'CH' && (
                          <PaymentButton method="TWINT" onClick={handlePayment}>
                              <TwintIcon className="mr-4 h-6 w-6"/> Mit TWINT bezahlen
                          </PaymentButton>
                       )}
                       {club?.paymentConfig?.paypalEmail && (
                          <PaymentButton method="PayPal" onClick={handlePayment}>
                              <svg className="w-6 h-6 mr-4" viewBox="0 0 24 24"><path fill="#003087" d="M7.1,16.2l-1.6-9.3H10l-0.7,3.9c0.2-0.1,0.5-0.2,0.8-0.2c2.9,0,5.2,2.3,5.2,5.2c0,2.9-2.3,5.2-5.2,5.2 c-2.1,0-3.9-1.2-4.7-3L7.1,16.2z M10.4,15.6c0.1,1.5,1.4,2.7,2.9,2.7c1.6,0,2.9-1.3,2.9-2.9c0-1.6-1.3-2.9-2.9-2.9 c-0.9,0-1.7,0.4-2.2,1.1L10.4,15.6z"></path><path fill="#009cde" d="M19.3,7.9h-4.3c-0.4,0-0.7,0.3-0.8,0.7L13,12.5c-0.1,0.7,0.4,1.3,1.1,1.3h2.4c0.4,0,0.7-0.3,0.8-0.7l0.7-3.9 C18.1,8.5,18.5,8.1,19,8.1h0.3c0.4,0,0.7-0.3,0.7-0.7v-0.1C20,7.9,19.7,7.9,19.3,7.9z"></path><path fill="#002f86" d="M6.3,6.9L7.9,16.2c0.1,0.4,0.4,0.7,0.9,0.7l-0.2-1.1c-0.1-0.7,0.4-1.3,1.1-1.3c0.5-0.7,1.3-1.1,2.2-1.1 c1.6,0,2.9,1.3,2.9,2.9c0,1.6-1.3,2.9-2.9,2.9c-1.5,0-2.8-1.2-2.9-2.7L6.3,6.9H1.8C1.4,6.9,1.1,7.2,1,7.6L0,12.8 C0,13.2,0.3,13.5,0.7,13.5h4l1.1-6.6H6.3z"></path></svg>
                              Mit PayPal bezahlen
                          </PaymentButton>
                       )}
                              {club?.paymentConfig?.stripeAccountId && (
                                <PaymentButton method="Credit Card" onClick={handlePayment}>
                                    <CreditCard className="mr-4 h-6 w-6"/> Mit Kreditkarte bezahlen
                                </PaymentButton>
                             )}
                       {/* Fallback if no payment methods are configured */}
                       {(!club || (!club.paymentConfig?.twintLink && !club.paymentConfig?.paypalEmail && !club.paymentConfig?.stripeAccountId)) && (
                           <p className="text-sm text-muted-foreground text-center">Keine Online-Zahlungsmethoden für diesen Anbieter konfiguriert. Bitte kontaktieren Sie den Veranstalter.</p>
                       )}
                    </CardContent>
                    <CardFooter>
                         <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Lock className="h-3 w-3"/> Sichere Zahlung.
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
