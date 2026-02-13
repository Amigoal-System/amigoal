
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SwapyDemo } from '@/components/ui/swapy-demo';
import { Clock, Percent, ShieldCheck } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);


export default function FacilityPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-headline">Anlagen & Belegung</h1>
                <p className="text-muted-foreground">Tagesübersicht für den Platzwart</p>
            </div>
            
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Plätze in Betrieb" value="3" icon={ShieldCheck} />
                <StatCard title="Heutige Auslastung" value="85%" icon={Percent} />
                <StatCard title="Nächstes Training" value="18:30 (Team A1)" icon={Clock} />
                <StatCard title="Freie Kapazität" value="Platz 2 (ab 20:00)" icon={Clock} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Live-Belegungsplan (Heute)</CardTitle>
                    <CardDescription>
                        Verschieben Sie Teams per Drag & Drop, um die Belegung kurzfristig anzupassen.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <SwapyDemo />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
