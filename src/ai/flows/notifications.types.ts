
/**
 * @fileOverview Types for the notifications flow.
 */
import { z } from 'zod';

export const NotificationSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  link: z.string(),
  read: z.boolean().default(false),
  createdAt: z.string(), // ISO date string
  fromUser: z.object({
      name: z.string(),
      avatar: z.string().optional(),
  }).optional(),
});

export type Notification = z.infer<typeof NotificationSchema>;
