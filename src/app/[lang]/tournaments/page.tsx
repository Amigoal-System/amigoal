
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Check, Package, ShieldQuestion, User, Globe, Trophy, Calendar, Users, BarChart } from 'lucide-react';
import { NavHeader } from '@/components/ui/nav-header';
import { useToast } from '@/hooks/use-toast';
import { useParams, useRouter } from 'next/navigation';
import { TournamentSearch } from '@/components/ui/tournament-search';
import { SiteFooter } from '@/components/ui/footer';
import TournamentFeatures from '@/components/ui/tournament-features';


export default function OrganizeTournamentPage() {
    const { toast } = useToast();
    const params = useParams();
    const lang = params.lang as string;
    const router = useRouter();
    const [showLogin, setShowLogin] = useState(false);
    
    const handleStart = () => {
        router.push(`/${lang}/register/bootcamp-provider?type=tournament`);
    };


    return (
    <div className="min-h-screen bg-muted/20">
        <NavHeader onLoginClick={() => setShowLogin(true)} />
        <header className="relative pt-40 pb-20 bg-gradient-to-b from-primary/10 to-muted/20">
            <div className="container mx-auto max-w-5xl px-4 text-center">
                <Trophy className="mx-auto h-16 w-16 text-primary mb-4" />
                <h1 className="text-5xl md:text-6xl font-bold font-headline mb-4">Organisiere dein Fussballturnier</h1>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Nutze die professionellen Werkzeuge von Amigoal, um dein nächstes Turnier einfach, effizient und unvergesslich zu gestalten.
                </p>
            </div>
        </header>

        <main className="py-24">
             <div className="container mx-auto max-w-6xl px-4 space-y-24">
                <TournamentSearch />
                <TournamentFeatures />

                <Card id="start" className="max-w-2xl mx-auto shadow-xl text-center">
                    <CardHeader>
                        <CardTitle>Bereit, dein Turnier zu starten?</CardTitle>
                        <CardDescription>Erstelle einen Account, um dein Turnier professionell zu verwalten.</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center">
                        <Button size="lg" onClick={handleStart}>
                            Als Organisator registrieren
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </main>
        <SiteFooter onLoginClick={() => setShowLogin(true)} />
    </div>
  );
}
