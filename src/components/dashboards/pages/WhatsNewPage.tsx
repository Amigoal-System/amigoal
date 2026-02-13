'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineIcon, TimelineTitle, TimelineBody } from '@/components/ui/timeline';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, User, Users } from 'lucide-react';

const updates = [
    { date: "28. Juli 2024", title: "Rollen- & Rechtematrix", description: "Super-Admins können nun detailliert die Berechtigungen für jede Rolle auf der Plattform konfigurieren.", icon: <User />, type: "feature" },
    { date: "25. Juli 2024", title: "KI-gestützte Spielanalyse", description: "Trainer können jetzt eine KI-basierte Analyse für vergangene Spiele generieren, um Stärken, Schwächen und Trainingsvorschläge zu erhalten.", icon: <Sparkles />, type: "ai" },
    { date: "20. Juli 2024", title: "Überarbeitung des Dashboards", description: "Die Dashboards für alle Rollen wurden neu gestaltet, um eine bessere Übersicht und schnellere Navigation zu ermöglichen.", icon: <Check />, type: "improvement" },
    { date: "15. Juli 2024", title: "Fix für Mitglieder-Import", description: "Ein Fehler wurde behoben, der beim Import von CSV-Dateien mit Sonderzeichen zu Problemen führte.", type: "fix" },
];

const getTypeBadge = (type: string) => {
    switch(type) {
        case 'feature': return <Badge variant="default">Neues Feature</Badge>;
        case 'ai': return <Badge className="bg-purple-500">KI-Funktion</Badge>;
        case 'improvement': return <Badge variant="secondary">Verbesserung</Badge>;
        case 'fix': return <Badge variant="destructive">Bugfix</Badge>;
        default: return <Badge variant="outline">{type}</Badge>;
    }
}

export default function WhatsNewPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Was ist neu in Amigoal?</CardTitle>
                <CardDescription>
                    Hier finden Sie die neuesten Updates, Verbesserungen und Fehlerbehebungen der Plattform.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Timeline>
                    {updates.map((update, index) => (
                         <TimelineItem key={index}>
                            <TimelineConnector />
                            <TimelineHeader>
                                <TimelineIcon>{update.icon}</TimelineIcon>
                                <div className="flex justify-between items-center w-full">
                                    <TimelineTitle>{update.title}</TimelineTitle>
                                    {getTypeBadge(update.type)}
                                </div>
                            </TimelineHeader>
                            <TimelineBody>
                                <p className="text-sm text-muted-foreground mb-1">{update.date}</p>
                                <p className="text-sm">{update.description}</p>
                            </TimelineBody>
                        </TimelineItem>
                    ))}
                </Timeline>
            </CardContent>
        </Card>
    )
}
