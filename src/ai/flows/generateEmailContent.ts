'use server';
/**
 * @fileOverview A flow for generating email content.
 *
 * - generateEmailContent - A function that generates a helpful email body.
 */

import {ai} from '@/ai/genkit';
import { GenerateEmailContentInputSchema, GenerateEmailContentOutputSchema } from './generateEmailContent.types';
import type { GenerateEmailContentInput, GenerateEmailContentOutput } from './generateEmailContent.types';

const prompt = ai.definePrompt({
  name: 'emailContentPrompt',
  input: {schema: GenerateEmailContentInputSchema},
  output: {schema: GenerateEmailContentOutputSchema},
  prompt: `You are a helpful AI assistant integrated into a club management software.
Your task is to write a friendly and professional email body based on the provided subject and context.
The context might be a simple text, a URL, or a note about an attachment.
Rewrite the provided context into a complete and polite email body.
The language of the email must be German.

Subject: {{{subject}}}
Context from original body: {{{context}}}

Generated Email Body:
`,
});

const generateEmailContentFlow = ai.defineFlow(
  {
    name: 'generateEmailContentFlow',
    inputSchema: GenerateEmailContentInputSchema,
    outputSchema: GenerateEmailContentOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await prompt(input);
       if (!output) {
        throw new Error('No output from prompt');
      }
      return output;
    } catch (error) {
        console.error('Error in generateEmailContentFlow:', error);
        throw new Error('Failed to generate email content.');
    }
  }
);


export async function generateEmailContent(input: GenerateEmailContentInput): Promise<GenerateEmailContentOutput> {
  return generateEmailContentFlow(input);
}
