
'use server';
/**
 * @fileOverview Genkit flows for managing bootcamp providers.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { ProviderSchema, type Provider } from './providers.types';

const getAllBootcampProvidersFlow = ai.defineFlow(
  {
    name: 'getAllBootcampProvidersFlow',
    outputSchema: z.array(ProviderSchema),
  },
  async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const snapshot = await db.collection('bootcampProviders').get();
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Provider[];
  }
);
export async function getAllBootcampProviders(): Promise<Provider[]> {
    return getAllBootcampProvidersFlow();
}

const addBootcampProviderFlow = ai.defineFlow(
  {
    name: 'addBootcampProviderFlow',
    inputSchema: ProviderSchema.omit({ id: true }),
    outputSchema: ProviderSchema,
  },
  async (providerData) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const docRef = await db.collection('bootcampProviders').add(providerData);
    return { id: docRef.id, ...providerData };
  }
);
export async function addBootcampProvider(providerData: Omit<Provider, 'id'>): Promise<Provider> {
    return addBootcampProviderFlow(providerData);
}


const updateBootcampProviderFlow = ai.defineFlow(
  {
    name: 'updateBootcampProviderFlow',
    inputSchema: ProviderSchema,
    outputSchema: z.void(),
  },
  async (provider) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { id, ...providerData } = provider;
    if (!id) throw new Error("ID is required for update.");
    await db.collection('bootcampProviders').doc(id).update(providerData);
  }
);
export async function updateBootcampProvider(provider: Provider): Promise<void> {
    return updateBootcampProviderFlow(provider);
}


const deleteAllBootcampProvidersFlow = ai.defineFlow({
    name: 'deleteAllBootcampProvidersFlow',
    inputSchema: z.void(),
    outputSchema: z.object({ deletedCount: z.number() }),
}, async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const snapshot = await db.collection('bootcampProviders').get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
    return { deletedCount: snapshot.size };
});
export async function deleteAllBootcampProviders(): Promise<{ deletedCount: number }> {
    return deleteAllBootcampProvidersFlow();
}
