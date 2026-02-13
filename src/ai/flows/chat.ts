
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
import { getRbacContext, hasModuleAccess } from '@/lib/rbac';

async function getCurrentContext() {
    return await getRbacContext();
}

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
        const context = await getCurrentContext();
        
        // RBAC: Check if user has access to Chat module
        if (!hasModuleAccess(context.role, 'Chat')) {
          console.warn(`[createPublicChatSession] User ${context.email} with role ${context.role} denied access to Chat module`);
          throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, den Chat zu nutzen.");
        }

        const db = await getDb();
        if (!db) {
            throw new Error("Database service is not available.");
        }

        const newChatId = nanoid();
        const chatRoomRef = db.collection('chatRooms').doc(newChatId);
        const messagesCol = chatRoomRef.collection('messages');

        const timestamp = firestore.FieldValue.serverTimestamp();

        const chatRoomData: Omit<ChatRoom, 'id'|'lastMessage'> & { lastMessage: any } = {
            participantIds: ['public-user', 'super-admin-placeholder'],
            participants: [{id: 'public-user', name: 'Web-Besucher'}],
            isGroupChat: false,
            createdAt: timestamp,
            lastMessage: {
                text: aiMessage,
                timestamp: timestamp,
            },
            clubId: null,
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

// Flow to get chat rooms for current user
export const getUserChatRooms = ai.defineFlow(
    {
        name: 'getUserChatRooms',
        inputSchema: z.void().optional().nullable(),
        outputSchema: z.array(z.any()),
    },
    async () => {
        const context = await getCurrentContext();
        
        // RBAC: Check if user has access to Chat module
        if (!hasModuleAccess(context.role, 'Chat')) {
          console.warn(`[getUserChatRooms] User ${context.email} with role ${context.role} denied access to Chat module`);
          throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, den Chat zu nutzen.");
        }

        const db = await getDb();
        if (!db) {
            throw new Error("Database service is not available.");
        }

        try {
            let query = db.collection("chatRooms");
            
            // Filter by user participation
            if (context.userId) {
                query = query.where('participantIds', 'array-contains', context.userId);
            } else if (context.role === 'Super-Admin') {
                // Super-Admin can see all chat rooms
            } else {
                // Filter by club
                if (context.clubId) {
                    query = query.where('clubId', '==', context.clubId);
                } else {
                    return [];
                }
            }
            
            const snapshot = await query.orderBy('lastMessage.timestamp', 'desc').get();
            return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        } catch (error) {
            console.error("Error fetching chat rooms:", error);
            return [];
        }
    }
);

// Flow to send a message to a chat room
export const sendChatMessage = ai.defineFlow(
    {
        name: 'sendChatMessage',
        inputSchema: z.object({
            chatRoomId: z.string(),
            text: z.string(),
            senderName: z.string(),
        }),
        outputSchema: z.string(), // Returns message ID
    },
    async ({ chatRoomId, text, senderName }) => {
        const context = await getCurrentContext();
        
        // RBAC: Check if user has access to Chat module
        if (!hasModuleAccess(context.role, 'Chat')) {
          console.warn(`[sendChatMessage] User ${context.email} with role ${context.role} denied access to Chat module`);
          throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, Nachrichten zu senden.");
        }

        const db = await getDb();
        if (!db) {
            throw new Error("Database service is not available.");
        }

        try {
            const chatRoomRef = db.collection('chatRooms').doc(chatRoomId);
            const messagesCol = chatRoomRef.collection('messages');
            const timestamp = firestore.FieldValue.serverTimestamp();
            
            const messageData = {
                senderId: context.userId || 'unknown',
                senderName: senderName,
                text: text,
                timestamp: timestamp,
            };
            
            const messageRef = await messagesCol.doc().set(messageData);
            
            // Update last message in chat room
            await chatRoomRef.update({
                lastMessage: {
                    text: text,
                    timestamp: timestamp,
                }
            });
            
            return "Message sent successfully";
        } catch (error) {
            console.error("Error sending message:", error);
            throw new Error("Failed to send message.");
        }
    }
);
