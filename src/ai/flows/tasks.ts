
'use server';
/**
 * @fileOverview Genkit flows for managing tasks using Firebase Firestore.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getDb } from '@/lib/firebase/server';
import { TaskSchema, type Task } from './tasks.types';
import type firebaseAdmin from 'firebase-admin';
import { getRbacContext, hasModuleAccess } from '@/lib/rbac';

async function getCurrentContext() {
    return await getRbacContext();
}

// Flow to get all tasks with RBAC
export const getAllTasks = ai.defineFlow(
  {
    name: 'getAllTasks',
    inputSchema: z.string().optional().nullable(), // clubId or providerId
    outputSchema: z.array(TaskSchema),
  },
  async (requestedOwnerId) => {
    const context = await getCurrentContext();
    
    // RBAC: Check if user has access to Tasks module
    if (!hasModuleAccess(context.role, 'Tasks')) {
      console.warn(`[getAllTasks] User ${context.email} with role ${context.role} denied access to Tasks module`);
      throw new Error("Zugriff verweigert: Sie haben keine Berechtigung, Aufgaben anzuzeigen.");
    }

    const db = await getDb();
    if (!db) {
      throw new Error("Database service is not available.");
    }
    try {
      let tasksCollectionRef: firebaseAdmin.firestore.Query = db.collection("tasks");

      // RBAC: Filter by clubId for non-super-admins
      let effectiveOwnerId = requestedOwnerId;
      
      if (context.role !== 'Super-Admin') {
          if (!context.clubId) {
              return [];
          }
          effectiveOwnerId = context.clubId;
      }
      
      if (effectiveOwnerId) {
        tasksCollectionRef = tasksCollectionRef.where('clubId', '==', effectiveOwnerId);
      }
      
      // REMOVED: .orderBy('createdAt', 'desc') to prevent index error. Sorting will be done client-side.
      const snapshot = await tasksCollectionRef.get();
      if (snapshot.empty) return [];
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Task[];
    } catch (error: any) {
      if (error.code === 5) {
        return [];
      }
      console.error("[getAllTasks] Error fetching tasks:", error);
      throw error;
    }
  }
);

// Flow to add a new task
export const addTask = ai.defineFlow(
  {
    name: 'addTask',
    inputSchema: TaskSchema.omit({ id: true, createdAt: true }),
    outputSchema: TaskSchema,
  },
  async (taskData) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    
    const newTask = {
        ...taskData,
        createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("tasks").add(newTask);
    return { id: docRef.id, ...newTask };
  }
);

// Flow to update a task
export const updateTask = ai.defineFlow(
  {
    name: 'updateTask',
    inputSchema: z.object({
        id: z.string(),
        data: TaskSchema.partial(),
    }),
    outputSchema: z.void(),
  },
  async ({ id, data }) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    
    await db.collection("tasks").doc(id).update(data);
  }
);

// Flow to delete a task
export const deleteTask = ai.defineFlow(
  {
    name: 'deleteTask',
    inputSchema: z.string(), // Task ID
    outputSchema: z.void(),
  },
  async (taskId) => {
    const db = await getDb();
    if (!db) throw new Error("Database service is not available.");
    await db.collection("tasks").doc(taskId).delete();
  }
);
