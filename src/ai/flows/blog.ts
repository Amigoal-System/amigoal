
'use server';
/**
 * @fileOverview Genkit flows for managing blog posts using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { PostSchema, type Post } from './blog.types';

// Flow to get all posts
export const getAllPosts = ai.defineFlow(
  {
    name: 'getAllPosts',
    outputSchema: z.array(PostSchema),
  },
  async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    const snapshot = await db.collection("posts").orderBy('publishDate', 'desc').get();
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Post[];
  }
);

// Flow to get a single post by slug
export const getPostBySlug = ai.defineFlow(
  {
    name: 'getPostBySlug',
    inputSchema: z.string(),
    outputSchema: PostSchema.optional(),
  },
  async (slug) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    const snapshot = await db.collection("posts").where('slug', '==', slug).limit(1).get();
    if (snapshot.empty) {
        return undefined;
    }
    const doc = snapshot.docs[0];
    return { ...doc.data(), id: doc.id } as Post;
  }
);


// Flow to add a new post
export const addPost = ai.defineFlow(
  {
    name: 'addPost',
    inputSchema: PostSchema.omit({ id: true }),
    outputSchema: PostSchema,
  },
  async (postData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    const docRef = await db.collection("posts").add(postData);
    return { id: docRef.id, ...postData };
  }
);

// Flow to update a post
export const updatePost = ai.defineFlow(
  {
    name: 'updatePost',
    inputSchema: PostSchema,
    outputSchema: z.void(),
  },
  async (post) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    const { id, ...postData } = post;
    if (!id) throw new Error("Post ID is required for updating.");
    await db.collection("posts").doc(id).update(postData);
  }
);

// Flow to delete a post
export const deletePost = ai.defineFlow(
  {
    name: 'deletePost',
    inputSchema: z.string(), // Post ID
    outputSchema: z.void(),
  },
  async (postId) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    await db.collection("posts").doc(postId).delete();
  }
);
