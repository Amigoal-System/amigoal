
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Clock, HandHelping } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AmigoalLogo } from '@/components/icons';
import { Badge } from '@/components/ui/badge';


const initialStations = [
  { 
    id: '1',
    name: 'Grillstand', 
    shifts: [
      { id: '101', time: '10:00 - 12:00', needed: 2, assigned: ['1'] },
      { id: '102', time: '12:00 - 14:00', needed: 2, assigned: [] },
      { id: '103', time: '14:00 - 16:00', needed: 2, assigned: [] },
    ]
  },
  { 
    id: '2',
    name: 'Getränkeverkauf', 
    shifts: [
      { id: '201', time: '10:00 - 12:00', needed: 1, assigned: ['2'] },
      { id: '202', time: '12:00 - 14:00', needed: 2, assigned: ['3'] },
      { id: '203', time: '14:00 - 16:00', needed: 2, assigned: [] },
    ]
  },
  { 
    id: '3',
    name: 'Aufbau & Logistik', 
    shifts: [
      { id: '301', time: '08:00 - 10:00', needed: 4, assigned: ['4'] },
    ]
  }
];

const initialHelpers = [
  { id: '1', name: 'Peter Lustig' },
  { id: '2', name: 'Erika Muster' },
  { id: '3', name: 'Max Power' },
  { id: '4', name: 'Anna Konda' },
];


export default function PublicHelperSchedulePage() {
    const params = useParams();
    const tournamentId = params.id;
    const lang = params.lang;
    const [stations, setStations] = useState(initialStations);
    const [helpers, setHelpers] = useState(initialHelpers);

    const getHelperById = (id: string) => helpers.find(h => h.id === id);

    return (
         <div className="p-4 md:p-8 bg-muted/20 min-h-screen font-sans">
            <header className="text-center mb-8">
                <div className="flex justify-center items-center gap-4">
                    <AmigoalLogo className="w-16 h-16"/>
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-gray-800 dark:text-gray-100">Helfer-Einsatzplan: Zürcher Sommer-Cup 2024</h1>
                </div>
                 <p className="text-muted-foreground mt-2">Vielen Dank für deinen Einsatz!</p>
            </header>

            <main className="max-w-5xl mx-auto space-y-8">
                {stations.map(station => (
                     <Card key={station.id}>
                        <CardHeader>
                            <CardTitle className="text-2xl">{station.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="divide-y">
                                {station.shifts.map(shift => (
                                    <div key={shift.id} className="py-3 grid grid-cols-3 items-center gap-4">
                                        <div className="flex items-center gap-2 font-medium">
                                            <Clock className="h-5 w-5 text-primary"/>
                                            <span>{shift.time}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <div className="grid grid-cols-2 gap-2">
                                                {shift.assigned.map(helperId => {
                                                    const helper = getHelperById(helperId);
                                                    return helper ? (
                                                        <div key={helper.id} className="bg-primary/10 text-primary-foreground p-2 rounded-md flex items-center gap-2 text-sm">
                                                            <Avatar className="w-6 h-6 text-xs"><AvatarFallback>{helper.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar>
                                                            <span className="font-semibold text-primary">{helper.name}</span>
                                                        </div>
                                                    ) : null;
                                                })}
                                                
                                                {Array.from({ length: shift.needed - shift.assigned.length }).map((_, i) => (
                                                     <div key={i} className="bg-muted/50 p-2 rounded-md flex items-center gap-2 text-sm text-muted-foreground">
                                                         <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center">?</div>
                                                        <span>Helfer gesucht</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </main>
        </div>
    );
}
