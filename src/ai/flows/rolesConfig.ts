
'use server';
/**
 * @fileOverview Genkit flows for managing roles configuration
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { getRbacContext } from '@/lib/rbac';

const RolesConfigSchema = z.record(z.array(z.string()));

// Flow to get roles configuration
export const getRolesConfig = ai.defineFlow(
  {
    name: 'getRolesConfig',
    outputSchema: RolesConfigSchema,
  },
  async () => {
    const context = await getRbacContext();
    
    // Only Super-Admin can view roles config
    if (context.role !== 'Super-Admin') {
      throw new Error("Zugriff verweigert: Nur Super-Admin kann die Rollenkonfiguration anzeigen.");
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }

    try {
      const configDoc = await db.collection("configurations").doc("roles").get();
      
      if (configDoc.exists) {
        return configDoc.data() as Record<string, string[]>;
      }
      
      // Return default config if none exists
      return {};
    } catch (error) {
      console.error("[getRolesConfig] Error fetching roles config:", error);
      return {};
    }
  }
);

// Flow to save roles configuration
export const saveRolesConfig = ai.defineFlow(
  {
    name: 'saveRolesConfig',
    inputSchema: RolesConfigSchema,
    outputSchema: z.boolean(),
  },
  async (config) => {
    const context = await getRbacContext();
    
    // Only Super-Admin can modify roles config
    if (context.role !== 'Super-Admin') {
      console.warn(`[saveRolesConfig] User ${context.email} with role ${context.role} denied access`);
      throw new Error("Zugriff verweigert: Nur Super-Admin kann die Rollenkonfiguration ändern.");
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }

    try {
      await db.collection("configurations").doc("roles").set(config);
      console.log("[saveRolesConfig] Roles config saved successfully");
      return true;
    } catch (error) {
      console.error("[saveRolesConfig] Error saving roles config:", error);
      throw error;
    }
  }
);
