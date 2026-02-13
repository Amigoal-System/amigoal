'use server';
/**
 * @fileOverview Genkit flows for managing commission invoices.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { CommissionInvoiceSchema, type CommissionInvoice } from './commissionInvoices.types';
import { getRbacContext, hasModuleAccess } from '@/lib/rbac';

async function getCurrentContext() {
    return await getRbacContext();
}

export const createCommissionInvoice = ai.defineFlow(
  {
    name: 'createCommissionInvoice',
    inputSchema: CommissionInvoiceSchema.omit({ id: true, createdAt: true }),
    outputSchema: CommissionInvoiceSchema,
  },
  async (invoiceData) => {
    const context = await getCurrentContext();
    
    // RBAC: Check if user has access to SaaS Invoices module
    if (!hasModuleAccess(context.role, 'SaaS Invoices')) {
      console.warn(`[createCommissionInvoice] User ${context.email} with role ${context.role} denied access to SaaS Invoices module`);
      throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, Rechnungen zu erstellen.");
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }

    const newInvoice = {
      ...invoiceData,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("commissionInvoices").add(newInvoice);
    return { id: docRef.id, ...newInvoice };
  }
);
