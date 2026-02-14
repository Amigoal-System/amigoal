'use server';
/**
 * @fileOverview A flow for generating a soccer training plan suggestion.
 *
 * - generateTrainingPlan - A function that generates a training plan.
 */

import {ai} from '@/ai/genkit';
import type { TrainingPlanInput, TrainingPlanOutput } from './generateTrainingPlan.types';
import { TrainingPlanInputSchema, TrainingPlanOutputSchema } from './generateTrainingPlan.types';


const prompt = ai.definePrompt({
  name: 'trainingPlanPrompt',
  input: {schema: TrainingPlanInputSchema},
  output: {schema: TrainingPlanOutputSchema},
  prompt: `You are an expert sports scientist and soccer coach.
Based on the provided training history of a soccer team, create a suggestion for the next training session.
The suggestion should be well-founded and aim to optimize performance and prevent injuries.
Your output must be in German and formatted as Markdown.

Last Week's Training Load:
{{#each history}}
- Session Type: {{{type}}}, Load: {{{load}}}/10
{{/each}}

Based on this data, provide a training suggestion that includes:
1.  A primary focus for the session (e.g., Regeneration, Tactics, Strength).
2.  A brief justification for this focus.
3.  Two simple, concrete drill examples to implement the focus.
`,
});

const generateTrainingPlanFlow = ai.defineFlow(
  {
    name: 'generateTrainingPlanFlow',
    inputSchema: TrainingPlanInputSchema,
    outputSchema: TrainingPlanOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('No output from prompt');
      }
      return output;
    } catch (error: any) {
        console.error('Error in generateTrainingPlanFlow:', error);
        throw new Error('Failed to generate training plan.');
    }
  }
);


export async function generateTrainingPlan(input: TrainingPlanInput): Promise<TrainingPlanOutput> {
  return generateTrainingPlanFlow(input);
}
