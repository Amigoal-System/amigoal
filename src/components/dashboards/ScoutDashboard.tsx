'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BarChart, Users, DollarSign, Target, FileText, Calendar, Video, Search, Eye } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type Locale } from '@/../i18n.config';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReviewStars } from '../blocks/animated-cards-stack';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useHighlights } from '@/hooks/useHighlights';


const mockUpcomingGames = [
    { id: 1, date: '2024-08-10', homeTeam: 'Junioren A1', awayTeam: 'FC Rivalen', competition: 'Meisterschaft' },
    { id: 2, date: '2024-08-11', homeTeam: 'Junioren B1', awayTeam: 'FC City', competition: 'Cup' },
    { id: 3, date: '2024-08-17', homeTeam: '1. Mannschaft', awayTeam: 'FC Metropolis', competition: 'Meisterschaft' },
];

export function ScoutDashboard() {
    const params = useParams();
    const lang = params.lang as Locale;
    const { watchlist, isLoading: isLoadingWatchlist } = useWatchlist();
    const { highlights, isLoading: isLoadingHighlights } = useHighlights();
    
    const ratedHighlights = highlights.filter(h => h.scoutRating !== null && h.scoutRating > 0).slice(0, 3);

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-headline">Scouting Dashboard</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Meine Watchlist</CardTitle>
                            <CardDescription>Spieler, die Sie aktuell beobachten.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Spieler</TableHead>
                                        <TableHead>Team</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead>Potenzial</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(isLoadingWatchlist ? [] : watchlist).slice(0, 5).map(player => (
                                        <TableRow key={player.id}>
                                            <TableCell className="flex items-center gap-2 font-medium">
                                                <Avatar className="h-8 w-8"><AvatarImage src={player.avatarUrl} /><AvatarFallback>{player.name.slice(0,2)}</AvatarFallback></Avatar>
                                                {player.name}
                                            </TableCell>
                                            <TableCell>{player.teamName}</TableCell>
                                            <TableCell>{player.position}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                     <ReviewStars rating={player.potential || 0} />
                                                     <span className="text-xs text-muted-foreground">({player.potential?.toFixed(1) || 'N/A'})</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" asChild>
                                <Link href={`/${lang}/dashboard/scouting/watchlist`}>Zur vollständigen Watchlist</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Anstehende Spiele</CardTitle>
                             <CardDescription>Relevante Spiele für Ihr Scouting.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {mockUpcomingGames.map(game => (
                                    <div key={game.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                                        <div>
                                            <p className="font-semibold">{game.homeTeam} vs. {game.awayTeam}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(game.date).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })} - {game.competition}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/${lang}/dashboard/matches`}>
                                                Details <ArrowRight className="ml-2 h-4 w-4"/>
                                            </Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Schnellzugriff</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                             <Button variant="outline" className="justify-start gap-2" asChild>
                                <Link href={`/${lang}/dashboard/player-placement`}>
                                    <Search className="h-4 w-4"/> Spieler suchen
                                </Link>
                            </Button>
                            <Button variant="outline" className="justify-start gap-2" asChild>
                                <Link href={`/${lang}/dashboard/highlights`}>
                                    <Video className="h-4 w-4"/> Highlights ansehen
                                </Link>
                            </Button>
                            <Button variant="outline" className="justify-start gap-2" asChild>
                                <Link href={`/${lang}/dashboard/scouting/reports`}>
                                    <FileText className="h-4 w-4"/> Berichte erstellen
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Zuletzt bewertete Highlights</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                             {isLoadingHighlights ? <p>Lade...</p> : ratedHighlights.map(highlight => (
                                <div key={highlight.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                                    <img src={highlight.videoUrl} alt="highlight" className="w-16 h-10 object-cover rounded-md" data-ai-hint={highlight.dataAiHint}/>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{highlight.user}</p>
                                        <div className="flex items-center gap-1">
                                            <ReviewStars rating={highlight.scoutRating!} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default ScoutDashboard;
