/**
 * @fileOverview Types for the feature idea validation flow.
 */

import { z } from 'genkit';

export const ValidateIdeaInputSchema = z.object({
  ideaDescription: z.string().describe("The user's new feature idea or wish."),
});
export type ValidateIdeaInput = z.infer<typeof ValidateIdeaInputSchema>;

export const ValidateIdeaOutputSchema = z.object({
  exists: z.boolean().describe('Whether a similar feature already exists.'),
  featureName: z.string().optional().describe('The name of the existing feature, if it exists.'),
  locationHint: z.string().optional().describe('A hint on where to find the existing feature.'),
});
export type ValidateIdeaOutput = z.infer<typeof ValidateIdeaOutputSchema>;
