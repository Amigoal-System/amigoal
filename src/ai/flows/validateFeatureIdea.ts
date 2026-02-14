
'use server';
/**
 * @fileOverview A flow for validating if a feature idea already exists.
 *
 * - validateFeatureIdea - A function that checks a user's idea against existing features.
 */

import {ai} from '@/ai/genkit';
import { ValidateIdeaInputSchema, ValidateIdeaOutputSchema } from './validateFeatureIdea.types';
import type { ValidateIdeaInput, ValidateIdeaOutput } from './validateFeatureIdea.types';
import { googleAI } from '@genkit-ai/google-genai';

// Simplified list of existing features for the prompt context.
const existingFeatures = `
- Mitglieder & Spieler-Verwaltung
- Mannschafts- & Trainer-Management
- Dokumenten- & Vertragsablage
- Anlagen- & Platzbelegung
- Shop- & Inventar-Verwaltung
- Vereins-Webseite (Builder)
- Trainingsplanung und -vorbereitung
- Spielplanung, Live-Ticker, Spielanalyse (KI)
- Taktiktafel
- Leistungsdaten & Anwesenheit
- Verhaltensregeln & Team-Kodex
- Medical Center (Verletzungs-Management)
- Reise & Event-Planung (Trainingslager)
- Finanzen: Mitgliederbeiträge, Rechnungen, Mahnwesen
- Spesen-Einreichung
- Sponsoring-Verwaltung
- Mannschaftskasse
- Tokenization & Belohnungssystem (AMIGO-Tokens)
- Kalender & Termine
- Aufgabenverwaltung
- Chat & Kommunikation
- Video-Highlights
- Spieler-Cockpit mit persönlichen Daten
- Eltern-Cockpit mit Übersicht über Kinder
- Super-Admin Dashboard für die SaaS-Verwaltung (Onboarding, Leads etc.)
`;

const prompt = ai.definePrompt({
  name: 'validateIdeaPrompt',
  input: { schema: ValidateIdeaInputSchema },
  output: { schema: ValidateIdeaOutputSchema },
  prompt: `You are an AI assistant for a soccer club management software called Amigoal.
Your task is to check if a user's feature idea already exists within the platform.

Here is a list of existing features:
${existingFeatures}

User's idea: "{{ideaDescription}}"

Analyze the user's idea.
- If the idea clearly corresponds to an existing feature, set "exists" to true, and provide the "featureName" and a "locationHint" on where to find it (e.g., "im Dashboard unter 'Finanzen'").
- If the idea is a new concept or a significant extension of an existing feature that isn't listed, set "exists" to false. The featureName and locationHint can be empty.
- Be concise in your response.

Your response must be in German.
`,
  model: googleAI.model('gemini-1.5-pro-latest'),
});

const validateIdeaFlow = ai.defineFlow(
  {
    name: 'validateIdeaFlow',
    inputSchema: ValidateIdeaInputSchema,
    outputSchema: ValidateIdeaOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      if (!output) {
        throw new Error('No output from validation prompt');
      }
      return output;
    } catch (error: any) {
      console.error('Error in validateIdeaFlow:', error);
      throw new Error('Failed to validate feature idea.');
    }
  }
);

export async function validateFeatureIdea(input: ValidateIdeaInput): Promise<ValidateIdeaOutput> {
  return validateIdeaFlow(input);
}
