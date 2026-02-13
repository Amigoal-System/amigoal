
'use client';

import React, from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, HeartPulse } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const myStats = {
    season: '24/25',
    gamesPlayed: 12,
    minutesPlayed: 980,
    goals: 7,
    assists: 4,
    yellowCards: 2,
    redCards: 0,
};

const myAttendance = {
    trainings: { present: 45, absent: 5, total: 50, rate: '90%' },
    matches: { present: 12, absent: 0, total: 12, rate: '100%' },
};

const lastFiveGames = [
    { opponent: 'FC Rivalen', result: 'W', score: '3-1', myGoals: 2, myAssists: 0 },
    { opponent: 'FC City', result: 'D', score: '2-2', myGoals: 1, myAssists: 1 },
    { opponent: 'United FC', result: 'W', score: '2-0', myGoals: 0, myAssists: 1 },
    { opponent: 'Metropolis SC', result: 'L', score: '1-2', myGoals: 0, myAssists: 0 },
    { opponent: 'Star FC', result: 'W', score: '4-0', myGoals: 1, myAssists: 0 },
];

export const PlayerStatistics = () => {
    const params = useParams();
    const lang = params.lang;
    
    return (
        <>
            <div className="flex flex-col gap-6">
                <h1 className="text-2xl font-bold font-headline">Meine Leistungsdaten</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-primary"/>Saisonstatistik ({myStats.season})</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <div className="p-2 rounded-md bg-muted/50"><span className="text-muted-foreground">Spiele:</span> <span className="font-semibold">{myStats.gamesPlayed}</span></div>
                            <div className="p-2 rounded-md bg-muted/50"><span className="text-muted-foreground">Minuten:</span> <span className="font-semibold">{myStats.minutesPlayed}</span></div>
                            <div className="p-2 rounded-md bg-muted/50"><span className="text-muted-foreground">Tore:</span> <span className="font-semibold">{myStats.goals}</span></div>
                            <div className="p-2 rounded-md bg-muted/50"><span className="text-muted-foreground">Assists:</span> <span className="font-semibold">{myStats.assists}</span></div>
                            <div className="p-2 rounded-md bg-muted/50"><span className="text-muted-foreground">Gelbe Karten:</span> <span className="font-semibold">{myStats.yellowCards}</span></div>
                            <div className="p-2 rounded-md bg-muted/50"><span className="text-muted-foreground">Rote Karten:</span> <span className="font-semibold">{myStats.redCards}</span></div>
                        </CardContent>
                    </Card>
                     <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary"/>Letzte 5 Spiele</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Gegner</TableHead>
                                        <TableHead>Resultat</TableHead>
                                        <TableHead>Tore</TableHead>
                                        <TableHead>Assists</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lastFiveGames.map((game, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{game.opponent}</TableCell>
                                            <TableCell>
                                                <Badge variant={game.result === 'W' ? 'default' : game.result === 'L' ? 'destructive' : 'secondary'} className={game.result === 'W' ? 'bg-green-500' : ''}>
                                                    {game.score} ({game.result})
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{game.myGoals}</TableCell>
                                            <TableCell>{game.myAssists}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                     <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><HeartPulse className="h-5 w-5 text-primary"/>Anwesenheiten</CardTitle>
                        </CardHeader>
                         <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Link href={`/${lang}/dashboard/training`} className="cursor-pointer">
                                <Card className="hover:bg-muted transition-colors">
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold">Trainings</h3>
                                        <div className="flex flex-col items-start mt-2">
                                            <span className="text-5xl font-bold">{myAttendance.trainings.rate}</span>
                                            <span className="text-sm text-muted-foreground">{myAttendance.trainings.present} von {myAttendance.trainings.total}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                             <Link href={`/${lang}/dashboard/matches`} className="cursor-pointer">
                                <Card className="hover:bg-muted transition-colors">
                                    <CardContent className="p-6">
                                        <h3 className="font-semibold">Spiele</h3>
                                        <div className="flex flex-col items-start mt-2">
                                            <span className="text-5xl font-bold">{myAttendance.matches.rate}</span>
                                            <span className="text-sm text-muted-foreground">{myAttendance.matches.present} von {myAttendance.matches.total}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
};
