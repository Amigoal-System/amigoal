
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAllEvents, addEvent, updateEvent, deleteEvent } from '@/ai/flows/events';
import type { Event, EventRegistration } from '@/ai/flows/events.types';
import { useTeam } from './use-team';

export const useEvents = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const { currentUserRole, clubName } = useTeam();

    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        try {
            // Pass clubId for regular users, null for super-admin to get public events
            const clubIdToFetch = currentUserRole === 'Super-Admin' ? null : clubName;
            const fetchedEvents = await getAllEvents(clubIdToFetch);
            setEvents(fetchedEvents);
        } catch (error) {
            console.error('Failed to fetch events:', error);
            toast({
                title: "Fehler beim Laden",
                description: "Die Events konnten nicht geladen werden.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast, currentUserRole, clubName]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleAddEvent = async (newEventData: Omit<Event, 'id'>) => {
        try {
            await addEvent(newEventData);
            await fetchEvents();
        } catch (error) {
            console.error('Failed to add event:', error);
            toast({ title: "Fehler beim Hinzufügen", variant: "destructive" });
        }
    };

    const handleUpdateEvent = async (updatedEvent: Event) => {
        try {
            await updateEvent(updatedEvent);
            await fetchEvents();
        } catch (error) {
            console.error('Failed to update event:', error);
            toast({ title: "Fehler beim Speichern", variant: "destructive" });
        }
    };
    
    const handleDeleteEvent = async (eventId: string) => {
        try {
            await deleteEvent(eventId);
            toast({ title: "Event gelöscht" });
            await fetchEvents();
        } catch (error) {
            console.error('Failed to delete event:', error);
            toast({ title: "Fehler beim Löschen", variant: "destructive" });
        }
    };

    return {
        events,
        isLoading,
        addEvent: handleAddEvent,
        updateEvent: handleUpdateEvent,
        deleteEvent: handleDeleteEvent,
        refetchEvents: fetchEvents,
    };
};
