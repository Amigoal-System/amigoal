'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { createCalendarEvent } from '@/services/google-calendar';

const CreateGoogleMeetInputSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    startDateTime: z.string().datetime(),
    endDateTime: z.string().datetime(),
});

const CreateGoogleMeetOutputSchema = z.object({
    link: z.string().url().optional(),
    error: z.string().optional(),
});

export const createGoogleMeet = ai.defineFlow(
  {
    name: 'createGoogleMeet',
    inputSchema: CreateGoogleMeetInputSchema,
    outputSchema: CreateGoogleMeetOutputSchema,
  },
  async ({ title, description, startDateTime, endDateTime }) => {
    try {
        const event = await createCalendarEvent({
            summary: title,
            description: description || 'Von Amigoal erstelltes Event.',
            start: {
                dateTime: startDateTime,
                timeZone: 'Europe/Zurich',
            },
            end: {
                dateTime: endDateTime,
                timeZone: 'Europe/Zurich',
            },
            conferenceData: {
                createRequest: {
                    requestId: `amigoal-${Date.now()}`,
                    conferenceSolutionKey: {
                        type: 'hangoutsMeet'
                    }
                }
            }
        });

        if (event && event.hangoutLink) {
            return { link: event.hangoutLink };
        } else {
            return { error: 'Konferenz-Link konnte nicht erstellt werden.' };
        }
    } catch (error: any) {
        console.error('Error creating Google Meet link:', error);
        return { error: `Google API Fehler: ${error.message}` };
    }
  }
);
