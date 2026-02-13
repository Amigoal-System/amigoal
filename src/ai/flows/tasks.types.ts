/**
 * @fileOverview Types for the tasks flow.
 */
import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  status: z.enum(['To Do', 'In Progress', 'Done']),
  priority: z.enum(['Low', 'Medium', 'High']),
  dueDate: z.string(), // ISO date string
  assignee: z.string(),
  from: z.string(),
  createdAt: z.string(), // ISO date string
  clubId: z.string().optional(), // To associate task with a club
});

export type Task = z.infer<typeof TaskSchema>;

export const initialTasks: Omit<Task, 'id'>[] = [
  { 
    title: 'Review last match footage', 
    status: 'Done', 
    priority: 'High', 
    dueDate: '2024-07-28', 
    description: 'Analyze the recording from the last match against FC Rivals, focus on defensive positioning.', 
    assignee: 'self', 
    from: 'self',
    createdAt: new Date().toISOString()
  },
  { 
    title: 'Plan offensive drills for next session', 
    status: 'In Progress', 
    priority: 'High', 
    dueDate: '2024-07-30', 
    description: 'Prepare 3 new drills for improving finishing and final passes.', 
    assignee: 'self', 
    from: 'self',
    createdAt: new Date().toISOString()
  },
  { 
    title: 'Confirm travel arrangements for away game', 
    status: 'To Do', 
    priority: 'Medium', 
    dueDate: '2024-08-01', 
    description: 'Book the bus and confirm the departure time with the team manager.', 
    from: 'self', 
    assignee: 'Marina G.',
    createdAt: new Date().toISOString()
  },
  { 
    title: 'Update player fitness reports', 
    status: 'To Do', 
    priority: 'Low', 
    dueDate: '2024-08-05', 
    description: 'Collect data from fitness trackers and update individual player profiles.', 
    assignee: 'self', 
    from: 'self',
    createdAt: new Date().toISOString()
  },
  { 
    title: 'Elterngespräch T.Müller organisieren', 
    status: 'To Do', 
    priority: 'High', 
    dueDate: '2024-08-10', 
    description: 'Termin für Gespräch mit den Eltern von Thomas Müller finden.', 
    assignee: 'self', 
    from: 'self',
    createdAt: new Date().toISOString()
  },
  { 
    title: 'Teamfoto organisieren', 
    status: 'In Progress', 
    priority: 'Medium', 
    dueDate: '2024-08-12', 
    from: 'Max Meier', 
    assignee: 'Marina G.',
    createdAt: new Date().toISOString()
  },
];
