

'use server';
/**
 * @fileOverview Genkit flows for managing coupons.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { CouponSchema, type Coupon } from './coupons.types';
import type { admin } from 'firebase-admin';

export const getAllCoupons = ai.defineFlow(
  {
    name: 'getAllCoupons',
    outputSchema: z.array(CouponSchema),
  },
  async () => {
    const db = await getDb();
    if (!db) throw new Error("DB not available");
    const snapshot = await db.collection('coupons').get();
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Coupon[];
  }
);

export const addCoupon = ai.defineFlow(
  {
    name: 'addCoupon',
    inputSchema: CouponSchema.omit({ id: true }),
    outputSchema: CouponSchema,
  },
  async (couponData) => {
    const db = await getDb();
    if (!db) throw new Error("DB not available");
    
    // Ensure usedBy is an array, even if undefined in some cases.
    const newCouponData = {
      ...couponData,
      usedBy: couponData.usedBy || [],
    };
    const docRef = await db.collection('coupons').add(newCouponData);
    return { id: docRef.id, ...newCouponData };
  }
);

export const updateCoupon = ai.defineFlow(
  {
    name: 'updateCoupon',
    inputSchema: CouponSchema,
    outputSchema: z.void(),
  },
  async (coupon) => {
    const db = await getDb();
    if (!db) throw new Error("DB not available");
    const { id, ...couponData } = coupon;
    if (!id) throw new Error("ID is required for update.");
    await db.collection('coupons').doc(id).update(couponData);
  }
);

export const deleteCoupon = ai.defineFlow(
  {
    name: 'deleteCoupon',
    inputSchema: z.string(),
    outputSchema: z.void(),
  },
  async (couponId) => {
    const db = await getDb();
    if (!db) throw new Error("DB not available");
    await db.collection('coupons').doc(couponId).delete();
  }
);

export const validateCoupon = ai.defineFlow(
  {
    name: 'validateCoupon',
    inputSchema: z.object({ 
        code: z.string(), 
        clubId: z.string().optional(),
        scope: z.enum(['SaaS', 'Bootcamp', 'TrainingCamp']).optional(),
    }),
    outputSchema: CouponSchema.nullable().optional(),
  },
  async ({ code, clubId, scope }) => {
    const db = await getDb();
    if (!db) throw new Error("DB not available");
    
    let query: admin.firestore.Query = db.collection('coupons').where('code', '==', code);

    if (scope) {
        query = query.where('scope', '==', scope);
    }
    
    const snapshot = await query.limit(1).get();
    
    if (snapshot.empty) {
      return null; // Not found
    }

    const doc = snapshot.docs[0];
    const coupon = { ...doc.data(), id: doc.id } as Coupon;

    const now = new Date();
    const validUntil = new Date(coupon.validUntil);

    if (!coupon.isActive || now > validUntil || coupon.usageCount >= coupon.maxUsage) {
      return null; // Invalid due to date, status, or usage limit
    }
    
    // Check if the club has already used this coupon
    if (clubId && coupon.usedBy?.includes(clubId)) {
        console.log(`[ValidateCoupon] Coupon ${code} already used by club ${clubId}.`);
        return null; // Already used by this club
    }

    return coupon;
  }
);