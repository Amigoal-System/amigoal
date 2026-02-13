
import { z } from 'zod';
import { MemberSchema } from './members.types';
import { ClubRuleSchema } from './configurations.types';

const TrainingTimeSchema = z.object({
  id: z.string(),
  day: z.string(),
  from: z.string(),
  to: z.string(),
  location: z.string(),
});

const TeamMaterialSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number(),
});

const TeamStaffSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.string(), // e.g., 'Haupt-Trainer', 'Co-Trainer', 'Physio'
});

export const TeamSchema = z.object({
  id: z.string().optional(),
  clubId: z.string(),
  name: z.string(),
  category: z.string(),
  liga: z.string(),
  season: z.string().optional(),
  trainer: z.string().optional(),
  members: z.number().optional(), // player count
  openSpots: z.number().optional(),
  teamPhotoUrl: z.string().url().optional().nullable(),
  staff: z.array(TeamStaffSchema).optional(),
  players: z.array(MemberSchema.pick({ id: true, firstName: true, lastName: true, position: true, trikot: true, fee: true })).optional(),
  trainings: z.array(TrainingTimeSchema).optional(),
  material: z.array(TeamMaterialSchema).optional(),
  garderobe: z.string().optional(), // Locker room
  rules: z.array(ClubRuleSchema).optional(),
});
export type Team = z.infer<typeof TeamSchema>;

export const CreateTeamSchema = TeamSchema.omit({ id: true });
export type CreateTeamInput = z.infer<typeof CreateTeamSchema>;
