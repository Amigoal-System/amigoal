

'use client';

import React, { useState, useEffect } from 'react';
import { NavHeader } from '@/components/ui/nav-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { DollarSign, BarChart2, Users, Handshake, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type Locale } from '@/../i18n.config';
import Image from 'next/image';
import { SiteFooter } from '@/components/ui/footer';
import { SponsorInterestModal } from '@/components/ui/sponsor-interest-modal';
import { useSponsorTypes } from '@/hooks/useSponsorTypes';

const sponsorshipBenefits = [
    { icon: <Users className="h-6 w-6"/>, title: 'Zielgruppen-Zugang', description: 'Erreichen Sie eine engagierte Community von Fussballvereinen, Spielern und Fans.'},
    { icon: <BarChart2 className="h-6 w-6"/>, title: 'Messbare Reichweite', description: 'Verfolgen Sie die Performance Ihrer Sponsoring-Aktivitäten mit detaillierten Statistiken.'},
    { icon: <Handshake className="h-6 w-6"/>, title: 'Positive Assoziation', description: 'Verbinden Sie Ihre Marke mit den positiven Werten des Sports: Teamgeist, Leidenschaft und Erfolg.'},
];


export default function SponsoringLandingPage() {
    const params = useParams();
    const lang = params.lang as Locale;
    const [showLogin, setShowLogin] = useState(false);
    const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
    const { sponsorTypes, isLoading } = useSponsorTypes();
    
    return (
        <>
            <div className="min-h-screen bg-muted/20">
                <NavHeader onLoginClick={() => setShowLogin(true)} />
                <header className="relative pt-40 pb-20 bg-gradient-to-b from-primary/10 to-muted/20 text-center">
                    <div className="container mx-auto max-w-5xl px-4">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                            <DollarSign className="h-8 w-8" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold font-headline mb-4">Werden Sie Teil des Erfolgs</h1>
                        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        Sponsoring auf Amigoal verbindet Ihre Marke mit der Faszination Fussball. Unterstützen Sie Vereine und Talente und profitieren Sie von einer einzigartigen Reichweite.
                        </p>
                        <Button size="lg" className="mt-8" onClick={() => setIsInterestModalOpen(true)}>
                            Jetzt Sponsor werden <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    </div>
                </header>
                
                <main className="py-24">
                    <div className="container mx-auto max-w-6xl px-4 space-y-24">
                        <section className="text-center">
                            <h2 className="text-3xl font-bold mb-4">Ihre Vorteile als Sponsor</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
                                Investieren Sie in die Zukunft des Sports und profitieren Sie von zahlreichen Vorteilen.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {sponsorshipBenefits.map((benefit, i) => (
                                    <Card key={i} className="text-left">
                                        <CardHeader>
                                            <div className="p-3 rounded-md bg-primary/10 text-primary w-fit mb-2">{benefit.icon}</div>
                                            <CardTitle>{benefit.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground">{benefit.description}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                        <section>
                            <h2 className="text-3xl font-bold text-center mb-12">Unsere Sponsoring-Pakete</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {isLoading ? <p>Lade Pakete...</p> : sponsorTypes.map((pkg, i) => (
                                    <Card key={i} className="flex flex-col">
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle>{pkg.name}</CardTitle>
                                                <p className="text-xl font-bold">ab CHF {pkg.baseAmount}</p>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 space-y-3">
                                            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                                <Image src={`https://placehold.co/800x600?text=${pkg.name}`} alt={pkg.name} width={800} height={600} className="rounded-lg object-cover" />
                                            </div>
                                            <p className="text-sm text-muted-foreground">{pkg.description}</p>
                                            <ul className="space-y-2 text-sm">
                                                {pkg.benefits.map((feature, j) => (
                                                    <li key={j} className="flex items-center gap-2">
                                                        <Check className="h-4 w-4 text-green-500" />
                                                        <span className="text-muted-foreground">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                        <CardFooter>
                                            <Button className="w-full" onClick={() => setIsInterestModalOpen(true)}>Paket anfragen</Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </div>
                </main>
                <SiteFooter onLoginClick={() => setShowLogin(true)} />
            </div>
            <SponsorInterestModal isOpen={isInterestModalOpen} onOpenChange={setIsInterestModalOpen} />
        </>
    );
}
