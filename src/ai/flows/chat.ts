
'use server';
/**
 * @fileOverview Genkit flows for managing chat functionalities.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { firestore } from 'firebase-admin';
import { nanoid } from 'nanoid';
import { type ChatRoom, type ChatMessage } from './chat.types';

export const createPublicChatSession = ai.defineFlow(
    {
        name: 'createPublicChatSession',
        inputSchema: z.object({
            userMessage: z.string(),
            aiMessage: z.string(),
        }),
        outputSchema: z.string(), // Returns the new chat ID
    },
    async ({ userMessage, aiMessage }) => {
        const db = await getDb();
        if (!db) {
            throw new Error("Database service is not available.");
        }

        const newChatId = nanoid();
        const chatRoomRef = db.collection('chatRooms').doc(newChatId);
        const messagesCol = chatRoomRef.collection('messages');

        const timestamp = firestore.FieldValue.serverTimestamp(); // CORRECTED LINE

        const chatRoomData: Omit<ChatRoom, 'id'|'lastMessage'> & { lastMessage: any } = {
            participantIds: ['public-user', 'super-admin-placeholder'], // Placeholder for admin
            participants: [{id: 'public-user', name: 'Web-Besucher'}],
            isGroupChat: false,
            createdAt: timestamp,
            lastMessage: {
                text: aiMessage,
                timestamp: timestamp,
            },
            clubId: null, // Public chat has no club
            ownerId: null,
            groupName: `Support Chat ${newChatId.substring(0, 4)}`
        };

        const firstUserMessage: Omit<ChatMessage, 'id'> = {
            senderId: 'public-user',
            senderName: 'Web-Besucher',
            text: userMessage,
            timestamp: timestamp,
        };

        const firstAiMessage: Omit<ChatMessage, 'id'> = {
            senderId: 'ai-amigo',
            senderName: 'Amigo',
            text: aiMessage,
            timestamp: timestamp,
        };
        
        try {
            const batch = db.batch();
            batch.set(chatRoomRef, chatRoomData);
            // Firestore automatically creates subcollections and documents
            batch.set(messagesCol.doc(), firstUserMessage);
            batch.set(messagesCol.doc(), firstAiMessage);
            
            await batch.commit();

            return newChatId;
        } catch(error) {
            console.error("Error in createPublicChatSession flow:", error);
            throw new Error("Failed to create chat session on the server.");
        }
    }
);
