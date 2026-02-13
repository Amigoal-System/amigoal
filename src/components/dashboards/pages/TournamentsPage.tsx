'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { type Locale } from '@/i18n.config';
import { useTournaments } from '@/hooks/useTournaments';

export default function TournamentsPage() {
    const params = useParams();
    const router = useRouter();
    const lang = params.lang as Locale;
    const { tournaments, isLoading } = useTournaments();

    const handleCreateTournament = () => {
        // This would ideally open a creation modal. For now, we'll just log it.
        console.log("Create new tournament");
    };

    if (isLoading) {
        return <div>Lade Turniere...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Turnier-Cockpit</h1>
                    <p className="text-muted-foreground">Übersicht und Verwaltung aller anstehenden und vergangenen Turniere.</p>
                </div>
                <Button onClick={handleCreateTournament}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Neues Turnier erstellen
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map(tournament => (
                    <Card key={tournament.id}>
                        <CardHeader>
                            <CardTitle>{tournament.name}</CardTitle>
                            <CardDescription>{tournament.date}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">Status: <span className="font-semibold">{tournament.status}</span></p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href={`/${lang}/dashboard/tournaments/${tournament.id}`}>
                                    Verwalten <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
