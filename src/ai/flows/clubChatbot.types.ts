
/**
 * @fileOverview Types for the club chatbot flow.
 *
 * - ChatbotInput - The input type for the clubChatbot function.
 * - ChatbotOutput - The return type for the clubChatbot function.
 * - ChatbotInputSchema - The Zod schema for the input.
 * - ChatbotOutputSchema - The Zod schema for the output.
 */

import {z} from 'genkit';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatHistorySchema = z.array(ChatMessageSchema);
export type ChatHistory = z.infer<typeof ChatHistorySchema>;


export const ChatbotInputSchema = z.object({
  query: z.string().describe("The user's question for the chatbot."),
  history: ChatHistorySchema.optional().describe('The conversation history.'),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

export const ChatbotOutputSchema = z.object({
  response: z.string().describe("The chatbot's answer to the user's query."),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;
