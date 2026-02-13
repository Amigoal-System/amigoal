'use client';

import React, { useState, useEffect } from 'react';
import { NavHeader } from '@/components/ui/nav-header';
import { SiteFooter } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Ticket, Calendar, Clock, Home, Users, CheckCircle, Minus, Plus, Loader2, CreditCard } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { AmigoalLogo, TwintIcon } from '@/components/icons';
import { usePublicMatches } from '@/hooks/usePublicMatches';
import type { Club } from '@/ai/flows/clubs.types';
import { Separator } from '../separator';


const PaymentButton = ({ method, onClick, children, ...props }) => {
    return (
        <Button onClick={() => onClick(method)} className="w-full justify-start h-14" {...props}>
            {children}
        </Button>
    )
}


const TicketPurchaseModal = ({ match, club, isOpen, onOpenChange }) => {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [tickets, setTickets] = useState({ stehplatz: 1, sitzplatz: 0, vip: 0 });
    const prices = { stehplatz: 20, sitzplatz: 40, vip: 100 };
    const total = tickets.stehplatz * prices.stehplatz + tickets.sitzplatz * prices.sitzplatz + tickets.vip * prices.vip;

    const handleTicketChange = (type: keyof typeof tickets, change: number) => {
        setTickets(prev => ({ ...prev, [type]: Math.max(0, prev[type] + change) }));
    };

    const handlePayment = (method: string) => {
        
        switch(method) {
            case 'TWINT':
                if (club.paymentConfig?.twintLink) {
                    window.open(club.paymentConfig.twintLink, '_blank');
                    setStep(2); // Simulate successful payment redirect
                } else {
                    toast({ title: "Fehler", description: "Kein TWINT-Link für diesen Anbieter konfiguriert.", variant: "destructive" });
                }
                break;
            case 'PayPal':
                 toast({ title: "Noch nicht implementiert", description: "PayPal-Zahlungen sind bald verfügbar." });
                break;
            case 'Credit Card':
                 toast({ title: "Noch nicht implementiert", description: "Kreditkartenzahlungen sind bald verfügbar." });
                 break;
            default:
                 toast({ title: "Unbekannte Zahlungsmethode", variant: "destructive"});
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(() => setStep(1), 300); // Reset after close
    }

    if (!match || !club) return null;

    const TicketCounter = ({ label, type, price }) => (
        <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
                <p className="font-semibold">{label}</p>
                <p className="text-sm text-muted-foreground">CHF {price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => handleTicketChange(type, -1)} disabled={tickets[type] === 0}><Minus className="h-4 w-4"/></Button>
                <span className="text-lg font-bold w-10 text-center">{tickets[type]}</span>
                <Button variant="outline" size="icon" onClick={() => handleTicketChange(type, 1)}><Plus className="h-4 w-4"/></Button>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                 {step === 1 ? (
                    <>
                         <DialogHeader>
                            <DialogTitle>Tickets kaufen: {match.homeTeam} vs {match.awayTeam}</DialogTitle>
                         </DialogHeader>
                        <div className="py-4 space-y-4">
                            <TicketCounter label="Stehplatz" type="stehplatz" price={prices.stehplatz} />
                            <TicketCounter label="Sitzplatz" type="sitzplatz" price={prices.sitzplatz} />
                            <TicketCounter label="VIP" type="vip" price={prices.vip} />
                             <Separator />
                            <div className="text-xl font-bold text-right w-full">
                                Total: CHF {total.toFixed(2)}
                            </div>
                        </div>
                        <DialogFooter className="flex-col gap-2">
                            <p className="text-xs text-muted-foreground text-center">Wählen Sie Ihre Zahlungsmethode</p>
                             {club.country === 'CH' && club.paymentConfig?.twintLink && (
                                <PaymentButton method="TWINT" onClick={handlePayment}>
                                    <TwintIcon className="mr-4 h-6 w-6"/> Mit TWINT bezahlen
                                </PaymentButton>
                             )}
                             {club.paymentConfig?.paypalEmail && (
                                <PaymentButton method="PayPal" onClick={handlePayment}>
                                    <svg className="w-6 h-6 mr-4" viewBox="0 0 24 24"><path fill="#003087" d="M7.1,16.2l-1.6-9.3H10l-0.7,3.9c0.2-0.1,0.5-0.2,0.8-0.2c2.9,0,5.2,2.3,5.2,5.2c0,2.9-2.3,5.2-5.2,5.2 c-2.1,0-3.9-1.2-4.7-3L7.1,16.2z M10.4,15.6c0.1,1.5,1.4,2.7,2.9,2.7c1.6,0,2.9-1.3,2.9-2.9c0-1.6-1.3-2.9-2.9-2.9 c-0.9,0-1.7,0.4-2.2,1.1L10.4,15.6z"></path><path fill="#009cde" d="M19.3,7.9h-4.3c-0.4,0-0.7,0.3-0.8,0.7L13,12.5c-0.1,0.7,0.4,1.3,1.1,1.3h2.4c0.4,0,0.7-0.3,0.8-0.7l0.7-3.9 C18.1,8.5,18.5,8.1,19,8.1h0.3c0.4,0,0.7-0.3,0.7-0.7v-0.1C20,7.9,19.7,7.9,19.3,7.9z"></path><path fill="#002f86" d="M6.3,6.9L7.9,16.2c0.1,0.4,0.4,0.7,0.9,0.7l-0.2-1.1c-0.1-0.7,0.4-1.3,1.1-1.3c0.5-0.7,1.3-1.1,2.2-1.1 c1.6,0,2.9,1.3,2.9,2.9c0,1.6-1.3,2.9-2.9,2.9c-1.5,0-2.8-1.2-2.9-2.7L6.3,6.9H1.8C1.4,6.9,1.1,7.2,1,7.6L0,12.8 C0,13.2,0.3,13.5,0.7,13.5h4l1.1-6.6H6.3z"></path></svg>
                                    Mit PayPal bezahlen
                                </PaymentButton>
                             )}
                              {club.paymentConfig?.stripeAccountId && (
                                <PaymentButton method="Credit Card" onClick={handlePayment}>
                                    <CreditCard className="mr-4 h-6 w-6"/> Mit Kreditkarte bezahlen
                                </PaymentButton>
                             )}
                        </DialogFooter>
                    </>
                ) : (
                    <div className="text-center py-10">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4"/>
                        <h3 className="text-xl font-bold">Zahlung erfolgreich!</h3>
                        <p className="text-muted-foreground mt-2">Ihre Tickets wurden an Ihre E-Mail-Adresse gesendet.</p>
                        <Button className="mt-6" onClick={handleClose}>Schliessen</Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default function TicketShopPage() {
    const [showLogin, setShowLogin] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { publicMatches, isLoading } = usePublicMatches();

    const handleBuyTickets = (match, club) => {
        setSelectedMatch({ ...match, club });
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-muted/20">
            <NavHeader onLoginClick={() => setShowLogin(true)} />

            <header className="relative pt-40 pb-20 bg-gradient-to-b from-primary/10 to-muted/20 text-center">
                <div className="container mx-auto max-w-5xl px-4">
                    <Ticket className="mx-auto h-16 w-16 text-primary mb-4" />
                    <h1 className="text-5xl md:text-6xl font-bold font-headline mb-4">Ticket-Shop</h1>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        Sichern Sie sich Ihre Plätze für die nächsten Heimspiele und unterstützen Sie Ihren Verein live im Stadion.
                    </p>
                </div>
            </header>

            <main className="py-24">
                <div className="container mx-auto max-w-5xl px-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="ml-2">Lade verfügbare Spiele...</p>
                        </div>
                    ) : publicMatches.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {publicMatches.map(({ match, club }) => (
                                <Card key={match.id} className="flex flex-col">
                                    <CardHeader>
                                        <div className="flex justify-around items-center text-center">
                                            <div className="w-24">
                                                <Image src={club.logo || "https://placehold.co/80x80.png"} alt={match.homeTeam} width={64} height={64} className="mx-auto" />
                                                <p className="font-bold mt-2">{match.homeTeam}</p>
                                            </div>
                                            <span className="text-2xl font-light text-muted-foreground">vs</span>
                                            <div className="w-24">
                                                <div className="w-16 h-16 bg-muted rounded-full mx-auto" />
                                                <p className="font-bold mt-2">{match.awayTeam}</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 space-y-3 text-sm">
                                        <p className="font-semibold text-center">{match.competition}</p>
                                        <div className="pt-2 border-t">
                                            <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground"/> {new Date(match.date).toLocaleDateString('de-CH', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
                                            <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground"/> {match.time} Uhr</p>
                                            <p className="flex items-center gap-2"><Home className="h-4 w-4 text-muted-foreground"/> {match.location}</p>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full" onClick={() => handleBuyTickets(match, club)}>
                                            <Ticket className="mr-2 h-4 w-4" /> Tickets kaufen
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center text-muted-foreground">
                            <p>Aktuell sind keine Tickets verfügbar.</p>
                        </div>
                    )}
                </div>
            </main>

            <SiteFooter onLoginClick={() => setShowLogin(true)} />
            
            <TicketPurchaseModal
                match={selectedMatch}
                club={selectedMatch?.club}
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </div>
    );
}
