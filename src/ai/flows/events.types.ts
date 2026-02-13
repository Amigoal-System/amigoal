
/**
 * @fileOverview Types for the events flow.
 */
import { z } from 'zod';

export const EventRegistrationSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  status: z.enum(['Zusage', 'Absage', 'Ausstehend']),
});
export type EventRegistration = z.infer<typeof EventRegistrationSchema>;

const TargetObjectSchema = z.object({
  level: z.enum(['public', 'club', 'team']),
  id: z.string().optional(),
});

// This transform ensures that when data is parsed, it's always converted to the object structure for consistency in the app.
// It accepts either a string OR an object, making it backwards-compatible and flexible.
const TargetSchema = z.union([z.string(), TargetObjectSchema]).transform((val) => {
    if (typeof val === 'string') {
        if (val.startsWith('team:')) {
            return { level: 'team', id: val.split(':')[1] };
        }
        return { level: val as 'public' | 'club' };
    }
    return val;
});


export const EventSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  locationType: z.enum(['physical', 'online']).optional().default('physical'),
  from: z.string(), // ISO String
  to: z.string(),   // ISO String
  category: z.string(),
  attendees: z.array(EventRegistrationSchema).optional(), // Array of registrations
  clubId: z.string(), // ID of the club this event belongs to or 'public'
  target: TargetSchema.optional(),
});
export type Event = z.infer<typeof EventSchema>;

export const initialEvents: Event[] = [
    { id: '1', title: "Webinar: Neue Features Q3", description: "Vorstellung der neuen KI-Funktionen und des überarbeiteten Dashboards.", location: "https://meet.google.com/xyz-abc-def", locationType: 'online', from: new Date(2024, 8, 5, 18, 0).toISOString(), to: new Date(2024, 8, 5, 19, 0).toISOString(), category: 'Webinar', attendees: [], clubId: 'public', target: { level: 'public' } },
    { id: '2', title: "Geplante Wartung", description: "Kurze Wartungsarbeiten an der Datenbank-Infrastruktur.", location: "N/A", locationType: 'online', from: new Date(2024, 8, 10, 2, 0).toISOString(), to: new Date(2024, 8, 10, 4, 0).toISOString(), category: 'Wartung', attendees: [], clubId: 'public', target: { level: 'public' } },
    { id: '3', title: "Sponsoren-Apéro", description: "Exklusives Networking-Event für unsere Top-Sponsoren und Partner.", location: "Clubhaus Amigoal", locationType: 'physical', from: new Date(2024, 9, 15, 17, 30).toISOString(), to: new Date(2024, 9, 15, 20, 0).toISOString(), category: 'Networking', attendees: [], clubId: 'public', target: { level: 'public' } },
];
