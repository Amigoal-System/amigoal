
/**
 * @fileOverview Types for the camp/bootcamp providers flow.
 */
import { z } from 'zod';

const ReviewSchema = z.object({
    id: z.string(),
    author: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string(),
    date: z.string(),
});

const PitchDetailsSchema = z.object({
    naturalGrass: z.number().optional(),
    artificialGrass: z.number().optional(),
    smallPitches: z.number().optional(),
});

export const SportsFacilitySchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  location: z.string(),
  description: z.string().optional(),
  features: z.array(z.string()),
  images: z.array(z.string().optional()).optional(),
  rating: z.number().optional(),
  reviews: z.array(ReviewSchema).optional(),
  address: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal('')).nullable(),
  contactPhone: z.string().optional(),
  pitchDetails: PitchDetailsSchema.optional(),
  owner: z.enum(['Eigenbesitz', 'Zugelieferer']).optional().default('Eigenbesitz'),
});
export type SportsFacility = z.infer<typeof SportsFacilitySchema>;
export type Review = z.infer<typeof ReviewSchema>;

const AddressSchema = z.object({
    street: z.string().optional(),
    zip: z.string().optional(),
    city: z.string().optional(),
}).optional();

const PaymentConfigSchema = z.object({
    iban: z.string().optional().nullable(),
    paypalEmail: z.string().email().optional().nullable(),
    twintLink: z.string().url().optional().nullable(),
}).optional();

export const EvaluationAttributeSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
});
export type EvaluationAttribute = z.infer<typeof EvaluationAttributeSchema>;

export const ProviderSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  contact: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  website: z.string().url().optional().nullable(),
  instagram: z.string().url().optional().nullable(),
  facebook: z.string().url().optional().nullable(),
  regions: z.array(z.string()),
  facilities: z.array(SportsFacilitySchema),
  commission: z.string(), // e.g. "10%"
  type: z.enum(['Trainingslager', 'Bootcamp', 'Turnier']).optional(),
  paymentConfig: PaymentConfigSchema,
  address: AddressSchema,
  billingAddress: AddressSchema,
  evaluationAttributes: z.array(EvaluationAttributeSchema).optional(),
});
export type Provider = z.infer<typeof ProviderSchema>;


export const initialProviders: Provider[] = [
    { 
        id: '1', 
        name: 'TUI Sports', 
        contact: 'Peter Pan', 
        regions: ['Spanien', 'Türkei'], 
        facilities: [
            { id: '1', name: 'LaLiga Training Center', location: 'Mallorca, Spanien', features: ['2x Rasenplätze', 'Kraftraum', '5-Sterne Hotel'], description: 'Top-modernes Trainingszentrum auf Mallorca.' },
            { id: '2', name: 'Gloria Sports Arena', location: 'Belek, Türkei', features: ['5x Rasenplätze', 'Leichtathletikstadion', 'Hallenbad'], description: 'Professionelle Bedingungen an der türkischen Riviera.' }
        ], 
        commission: '10%', 
        website: 'https://www.tui-sports.com', 
        email: 'peter.pan@tui.com', 
        phone: '+41 79 123 45 67',
        type: 'Trainingslager',
        instagram: null,
        facebook: null,
        address: { street: 'Hauptstrasse 1', zip: '8001', city: 'Zürich' },
        billingAddress: { street: 'Postfach 123', zip: '8021', city: 'Zürich' },
    },
    { 
        id: '2', 
        name: 'ITS Coop Travel', 
        contact: 'Erika Musterfrau', 
        regions: ['Italien', 'Schweiz'], 
        facilities: [
             { id: '3', name: 'Centro Sportivo Tenero', location: 'Tenero, Schweiz', features: ['3x Rasenplätze', '3x Kunstrasen', 'Sporthallen'], description: 'Nationales Sportzentrum im Tessin.' }
        ], 
        commission: '8%', 
        website: 'https://www.its-coop.ch', 
        email: 'erika.m@its.ch', 
        phone: '+41 44 123 45 67',
        type: 'Trainingslager',
        instagram: null,
        facebook: null,
        address: { street: 'Via Cantonale 10', zip: '6900', city: 'Lugano' },
        billingAddress: { street: 'Via Cantonale 10', zip: '6900', city: 'Lugano' },
    },
];
