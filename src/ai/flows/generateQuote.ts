
'use server';
/**
 * @fileOverview A flow for generating a quote.
 *
 * - generateQuote - A function that generates a quote based on a theme.
 */

import {ai} from '@/ai/genkit';
import type { GenerateQuoteInput, GenerateQuoteOutput } from './generateQuote.types';
import { GenerateQuoteInputSchema, GenerateQuoteOutputSchema } from './generateQuote.types';


const prompt = ai.definePrompt({
  name: 'quotePrompt',
  input: {schema: GenerateQuoteInputSchema},
  output: {schema: GenerateQuoteOutputSchema},
  prompt: `You are an expert in finding inspiring quotes.
Generate a short, inspiring quote about the theme of '{{{theme}}}'.
The quote should be suitable for a birthday card for a sports club member.
Provide the quote and the author. If the author is unknown, state "Unknown".

Generated Quote:
`,
});

const generateQuoteFlow = ai.defineFlow(
  {
    name: 'generateQuoteFlow',
    inputSchema: GenerateQuoteInputSchema,
    outputSchema: GenerateQuoteOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('No output from prompt');
      }
      return output;
    } catch (error) {
        console.error('Error in generateQuoteFlow:', error);
        throw new Error('Failed to generate quote.');
    }
  }
);


export async function generateQuote(input: GenerateQuoteInput): Promise<GenerateQuoteOutput> {
  return generateQuoteFlow(input);
}
