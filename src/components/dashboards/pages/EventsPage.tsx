
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Mail, Send, Calendar, Users, User, Loader2, List, LayoutGrid } from 'lucide-react';
import { CreateEventWizard } from '@/components/CreateEventWizard';
import { CalendarWithEvents } from '@/components/ui/calendar-with-events';
import { useTeam } from '@/hooks/use-team';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useEvents } from '@/hooks/useEvents';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTrainings } from '@/hooks/useTrainings';
import { useMatches } from '@/hooks/useMatches';
import { EventDetailModal } from '@/components/ui/event-detail-modal';


const SuperAdminEventView = () => {
    const { events, addEvent, deleteEvent, isLoading } = useEvents();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid' | 'calendar'>('list');

    const handleAddEvent = (newEvent) => {
        addEvent({ ...newEvent, clubId: 'public' });
    };

    const handleDeleteEvent = (eventId: string) => {
        deleteEvent(eventId);
        setIsDetailModalOpen(false);
    }

    const handleOpenDetailModal = (event) => {
        setSelectedEvent(event);
        setIsDetailModalOpen(true);
    };

    const renderView = (eventData) => {
        if (viewMode === 'list') return <EventListView events={eventData} onRowClick={handleOpenDetailModal} />;
        if (viewMode === 'grid') return <EventGridView events={eventData} onCardClick={handleOpenDetailModal} />;
        return <div className="flex justify-center mt-4"><CalendarWithEvents events={eventData} /></div>;
    }


    return (
        <>
            <div className="flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold md:text-2xl font-headline">Plattform-Events</h1>
                        <p className="text-muted-foreground">Diese Events sind für alle oder ausgewählte Benutzer auf der Amigoal-Plattform sichtbar.</p>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Neues Plattform-Event
                        </Button>
                         <Button variant={viewMode === 'calendar' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('calendar')}><Calendar className="h-4 w-4"/></Button>
                        <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}><List className="h-4 w-4"/></Button>
                        <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}><LayoutGrid className="h-4 w-4"/></Button>
                    </div>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Anstehende Events</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {isLoading ? <p>Lade Events...</p> : (
                            renderView(events)
                         )}
                    </CardContent>
                </Card>
            </div>
            <CreateEventWizard
                isOpen={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onCreateEvent={handleAddEvent}
                context="super-admin"
            />
             {selectedEvent && (
                <EventDetailModal
                    event={selectedEvent}
                    isOpen={isDetailModalOpen}
                    onOpenChange={setIsDetailModalOpen}
                    onDelete={handleDeleteEvent}
                />
            )}
        </>
    );
};

const EventListView = ({ events, onRowClick }) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Datum & Zeit</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {events.map((event) => (
                    <TableRow key={event.id} onClick={() => onRowClick && onRowClick(event)} className={onRowClick ? "cursor-pointer" : ""}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell><Badge variant="secondary">{event.category}</Badge></TableCell>
                        <TableCell>{format(new Date(event.from), "dd.MM.yyyy HH:mm")} - {format(new Date(event.to), "HH:mm")}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

const EventGridView = ({ events, onCardClick }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(event => (
                 <Card key={event.id} onClick={() => onCardClick && onCardClick(event)} className={onCardClick ? "cursor-pointer hover:bg-muted/50" : ""}>
                    <CardHeader>
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <CardDescription>{event.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>{format(new Date(event.from), "dd.MM.yyyy HH:mm")} - {format(new Date(event.to), "HH:mm")}</p>
                    </CardContent>
                 </Card>
            ))}
        </div>
    )
}


const ClubUserEventView = () => {
    const { currentUserRole, clubName, activeTeam } = useTeam();
    const { events, isLoading: isLoadingEvents, addEvent } = useEvents();
    const { trainings, isLoading: isLoadingTrainings } = useTrainings();
    const { matches, isLoading: isLoadingMatches } = useMatches();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'calendar' | 'list' | 'grid'>('calendar');
    const canCreateEvents = ['Club-Admin', 'Manager', 'Coach'].includes(currentUserRole!);

    const allEvents = useMemo(() => {
        const mappedTrainings = (trainings || []).map(t => ({
            ...t,
            title: t.name,
            from: new Date(`${t.date}T${t.from}`).toISOString(),
            to: new Date(`${t.date}T${t.to}`).toISOString(),
            category: 'Training',
            target: { level: 'team', id: t.team },
        }));

        const mappedMatches = (matches || []).map(m => {
            const time = '15:00'; // Default time if not set
            return {
                ...m,
                title: `Spiel: vs ${m.opponent}`,
                from: new Date(`${m.date}T${time}`).toISOString(),
                to: new Date(new Date(`${m.date}T${time}`).getTime() + 90 * 60000).toISOString(),
                category: 'Spiel',
                target: { level: 'team', id: activeTeam }, // Assume match is for the active team
            };
        });

        return [...(events || []), ...mappedTrainings, ...mappedMatches];
    }, [events, trainings, matches, activeTeam]);

    const clubEvents = useMemo(() => allEvents.filter(e => e.clubId === clubName && e.target?.level === 'club'), [allEvents, clubName]);
    const teamEvents = useMemo(() => allEvents.filter(e => e.clubId === clubName && (e.target?.level === 'team' && e.target?.id === activeTeam)), [allEvents, clubName, activeTeam]);
    const individualEvents = useMemo(() => allEvents.filter(e => e.category === 'Sitzung' && e.clubId === clubName), [allEvents, clubName]);
    
    if (isLoadingEvents || isLoadingTrainings || isLoadingMatches) {
        return <div className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Lade Termine...</div>
    }
    
    const renderView = (eventData) => {
        if (viewMode === 'list') return <EventListView events={eventData} />;
        if (viewMode === 'grid') return <EventGridView events={eventData} />;
        return <div className="flex justify-center mt-4"><CalendarWithEvents events={eventData} /></div>;
    }

    return (
         <>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold md:text-2xl font-headline">Events</h1>
                    <div className="flex items-center gap-2">
                        {canCreateEvents && (
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Neues Event erstellen
                            </Button>
                        )}
                        <Button variant={viewMode === 'calendar' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('calendar')}><Calendar className="h-4 w-4"/></Button>
                        <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}><List className="h-4 w-4"/></Button>
                        <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}><LayoutGrid className="h-4 w-4"/></Button>
                    </div>
                </div>
                
                <Tabs defaultValue="team" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="club" className="gap-2"><Users className="h-4 w-4"/> Verein</TabsTrigger>
                        <TabsTrigger value="team" className="gap-2"><Users className="h-4 w-4"/> Mannschaft</TabsTrigger>
                        <TabsTrigger value="individual" className="gap-2"><User className="h-4 w-4"/> Individuell</TabsTrigger>
                    </TabsList>
                    <TabsContent value="club" className="mt-4">
                        {renderView(clubEvents)}
                    </TabsContent>
                     <TabsContent value="team" className="mt-4">
                        {renderView(teamEvents)}
                    </TabsContent>
                     <TabsContent value="individual" className="mt-4">
                        {renderView(individualEvents)}
                    </TabsContent>
                </Tabs>
            </div>
            <CreateEventWizard 
                isOpen={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onCreateEvent={(newEvent) => addEvent({...newEvent, clubId: clubName!})}
                context="club-admin"
            />
        </>
    )
}


export default function EventsPage() {
    const { currentUserRole } = useTeam();
    
    if (currentUserRole === 'Super-Admin') {
        return <SuperAdminEventView />;
    }

    return <ClubUserEventView />;
}
