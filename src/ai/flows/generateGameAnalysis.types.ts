/**
 * @fileOverview Types for the game analysis flow.
 * 
 * - GameAnalysisInput - The input type for the generateGameAnalysis function.
 * - GameAnalysisOutput - The return type for the generateGameAnalysis function.
 * - GameAnalysisInputSchema - The Zod schema for the input.
 * - GameAnalysisOutputSchema - The Zod schema for the output.
 */

import {z} from 'genkit';

export const GameAnalysisInputSchema = z.object({
  opponent: z.string().describe('The name of the opponent team.'),
  score: z.string().describe("The final score of the match (e.g., '3-1')."),
  result: z.string().describe("The result of the match for our team ('W' for Win, 'D' for Draw, 'L' for Loss)."),
  competition: z.string().describe('The competition or league the match was part of.'),
  events: z.array(z.string()).optional().describe("A list of key events from the game, captured by the live ticker (e.g., 'Minute 15: Goal by Meier', 'Minute 30: Yellow Card for Schmid')."),
  playerData: z.object({
    position: z.string().describe("The player's position."),
    playtime: z.string().describe("How many minutes the player played."),
    goals: z.number().describe("Number of goals scored by the player."),
    assists: z.number().describe("Number of assists by the player.")
  }).optional().describe("Specific data for an individual player's performance.")
});
export type GameAnalysisInput = z.infer<typeof GameAnalysisInputSchema>;

export const GameAnalysisOutputSchema = z.object({
  analysis: z.string().describe("A detailed analysis of the game, including strengths, weaknesses, and key moments."),
  suggestion: z.string().describe("A concrete suggestion for the next training session based on the analysis."),
  playerAnalysis: z.string().optional().describe("A personal analysis of the player's performance, if player data was provided.")
});
export type GameAnalysisOutput = z.infer<typeof GameAnalysisOutputSchema>;
