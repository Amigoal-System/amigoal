
import { z } from 'zod';

export const ChatParticipantSchema = z.object({
    id: z.string(),
    name: z.string(),
});

export const LastMessageSchema = z.object({
    text: z.string(),
    timestamp: z.any(), // Can be Date or server timestamp
});

export const ChatRoomSchema = z.object({
    id: z.string().optional(),
    ownerId: z.string().optional().nullable(), // The user ID of the chat owner (admin/coach)
    participantIds: z.array(z.string()),
    participants: z.array(ChatParticipantSchema),
    isGroupChat: z.boolean(),
    groupName: z.string().optional().nullable(),
    clubId: z.string().optional().nullable(),
    createdAt: z.any(),
    lastMessage: LastMessageSchema.nullable(),
});

export const ChatMessageSchema = z.object({
    id: z.string().optional(),
    senderId: z.string(),
    senderName: z.string(),
    text: z.string(),
    timestamp: z.any(),
});

export type ChatRoom = z.infer<typeof ChatRoomSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
