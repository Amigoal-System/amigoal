
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import React, { useState, useEffect } from 'react';
import { AmigoalLogo } from '@/components/icons';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

const mockLiveGames = [
    { id: 1, field: 'Platz 1', teamA: 'FC Junior Lions', teamB: 'Red Star Kids', scoreA: 1, scoreB: 0, time: '12\'' },
    { id: 2, field: 'Platz 2', teamA: 'Blue Stars Talents', teamB: 'Grasshopper U10', scoreA: 2, scoreB: 2, time: '15\'' },
];

const mockUpcomingGames = [
    { time: '10:45', field: 1, teamA: 'FC Oerlikon', teamB: 'SV Höngg' },
    { time: '10:45', field: 2, teamA: 'SC Schwamendingen', teamB: 'FC Seefeld' },
    { time: '11:00', field: 1, teamA: 'FC Junior Lions', teamB: 'Blue Stars Talents' },
    { time: '11:00', field: 2, teamA: 'Red Star Kids', teamB: 'Grasshopper U10' },
];

const mockResults = [
    { teamA: 'FC Oerlikon Youngsters', teamB: 'SC Schwamendingen Future', scoreA: 2, scoreB: 1 },
    { teamA: 'SV Höngg Minis', teamB: 'FC Seefeld City', scoreA: 0, scoreB: 3 },
];

const mockStandings = {
    'Gruppe A': [
        { rank: 1, team: 'FC Junior Lions', games: 1, goals: '1:0', points: 3 },
        { rank: 2, team: 'Red Star Kids', games: 1, goals: '0:1', points: 0 },
        { rank: 3, team: 'FC Oerlikon', games: 0, goals: '0:0', points: 0 },
        { rank: 4, team: 'SV Höngg', games: 0, goals: '0:0', points: 0 },
    ],
    'Gruppe B': [
        { rank: 1, team: 'FC Seefeld City', games: 1, goals: '3:0', points: 3 },
        { rank: 2, team: 'Blue Stars Talents', games: 1, goals: '2:2', points: 1 },
        { rank: 3, team: 'Grasshopper U10', games: 1, goals: '2:2', points: 1 },
        { rank: 4, team: 'SV Höngg Minis', games: 1, goals: '0:3', points: 0 },
    ]
};

const mockHighlights = [
    { id: 1, type: 'image', url: 'https://placehold.co/600x400.png', dataAiHint: 'soccer goal celebration', caption: 'Jubel nach dem Führungstreffer!' },
    { id: 2, type: 'image', url: 'https://placehold.co/600x400.png', dataAiHint: 'fans cheering', caption: 'Tolle Stimmung am Spielfeldrand.' },
    { id: 3, type: 'video', url: 'https://placehold.co/600x400.png', dataAiHint: 'soccer skill move', caption: 'Spektakulärer Trick im Mittelfeld.' },
    { id: 4, type: 'image', url: 'https://placehold.co/600x400.png', dataAiHint: 'team huddle', caption: 'Teamgeist pur!' },
];


export default function PublicBoardPage() {

    // This simulates real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            // Here you would fetch new data. For the demo, we just trigger a re-render.
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-4 md:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen font-sans">
             <header className="text-center mb-8">
                <div className="flex justify-center items-center gap-4">
                    <AmigoalLogo className="w-16 h-16"/>
                    <h1 className="text-4xl md:text-6xl font-bold font-headline text-gray-800 dark:text-gray-100">Zürcher Sommer-Cup 2024</h1>
                </div>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                
                {/* Main Content: Live & Upcoming */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-white/80 dark:bg-black/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Badge className="bg-red-600 text-white animate-pulse">LIVE</Badge>
                                Aktuelle Spiele
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {mockLiveGames.map(game => (
                                <div key={game.id} className="p-4 rounded-lg bg-primary/10">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-medium text-muted-foreground">{game.field} | {game.time}</p>
                                    </div>
                                    <div className="grid grid-cols-3 items-center text-center mt-2">
                                        <p className="text-lg md:text-xl font-bold text-right">{game.teamA}</p>
                                        <p className="text-2xl md:text-3xl font-black mx-4">{game.scoreA} : {game.scoreB}</p>
                                        <p className="text-lg md:text-xl font-bold text-left">{game.teamB}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-black/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Kommende Spiele</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Zeit</TableHead>
                                        <TableHead>Platz</TableHead>
                                        <TableHead className="text-right">Heim</TableHead>
                                        <TableHead></TableHead>
                                        <TableHead>Gast</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockUpcomingGames.map(game => (
                                        <TableRow key={game.time + game.field}>
                                            <TableCell className="font-bold">{game.time}</TableCell>
                                            <TableCell><Badge variant="outline">Platz {game.field}</Badge></TableCell>
                                            <TableCell className="font-medium text-right">{game.teamA}</TableCell>
                                            <TableCell className="text-center text-muted-foreground">vs.</TableCell>
                                            <TableCell className="font-medium">{game.teamB}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-black/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="text-primary"/> Highlights des Tages
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {mockHighlights.map(highlight => (
                                    <div key={highlight.id} className="group relative overflow-hidden rounded-lg">
                                        <Image src={highlight.url} alt={highlight.caption} width={600} height={400} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint={highlight.dataAiHint} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                                        <p className="absolute bottom-2 left-2 text-white text-sm font-semibold">{highlight.caption}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* Sidebar: Standings & Results */}
                <div className="space-y-6">
                    <Card className="bg-white/80 dark:bg-black/50 backdrop-blur-sm">
                        <CardHeader><CardTitle>Ranglisten</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {Object.entries(mockStandings).map(([groupName, teams]) => (
                                <div key={groupName}>
                                    <h4 className="font-semibold mb-2">{groupName}</h4>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="p-1 h-8">#</TableHead>
                                                <TableHead className="p-1 h-8">Team</TableHead>
                                                <TableHead className="p-1 h-8 text-center">Sp</TableHead>
                                                <TableHead className="p-1 h-8 text-center">Tore</TableHead>
                                                <TableHead className="p-1 h-8 text-center">Pkt</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {teams.map((team, idx) => (
                                                <TableRow key={team.team}>
                                                    <TableCell className="p-1">{idx + 1}</TableCell>
                                                    <TableCell className="p-1 font-medium">{team.team}</TableCell>
                                                    <TableCell className="p-1 text-center">{team.games}</TableCell>
                                                    <TableCell className="p-1 text-center">{team.goals}</TableCell>
                                                    <TableCell className="p-1 text-center font-bold">{team.points}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 dark:bg-black/50 backdrop-blur-sm">
                        <CardHeader><CardTitle>Resultate</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableBody>
                                    {mockResults.map((result, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="text-right font-medium">{result.teamA}</TableCell>
                                            <TableCell className="text-center font-bold">{result.scoreA} : {result.scoreB}</TableCell>
                                            <TableCell className="font-medium">{result.teamB}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
