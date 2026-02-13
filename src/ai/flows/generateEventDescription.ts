
'use server';
/**
 * @fileOverview A flow for generating a compelling event description from keywords.
 *
 * - generateEventDescription - A function that takes a title and keywords and returns a full description.
 */

import {ai} from '@/ai/genkit';
import { GenerateEventDescriptionInputSchema, GenerateEventDescriptionOutputSchema } from './generateEventDescription.types';
import type { GenerateEventDescriptionInput, GenerateEventDescriptionOutput } from './generateEventDescription.types';
import { googleAI } from '@genkit-ai/google-genai';

const prompt = ai.definePrompt({
  name: 'eventDescriptionPrompt',
  inputSchema: GenerateEventDescriptionInputSchema,
  prompt: `You are a creative marketing assistant for a sports club management software.
Your task is to write an engaging and professional event description based on a title and some keywords.
The language of the description must be German.
Keep the description concise and informative, suitable for an event invitation.
ONLY return the generated description text, without any labels, titles, or markdown formatting.

Event Title: {{{title}}}
Keywords/Notes: {{{keywords}}}
`,
  model: googleAI.model('gemini-1.5-flash-latest'),
});

const generateEventDescriptionFlow = ai.defineFlow(
  {
    name: 'generateEventDescriptionFlow',
    inputSchema: GenerateEventDescriptionInputSchema,
    outputSchema: GenerateEventDescriptionOutputSchema,
  },
  async (input) => {
    try {
      const response = await prompt(input);
      const text = response.text;
       if (!text) {
        throw new Error('No text output from prompt');
      }
      return { description: text };
    } catch (error) {
        console.error('Error in generateEventDescriptionFlow:', error);
        // Fallback to prevent crashing the entire application
        // We return the original keywords as the description if AI fails.
        return { description: `Fehler bei der Generierung. Ursprüngliche Notizen: ${input.keywords}` };
    }
  }
);


export async function generateEventDescription(input: GenerateEventDescriptionInput): Promise<GenerateEventDescriptionOutput> {
  return generateEventDescriptionFlow(input);
}
