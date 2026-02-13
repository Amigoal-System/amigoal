'use server';
/**
 * @fileOverview Genkit flows for managing global configurations like categories and league structures.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import {
  ConfigurationSchema,
  defaultConfig,
  type Configuration,
} from './configurations.types';

const CONFIG_DOC_ID = 'structures';

// Flow to get the entire configuration document
export const getConfiguration = ai.defineFlow(
  {
    name: 'getConfiguration',
    inputSchema: z.void().optional().nullable(),
    outputSchema: ConfigurationSchema.optional(),
  },
  async () => {
    const db = await getDb();
    if (!db) {
      console.error('[getConfiguration] Firestore is not initialized.');
      throw new Error('Database service is not available.');
    }
    
    const configDocRef = db.collection('configurations').doc(CONFIG_DOC_ID);
    
    try {
        const docSnap = await configDocRef.get();

        if (docSnap.exists) {
            // Merge with default config to ensure all keys are present, preventing crashes if a key is missing in the DB
            const dbData = docSnap.data() as Partial<Configuration>;
            return {
                ...defaultConfig,
                ...dbData,
                sponsorshipPackages: dbData.sponsorshipPackages || defaultConfig.sponsorshipPackages,
                contractTypes: dbData.contractTypes || defaultConfig.contractTypes,
                rolesConfig: dbData.rolesConfig || defaultConfig.rolesConfig,
                leagueStructures: dbData.leagueStructures || defaultConfig.leagueStructures,
            };
        } else {
            console.log(`[getConfiguration] Document '${CONFIG_DOC_ID}' not found. Creating with default structure.`);
            // If the document does not exist, create it with the default config.
            await configDocRef.set(defaultConfig);
            return defaultConfig;
        }
    } catch (error: any) {
        console.error("[getConfiguration] Unhandled error fetching or creating configuration:", error);
        throw new Error(`Failed to get configuration: ${error.message}`);
    }
  }
);

// Flow to update the entire configuration document
export const updateConfiguration = ai.defineFlow(
  {
    name: 'updateConfiguration',
    inputSchema: ConfigurationSchema,
    outputSchema: z.void(),
  },
  async (configData) => {
    const db = await getDb();
    if (!db) {
      console.error('Database not initialized. Cannot update configuration.');
      throw new Error('Database service is not available.');
    }
    const configDocRef = db.collection('configurations').doc(CONFIG_DOC_ID);
    // Use set with merge: true to create the document if it doesn't exist, or update it if it does.
    // This is safer than just update().
    await configDocRef.set(configData, { merge: true });
  }
);
