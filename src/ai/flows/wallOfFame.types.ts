/**
 * @fileOverview Types for the Wall of Fame flow.
 */
import { z } from 'zod';

// Define the Zod schema for a single honorary member for validation.
export const HonoraryMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  image: z.string().url().optional(),
  dataAiHint: z.string().optional(),
  achievements: z.array(z.string()),
});

export type HonoraryMember = z.infer<typeof HonoraryMemberSchema>;

export const initialHonoraryMembers: HonoraryMember[] = [
    {
        id: '1',
        name: 'Karl-Heinz Rummenigge',
        title: 'Ehrenpräsident',
        image: 'https://placehold.co/400x500.png?text=KHR',
        dataAiHint: 'older man portrait',
        achievements: [
            'Spieler des Jahrzehnts (1980er)',
            'Langjähriger Vorstandsvorsitzender',
            'Torschützenkönig Bundesliga 1980, 1981, 1984'
        ]
    },
];
