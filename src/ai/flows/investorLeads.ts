
'use server';
/**
 * @fileOverview Genkit flows for managing investor leads.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { InvestorLeadSchema, type InvestorLead, type HistoryItem } from './investorLeads.types';
import { sendMail } from '@/services/email';
import { firestore } from 'firebase-admin';
import type firebaseAdmin from 'firebase-admin';

// Flow to get all investor leads
export const getAllInvestorLeads = ai.defineFlow(
  {
    name: 'getAllInvestorLeads',
    inputSchema: z.object({ includeArchived: z.boolean().optional() }).optional(),
    outputSchema: z.array(InvestorLeadSchema),
  },
  async (input) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    try {
      let collectionRef: firebaseAdmin.firestore.Query = db.collection("investorLeads");

      if (!input?.includeArchived) {
          collectionRef = collectionRef.where('status', '!=', 'Archiviert');
      }

      const snapshot = await collectionRef.orderBy('createdAt', 'desc').get();
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as InvestorLead[];
    } catch (error: any) {
      if (error.code === 5) { // Collection not found
        console.warn("[getAllInvestorLeads] 'investorLeads' collection not found. It will be created on first add.");
        return [];
      }
      console.error("[getAllInvestorLeads] Error fetching investor leads:", error);
      throw error;
    }
  }
);

// Flow to add a new investor lead and "send" emails
export const addInvestorLead = ai.defineFlow(
  {
    name: 'addInvestorLead',
    inputSchema: InvestorLeadSchema.omit({ id: true, createdAt: true, status: true, history: true }),
    outputSchema: InvestorLeadSchema,
  },
  async (leadData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    
    // 1. Create lead document in Firestore
    const newLead: Omit<InvestorLead, 'id'> = {
        ...leadData,
        createdAt: new Date().toISOString(),
        status: 'Interessent' as const,
        history: [{
            date: new Date().toISOString(),
            text: 'Lead erstellt.'
        }],
    };

    const docRef = await db.collection("investorLeads").add(newLead);
    const createdLead = { id: docRef.id, ...newLead };

    // --- E-Mail-Versand ---
    
    // 2. Send a notification email to the admin
    await sendMail({
        to: 'info@amigoal.ch',
        subject: 'Neue Pitch Deck Anfrage',
        html: `
            <p>Sie haben einen neuen Investor-Interessenten:</p>
            <ul>
                <li><strong>Name:</strong> ${'\'\''}{leadData.name}</li>
                <li><strong>Firma:</strong> ${'\'\''}{leadData.company || 'N/A'}</li>
                <li><strong>E-Mail:</strong> ${'\'\''}{leadData.email}</li>
                <li><strong>Nachricht:</strong> ${'\'\''}{leadData.message || 'Keine Nachricht.'}</li>
            </ul>
        `
    });

    // 3. Send the pitch deck to the investor
    const pitchDeckUrl = "https://example.com/amigoal-pitch-deck.pdf"; // Platzhalter-URL
    await sendMail({
        to: leadData.email,
        subject: 'Ihr Exemplar des Amigoal Pitch Decks',
        html: `
            <p>Sehr geehrte/r ${'\'\''}{leadData.name},</p>
            <p>vielen Dank für Ihr Interesse an Amigoal. Wir freuen uns, unsere Vision mit Ihnen zu teilen.</p>
            <p>Hier können Sie unser Pitch Deck abrufen: <a href="${'\'\''}{pitchDeckUrl}">${'\'\''}{pitchDeckUrl}</a></p>
            <p>Wir werden uns in Kürze mit Ihnen in Verbindung setzen.</p>
            <br/>
            <p>Freundliche Grüsse,</p>
            <p>Das Amigoal Team</p>
        `
    });
    
    return createdLead as InvestorLead;
  }
);

// Flow to update an investor lead's status and add a history note
export const updateInvestorLead = ai.defineFlow(
  {
    name: 'updateInvestorLead',
    inputSchema: z.object({
        id: z.string(),
        status: z.enum(['Interessent', 'Kontaktiert', 'Präsentiert', 'Verhandlung', 'Abgeschlossen', 'Abgelehnt', 'Archiviert']),
        note: z.string().optional(),
    }),
    outputSchema: z.void(),
  },
  async ({ id, status, note }) => {
    const db = await getDb();
    if (!db) {
        throw new Error("Database service not available.");
    }
    
    const leadRef = db.collection('investorLeads').doc(id);

    const updateData: { status: string; history?: any } = { status };
    
    if (note) {
        const newHistoryItem: HistoryItem = {
            date: new Date().toISOString(),
            text: `Status geändert zu "${status}": ${note}`,
        };
        updateData.history = firestore.FieldValue.arrayUnion(newHistoryItem);
    }
    
    await leadRef.update(updateData);
  }
);
