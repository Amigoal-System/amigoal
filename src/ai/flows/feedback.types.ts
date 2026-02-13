
/**
 * @fileOverview Types for the feedback flow.
 */
import { z } from 'zod';

export const FeedbackSchema = z.object({
  id: z.string().optional(),
  memberId: z.string(),
  author: z.string(),
  date: z.string(), // ISO date string
  type: z.enum(['Feedback', 'Verwarnung']),
  description: z.string(),
  detail: z.string().optional(), // For modal view
});

export type Feedback = z.infer<typeof FeedbackSchema>;


export const initialFeedback: Feedback[] = [
    {
        id: 'feedback-1',
        memberId: 'player-101',
        author: 'Pep Guardiola',
        date: '2024-07-22',
        type: 'Feedback',
        description: 'Starke Leistung im letzten Training, weiter so!',
        detail: 'Lionel hat im letzten Training besonders durch seine Spielübersicht und seine präzisen Pässe überzeugt. Die Einstellung war vorbildlich.'
    },
    {
        id: 'feedback-2',
        memberId: 'player-101',
        author: 'Pep Guardiola',
        date: '2024-07-15',
        type: 'Verwarnung',
        description: 'Zu spät zum Training erschienen.',
        detail: 'Ist ohne Abmeldung 15 Minuten zu spät zum Training erschienen. Bei Wiederholung wird eine Busse fällig.'
    }
];
