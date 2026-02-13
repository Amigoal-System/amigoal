'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Gift, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TokenizationPage() {
    // Mock data, in a real app this would come from a user-specific data source.
    const tokenBalance = 1350;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">AMIGO Token Wallet</h1>
                    <p className="text-muted-foreground">Verdienen, verwalten und lösen Sie Ihre Vereinstreue-Tokens ein.</p>
                </div>
            </div>

            <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Coins />
                        Ihr aktuelles Guthaben
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-5xl font-bold">{tokenBalance.toLocaleString('de-CH')} AMIGO</p>
                </CardContent>
                <CardFooter>
                    <p className="text-xs opacity-80">Tokens werden für Engagement im Verein gutgeschrieben (z.B. hohe Trainingspräsenz).</p>
                </CardFooter>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Prämien-Katalog</CardTitle>
                    <CardDescription>
                        Entdecken Sie exklusive Prämien, die Sie mit Ihren AMIGO-Tokens einlösen können.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <p className="text-muted-foreground">Stöbern Sie durch exklusive Artikel, Gutscheine unserer Sponsoren oder einmalige Erlebnisse.</p>
                </CardContent>
                <CardFooter>
                     <Button asChild>
                        <Link href="/de/dashboard/token-catalog">
                            Zum Prämienkatalog <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
