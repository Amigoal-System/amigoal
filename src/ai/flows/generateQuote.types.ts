
/**
 * @fileOverview Types for the quote generation flow.
 *
 * - GenerateQuoteInput - The input type for the generateQuote function.
 * - GenerateQuoteOutput - The return type for the generateQuote function.
 * - GenerateQuoteInputSchema - The Zod schema for the input.
 * - GenerateQuoteOutputSchema - The Zod schema for the output.
 */

import {z} from 'genkit';

export const GenerateQuoteInputSchema = z.object({
  theme: z.string().describe('The theme for the quote (e.g., "Motivation", "Success", "Soccer").'),
});
export type GenerateQuoteInput = z.infer<typeof GenerateQuoteInputSchema>;

export const GenerateQuoteOutputSchema = z.object({
  quote: z.string().describe("The generated quote."),
  author: z.string().describe("The author of the quote."),
});
export type GenerateQuoteOutput = z.infer<typeof GenerateQuoteOutputSchema>;
