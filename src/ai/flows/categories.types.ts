/**
 * @fileOverview Types for the team categories flow.
 */
import { z } from 'zod';

// Base schema for a category
export const TeamCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  order: z.number(),
  countryCode: z.string().default('CH'),
});
export type TeamCategory = z.infer<typeof TeamCategorySchema>;


export const initialTeamCategories: Omit<TeamCategory, 'id'>[] = [
    { name: 'Junioren A', order: 1, countryCode: 'CH' },
    { name: 'Junioren B', order: 2, countryCode: 'CH' },
    { name: 'Junioren C', order: 3, countryCode: 'CH' },
    { name: 'Junioren D', order: 4, countryCode: 'CH' },
    { name: 'Junioren E', order: 5, countryCode: 'CH' },
    { name: 'Junioren F', order: 6, countryCode: 'CH' },
    { name: 'Junioren G', order: 7, countryCode: 'CH' },
];
