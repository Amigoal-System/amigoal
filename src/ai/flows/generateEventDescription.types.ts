/**
 * @fileOverview Types for the event description generation flow.
 */

import {z} from 'genkit';

export const GenerateEventDescriptionInputSchema = z.object({
  title: z.string().describe('The title of the event.'),
  keywords: z.string().describe("Keywords or short notes about the event to be expanded into a full description."),
});
export type GenerateEventDescriptionInput = z.infer<typeof GenerateEventDescriptionInputSchema>;

export const GenerateEventDescriptionOutputSchema = z.object({
  description: z.string().describe("The generated, friendly and professional event description."),
});
export type GenerateEventDescriptionOutput = z.infer<typeof GenerateEventDescriptionOutputSchema>;
