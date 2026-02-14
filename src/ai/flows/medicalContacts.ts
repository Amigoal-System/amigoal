
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { MedicalContactSchema, type MedicalContact } from './medicalContacts.types';
import { sendMail } from '@/services/email';
import { getRbacContext, hasModuleAccess } from '@/lib/rbac';

async function getCurrentContext() {
    return await getRbacContext();
}

export const getAllMedicalContacts = ai.defineFlow(
  {
    name: 'getAllMedicalContacts',
    outputSchema: z.array(MedicalContactSchema),
  },
  async () => {
    const context = await getCurrentContext();
    
    // RBAC: Check if user has access to Medical Center module
    if (!hasModuleAccess(context.role, 'Medical Center')) {
      console.warn(`[getAllMedicalContacts] User ${context.email} with role ${context.role} denied access to Medical Center module`);
      throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, das Medical Center anzuzeigen.");
    }

    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    
    // Only Super-Admin and Club-Admins can see all medical contacts
    if (context.role !== 'Super-Admin' && context.role !== 'Club-Admin') {
        return [];
    }
    
    try {
      const snapshot = await db.collection("medicalContacts").orderBy('lastName').orderBy('firstName').get();
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as MedicalContact[];
    } catch (error: any) {
      console.error("[getAllMedicalContacts] Error fetching contacts:", error);
      return [];
    }
  }
);

// Define a schema specifically for the input, without using .omit()
const AddMedicalContactInputSchema = z.object({
    salutation: z.string().optional(),
    title: z.string().optional().nullable(),
    firstName: z.string(),
    lastName: z.string(),
    contactPerson: z.string().optional(),
    specialty: z.string(),
    address: z.object({
        street: z.string().optional(),
        zip: z.string().optional(),
        city: z.string().optional(),
    }).optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')).nullable(),
    website: z.string().url().optional().or(z.literal('')).nullable(),
    instagram: z.string().url().optional().or(z.literal('')).nullable(),
    linkedin: z.string().url().optional().or(z.literal('')).nullable(),
    facebook: z.string().url().optional().or(z.literal('')).nullable(),
    notes: z.string().optional(),
    history: z.array(z.object({ date: z.string(), user: z.string() })).optional(),
    agreements: z.string().optional(),
});


export const addMedicalContact = ai.defineFlow(
  {
    name: 'addMedicalContact',
    inputSchema: AddMedicalContactInputSchema,
    outputSchema: MedicalContactSchema,
  },
  async (contactData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    
    // Add new contact to Firestore
    const docRef = await db.collection("medicalContacts").add(contactData);
    
    // Send welcome email if an email is provided
    if (contactData.email) {
        try {
            await sendMail({
                to: contactData.email,
                subject: 'Willkommen im Amigoal Medical Network!',
                html: `
                    <h1>Herzlich Willkommen, ${contactData.salutation} ${contactData.lastName}!</h1>
                    <p>Wir freuen uns, Sie im medizinischen Netzwerk von Amigoal begrüssen zu dürfen.</p>
                    <p>Sie sind nun als Experte für das Fachgebiet <strong>${contactData.specialty}</strong> für unsere Vereine sichtbar.</p>
                    <p>Falls Sie Fragen zu unserer Partnerschaft oder den Vereinbarungen haben, zögern Sie nicht, uns zu kontaktieren.</p>
                    <br/>
                    <p>Sportliche Grüsse,</p>
                    <p>Das Amigoal Team</p>
                `
            });
        } catch (error: any) {
            console.error(`[addMedicalContact] Contact created, but failed to send welcome email to ${contactData.email}:`, error);
            // We don't throw an error here, because the main action (creating the contact) was successful.
        }
    }

    return { id: docRef.id, ...contactData } as MedicalContact;
  }
);

export const updateMedicalContact = ai.defineFlow(
  {
    name: 'updateMedicalContact',
    inputSchema: MedicalContactSchema,
    outputSchema: z.void(),
  },
  async (contact) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    const { id, ...contactData } = contact;
    if (!id) throw new Error("Contact ID is required for updating.");
    await db.collection("medicalContacts").doc(id).update(contactData);
  }
);

export const deleteMedicalContact = ai.defineFlow(
  {
    name: 'deleteMedicalContact',
    inputSchema: z.string(), // ID
    outputSchema: z.void(),
  },
  async (contactId) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    await db.collection("medicalContacts").doc(contactId).delete();
  }
);
