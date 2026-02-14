
'use server';
/**
 * @fileOverview Genkit flows for managing members using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getAuth, getDb } from '@/lib/firebase/server';
import { MemberSchema, type Member } from './members.types';
import type firebaseAdmin from 'firebase-admin';
import { sendMail } from '@/services/email';
import { customAlphabet } from 'nanoid';
import { getRbacContext, hasModuleAccess } from '@/lib/rbac';

// Helper to get current user context
async function getCurrentContext() {
    return await getRbacContext();
}

// Flow to get all members with RBAC
const getAllMembersFlow = ai.defineFlow(
  {
    name: 'getAllMembersFlow',
    inputSchema: z.string().optional().nullable(), // clubId or '*' for all
    outputSchema: z.array(MemberSchema),
  },
  async (requestedClubId) => {
    const context = await getCurrentContext();
    
    // RBAC: Check if user has access to Members module
    if (!hasModuleAccess(context.role, 'Members')) {
      console.warn(`[getAllMembersFlow] User ${context.email} with role ${context.role} denied access to Members module`);
      throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, Mitglieder anzuzeigen.");
    }

    const db = await getDb();
    if (!db) {
      console.error("[getAllMembersFlow] Firestore is not initialized.");
      throw new Error("Database service is not available.");
    }
    try {
        let membersCollectionRef: firebaseAdmin.firestore.Query = db.collection("members");
        
        // RBAC: Non-Super-Admins can only see their own club's members
        let effectiveClubId = requestedClubId;
        
        if (context.role !== 'Super-Admin') {
            // Force clubId from context for non-super-admins
            if (!context.clubId) {
                console.warn(`[getAllMembersFlow] User ${context.email} has no clubId`);
                return [];
            }
            effectiveClubId = context.clubId;
        } else if (requestedClubId === '*') {
            // Super-Admin can request all
            effectiveClubId = '*';
        } else {
            effectiveClubId = requestedClubId || context.clubId;
        }
        
        // If a specific clubId is provided (and it's not the wildcard), filter by it.
        if (effectiveClubId && effectiveClubId !== '*') {
            membersCollectionRef = membersCollectionRef.where('clubId', '==', effectiveClubId);
        }

        const snapshot = await membersCollectionRef.get();
        const members = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Member[];
        
        // Additional filtering for Coach role - only show their team's members
        if (context.role === 'Coach' && context.clubId) {
            // Coaches can see all members in their club but this is filtered by the team assignment in UI
        }
        
        return members;
    } catch (error: any) {
        if (error.code === 5) {
            console.error("[getAllMembersFlow] Firestore collection 'members' not found.");
            return [];
        }
        console.error("[getAllMembersFlow] Error fetching members:", error);
        throw error;
    }
  }
);

export async function getAllMembers(clubId?: string | null): Promise<Member[]> {
    return getAllMembersFlow(clubId);
}

// Flow to update a member
const updateMemberFlow = ai.defineFlow(
  {
    name: 'updateMemberFlow',
    inputSchema: MemberSchema,
    outputSchema: z.void(),
  },
  async (member) => {
    const db = await getDb();
    if (!db) {
        console.error("Database not initialized. Cannot update member.");
        throw new Error("Database service is not available.");
    }
    const { id, ...memberData } = member;
    if (!id) {
        throw new Error("Member ID is required for updating.");
    }
    const memberDoc = db.collection("members").doc(id);
    await memberDoc.update(memberData);
  }
);

export async function updateMember(member: Member): Promise<void> {
    return updateMemberFlow(member);
}


// Flow to add a new member, create auth user, and send welcome email
const addMemberFlow = ai.defineFlow(
  {
    name: 'addMemberFlow',
    inputSchema: MemberSchema.omit({ id: true }),
    outputSchema: MemberSchema.optional(),
  },
  async (memberData) => {
    const db = await getDb();
    const auth = await getAuth();
    if (!db || !auth) {
      console.error("Database or Auth service not initialized.");
      throw new Error("Database or Auth service is not available.");
    }

    // 1. Save member data to Firestore
    let createdMember;
    try {
        const membersCollectionRef = db.collection("members");
        const docRef = await membersCollectionRef.add(memberData);
        createdMember = { id: docRef.id, ...memberData };
    } catch (error: any) {
        console.error("[addMemberFlow] Error adding member to Firestore:", error);
        throw error;
    }

    // 2. Create auth user and send welcome email if an email is provided
    if (memberData.email) {
      try {
        // Generate a random password
        const generatePassword = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);
        const password = generatePassword();
        
        await auth.createUser({
          email: memberData.email,
          password: password,
          displayName: `''${memberData.firstName} ''${memberData.lastName}`,
        });

        const appUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        
        // Send welcome email with credentials
        await sendMail({
          to: memberData.email,
          subject: `Willkommen bei Amigoal, ''${memberData.firstName}!`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
              <div style="background-color: #4285F4; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Herzlich Willkommen bei Amigoal!</h1>
              </div>
              <div style="padding: 30px 20px;">
                <p>Hallo ''${memberData.firstName},</p>
                <p>für Sie wurde ein Konto beim Verein <strong>''${memberData.clubName}</strong> auf der Amigoal-Plattform erstellt. Sie können sich ab sofort mit den folgenden Daten anmelden:</p>
                <div style="background-color: #f5f5f5; border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin: 20px 0;">
                  <p style="margin: 0 0 10px 0;"><strong>Login-Benutzername:</strong><br><span style="font-family: monospace; background: #eee; padding: 2px 5px; border-radius: 3px;">''${memberData.clubLoginUser}</span></p>
                  <p style="margin: 0;"><strong>Initiales Passwort:</strong><br><span style="font-family: monospace; background: #eee; padding: 2px 5px; border-radius: 3px;">''${password}</span></p>
                </div>
                <p style="text-align: center;">
                  <a href="''${appUrl}" style="background-color: #34A853; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Jetzt Anmelden</a>
                </p>
                <p style="margin-top: 20px;"><strong>Wichtig:</strong> Wir empfehlen Ihnen dringend, Ihr Passwort direkt nach dem ersten Login in Ihren Profileinstellungen zu ändern.</p>
              </div>
              <div style="background-color: #f5f5f5; color: #777; padding: 15px; text-align: center; font-size: 12px;">
                <p>Sportliche Grüsse,<br>Ihr Amigoal Team</p>
              </div>
            </div>
          `
        });

      } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
          console.warn(`[addMemberFlow] Auth user ''${memberData.email} already exists. Skipping creation and email.`);
          // If user exists, we probably shouldn't send another welcome email with a new password.
        } else {
          console.error(`[addMemberFlow] Error creating auth user or sending email for ''${memberData.email}:`, error);
          // Optional: Decide if you want to roll back the Firestore member creation
        }
      }
    }
    
    return createdMember;
  }
);

export async function addMember(memberData: Omit<Member, 'id'>): Promise<Member | undefined> {
    return addMemberFlow(memberData);
}

// Flow to delete a member
const deleteMemberFlow = ai.defineFlow(
  {
    name: 'deleteMemberFlow',
    inputSchema: z.string(), // Input is the member ID
    outputSchema: z.void(),
  },
  async (memberId) => {
     const db = await getDb();
     if (!db) {
        console.error("Database not initialized. Cannot delete member.");
        throw new Error("Database service is not available.");
     }
     if (!memberId) {
        throw new Error("Member ID is required for deletion.");
    }
    const memberDoc = db.collection("members").doc(memberId);
    await memberDoc.delete();
  }
);

export async function deleteMember(memberId: string): Promise<void> {
    return deleteMemberFlow(memberId);
}

// Flow to update a member's status (e.g., suspend)
export const updateMemberStatus = ai.defineFlow({
    name: 'updateMemberStatus',
    inputSchema: z.object({
        memberId: z.string(),
        suspension: MemberSchema.shape.suspension,
    }),
    outputSchema: z.void(),
}, async ({ memberId, suspension }) => {
    const db = await getDb();
    if (!db) throw new Error("Database service not available.");

    const memberRef = db.collection('members').doc(memberId);
    await memberRef.update({
        suspension: suspension || null
    });
    // Here you could also disable the user in Firebase Auth if they have a login
});

    