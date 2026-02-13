
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { getAllTasks, addTask as addTaskFlow, updateTask, deleteTask } from '@/ai/flows/tasks';
import type { Task } from '@/ai/flows/tasks.types';

export const useTasks = (ownerId?: string | null) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      // Pass ownerId to the flow. If ownerId is undefined, it fetches all tasks (the old behavior).
      const allTasks = await getAllTasks(ownerId);
      // Sort client-side
      allTasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTasks(allTasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      toast({ title: "Fehler beim Laden der Aufgaben", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, ownerId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      // Ensure the task is created with the correct ownerId
      await addTaskFlow({ ...newTaskData, clubId: ownerId });
      await fetchTasks();
      toast({ title: "Aufgabe erstellt!" });
    } catch (error) {
      console.error("Failed to add task:", error);
      toast({ title: "Fehler beim Erstellen der Aufgabe", variant: "destructive" });
    }
  };

  const handleUpdateTask = async (taskId: string, updatedData: Partial<Task>) => {
    try {
      await updateTask({ id: taskId, data: updatedData });
      await fetchTasks();
      toast({ title: "Aufgabe aktualisiert" });
    } catch (error) {
      console.error("Failed to update task:", error);
      toast({ title: "Fehler beim Aktualisieren", variant: "destructive" });
    }
  };

  const archiveTask = async (taskId: string) => {
    const taskToArchive = tasks.find(t => t.id === taskId);
    if (taskToArchive) {
      try {
        await updateTask({ id: taskId, data: { status: 'Done' } });
        await fetchTasks();
        toast({ title: `Aufgabe "${taskToArchive.title}" als erledigt markiert.` });
      } catch (error) {
        console.error("Failed to archive task:", error);
        toast({ title: "Fehler beim Archivieren", variant: "destructive" });
      }
    }
  };

  const unarchiveTask = async (taskId: string) => {
     try {
        const taskToUnarchive = tasks.find(t => t.id === taskId) || archivedTasks.find(t => t.id === taskId);
        if (taskToUnarchive) {
            await updateTask({ id: taskId, data: { status: 'To Do' } });
            await fetchTasks();
            toast({ title: `Aufgabe "${taskToUnarchive.title}" wiederhergestellt.` });
        }
     } catch(error) {
         console.error("Failed to unarchive task:", error);
         toast({ title: "Fehler beim Wiederherstellen", variant: "destructive" });
     }
  };

  const activeTasks = tasks.filter(t => t.status !== 'Done');
  const archivedTasks = tasks.filter(t => t.status === 'Done');

  return {
    tasks: activeTasks,
    archivedTasks,
    isLoading,
    addTask: addTask,
    updateTask: handleUpdateTask,
    archiveTask,
    unarchiveTask,
  };
};
