'use server';
/**
 * @fileOverview Genkit flows for managing sponsor leads.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { SponsorLeadSchema, type SponsorLead } from './sponsorLeads.types';
import { sendMail } from '@/services/email';

// Flow to get all sponsor leads
export const getAllSponsorLeads = ai.defineFlow(
  {
    name: 'getAllSponsorLeads',
    outputSchema: z.array(SponsorLeadSchema),
  },
  async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    try {
      const collectionRef = db.collection("sponsorLeads");
      const snapshot = await collectionRef.get();
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as SponsorLead[];
    } catch (error: any) {
      if (error.code === 5) {
        return [];
      }
      console.error("[getAllSponsorLeads] Error fetching sponsor leads:", error);
      throw error;
    }
  }
);

// Flow to add a new sponsor lead
export const addSponsorLead = ai.defineFlow(
  {
    name: 'addSponsorLead',
    inputSchema: SponsorLeadSchema.omit({ id: true }),
    outputSchema: SponsorLeadSchema,
  },
  async (leadData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    
    // 1. Save lead to Firestore
    const docRef = await db.collection("sponsorLeads").add(leadData);
    const createdLead = { id: docRef.id, ...leadData };
    
    const adminEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@amigoal.ch';
    
    const selectedPackagesHtml = leadData.packages && leadData.packages.length > 0
        ? `<li><strong>Gewählte Pakete:</strong> ${leadData.packages.join(', ')}</li>`
        : '';
        
    // 2. Notify Super-Admin
    await sendMail({
        to: adminEmail,
        subject: `Neue Sponsoring-Anfrage von ${leadData.company}`,
        html: `
            <h1>Neue Sponsoring-Anfrage</h1>
            <p>Ein potenzieller Sponsor hat Interesse gezeigt.</p>
            <h3>Details:</h3>
            <ul>
                <li><strong>Firma:</strong> ${leadData.company}</li>
                <li><strong>Kontaktperson:</strong> ${leadData.contact}</li>
                <li><strong>E-Mail:</strong> ${leadData.email}</li>
                ${selectedPackagesHtml}
                <li><strong>Interesse/Nachricht:</strong> ${leadData.interest || 'Keine'}</li>
            </ul>
        `
    });

    // 3. Send confirmation to the sponsor
    await sendMail({
        to: leadData.email,
        subject: `Ihre Sponsoring-Anfrage bei Amigoal`,
        html: `
            <h1>Anfrage erhalten!</h1>
            <p>Hallo ${leadData.contact},</p>
            <p>vielen Dank für Ihr Interesse an Sponsoring-Möglichkeiten bei Amigoal. Wir haben Ihre Anfrage für <strong>${leadData.company}</strong> erhalten.</p>
            <p>Unser Team wird sich in Kürze mit passenden Angeboten und Informationen bei Ihnen melden.</p>
            <br/>
            <p>Sportliche Grüsse,</p>
            <p>Ihr Amigoal Team</p>
        `
    });

    return createdLead;
  }
);
