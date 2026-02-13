
/**
 * @fileOverview Types for the newsletter flow.
 */

import { z } from 'zod';

// Schema for a newsletter group
export const NewsletterGroupSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
  clubId: z.string(), // To associate group with a club or 'amigoal_platform' for saas
});
export type NewsletterGroup = z.infer<typeof NewsletterGroupSchema>;


// Schema for a newsletter campaign
export const NewsletterCampaignSchema = z.object({
    id: z.string().optional(),
    subject: z.string(),
    sentAt: z.string(), // ISO date string
    recipients: z.number(),
    openRate: z.number(),
    clubId: z.string(),
});
export type NewsletterCampaign = z.infer<typeof NewsletterCampaignSchema>;


// --- Mock Data for Seeding ---

export const initialSaasNewsletterGroups: Omit<NewsletterGroup, 'id'>[] = [
    {
        name: 'Alle Vereine',
        description: 'Alle registrierten Club-Admins.',
        memberIds: ['club.admin@fc-awesome.com'],
        clubId: 'amigoal_platform'
    },
    {
        name: 'Interessenten (Leads)',
        description: 'Alle Kontakte aus dem Lead-Management.',
        memberIds: ['wf@fcglattbrugg.ch', 'pk@fcunterstrass.ch'],
        clubId: 'amigoal_platform'
    },
];

export const initialClubNewsletterGroups: Omit<NewsletterGroup, 'id'>[] = [
    {
        name: 'Vorstand',
        description: 'Alle Vorstandsmitglieder.',
        memberIds: [],
        clubId: 'FC Awesome' // Example club
    },
    {
        name: 'Alle Trainer',
        description: 'Enthält alle aktiven Trainer des Vereins.',
        memberIds: [],
        clubId: 'FC Awesome'
    },
     {
        name: 'Sponsoren',
        description: 'Alle Sponsoring-Kontakte.',
        memberIds: [],
        clubId: 'FC Awesome'
    },
];
