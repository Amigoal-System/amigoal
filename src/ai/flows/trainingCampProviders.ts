
'use server';
/**
 * @fileOverview Genkit flows for managing training camp providers.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { ProviderSchema, type Provider } from './providers.types';

const getAllTrainingCampProvidersFlow = ai.defineFlow(
  {
    name: 'getAllTrainingCampProvidersFlow',
    outputSchema: z.array(ProviderSchema),
  },
  async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const snapshot = await db.collection('trainingCampProviders').get();
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Provider[];
  }
);
export async function getAllTrainingCampProviders(): Promise<Provider[]> {
    return getAllTrainingCampProvidersFlow();
}

const addTrainingCampProviderFlow = ai.defineFlow(
  {
    name: 'addTrainingCampProviderFlow',
    inputSchema: ProviderSchema.omit({ id: true }),
    outputSchema: ProviderSchema,
  },
  async (providerData) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const docRef = await db.collection('trainingCampProviders').add(providerData);
    return { id: docRef.id, ...providerData };
  }
);
export async function addTrainingCampProvider(providerData: Omit<Provider, 'id'>): Promise<Provider> {
    return addTrainingCampProviderFlow(providerData);
}

const updateTrainingCampProviderFlow = ai.defineFlow(
  {
    name: 'updateTrainingCampProviderFlow',
    inputSchema: ProviderSchema,
    outputSchema: z.void(),
  },
  async (provider) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...providerData } = provider;
    if (!id) throw new Error("ID is required for update.");
    await db.collection('trainingCampProviders').doc(id).update(providerData);
  }
);
export async function updateTrainingCampProvider(provider: Provider): Promise<void> {
    return updateTrainingCampProviderFlow(provider);
}


const deleteAllTrainingCampProvidersFlow = ai.defineFlow({
    name: 'deleteAllTrainingCampProvidersFlow',
    inputSchema: z.void(),
    outputSchema: z.object({ deletedCount: z.number() }),
}, async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const snapshot = await db.collection('trainingCampProviders').get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    return { deletedCount: snapshot.size };
});
export async function deleteAllTrainingCampProviders(): Promise<{ deletedCount: number }> {
    return deleteAllTrainingCampProvidersFlow();
}
