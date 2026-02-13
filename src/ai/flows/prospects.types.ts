
import { z } from 'zod';

export const ProspectSchema = z.object({
  id: z.string(),
  name: z.string(),
  contact: z.string(),
});

export type Prospect = z.infer<typeof ProspectSchema>;

export const initialWebsiteProspects: Prospect[] = [
    { id: 'prospect-1', name: 'FC Adliswil', contact: 'info@fcadliswil.ch' },
    { id: 'prospect-2', name: 'FC Kilchberg-Rüschlikon', contact: 'info@fckr.ch' },
];
