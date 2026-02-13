
import { z } from 'zod';

export const AssociationMessageSchema = z.object({
  id: z.string().optional(),
  clubId: z.string(),
  type: z.enum(['Team-Meldung', 'Spieler-Qualifikation', 'Spielverschiebung']),
  subject: z.string(),
  date: z.string(), // ISO date string
  status: z.enum(['Bestätigt', 'In Prüfung', 'Genehmigt', 'Abgelehnt']),
});

export type AssociationMessage = z.infer<typeof AssociationMessageSchema>;

export const initialAssociationMessages: Omit<AssociationMessage, 'id'>[] = [
    {
        clubId: 'k4rGugGDcUtdnA0epIb0', // FC Albania
        type: 'Team-Meldung',
        subject: 'Anmeldung Saison 25/26 - Junioren A',
        date: '2024-06-15T00:00:00.000Z',
        status: 'Bestätigt',
    },
    {
        clubId: 'k4rGugGDcUtdnA0epIb0', // FC Albania
        type: 'Spieler-Qualifikation',
        subject: 'Antrag für Spieler A. Abrashi',
        date: '2024-07-01T00:00:00.000Z',
        status: 'In Prüfung',
    },
    {
        clubId: 'someOtherClubId', // FC Awesome
        type: 'Spielverschiebung',
        subject: 'Anfrage Spiel #12345 vs FC Rivalen',
        date: '2024-08-10T00:00:00.000Z',
        status: 'Genehmigt',
    },
];
