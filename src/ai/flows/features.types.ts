/**
 * @fileOverview Types for the features (roadmap) flow.
 */
import { z } from 'zod';

export const TaskSchema = z.object({
    id: z.string(),
    text: z.string(),
    done: z.boolean(),
});

export const FeatureSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string(),
  status: z.enum(['review', 'planned', 'inProgress', 'beta', 'done', 'rejected']),
  category: z.enum(['New Feature', 'Improvement', 'ai', 'Bug Report', 'Other']),
  timeline: z.string(),
  assignedTo: z.string().optional(),
  tasks: z.array(TaskSchema).optional(),
});
export type Feature = z.infer<typeof FeatureSchema>;


// Data for seeding
export const initialFeatures: Feature[] = [
    { id: '1', name: 'KI-gestützte Spielanalyse', description: 'Automatische Analyse von hochgeladenen Spielvideos mit Stärken- und Schwächen-Report.', status: 'done', category: 'ai', timeline: 'Q3 2024', assignedTo: 'AI Team', tasks: [{id: 'task-1-1', text: 'Modell trainieren', done: true}, {id: 'task-1-2', text: 'Frontend integrieren', done: true}] },
    { id: '2', name: 'Erweitertes Finanz-Dashboard', description: 'Ein neues Dashboard für detaillierte Finanzanalysen und Budgetplanung.', status: 'inProgress', category: 'Improvement', timeline: 'Q4 2024', assignedTo: 'Frontend-Team', tasks: [{id: 'task-2-1', text: 'Design finalisieren', done: true}, {id: 'task-2-2', text: 'Backend-Anbindung', done: false}, {id: 'task-2-3', text: 'Testing', done: false}] },
    { id: '3', name: 'Sponsoring-Marktplatz', description: 'Eine Plattform, auf der Sponsoren und Vereine direkt zueinander finden können.', status: 'planned', category: 'New Feature', timeline: 'Q1 2025', assignedTo: 'Team Gamma', tasks: [{id: 'task-3-1', text: 'Konzept ausarbeiten', done: false}, {id: 'task-3-2', text: 'Marktanalyse', done: false}] },
    { id: '4', name: 'Integration von Wearables', description: 'Live-Tracking von Spieler-Vitaldaten während des Trainings.', status: 'review', category: 'New Feature', timeline: 'TBD', assignedTo: '', tasks: [] },
    { id: '5', name: 'Automatisierte J+S Listen', description: 'Generierung von J+S konformen Anwesenheitslisten per Knopfdruck.', status: 'inProgress', category: 'Improvement', timeline: 'Q4 2024', assignedTo: 'Backend-Team', tasks: [{id: 'task-5-1', text: 'Anforderungen klären', done: true}, {id: 'task-5-2', text: 'PDF-Export implementieren', done: true}, {id: 'task-5-3', text: 'Verbands-API anbinden', done: false}] },
    { id: '6', name: 'Mobiler Eltern-Login', description: 'Eltern sollen sich auch über eine mobile App einloggen können, um Termine und Finanzen ihrer Kinder zu sehen.', status: 'review', category: 'New Feature', timeline: 'TBD', assignedTo: '', tasks: [] },
    { id: '7', name: 'Bessere Filter für Mitgliederliste', description: 'Die Club-Admins benötigen erweiterte Filteroptionen in der Mitgliederliste, z.B. nach Jahrgang, Zahlungsstatus und Team gleichzeitig.', status: 'planned', category: 'Improvement', timeline: 'Q4 2024', assignedTo: 'Frontend-Team', tasks: [] },
    { id: '8', name: 'Automatisches Onboarding-Tutorial', description: 'Ein interaktives Tutorial, das neue Benutzer durch die wichtigsten Funktionen der Plattform führt, um den Einstieg zu erleichtern.', status: 'review', category: 'New Feature', timeline: 'TBD', assignedTo: 'Team Gamma', tasks: [] },
];
