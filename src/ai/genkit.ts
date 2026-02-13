
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// .env.local variables are loaded automatically by Next.js.
// No need for dotenv here.

const plugins = [];

if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
  plugins.push(googleAI({apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY}));
}

export const ai = genkit({
  plugins,
});
