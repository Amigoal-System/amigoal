
/**
 * @fileOverview Types for the sponsors flow.
 */
import { z } from 'zod';

export const SponsorSchema = z.object({
  id: z.string().optional(),
  company: z.string(),
  contact: z.string(),
  email: z.string().email(),
  types: z.array(z.string()),
  status: z.enum(['Active', 'Inactive', 'Expired']),
  amount: z.number(),
  contractEnd: z.string(), // ISO date string
  paymentStatus: z.enum(['Paid', 'Open', 'Overdue', 'Pending Confirmation']),
  logo: z.string().url().optional().nullable(),
  billingCycle: z.enum(['Saisonstart', 'Kalenderjahr', 'Manuell']),
});
export type Sponsor = z.infer<typeof SponsorSchema>;


export const initialSponsors: Sponsor[] = [
    { id: '1', company: 'Hauptsponsor AG', contact: 'Peter Müller', email: 'peter.mueller@hauptsponsor.ch', types: ['General'], status: 'Active', amount: 25000, contractEnd: '2025-06-30', paymentStatus: 'Paid', logo: 'https://placehold.co/80x80.png?text=HS', billingCycle: 'Saisonstart' },
    { id: '2', company: 'Ausrüster GmbH', contact: 'Sabine Meier', email: 'sabine.meier@ausruester.ch', types: ['Ausrüster'], status: 'Active', amount: 5000, contractEnd: '2024-12-31', paymentStatus: 'Paid', logo: 'https://placehold.co/80x80.png?text=AG', billingCycle: 'Saisonstart' },
    { id: '3', company: 'Banden-Partner 1', contact: 'Fritz Walter', email: 'fritz.walter@bande.ch', types: ['Banden'], status: 'Active', amount: 2500, contractEnd: '2024-08-31', paymentStatus: 'Overdue', logo: 'https://placehold.co/80x80.png?text=BP1', billingCycle: 'Kalenderjahr' },
    { id: '4', company: 'Restaurant zum Sieg', contact: 'Maria Koch', email: 'maria.koch@zum-sieg.ch', types: ['Spielerpatenschaft'], status: 'Active', amount: 1500, contractEnd: '2024-12-31', paymentStatus: 'Paid', logo: 'https://placehold.co/80x80.png?text=ZS', billingCycle: 'Manuell' },
    { id: '5', company: 'Speedy Pizza', contact: 'Luigi Rossi', email: 'luigi.rossi@pizza.ch', types: ['Spielerpatenschaft'], status: 'Active', amount: 2000, contractEnd: '2025-06-30', paymentStatus: 'Open', logo: 'https://placehold.co/80x80.png?text=SP', billingCycle: 'Saisonstart' },
    { id: '6', company: 'Maler Bunt', contact: 'Hans Bunt', email: 'hans.bunt@maler.ch', types: ['Junioren A'], status: 'Active', amount: 1000, contractEnd: '2025-06-30', paymentStatus: 'Paid', logo: 'https://placehold.co/80x80.png?text=MB', billingCycle: 'Saisonstart' },
    { id: '7', company: 'Gesundheitszentrum Vital', contact: 'Dr. Wohl', email: 'dr.wohl@vital.ch', types: ['Senioren'], status: 'Active', amount: 750, contractEnd: '2024-12-31', paymentStatus: 'Open', logo: 'https://placehold.co/80x80.png?text=GV', billingCycle: 'Kalenderjahr' },
    { id: '8', company: 'Trikot-Sponsor', contact: 'Erika Muster', email: 'erika.muster@trikot.ch', types: ['Trikot'], status: 'Active', amount: 10000, contractEnd: '2025-06-30', paymentStatus: 'Paid', logo: 'https://placehold.co/80x80.png?text=TS', billingCycle: 'Saisonstart' },
    { id: '9', company: 'Webseite-Partner', contact: 'Digital Solutions', email: 'contact@digital.ch', types: ['Digital'], status: 'Active', amount: 3000, contractEnd: '2024-12-31', paymentStatus: 'Paid', logo: 'https://placehold.co/80x80.png?text=WP', billingCycle: 'Kalenderjahr' },
    { id: '10', company: 'Media-Partner TV', contact: 'Lokal TV', email: 'info@lokal.tv', types: ['Banden'], status: 'Active', amount: 0, contractEnd: '2024-12-31', paymentStatus: 'Paid', logo: 'https://placehold.co/80x80.png?text=MP', billingCycle: 'Manuell' },
    { id: '11', company: 'Co-Sponsor Bank', contact: 'Finanz & Co.', email: 'info@finanz.co', types: ['General'], status: 'Active', amount: 15000, contractEnd: '2025-06-30', paymentStatus: 'Paid', logo: 'https://placehold.co/80x80.png?text=CS', billingCycle: 'Saisonstart' }
];
