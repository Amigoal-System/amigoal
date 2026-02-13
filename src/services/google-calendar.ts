'use server';
import { google } from 'googleapis';

const calendarId = process.env.GOOGLE_CALENDAR_ID;

const getGoogleAuth = () => {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
        throw new Error("Google Service Account-Anmeldeinformationen sind nicht in den Umgebungsvariablen festgelegt.");
    }
    
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/calendar.events'],
    });

    return auth;
};

export const createCalendarEvent = async (eventData: any) => {
    const auth = getGoogleAuth();
    const calendar = google.calendar({ version: 'v3', auth });

    try {
        const event = await calendar.events.insert({
            calendarId: calendarId,
            requestBody: eventData,
            conferenceDataVersion: 1,
        });

        return event.data;
    } catch (error) {
        console.error('Fehler beim Erstellen des Kalenderereignisses:', error);
        throw new Error('Konnte kein Google Calendar Event erstellen.');
    }
};
