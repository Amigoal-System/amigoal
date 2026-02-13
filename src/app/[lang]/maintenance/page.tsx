
'use client';

import { AmigoalLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hammer } from 'lucide-react';
import React from 'react';

export default function MaintenancePage() {
    return (
        <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
            <Card className="max-w-xl w-full text-center">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 text-primary w-fit p-4 rounded-full mb-4">
                        <Hammer className="h-10 w-10" />
                    </div>
                    <CardTitle className="text-3xl font-bold font-headline">Wir sind bald wieder da!</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground">
                        Amigoal wird gerade gewartet, um Ihr Erlebnis zu verbessern.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>
                        Wir arbeiten hart daran, die Plattform noch besser zu machen. Wir entschuldigen uns für die Unannehmlichkeiten und danken für Ihre Geduld.
                    </p>
                    <div className="mt-8">
                        <p className="text-sm text-muted-foreground">Benötigen Sie dringende Hilfe?</p>
                        <Button asChild variant="link">
                            <a href="mailto:info@amigoal.ch">Kontaktieren Sie den Support: info@amigoal.ch</a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
