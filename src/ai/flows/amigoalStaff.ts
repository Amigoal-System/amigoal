
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getAuth, getDb } from '@/lib/firebase/server';
import { AmigoalStaffSchema, type AmigoalStaff, type HistoryItem } from './amigoalStaff.types';
import type { admin } from 'firebase-admin';
import { sendMail } from '@/services/email';
import { customAlphabet } from 'nanoid';
import { firestore } from 'firebase-admin';


// Flow to get all staff members
export const getAllStaff = ai.defineFlow(
  {
    name: 'getAllAmigoalStaff',
    inputSchema: z.string().optional().nullable(), // ownerId
    outputSchema: z.array(AmigoalStaffSchema),
  },
  async (ownerId) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    try {
      let collectionRef: admin.firestore.Query = db.collection("amigoalStaff");
      
      if (ownerId) {
        // If an ownerId is provided, filter by it.
        // For Super-Admins who see everyone, the ownerId would be null or a special value.
        // We will fetch Amigoal's own staff by checking for non-existent or null ownerId.
        if (ownerId === 'amigoal_internal') {
            collectionRef = collectionRef.where('ownerId', '==', null);
        } else {
            collectionRef = collectionRef.where('ownerId', '==', ownerId);
        }
      }

      const snapshot = await collectionRef.get();
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as AmigoalStaff[];
    } catch (error: any) {
      if (error.code === 5) {
        console.warn("[getAllStaff] 'amigoalStaff' collection not found.");
        return [];
      }
      console.error("[getAllStaff] Error fetching staff:", error);
      throw error;
    }
  }
);

// Flow to add a new staff member
export const addStaff = ai.defineFlow(
  {
    name: 'addAmigoalStaff',
    inputSchema: AmigoalStaffSchema.omit({ id: true }),
    outputSchema: AmigoalStaffSchema,
  },
  async (staffData) => {
    const db = await getDb();
    const auth = await getAuth();
    if (!db || !auth) throw new Error("Database or Auth service is not available.");
    
    // Determine if we should create an auth user (only for Amigoal's internal staff, who don't have an ownerId)
    const isInternalAmigoalStaff = !staffData.ownerId;

    const firstHistoryItem: HistoryItem = {
        date: new Date().toISOString(),
        action: 'Erstellt',
        details: 'Mitarbeiter-Profil wurde angelegt.',
        author: 'Super-Admin'
    };

    const finalStaffData = {
        ...staffData,
        history: [firstHistoryItem]
    };

    // 1. Create staff member in Firestore
    const docRef = await db.collection("amigoalStaff").add(finalStaffData);
    
    // 2. Create user in Firebase Auth and send welcome email ONLY for internal staff
    if (isInternalAmigoalStaff && staffData.email) {
        try {
            const generatePassword = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);
            const password = generatePassword();

            await auth.createUser({
                email: staffData.email,
                password: password,
                displayName: staffData.name,
                disabled: staffData.status === 'Gesperrt',
            });

            const appUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

            await sendMail({
                to: staffData.email,
                subject: `Willkommen im Amigoal Team, ${staffData.name}!`,
                html: `
                    <h1>Willkommen bei Amigoal!</h1>
                    <p>Hallo ${staffData.name},</p>
                    <p>Für Sie wurde ein Administrator-Konto auf der Amigoal-Plattform erstellt. Sie können sich ab sofort mit den folgenden Daten anmelden:</p>
                    <div style="background-color: #f5f5f5; border: 1px solid #ddd; padding: 15px; margin: 15px 0;">
                        <p><strong>Login:</strong> ${staffData.email}</p>
                        <p><strong>Initiales Passwort:</strong> ${password}</p>
                    </div>
                    <p>Bitte ändern Sie Ihr Passwort nach dem ersten Login in Ihren Profileinstellungen.</p>
                    <a href="${appUrl}" style="display: inline-block; padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Jetzt Anmelden</a>
                    <br/><br/>
                    <p>Sportliche Grüsse,</p>
                    <p>Ihr Amigoal Team</p>
                `
            });

        } catch (error: any) {
            if (error.code === 'auth/email-already-exists') {
                console.warn(`[addStaff] Auth user ${staffData.email} already exists. Skipping creation and email.`);
            } else {
                console.error(`[addStaff] Error creating auth user or sending email for ${staffData.email}:`, error);
                // Optional: Rollback Firestore document creation if auth creation fails
                await docRef.delete();
                throw new Error(`Konnte Auth-Benutzer nicht erstellen: ${error.message}`);
            }
        }
    }
    
    return { id: docRef.id, ...finalStaffData };
  }
);

