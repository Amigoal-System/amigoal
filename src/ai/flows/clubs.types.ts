/**
 * @fileOverview Types for the clubs flow.
 */
import { z } from 'zod';
import type { DunningLevel } from '@/lib/types/dunning';
import type { TeamCategory } from './configurations.types';

const BrandingSchema = z.object({
    primary: z.object({ h: z.number(), s: z.number(), l: z.number() }).optional(),
    background: z.object({ h: z.number(), s: z.number(), l: z.number() }).optional(),
    accent: z.object({ h: z.number(), s: z.number(), l: z.number() }).optional(),
    bodyFont: z.string().optional(),
    headlineFont: z.string().optional(),
    logo: z.string().url().optional().nullable(),
}).optional();

const PaymentConfigSchema = z.object({
    twintLink: z.string().url().optional().nullable(),
    paypalEmail: z.string().email().optional().nullable(),
    stripeAccountId: z.string().optional().nullable(),
}).optional();

const TeamCategorySchemaForClub = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number(),
});

const GoalSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    kpi: z.string(),
});

const StrategySchema = z.object({
    vision: z.string(),
    mission: z.string(),
    values: z.array(z.string()),
    goals: z.array(GoalSchema),
}).optional();


export const ClubSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  association_id: z.string().optional(),
  founded: z.number().optional(),
  city: z.string().optional(),
  manager: z.string(),
  logo: z.string().url().optional().nullable(),
  website: z.string().optional().nullable(),
  clubLoginUser: z.string(),
  contactEmail: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  paymentStatus: z.enum(['Paid', 'Overdue']),
  overdueSince: z.string().nullable(),
  hasWebsite: z.boolean().optional(),
  subdomain: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  template: z.string().optional().nullable(),
  seekingSponsorship: z.boolean().optional().default(false),
  sponsorshipNeeds: z.array(z.string()).optional(),
  memberCount: z.number().optional(),
  league: z.string().optional(),
  branding: BrandingSchema,
  dunningLevels: z.any().optional(),
  status: z.enum(['active', 'suspended', 'archived']).optional().default('active'),
  createdAt: z.string().optional(),
  package: z.string().optional(),
  contractEnd: z.string().optional(),
  ticketingEnabled: z.boolean().optional().default(false),
  country: z.string(),
  paymentConfig: PaymentConfigSchema,
  websiteManagedBy: z.enum(['Club', 'Amigoal']).optional().default('Club'),
  teamCategories: z.array(TeamCategorySchemaForClub).optional(),
  strategy: StrategySchema,
});
export type Club = z.infer<typeof ClubSchema> & {
    dunningLevels?: DunningLevel[];
    teamCategories?: TeamCategory[];
    strategy?: {
        vision: string;
        mission: string;
        values: string[];
        goals: { id: string; title: string; description: string; kpi: string; }[];
    }
};
