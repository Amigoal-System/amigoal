
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BarChart, DollarSign, Handshake, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type Locale } from '@/../i18n.config';

const sponsorshipData = [
    { name: 'Hauptsponsor 1. Mannschaft', amount: 'CHF 25\'000', status: 'Aktiv' },
    { name: 'Trikotsponsor Junioren A', amount: 'CHF 5\'000', status: 'Aktiv' },
    { name: 'Bandenwerbung Platz 1', amount: 'CHF 2\'500', status: 'Aktiv' },
];

const StatCard = ({ title, value, icon: Icon, description }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

export function SponsorDashboard() {
    const params = useParams();
    const lang = params.lang as Locale;
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Sponsoring Cockpit</h1>
            <p className="text-muted-foreground">Willkommen zurück! Hier finden Sie eine Übersicht über Ihr Sponsoring-Engagement.</p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Gesamtengagement" value="CHF 32'500" icon={DollarSign} description="Total über alle Pakete" />
                <StatCard title="Erreichte Personen" value="~15'000" icon={Users} description="Geschätzte Reichweite pro Monat" />
                <StatCard title="Aktive Pakete" value="3" icon={Handshake} description="Anzahl laufender Sponsorings" />
                <StatCard title="Performance" value="+12%" icon={BarChart} description="Reichweiten-Wachstum zum Vormonat" />
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Ihre aktiven Sponsoring-Pakete</CardTitle>
                    <CardDescription>Eine Übersicht Ihrer laufenden Engagements und deren Status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Paket</TableHead>
                                <TableHead>Betrag</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sponsorshipData.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.amount}</TableCell>
                                    <TableCell>
                                        <Badge className="bg-green-500 hover:bg-green-600">{item.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter>
                    <Button asChild variant="outline">
                        <Link href={`/${lang}/dashboard/sponsoring`}>Alle Engagements ansehen</Link>
                    </Button>
                 </CardFooter>
            </Card>

            <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <CardHeader>
                    <CardTitle>Entdecken Sie neue Möglichkeiten</CardTitle>
                    <CardDescription className="text-primary-foreground/80">Erweitern Sie Ihr Engagement und erreichen Sie neue Zielgruppen.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild variant="secondary">
                        <Link href={`/${lang}/sponsoring`}>
                            Neue Sponsoring-Pakete entdecken <ArrowRight className="ml-2 h-4 w-4"/>
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
