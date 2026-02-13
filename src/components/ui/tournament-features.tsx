
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Users, Calendar, Trophy } from 'lucide-react';

const features = [
    { icon: <Globe className="h-6 w-6"/>, title: 'Dedizierte Turnier-Webseite', description: 'Jedes Turnier erhält eine eigene Seite mit allen Infos, Spielplänen und Resultaten.'},
    { icon: <Users className="h-6 w-6"/>, title: 'Online-Anmeldung & Bezahlung', description: 'Teams können sich einfach online anmelden und das Startgeld direkt sicher bezahlen.'},
    { icon: <Calendar className="h-6 w-6"/>, title: 'Automatischer Spielplan-Generator', description: 'Erstellen Sie faire und ausgewogene Spielpläne für Gruppenphasen und K.O.-Runden.'},
    { icon: <Trophy className="h-6 w-6"/>, title: 'Live-Resultate & Ranglisten', description: 'Erfassen Sie Resultate in Echtzeit und halten Sie alle Teilnehmer und Fans auf dem Laufenden.'},
];

const TournamentFeatures = () => {
    return (
        <section className="text-center">
            <h2 className="text-3xl font-bold mb-4">Mächtige Werkzeuge für Organisatoren</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
                Von der Anmeldung bis zur Siegerehrung - wir bieten alles, was Sie für ein erfolgreiches Turnier brauchen.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, i) => (
                    <Card key={i} className="text-left">
                        <CardHeader>
                            <div className="p-3 rounded-md bg-primary/10 text-primary w-fit mb-2">{feature.icon}</div>
                            <CardTitle>{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
};

export default TournamentFeatures;
