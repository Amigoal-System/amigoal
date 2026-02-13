'use server';
/**
 * @fileOverview Genkit flows for managing commission invoices.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { CommissionInvoiceSchema, type CommissionInvoice } from './commissionInvoices.types';

export const createCommissionInvoice = ai.defineFlow(
  {
    name: 'createCommissionInvoice',
    inputSchema: CommissionInvoiceSchema.omit({ id: true, createdAt: true }),
    outputSchema: CommissionInvoiceSchema,
  },
  async (invoiceData) => {
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
