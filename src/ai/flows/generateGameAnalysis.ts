'use server';
/**
 * @fileOverview A flow for generating a soccer game analysis.
 *
 * - generateGameAnalysis - A function that generates a game analysis based on match data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { GameAnalysisInput, GameAnalysisOutput } from './generateGameAnalysis.types';
import { GameAnalysisInputSchema, GameAnalysisOutputSchema } from './generateGameAnalysis.types';


const prompt = ai.definePrompt({
  name: 'gameAnalysisPrompt',
  input: {schema: GameAnalysisInputSchema},
  output: {schema: GameAnalysisOutputSchema},
  prompt: `You are a professional soccer analyst and coach.
Your task is to provide a concise analysis of a past match based on the provided data.
The analysis should be constructive and focus on potential improvements.
Your output must be in German.

## Match Data:
- Opponent: {{{opponent}}}
- Final Score: {{{score}}} (Our Team - Opponent)
- Result: {{{result}}}
- Competition: {{{competition}}}

{{#if events}}
## Key Events (from Live Ticker):
{{#each events}}
- {{{this}}}
{{/each}}
{{/if}}

Based on this, generate a brief analysis covering:
1. A summary of the game dynamic based on the score and key events.
2. What probably went well (strengths).
3. What could be improved (weaknesses).

Finally, provide a single, actionable suggestion for the next training session based on your analysis.

---

## Individual Player Analysis
{{#if playerData}}
Now, provide a separate, personal analysis for the player based on their specific data.
Address the player directly using "Du".

### Player Data:
- Position: {{playerData.position}}
- Playtime: {{playerData.playtime}} minutes
- Goals: {{playerData.goals}}
- Assists: {{playerData.assists}}

Based on the player's data and the overall match result, provide:
1.  A short, encouraging feedback on their performance.
2.  One concrete tip for improvement for their specific position.
{{/if}}
`,
  config: {
    // Lower temperature for more factual, less creative output
    temperature: 0.3,
  },
});

const generateGameAnalysisFlow = ai.defineFlow(
  {
    name: 'generateGameAnalysisFlow',
    inputSchema: GameAnalysisInputSchema,
    outputSchema: GameAnalysisOutputSchema,
  },
  async (input) => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('No output from prompt');
      }
      return output;
    } catch (error) {
        console.error('Error in generateGameAnalysisFlow:', error);
        throw new Error('Failed to generate game analysis.');
    }
  }
);


export async function generateGameAnalysis(input: GameAnalysisInput): Promise<GameAnalysisOutput> {
  return generateGameAnalysisFlow(input);
}
