
/**
 * @fileOverview Types for the trainings flow.
 */
import { z } from 'zod';

export const TrainingSchema = z.object({
  id: z.string().optional(),
  clubId: z.string().optional(), // Added to associate training with a club
  name: z.string(),
  trainer: z.string(),
  day: z.string(),
  date: z.string(),
  from: z.string(),
  to: z.string(),
  field: z.string(),
  lockerRoom: z.number(),
  team: z.string(),
  prepared: z.boolean(),
  type: z.string().optional().default('training'), // To distinguish from matches in a unified calendar
});

export type Training = z.infer<typeof TrainingSchema>;

export const initialTrainings: Training[] = [
    // FC Awesome
    { id: '1', clubId: 'FC Awesome', name: '1. Mannschaft', trainer: 'Pep Guardiola', day: 'Montag', date: '2024-07-29', from: '18:30', to: '20:00', field: 'Hauptplatz A', lockerRoom: 1, team: '1. Mannschaft', prepared: true, type: 'training' },
    { id: '2', clubId: 'FC Awesome', name: 'Junioren A1', trainer: 'Zinedine Zidane', day: 'Dienstag', date: '2024-07-30', from: '19:00', to: '20:30', field: 'Kunstrasen', lockerRoom: 3, team: 'Junioren A1', prepared: false, type: 'training' },
    { id: '3', clubId: 'FC Awesome', name: '1. Mannschaft', trainer: 'Pep Guardiola', day: 'Mittwoch', date: '2024-07-31', from: '18:30', to: '20:00', field: 'Hauptplatz A', lockerRoom: 1, team: '1. Mannschaft', prepared: true, type: 'training' },
    { id: '4', clubId: 'FC Awesome', name: 'Junioren B1', trainer: 'Jürgen Klopp', day: 'Donnerstag', date: '2024-08-01', from: '18:00', to: '19:30', field: 'Platz 2', lockerRoom: 5, team: 'Junioren B1', prepared: false, type: 'training' },
    
    // FC Albania
    { id: '5', clubId: 'FC Albania', name: 'Aktive', trainer: 'Gianni De Biasi', day: 'Dienstag', date: '2024-07-30', from: '20:00', to: '21:30', field: 'Platz 1', lockerRoom: 2, team: 'Aktive', prepared: true, type: 'training' },
    { id: '6', clubId: 'FC Albania', name: 'Junioren D', trainer: 'Lorik Cana', day: 'Mittwoch', date: '2024-07-31', from: '17:30', to: '19:00', field: 'Platz 3', lockerRoom: 6, team: 'Junioren D', prepared: false, type: 'training' },
];
