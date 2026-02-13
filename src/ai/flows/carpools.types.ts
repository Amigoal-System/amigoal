
/**
 * @fileOverview Types for the carpools flow.
 */
import { z } from 'zod';

export const PassengerSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type Passenger = z.infer<typeof PassengerSchema>;

export const CarpoolSchema = z.object({
  id: z.string().optional(),
  matchId: z.string(),
  driverId: z.string(),
  driverName: z.string(),
  maxSeats: z.number(),
  seatsAvailable: z.number(),
  passengers: z.array(PassengerSchema).optional(),
});
export type Carpool = z.infer<typeof CarpoolSchema>;

export const initialCarpools: Carpool[] = [
    {
        id: 'carpool-1',
        matchId: 'match-123', // Corresponds to the mock matchId in ParentDashboard
        driverId: 'parent-2',
        driverName: 'Familie Müller',
        maxSeats: 4,
        seatsAvailable: 2,
        passengers: [{ id: 'player-102', name: 'Cristiano Ronaldo' }],
    },
];
