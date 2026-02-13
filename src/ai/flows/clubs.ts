

'use server';
/**
 * @fileOverview Genkit flows for managing clubs using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getAuth, getDb } from '@/lib/firebase/server';
import { ClubSchema, type Club } from './clubs.types';
import type { admin } from 'firebase-admin';
import { sendMail } from '@/services/email';
import { customAlphabet } from 'nanoid';
import { addAmigoalContract } from './amigoalContracts';
import { getRbacContext, hasModuleAccess } from '@/lib/rbac';

async function getCurrentContext() {
    return await getRbacContext();
}

// Flow to get all clubs with RBAC
export const getAllClubs = ai.defineFlow(
  {
    name: 'getAllClubs',
    inputSchema: z.object({ includeArchived: z.boolean().optional() }).optional().nullable(),
    outputSchema: z.array(ClubSchema),
  },
  async (input) => {
    const context = await getCurrentContext();
    
    // RBAC: Check if user has access to Clubs module (only Super-Admin and Club-Admin)
    if (!hasModuleAccess(context.role, 'Vereine')) {
      console.warn(`[getAllClubs] User ${context.email} with role ${context.role} denied access to Clubs module`);
      throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, Vereine anzuzeigen.");
    }

    const db = await getDb();
    if (!db) {
        console.error("[getAllClubs] Firestore is not initialized. Check your server configuration.");
        throw new Error("Database service is not available.");
    }
    try {
        let clubsCollectionRef: admin.firestore.Query<admin.firestore.DocumentData> = db.collection("clubs");

        const snapshot = await clubsCollectionRef.get();
        if (snapshot.empty) {
            return [];
        }

        const clubs: Club[] = [];
        const updateBatch = db.batch();
        let hasUpdates = false;

        snapshot.docs.forEach(doc => {
            const data = doc.data() as Club;
            // --- DATA MIGRATION ---
            // If a club is missing the 'country' field, default it to 'CH' and update the document.
            if (!data.country) {
                console.warn(`[Data Migration] Club "${data.name}" (ID: ${doc.id}) is missing 'country' field. Defaulting to 'CH'.`);
                const updatedData = { ...data, country: 'CH', id: doc.id };
                clubs.push(updatedData);
                const docRef = db.collection("clubs").doc(doc.id);
                updateBatch.update(docRef, { country: 'CH' });
                hasUpdates = true;
            } else {
                clubs.push({ ...data, id: doc.id });
            }
        });

        // Commit updates if any were made
        if (hasUpdates) {
            console.log("[Data Migration] Applying updates for clubs missing the 'country' field...");
            await updateBatch.commit();
            console.log("[Data Migration] ✅ Updates applied successfully.");
        }

        // Now filter based on the input, after ensuring data integrity
        if (!input?.includeArchived) {
             return clubs.filter(club => club.status === 'active');
        }

        return clubs;

    } catch (error: any) {
        if (error.code === 5) { // NOT_FOUND
             console.error("[getAllClubs] Firestore collection 'clubs' not found. This likely means the database hasn't been created or is not available.");
             throw new Error("The 'clubs' collection does not exist in Firestore. Please create it or check permissions.");
        }
        console.error("[getAllClubs] Error fetching clubs:", error);
        throw error; // Re-throw other errors
    }
  }
);

// Flow to add a new club and its admin user
export const addClub = ai.defineFlow(
  {
    name: 'addClub',
    inputSchema: ClubSchema.omit({ id: true }),
    outputSchema: ClubSchema.optional(),
  },
  async (clubData) => {
    const db = await getDb();
    const auth = await getAuth();

    if (!db || !auth) {
        console.error("Database or Auth service not initialized. Cannot add club.");
        throw new Error("Database or Auth service is not available.");
    }
    
    // Set default contract end date to one year from now
    const contractEndDate = new Date();
    contractEndDate.setFullYear(contractEndDate.getFullYear() + 1);

    // 1. Create club in Firestore with active status and default package/contract
    const finalClubData = {
      ...clubData,
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      memberCount: 0,
      package: clubData.package || 'Pro', // Default to 'Pro' if not specified
      contractEnd: clubData.contractEnd || contractEndDate.toISOString(),
      country: clubData.country || 'CH', // Ensure country is set
    };

    let createdClub: Club | undefined;
    try {
      const clubsCollectionRef = db.collection("clubs");
      const docRef = await clubsCollectionRef.add(finalClubData);
      createdClub = { 
        id: docRef.id, 
        ...finalClubData,
      };
    } catch (error: any) {
       if (error.code === 5) { 
            console.error("[addClub] Firestore collection 'clubs' not found. This is a critical error, please check database setup.");
            throw new Error("The 'clubs' collection could not be found. Please ensure Firestore is set up correctly.");
        }
        console.error("[addClub] Error adding club to Firestore:", error);
        throw error;
    }

    // 2. Automatically create a SaaS contract for the new club
    if (createdClub && createdClub.id) {
        try {
            await addAmigoalContract({
                partnerId: createdClub.id,
                partnerName: createdClub.name,
                partnerType: 'Club',
                contractType: `SaaS Abo ${createdClub.package || 'Pro'}`,
                startDate: new Date().toISOString().split('T')[0],
                endDate: (createdClub.contractEnd || contractEndDate.toISOString()).split('T')[0],
                status: 'Draft',
                monthlyFee: clubData.package === 'Basis' ? 49 : 99,
                notes: 'Automatisch bei Club-Erstellung generiert.',
            });
            console.log(`[addClub] Successfully created SaaS contract for ${createdClub.name}`);
        } catch (contractError) {
            console.error(`[addClub] Failed to create SaaS contract for ${createdClub.name}:`, contractError);
            // We don't throw an error here, as the club creation was successful.
            // This could be logged for manual intervention.
        }
    }


    // 3. Create club admin user in Firebase Auth and send welcome email
    if (clubData.contactEmail) {
        try {
            // Generate a random password
            const generatePassword = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);
            const password = generatePassword();
            
            await auth.createUser({
                email: clubData.contactEmail,
                password: password,
                displayName: clubData.manager,
            });

            const appUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            
            // Send welcome email with credentials
            await sendMail({
                to: clubData.contactEmail,
                subject: `Willkommen bei Amigoal, ${clubData.manager}!`,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                        <div style="background-color: #4285F4; color: white; padding: 20px; text-align: center;">
                            <h1 style="margin: 0; font-size: 24px;">Herzlich Willkommen bei Amigoal!</h1>
                        </div>
                        <div style="padding: 30px 20px;">
                            <p>Hallo ${clubData.manager},</p>
                            <p>der Verein <strong>${clubData.name}</strong> wurde erfolgreich auf der Amigoal-Plattform registriert und für Sie ein Administrator-Konto erstellt. Sie können sich ab sofort mit den folgenden Daten anmelden:</p>
                            <div style="background-color: #f5f5f5; border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin: 20px 0;">
                                <p style="margin: 0 0 10px 0;"><strong>Login-Benutzername:</strong><br><span style="font-family: monospace; background: #eee; padding: 2px 5px; border-radius: 3px;">${clubData.clubLoginUser}</span></p>
                                <p style="margin: 0;"><strong>Initiales Passwort:</strong><br><span style="font-family: monospace; background: #eee; padding: 2px 5px; border-radius: 3px;">${password}</span></p>
                            </div>
                            <p style="text-align: center;">
                                <a href="${appUrl}" style="background-color: #34A853; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Jetzt Anmelden</a>
                            </p>
                            <p style="margin-top: 20px;"><strong>Wichtig:</strong> Wir empfehlen Ihnen dringend, Ihr Passwort direkt nach dem ersten Login in Ihren Profileinstellungen zu ändern.</p>
                        </div>
                        <div style="background-color: #f5f5f5; color: #777; padding: 15px; text-align: center; font-size: 12px;">
                            <p>Sportliche Grüsse,<br>Ihr Amigoal Team</p>
                        </div>
                    </div>
                `
            });

            console.log(`[addClub] Successfully created auth user and sent welcome email to ${clubData.contactEmail}`);

        } catch (error: any) {
            if (error.code === 'auth/email-already-exists') {
                console.warn(`[addClub] Auth user ${clubData.contactEmail} already exists. Skipping creation and email.`);
            } else {
                console.error(`[addClub] Error creating auth user or sending email for ${clubData.contactEmail}:`, error);
            }
        }
    }
    
    return createdClub;
  }
);


// Flow to update a club
export const updateClub = ai.defineFlow(
  {
    name: 'updateClub',
    inputSchema: ClubSchema,
    outputSchema: z.void(),
  },
  async (club) => {
    const db = await getDb();
    const auth = await getAuth();
    if (!db || !auth) {
        console.error("Database or Auth service not initialized. Cannot update club.");
        throw new Error("Database or Auth service is not available.");
    };
    
    const { id, ...clubData } = club;
    if (!id) {
        throw new Error("Club ID is required for updating.");
    }
    
    const clubDocRef = db.collection("clubs").doc(id);

    // Get current club data to check if email has changed
    const currentDoc = await clubDocRef.get();
    if (!currentDoc.exists) {
        throw new Error("Club not found.");
    }
    const currentData = currentDoc.data() as Club;

    // Check if the contactEmail has been changed
    if (currentData.contactEmail && clubData.contactEmail && currentData.contactEmail !== clubData.contactEmail) {
        try {
            const user = await auth.getUserByEmail(currentData.contactEmail);
            await auth.updateUser(user.uid, { email: clubData.contactEmail });
            console.log(`[updateClub] Successfully updated auth user email from ${currentData.contactEmail} to ${clubData.contactEmail}`);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                console.warn(`[updateClub] Auth user with old email ${currentData.contactEmail} not found. Skipping auth update.`);
            } else if (error.code === 'auth/email-already-exists') {
                 console.error(`[updateClub] New email ${clubData.contactEmail} is already in use. Auth update failed.`);
                 // Prevent the Firestore update to avoid inconsistency
                 throw new Error(`Die E-Mail-Adresse ${clubData.contactEmail} wird bereits von einem anderen Benutzer verwendet.`);
            }
            else {
                console.error(`[updateClub] Error updating auth user:`, error);
                // Decide if you want to proceed with Firestore update or throw an error
            }
        }
    }

    await clubDocRef.update(clubData);
  }
);

// Flow to update a club's status (archive, suspend, reactivate)
export const updateClubStatus = ai.defineFlow(
  {
    name: 'updateClubStatus',
    inputSchema: z.object({
        clubId: z.string(),
        status: z.enum(['active', 'suspended', 'archived']),
    }),
    outputSchema: z.void(),
  },
  async ({ clubId, status }) => {
     const db = await getDb();
     if (!db) {
        console.error("Database not initialized. Cannot update club status.");
        throw new Error("Database service is not available.");
     }
     if (!clubId) {
        throw new Error("Club ID is required for this operation.");
    }
    const clubDocRef = db.collection("clubs").doc(clubId);

    // Set the new status
    await clubDocRef.update({ status: status });

    // Disable/Enable the club's admin user in Firebase Auth based on status
    const auth = await getAuth();
    if (auth) {
        const clubDoc = await clubDocRef.get();
        const clubData = clubDoc.data() as Club;
        if (clubData && clubData.contactEmail) {
            try {
                const user = await auth.getUserByEmail(clubData.contactEmail);
                const shouldBeDisabled = status === 'suspended' || status === 'archived';
                await auth.updateUser(user.uid, { disabled: shouldBeDisabled });
                console.log(`[updateClubStatus] ${shouldBeDisabled ? 'Disabled' : 'Enabled'} auth user: ${clubData.contactEmail}`);
            } catch (error: any) {
                 if (error.code === 'auth/user-not-found') {
                     console.warn(`[updateClubStatus] Auth user ${clubData.contactEmail} not found. Skipping disable/enable.`);
                 } else {
                    console.error(`[updateClubStatus] Could not update auth user ${clubData.contactEmail}:`, error);
                 }
            }
        }
    }
  }
);

// Flow to check if a subdomain is already taken
export const isSubdomainTaken = ai.defineFlow(
  {
    name: 'isSubdomainTaken',
    inputSchema: z.string(),
    outputSchema: z.boolean(),
  },
  async (subdomain) => {
    // This now relies on getAllClubs, which will throw an error if the collection is missing.
    const allClubs = await getAllClubs({ includeArchived: true });
    return allClubs.some(club => club.subdomain === subdomain);
  }
);

export const sendPasswordResetEmailForClubAdmin = ai.defineFlow(
  {
    name: 'sendPasswordResetEmailForClubAdmin',
    inputSchema: z.string(), // email
    outputSchema: z.void(),
  },
  async (email) => {
    const auth = await getAuth();
    if (!auth) throw new Error("Auth service is not available.");
    await auth.generatePasswordResetLink(email);
  }
);

export const setOneTimePasswordForClubAdmin = ai.defineFlow(
  {
    name: 'setOneTimePasswordForClubAdmin',
    inputSchema: z.string(), // email
    outputSchema: z.string(), // one-time password
  },
  async (email) => {
    const auth = await getAuth();
    if (!auth) throw new Error("Auth service is not available.");

    try {
      const user = await auth.getUserByEmail(email);
      const generatePassword = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 12);
      const newPassword = generatePassword();
      
      await auth.updateUser(user.uid, {
        password: newPassword,
      });

      return newPassword;
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error(`Benutzer mit der E-Mail ${email} nicht gefunden.`);
      }
      throw new Error(`Fehler beim Zurücksetzen des Passworts: ${'\'\'\''}{error.message}`);
    }
  }
);


async function seedSpecialClubs() {
    const db = await getDb();
    const auth = await getAuth();
    if (!db || !auth) return;

    const clubsToSeed = [
        {
            name: "FC Awesome",
            manager: "Club Admin",
            clubLoginUser: "club.admin@fc-awesome.com",
            contactEmail: "club.admin@fc-awesome.com",
            subdomain: "fcawesome",
            country: "CH",
        },
        {
            name: "FC Albania",
            manager: "Club Admin Albania",
            clubLoginUser: "admin@fcalbania",
            contactEmail: "fcalbania@soocy.me",
            subdomain: "fcalbania",
            country: "CH",
        },
        {
            name: "FC Dietikon",
            manager: "Admin Dietikon",
            clubLoginUser: "admin@fcdietikon",
            contactEmail: "admin@fcdietikon.com",
            subdomain: "fcdietikon",
            country: "CH",
        }
    ];

    for (const club of clubsToSeed) {
        const query = db.collection('clubs').where('name', '==', club.name);
        const snapshot = await query.get();
        if (snapshot.empty) {
            console.log(`[Seeder] Club "${club.name}" not found, creating it...`);
            try {
                await addClub({
                    ...club,
                    paymentStatus: "Paid",
                    overdueSince: null,
                    template: "Modern",
                    url: `${club.subdomain}.amigoal.app`,
                    logo: `https://placehold.co/80x80.png?text=${club.name.substring(0, 3).toUpperCase()}`,
                    website: `${club.subdomain}.amigoal.app`,
                });
                console.log(`[Seeder] ✅ "${club.name}" seeded.`);
            } catch (error) {
                console.error(`[Seeder] ❌ Failed to seed "${club.name}":`, error);
            }
        }
    }
}

seedSpecialClubs();
    
