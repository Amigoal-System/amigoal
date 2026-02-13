
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { sendMail } from '@/services/email';
import { ClubSchema } from './clubs.types';
import { SponsorLeadSchema } from './sponsorLeads.types';

export const SponsorshipProposalSchema = z.object({
    clubId: z.string(),
    clubName: z.string(),
    clubContactEmail: z.string().email(),
    sponsorLeadId: z.string(),
    sponsorLeadName: z.string(),
    sponsorContactEmail: z.string().email(),
    status: z.enum(['proposed', 'accepted', 'rejected']),
    proposedAt: z.string(),
    proposedBy: z.string(),
});

export type SponsorshipProposal = z.infer<typeof SponsorshipProposalSchema>;


export const proposeSponsorshipMatch = ai.defineFlow(
  {
    name: 'proposeSponsorshipMatch',
    inputSchema: z.object({
      club: ClubSchema,
      sponsor: SponsorLeadSchema,
    }),
    outputSchema: z.void(),
  },
  async ({ club, sponsor }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const proposalData = {
        clubId: club.id!,
        clubName: club.name,
        clubContactEmail: club.contactEmail,
        sponsorLeadId: sponsor.id!,
        sponsorLeadName: sponsor.company,
        sponsorContactEmail: sponsor.email,
        status: 'proposed' as const,
        proposedAt: new Date().toISOString(),
        proposedBy: 'Super-Admin', // In a real app, this would be the current user's ID
    };

    // 1. Save the proposal to the database
    await db.collection('sponsorshipProposals').add(proposalData);

    // 2. Send email to the club
    if (club.contactEmail) {
        await sendMail({
            to: club.contactEmail,
            subject: `Neuer Sponsoring-Vorschlag für ${club.name}`,
            html: `
                <h1>Hallo ${club.manager},</h1>
                <p>Wir haben einen potenziell passenden Sponsor für Ihren Verein gefunden:</p>
                <h3>${sponsor.company}</h3>
                <p><strong>Branche:</strong> ${sponsor.industry}</p>
                <p><strong>Kontaktperson:</strong> ${sponsor.contact}</p>
                <p>Sie können diesen Vorschlag in Ihrem Amigoal-Dashboard einsehen und darauf reagieren.</p>
                <br/>
                <p>Sportliche Grüsse,</p>
                <p>Ihr Amigoal Team</p>
            `,
        });
    }
    
    // 3. Send email to the sponsor
    if(sponsor.email) {
         await sendMail({
            to: sponsor.email,
            subject: `Passender Verein auf Amigoal gefunden: ${club.name}`,
            html: `
                <h1>Hallo ${sponsor.contact},</h1>
                <p>Wir haben einen Verein gefunden, der gut zu Ihrem Sponsoring-Interesse passen könnte:</p>
                <h3>${club.name}</h3>
                <p>Der Verein ist auf der Suche nach Unterstützung und wir glauben, dass eine Partnerschaft für beide Seiten von Vorteil sein könnte.</p>
                <p>Der zuständige Vereinsmanager, ${club.manager}, wurde ebenfalls informiert und wird sich eventuell bei Ihnen melden.</p>
                <br/>
                <p>Sportliche Grüsse,</p>
                <p>Ihr Amigoal Team</p>
            `,
        });
    }

    // 4. (Future) Create In-App Notification
    // await createNotification({ ... });
  }
);
