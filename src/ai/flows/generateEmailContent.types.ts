/**
 * @fileOverview Types for the email content generation flow.
 *
 * - GenerateEmailContentInput - The input type for the generateEmailContent function.
 * - GenerateEmailContentOutput - The return type for the generateEmailContent function.
 * - GenerateEmailContentInputSchema - The Zod schema for the input.
 * - GenerateEmailContentOutputSchema - The Zod schema for the output.
 */

import {z} from 'genkit';

export const GenerateEmailContentInputSchema = z.object({
  subject: z.string().describe('The subject of the email.'),
  context: z.string().describe("The original content/context for the email body (e.g., a link or a note about an attachment)."),
});
export type GenerateEmailContentInput = z.infer<typeof GenerateEmailContentInputSchema>;

export const GenerateEmailContentOutputSchema = z.object({
  generatedBody: z.string().describe("The generated, friendly email body."),
});
export type GenerateEmailContentOutput = z.infer<typeof GenerateEmailContentOutputSchema>;
