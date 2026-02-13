
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getAuth, getDb } from '@/lib/firebase/server';
import type speakeasy from 'speakeasy';
// Dynamically import qrcode to avoid server build issues
import type QRCode from 'qrcode';


const TfaSecretSchema = z.object({
  secret: z.string(),
  qrCodeUrl: z.string().url(),
});
export type TfaSecret = z.infer<typeof TfaSecretSchema>;

const TfaTokenSchema = z.object({
  token: z.string().length(6),
});

const TfaStatusSchema = z.object({
  isTfaEnabled: z.boolean(),
  isTfaNeeded: z.boolean().optional(),
});

const VerificationResultSchema = z.object({
  isValid: z.boolean(),
  customToken: z.string().optional(),
});

const getSuperAdminRef = async () => {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Hardcoded ID for the single super-admin user document
  return db.collection('super-admins').doc('super-admin-doc');
};

export const getTfaStatus = ai.defineFlow(
  {
    name: 'getTfaStatus',
    inputSchema: z.void().optional(),
    outputSchema: TfaStatusSchema,
  },
  async () => {
    const adminRef = await getSuperAdminRef();
    const doc = await adminRef.get();
    
    if (doc.exists) {
        const data = doc.data();
        return { isTfaEnabled: data?.tfaEnabled || false };
    }
    return { isTfaEnabled: false };
  }
);


export const generateTfaSecret = ai.defineFlow(
  {
    name: 'generateTfaSecret',
    inputSchema: z.void().optional(),
    outputSchema: TfaSecretSchema,
  },
  async () => {
    const speakeasy: typeof import('speakeasy') = (await import('speakeasy')).default;
    const secret = speakeasy.generateSecret({
      name: 'Amigoal Super-Admin',
    });

    const adminRef = await getSuperAdminRef();
    await adminRef.set({ tfaSecret: secret.base32 }, { merge: true });

    // Dynamic import of QRCode
    const QRCodeModule = (await import('qrcode')).default;
    const qrCodeUrl = await QRCodeModule.toDataURL(secret.otpauth_url!);

    return { secret: secret.base32, qrCodeUrl };
  }
);

export const verifyTfaToken = ai.defineFlow(
  {
    name: 'verifyTfaToken',
    inputSchema: TfaTokenSchema,
    outputSchema: VerificationResultSchema,
  },
  async ({ token }) => {
    const speakeasy: typeof import('speakeasy') = (await import('speakeasy')).default;
    const adminRef = await getSuperAdminRef();
    const doc = await adminRef.get();
    const data = doc.data();

    if (!data || !data.tfaSecret) {
      throw new Error('2FA ist nicht für diesen Benutzer eingerichtet.');
    }

    const isValid = speakeasy.totp.verify({
      secret: data.tfaSecret,
      encoding: 'base32',
      token,
      window: 1, // Allow 1-time step tolerance
    });

    if (isValid) {
      // Create a custom token to complete the sign-in
      const auth = await getAuth();
      if (!auth) throw new Error("Auth service not available");
      const customToken = await auth.createCustomToken('super-admin-uid', { isSuperAdmin: true });
      return { isValid: true, customToken };
    }

    return { isValid: false };
  }
);

export const enableTfa = ai.defineFlow(
  {
    name: 'enableTfa',
    inputSchema: TfaTokenSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async ({ token }) => {
    const verification = await verifyTfaToken({ token });
    if (verification.isValid) {
        const adminRef = await getSuperAdminRef();
        await adminRef.set({ tfaEnabled: true }, { merge: true });
        return { success: true };
    }
    return { success: false };
  }
);

export const disableTfa = ai.defineFlow(
  {
    name: 'disableTfa',
    inputSchema: z.void().optional(),
    outputSchema: z.object({ success: z.boolean() }),
  },
  async () => {
    const adminRef = await getSuperAdminRef();
    await adminRef.update({ tfaEnabled: false, tfaSecret: null });
    return { success: true };
  }
);
