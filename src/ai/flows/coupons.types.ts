/**
 * @fileOverview Types for the coupons flow.
 */
import { z } from 'zod';

export const CouponSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(3, "Code muss mindestens 3 Zeichen haben."),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive("Wert muss positiv sein."),
  validUntil: z.string(),
  isActive: z.boolean().default(true),
  usageCount: z.number().default(0),
  maxUsage: z.number().positive("Maximale Nutzung muss positiv sein."),
  usedBy: z.array(z.string()).optional().default([]),
  scope: z.enum(['SaaS', 'Bootcamp', 'TrainingCamp']).default('SaaS'), // New field for scope
  providerId: z.string().optional(), // To link coupon to a specific provider
});

export type Coupon = z.infer<typeof CouponSchema>;