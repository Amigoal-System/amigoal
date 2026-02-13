'use client';

import React, { useState, useEffect } from 'react';
import { NavHeader } from '@/components/ui/nav-header';
import { SiteFooter } from '@/components/ui/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useEvents } from '@/hooks/useEvents';
import { EventRegistrationModal } from '@/components/ui/event-registration-modal';
import type { Event as EventType } from '@/ai/flows/events.types';

export default function PublicEventsPage() {
    const [showLogin, setShowLogin] = useState(false);
    const { events, isLoading } = useEvents();
    const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

    const handleRegisterClick = (event: EventType) => {
        setSelectedEvent(event);
        setIsRegistrationModalOpen(true);
    };

    return (
        <>
            <div className="min-h-screen bg-muted/20">
                <NavHeader onLoginClick={() => setShowLogin(true)} />

                <header className="relative pt-40 pb-20 bg-gradient-to-b from-primary/10 to-muted/20 text-center">
                    <div className="container mx-auto max-w-5xl px-4">
                        <Calendar className="mx-auto h-16 w-16 text-primary mb-4" />
                        <h1 className="text-5xl md:text-6xl font-bold font-headline mb-4">Amigoal Events</h1>
                        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                            Nehmen Sie an unseren Webinaren und Networking-Events teil, um das Beste aus Amigoal herauszuholen.
                        </p>
                    </div>
                </header>

                <main className="py-24">
                    <div className="container mx-auto max-w-4xl px-4">
                        {isLoading ? (
                            <p className="text-center">Lade Events...</p>
                        ) : (
                            <div className="space-y-8">
                                {events.map((event) => (
                                    <Card key={event.id}>
                                        <CardHeader>
                                            <CardTitle>{event.title}</CardTitle>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                                                <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4"/> {format(new Date(event.from), "eeee, dd. MMMM yyyy", { locale: de })}</div>
                                                <div className="flex items-center gap-1.5"><Clock className="h-4 w-4"/> {format(new Date(event.from), "HH:mm")} - {format(new Date(event.to), "HH:mm")} Uhr</div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-muted-foreground">{event.description}</p>
                                        </CardContent>
                                        <CardFooter>
                                            <Button onClick={() => handleRegisterClick(event)}>
                                                Jetzt anmelden <ArrowRight className="ml-2 h-4 w-4"/>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </main>

                <SiteFooter onLoginClick={() => setShowLogin(true)} />
            </div>

            <EventRegistrationModal
                isOpen={isRegistrationModalOpen}
                onOpenChange={setIsRegistrationModalOpen}
                event={selectedEvent}
            />
        </>
    );
}