// Flow to update a staff member
export const updateStaff = ai.defineFlow(
  {
    name: 'updateAmigoalStaff',
    inputSchema: AmigoalStaffSchema,
    outputSchema: z.void(),
  },
  async (staff) => {
    const db = await getDb();
    const auth = await getAuth();
    if (!db || !auth) throw new Error("Database service is not available.");
    
    const { id, ...staffData } = staff;
    if (!id) throw new Error("Staff ID is required for updating.");
    
    const docRef = db.collection("amigoalStaff").doc(id);
    const currentDoc = await docRef.get();
    
    if(!currentDoc.exists) throw new Error("Staff member not found");

    const currentData = currentDoc.data() as AmigoalStaff;
    
    // --- History Tracking ---
    const changes: string[] = [];
    Object.keys(staffData).forEach(key => {
        // Simple comparison, for nested objects this would need to be more robust
        if (JSON.stringify(staffData[key]) !== JSON.stringify(currentData[key])) {
            changes.push(`Feld '${key}' geändert.`);
        }
    });

    if (changes.length > 0) {
        const historyEntry: HistoryItem = {
            date: new Date().toISOString(),
            action: 'Aktualisiert',
            details: changes.join(' '),
            author: 'Super-Admin' // This should be dynamic based on the user making the change
        };
        staffData.history = [historyEntry, ...(staffData.history || [])];
    }
    // --- End History Tracking ---
    
    // Update auth user only if it's an internal Amigoal staff member
    if (staffData.email && !staffData.ownerId) {
        try {
            const userRecord = await auth.getUserByEmail(staffData.email);
            const shouldBeDisabled = staffData.status === 'Gesperrt';
            
            if (userRecord.disabled !== shouldBeDisabled) {
                await auth.updateUser(userRecord.uid, { disabled: shouldBeDisabled });
                console.log(`[updateStaff] User ${staffData.email} status set to disabled: ${shouldBeDisabled}`);
            }
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                console.warn(`[updateStaff] Auth user for ${staffData.email} not found. Cannot update auth status.`);
            } else {
                console.error(`[updateStaff] Error updating auth user status for ${staffData.email}:`, error);
            }
        }
    }


    await docRef.update(staffData);
  }
);

// Flow to delete a staff member
export const deleteStaff = ai.defineFlow(
  {
    name: 'deleteAmigoalStaff',
    inputSchema: z.string(), // Staff ID
    outputSchema: z.void(),
  },
  async (staffId) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    
    const docRef = db.collection("amigoalStaff").doc(staffId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
        const staffData = docSnap.data() as AmigoalStaff;
        
        // Only try to delete auth user if they are internal staff and have an email
        if (!staffData.ownerId && staffData.email) {
            const auth = await getAuth();
            if (auth) {
                 try {
                    const userRecord = await auth.getUserByEmail(staffData.email);
                    await auth.deleteUser(userRecord.uid);
                    console.log(`[deleteStaff] Successfully deleted auth user: ${staffData.email}`);
                } catch (error: any) {
                     if (error.code === 'auth/user-not-found') {
                        console.warn(`[deleteStaff] Auth user with email ${staffData.email} not found. Skipping auth deletion.`);
                     } else {
                        console.error(`[deleteStaff] Error deleting auth user ${staffData.email}:`, error);
                     }
                }
            }
        }
    }

    await docRef.delete();
  }
);
