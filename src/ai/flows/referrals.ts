
'use server';
/**
 * @fileOverview Genkit flows for managing referrals using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { ReferralSchema, type Referral } from './referrals.types';
import { sendMail } from '@/services/email';
import { getRbacContext, hasModuleAccess } from '@/lib/rbac';

async function getCurrentContext() {
    return await getRbacContext();
}

// Flow to get all referrals with RBAC
export const getReferrals = ai.defineFlow(
  {
    name: 'getReferrals',
    inputSchema: z.string().optional().nullable(), // clubId
    outputSchema: z.array(ReferralSchema),
  },
  async (requestedClubId) => {
    const context = await getCurrentContext();
    
    // RBAC: Check if user has access to Referrals module
    if (!hasModuleAccess(context.role, 'Referrals')) {
      console.warn(`[getReferrals] User ${context.email} with role ${context.role} denied access to Referrals module`);
      throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, Referrals anzuzeigen.");
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    try {
      let query = db.collection("referrals");
      
      // RBAC: Filter by clubId for non-super-admins
      if (context.role !== 'Super-Admin') {
          if (!context.clubId) {
              return [];
          }
          query = query.where('clubId', '==', context.clubId);
      } else if (requestedClubId) {
          query = query.where('clubId', '==', requestedClubId);
      }
      
      const snapshot = await query.orderBy('createdAt', 'desc').get();
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Referral[];
    } catch (error: any) {
      if (error.code === 5) {
        console.warn("[getReferrals] 'referrals' collection not found. Seeding should handle this.");
        return [];
      }
      console.error("[getReferrals] Error fetching referrals:", error);
      throw error;
    }
  }
);

// Flow to add a new referral
export const addReferral = ai.defineFlow(
  {
    name: 'addReferral',
    inputSchema: ReferralSchema.omit({ id: true, createdAt: true, status: true }),
    outputSchema: ReferralSchema,
  },
  async (referralData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    
    // 1. Save the referral to the database
    const newReferral = {
        ...referralData,
        createdAt: new Date().toISOString(),
        status: 'Pending' as const,
    };

    const docRef = await db.collection("referrals").add(newReferral);
    
    const adminEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@amigoal.ch';
    const referralTrackingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://amigoal.app'}/de/dashboard/referrals`;


    // 2. Send notification email to the admin
    try {
      await sendMail({
        to: adminEmail,
        subject: `Neue Empfehlung erhalten: ${referralData.referredClubName}`,
        html: `
          <p>Eine neue Empfehlung wurde übermittelt:</p>
          <ul>
            <li><strong>Empfohlen von:</strong> ${referralData.referrerName} (${referralData.referrerEmail})</li>
            <li><strong>Empfohlener Verein:</strong> ${referralData.referredClubName}</li>
            <li><strong>Kontakt im Verein:</strong> ${referralData.referredClubContact} (${referralData.referredClubEmail})</li>
            <li><strong>Telefon Kontakt:</strong> ${referralData.referredClubPhone || 'N/A'}</li>
          </ul>
          <p>Sie können diese Empfehlung jetzt im Super-Admin-Dashboard unter "Referrals" einsehen und bearbeiten.</p>
        `
      });
    } catch(emailError) {
        console.error(`[addReferral] Failed to send admin notification email to ${adminEmail}:`, emailError);
    }

    // 3. Send confirmation email to the referrer
    try {
        await sendMail({
            to: referralData.referrerEmail,
            subject: 'Ihre Amigoal-Empfehlung wurde übermittelt!',
            html: `
                <p>Hallo ${referralData.referrerName},</p>
                <p>vielen Dank für Ihre Empfehlung für den Verein <strong>${referralData.referredClubName}</strong>.</p>
                <p>Wir haben Ihre Empfehlung erhalten und werden uns mit dem Verein in Verbindung setzen. Sobald der Verein erfolgreich Mitglied bei Amigoal wird, werden wir Sie bezüglich Ihrer Prämie kontaktieren.</p>
                <p>Sie können den Status Ihrer Empfehlungen jederzeit über den folgenden Link einsehen:</p>
                <p><a href="${referralTrackingUrl}">${referralTrackingUrl}</a></p>
                <br/>
                <p>Sportliche Grüsse,</p>
                <p>Ihr Amigoal Team</p>
            `,
        });
    } catch (emailError) {
        // Log the email error but don't fail the entire flow.
        // The referral was saved successfully, which is the main goal.
        console.error(`[addReferral] Referral saved successfully, but failed to send confirmation email to ${referralData.referrerEmail}:`, emailError);
    }
    
    return { id: docRef.id, ...newReferral };
  }
);

// Flow to update a referral's status or notes
export const updateReferral = ai.defineFlow(
  {
    name: 'updateReferral',
    inputSchema: z.object({
        id: z.string(),
        status: ReferralSchema.shape.status.optional(),
        notes: z.string().optional(),
    }),
    outputSchema: z.void(),
  },
  async ({ id, ...updateData }) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    
    await db.collection("referrals").doc(id).update(updateData);
  }
);
