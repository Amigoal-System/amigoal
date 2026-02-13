
'use server';
/**
 * @fileOverview Genkit flows for managing notifications.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { NotificationSchema, type Notification } from './notifications.types';

// Flow to create a notification
export const createNotification = ai.defineFlow(
  {
    name: 'createNotification',
    inputSchema: NotificationSchema.omit({ id: true, createdAt: true, read: true }),
    outputSchema: NotificationSchema,
  },
  async (notificationData) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }

    const newNotification = {
        ...notificationData,
        read: false,
        createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("notifications").add(newNotification);
    return { id: docRef.id, ...newNotification };
  }
);
