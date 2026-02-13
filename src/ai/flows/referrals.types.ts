/**
 * @fileOverview Types for the referrals flow.
 */
import { z } from 'zod';

export const ReferralSchema = z.object({
  id: z.string().optional(),
  referrerName: z.string(),
  referrerEmail: z.string().email(),
  referredClubName: z.string(),
  referredClubContact: z.string(),
  referredClubEmail: z.string().email(),
  referredClubPhone: z.string().optional(),
  status: z.enum(['Pending', 'Contacted', 'Onboarded', 'Rejected', 'RewardPaid']),
  notes: z.string().optional(),
  createdAt: z.string(), // ISO date string
});
export type Referral = z.infer<typeof ReferralSchema>;

// Mock Data
export const initialReferrals: Referral[] = [
    {
        id: 'ref-1',
        referrerName: 'Sport-Shop Meier',
        referrerEmail: 'info@sport-meier.ch',
        referredClubName: 'FC Unterstrass',
        referredClubContact: 'Peter Keller',
        referredClubEmail: 'pkeller@fcunterstrass.ch',
        referredClubPhone: '079 123 45 67',
        status: 'Onboarded',
        notes: 'Haben grosses Interesse am Sponsoring-Modul.',
        createdAt: new Date('2024-07-20T10:00:00Z').toISOString(),
    },
    {
        id: 'ref-2',
        referrerName: 'Hans Muster',
        referrerEmail: 'hans.muster@example.com',
        referredClubName: 'FC Red Star ZH',
        referredClubContact: 'Erika Schmid',
        referredClubEmail: 'erika.schmid@redstar.ch',
        referredClubPhone: '078 987 65 43',
        status: 'Contacted',
        notes: 'Demo für nächste Woche geplant.',
        createdAt: new Date('2024-07-25T14:30:00Z').toISOString(),
    },
     {
        id: 'ref-3',
        referrerName: 'Vereinsbedarf AG',
        referrerEmail: 'kontakt@vereinsbedarf.ch',
        referredClubName: 'FC Blue Stars',
        referredClubContact: 'Max Fischer',
        referredClubEmail: 'max.fischer@bluestars.ch',
        referredClubPhone: '',
        status: 'Pending',
        notes: '',
        createdAt: new Date('2024-07-28T09:00:00Z').toISOString(),
    },
];
