
/**
 * @fileOverview Types for the polls flow.
 */
import { z } from 'zod';

export const PollOptionSchema = z.object({
    id: z.number(),
    text: z.string(),
    votes: z.number(),
});
export type PollOption = z.infer<typeof PollOptionSchema>;

export const PollTargetSchema = z.object({
    level: z.enum(['public', 'club', 'team']),
    id: z.string().optional(), // teamId if level is 'team'
});
export type PollTarget = z.infer<typeof PollTargetSchema>;

export const PollSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  options: z.array(PollOptionSchema),
  createdBy: z.string(),
  createdAt: z.string(), // ISO date string
  clubId: z.string().optional(),
  target: PollTargetSchema.optional(),
  voters: z.array(z.string()).optional(), // Store userIds of those who voted
});
export type Poll = z.infer<typeof PollSchema>;
