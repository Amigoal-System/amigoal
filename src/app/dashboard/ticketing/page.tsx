
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function TicketingPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Ticketing</CardTitle>
                <CardDescription>
                    Verwalten Sie hier den Ticketverkauf für Ihre Spiele und Events.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">
                    Erstellen Sie neue Ticketkategorien, verwalten Sie Kontingente und verfolgen Sie die Verkäufe.
                </p>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Neues Ticket-Event erstellen
                </Button>
            </CardContent>
        </Card>
    );
}
