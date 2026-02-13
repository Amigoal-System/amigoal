
'use server';
/**
 * @fileOverview Genkit flows for managing leads using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { LeadSchema, type Lead } from './leads.types';
import type { admin } from 'firebase-admin';
import { getRbacContext, hasModuleAccess } from '@/lib/rbac';

async function getCurrentContext() {
    return await getRbacContext();
}

// Flow to get all leads with RBAC
export const getAllLeads = ai.defineFlow(
  {
    name: 'getAllLeads',
    inputSchema: z.object({ includeArchived: z.boolean().optional() }).optional(),
    outputSchema: z.array(LeadSchema),
  },
  async (input) => {
    const context = await getCurrentContext();
    
    // RBAC: Check if user has access to Leads module (Super-Admin only)
    if (!hasModuleAccess(context.role, 'Leads')) {
      console.warn(`[getAllLeads] User ${context.email} with role ${context.role} denied access to Leads module`);
      throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, Leads anzuzeigen.");
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    try {
      let leadsCollectionRef: admin.firestore.Query = db.collection("leads");

      const snapshot = await leadsCollectionRef.orderBy('lastContact', 'desc').get();
      if (snapshot.empty) return [];
      
      const allLeads = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Lead[];
      
      if (!input?.includeArchived) {
          return allLeads.filter(lead => lead.status !== 'Archiviert');
      }

      return allLeads;
      
    } catch (error: any) {
      if (error.code === 5) {
        console.warn("[getAllLeads] 'leads' collection not found. Seeding should handle this.");
        return [];
      }
      console.error("[getAllLeads] Error fetching leads:", error);
      throw error;
    }
  }
);

// Flow to add a new lead
export const addLead = ai.defineFlow(
  {
    name: 'addLead',
    inputSchema: LeadSchema.omit({ id: true }),
    outputSchema: LeadSchema,
  },
  async (leadData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    
    const docRef = await db.collection("leads").add(leadData);
    return { id: docRef.id, ...leadData };
  }
);

// Flow to update a lead
export const updateLead = ai.defineFlow(
  {
    name: 'updateLead',
    inputSchema: LeadSchema,
    outputSchema: z.void(),
  },
  async (lead) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    const { id, ...leadData } = lead;
    if (!id) {
        throw new Error("Lead ID is required for updating.");
    }
    
    // Ensure all optional string fields default to empty string if null/undefined
    const dataToUpdate = {
        ...leadData,
        website: leadData.website || '',
        phone: leadData.phone || '',
        mobile: leadData.mobile || '',
        bestContactTime: leadData.bestContactTime || '',
        notes: leadData.notes || '',
        address: {
            street: leadData.address?.street || '',
            zip: leadData.address?.zip || '',
            city: leadData.address?.city || '',
        },
        tags: leadData.tags || [],
        history: leadData.history || [],
    };
    
    await db.collection("leads").doc(id).update(dataToUpdate);
  }
);

// Flow to delete a single lead
export const deleteLead = ai.defineFlow(
  {
    name: 'deleteLead',
    inputSchema: z.string(), // Lead ID
    outputSchema: z.void(),
  },
  async (leadId) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    await db.collection("leads").doc(leadId).delete();
  }
);

// Flow to delete multiple leads
export const deleteLeads = ai.defineFlow(
    {
        name: 'deleteLeads',
        inputSchema: z.array(z.string()), // Array of Lead IDs
        outputSchema: z.void(),
    },
    async (leadIds) => {
        const db = await getDb();
        if (!db) throw new Error("Database service is not available.");

        const batch = db.batch();
        leadIds.forEach(id => {
            const docRef = db.collection("leads").doc(id);
            batch.delete(docRef);
        });

        await batch.commit();
    }
);
