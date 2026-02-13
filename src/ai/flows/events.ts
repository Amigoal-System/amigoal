
'use server';
/**
 * @fileOverview Genkit flows for managing platform events.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { EventSchema, EventRegistrationSchema, type Event } from './events.types';
import { firestore } from 'firebase-admin';
import { getRbacContext, hasModuleAccess } from '@/lib/rbac';

async function getCurrentContext() {
    return await getRbacContext();
}

// Flow to get all events for a specific context with RBAC
export const getAllEvents = ai.defineFlow(
  {
    name: 'getAllEvents',
    inputSchema: z.string().optional().nullable(), // clubId or null/undefined for super-admin public events
    outputSchema: z.array(EventSchema),
  },
  async (requestedClubId) => {
    const context = await getCurrentContext();
    
    // RBAC: Check if user has access to Events module
    if (!hasModuleAccess(context.role, 'Events')) {
      console.warn(`[getAllEvents] User ${context.email} with role ${context.role} denied access to Events module`);
      throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, Events anzuzeigen.");
    }

    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    
    try {
        let query: firestore.Query = db.collection("events");

        // RBAC: Filter by clubId for non-super-admins
        let effectiveClubId = requestedClubId;
        
        if (context.role !== 'Super-Admin') {
            if (!context.clubId) {
                return [];
            }
            effectiveClubId = context.clubId;
        }

        if (effectiveClubId) {
            // Club users see only their club's events
            query = query.where('clubId', '==', effectiveClubId);
        } else {
            // Super-admin (when clubId is null/undefined) sees only public events
            query = query.where('clubId', '==', 'public');
        }
        
        const snapshot = await query.get();
        const events = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Event[];
        
        // Sort in code to avoid composite index requirement
        return events.sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());

    } catch (error) {
        console.error("[getAllEvents] Error fetching events:", error);
        // If collection doesn't exist, it's not a critical error, just return empty.
        if ((error as any).code === 5) { 
            return [];
        }
        throw error;
    }
  }
);

// Flow to add a new event
export const addEvent = ai.defineFlow(
  {
    name: 'addEvent',
    inputSchema: EventSchema.omit({ id: true }),
    outputSchema: EventSchema,
  },
  async (eventData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");

    const docRef = await db.collection("events").add(eventData);
    return { id: docRef.id, ...eventData };
  }
);

// Flow to update an event
export const updateEvent = ai.defineFlow(
  {
    name: 'updateEvent',
    inputSchema: EventSchema,
    outputSchema: z.void(),
  },
  async (event) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");

    const { id, ...eventData } = event;
    if (!id) throw new Error("Event ID is required for updating.");
    await db.collection("events").doc(id).update(eventData);
  }
);

// Flow to delete an event
export const deleteEvent = ai.defineFlow(
  {
    name: 'deleteEvent',
    inputSchema: z.string(), // Event ID
    outputSchema: z.void(),
  },
  async (eventId) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");

    await db.collection("events").doc(eventId).delete();
  }
);

// Flow for a user to register for an event
export const registerForEvent = ai.defineFlow(
  {
    name: 'registerForEvent',
    inputSchema: z.object({
        eventId: z.string(),
        registration: EventRegistrationSchema,
    }),
    outputSchema: z.void(),
  },
  async ({ eventId, registration }) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");

    const eventRef = db.collection("events").doc(eventId);
    
    // Use FieldValue.arrayUnion to add the new registration to the attendees array.
    // This also prevents duplicate entries for the same email address if you manage it carefully.
    await eventRef.update({
        attendees: firestore.FieldValue.arrayUnion(registration)
    });

    // Optional: Send a confirmation email here
  }
);
