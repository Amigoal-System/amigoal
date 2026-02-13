
import { z } from 'zod';

export const PostSchema = z.object({
  id: z.string().optional(),
  slug: z.string(),
  title: z.string(),
  publishDate: z.string(),
  author: z.object({
    name: z.string(),
    avatar: z.string(),
  }),
  summary: z.string(),
  content: z.string(),
  stats: z.object({
      views: z.number(),
      likes: z.number(),
      comments: z.number(),
  }),
});

export type Post = z.infer<typeof PostSchema>;
