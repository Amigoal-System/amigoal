/**
 * @fileOverview Types for the sponsor leads flow.
 */
import { z } from 'zod';

export const SponsorLeadSchema = z.object({
  id: z.string().optional(),
  company: z.string(),
  industry: z.string(),
  contact: z.string(),
  interest: z.string(),
  email: z.string().email(),
  packages: z.array(z.string()).optional(),
});
export type SponsorLead = z.infer<typeof SponsorLeadSchema>;


export const initialSponsorLeads: SponsorLead[] = [
    { id: '1', company: 'Zürich Versicherung', industry: 'Versicherung', contact: 'Olivia Brunner', interest: 'Starke lokale Präsenz', email: 'olivia.brunner@zurich.ch' },
    { id: '2', company: 'Sport-Shop Meier', industry: 'Sportartikel', contact: 'Reto Meier', interest: 'Trikot-Sponsoring, Ausrüstung', email: 'reto.meier@sport-shop.ch' },
    { id: '3', company: 'TechNova Solutions GmbH', industry: 'IT-Dienstleistungen', contact: 'David Chen', interest: 'Digitales Sponsoring, Jugendförderung', email: 'david.chen@technova.ch' },
];
