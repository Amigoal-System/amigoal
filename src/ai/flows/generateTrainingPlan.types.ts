/**
 * @fileOverview Types for the training plan flow.
 *
 * - TrainingPlanInput - The input type for the generateTrainingPlan function.
 * - TrainingPlanOutput - The return type for the generateTrainingPlan function.
 * - TrainingPlanInputSchema - The Zod schema for the input.
 * - TrainingPlanOutputSchema - The Zod schema for the output.
 */

import {z} from 'genkit';

export const TrainingPlanInputSchema = z.object({
  history: z.array(z.object({
    type: z.string(),
    load: z.number(),
  })).describe("The team's training history for the past week.")
});
export type TrainingPlanInput = z.infer<typeof TrainingPlanInputSchema>;

export const TrainingPlanOutputSchema = z.object({
  suggestion: z.string().describe("A detailed training suggestion for the upcoming week, including focus points and potential drills. Formatted as Markdown."),
});
export type TrainingPlanOutput = z.infer<typeof TrainingPlanOutputSchema>;
