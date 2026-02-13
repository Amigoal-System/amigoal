'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Apple, Bot } from 'lucide-react';
import { AmigoalLogo } from '@/components/icons';

export default function DownloadAppPage() {
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex justify-center mb-4">
                    <AmigoalLogo className="h-20 w-20" />
                </div>
                <CardTitle className="text-center">Laden Sie die Amigoal App herunter</CardTitle>
                <CardDescription className="text-center">
                    Verwalten Sie Ihren Verein jederzeit und überall. Verfügbar für iOS und Android.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button size="lg" className="h-16 flex items-center justify-center gap-2">
                    <Apple className="h-6 w-6"/>
                    <div>
                        <p className="text-xs">Download on the</p>
                        <p className="text-lg font-semibold">App Store</p>
                    </div>
                </Button>
                 <Button size="lg" className="h-16 flex items-center justify-center gap-2">
                    <Bot className="h-6 w-6"/>
                    <div>
                        <p className="text-xs">GET IT ON</p>
                        <p className="text-lg font-semibold">Google Play</p>
                    </div>
                </Button>
            </CardContent>
             <CardFooter className="flex-col gap-2 text-center text-xs text-muted-foreground">
                <p>Oder nutzen Sie unsere Progressive Web App (PWA), indem Sie die Seite zu Ihrem Startbildschirm hinzufügen.</p>
            </CardFooter>
        </Card>
    );
}
