'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GameAnalysisModal } from '@/components/GameAnalysisModal';
import { generateGameAnalysis } from '@/ai/flows/generateGameAnalysis';
import type { GameAnalysisInput } from '@/ai/flows/generateGameAnalysis.types';
import { Loader2, Calendar, Clock, Trophy, BarChart2, Search, FileSignature } from 'lucide-react';
import { useMatches } from '@/hooks/useMatches';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTeam } from '@/hooks/use-team';
import type { Match } from '@/ai/flows/matches.types';
import { Input } from '@/components/ui/input';
import { MatchClosingModal } from '@/components/ui/match-closing-modal';

const getStatusBadge = (status: Match['status']) => {
    switch (status) {
        case 'Live': return <Badge className="bg-red-500 hover:bg-red-600 animate-pulse">Live</Badge>;
        case 'Halbzeit': return <Badge className="bg-yellow-500 hover:bg-yellow-600">Halbzeit</Badge>;
        case 'Beendet': return <Badge variant="secondary">Beendet</Badge>;
        case 'Anstehend':
        default: return <Badge variant="outline">Anstehend</Badge>;
    }
}

const ClubMatchesPage = () => {
    const { club, currentUserRole } = useTeam();
    const { matches, isLoading: isLoadingMatches } = useMatches({ clubId: club?.id });
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

    const handleAnalyze = async (match: Match) => {
        setSelectedMatch(match);
        setIsAnalysisModalOpen(true);
        setIsLoadingAnalysis(true);
        try {
            const analysisInput: GameAnalysisInput = {
                opponent: match.homeTeam === 'FC Amigoal' ? match.awayTeam : match.homeTeam,
                score: `${match.homeScore}:${match.awayScore}`,
                result: match.homeScore > match.awayScore ? 'W' : match.homeScore < match.awayScore ? 'L' : 'D',
                competition: match.competition,
                events: match.events?.map(e => `${e.minute}': ${e.comment || e.type}`),
            };
            const result = await generateGameAnalysis(analysisInput);
            setAnalysisResult(result);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoadingAnalysis(false);
        }
    };
    
    const handleCloseMatch = (match: Match) => {
        setSelectedMatch(match);
        setIsClosingModalOpen(true);
    };

    const { upcoming, live, past } = useMemo(() => {
        return {
            upcoming: matches.filter(m => m.status === 'Anstehend').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
            live: matches.filter(m => m.status === 'Live' || m.status === 'Halbzeit'),
            past: matches.filter(m => m.status === 'Beendet' || m.status === 'Abgesagt').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        }
    }, [matches]);

    const MatchList = ({ matches, onAnalyze, isLoadingAnalysis, selectedMatchId }) => {
        if (matches.length === 0) {
            return <p className="text-center text-muted-foreground py-8">Keine Spiele in dieser Kategorie.</p>
        }
        return (
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Datum</TableHead>
                        <TableHead>Gegner</TableHead>
                        <TableHead>Wettbewerb</TableHead>
                        <TableHead>Resultat</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aktion</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {matches.map((match: Match) => (
                        <TableRow key={match.id}>
                            <TableCell>{new Date(match.date).toLocaleDateString('de-CH')}</TableCell>
                            <TableCell className="font-medium">{match.homeTeam === club?.name ? match.awayTeam : match.homeTeam}</TableCell>
                            <TableCell>{match.competition}</TableCell>
                            <TableCell>
                                {match.status === 'Beendet' ? `${match.homeScore} : ${match.awayScore}` : '-'}
                            </TableCell>
                             <TableCell>{getStatusBadge(match.status)}</TableCell>
                             <TableCell>
                                {match.status === 'Beendet' && (
                                    currentUserRole === 'Referee' ? (
                                        <Button variant="outline" size="sm" onClick={() => handleCloseMatch(match)}>
                                            <FileSignature className="mr-2 h-4 w-4" /> Abschliessen & Melden
                                        </Button>
                                    ) : (
                                        <Button variant="outline" size="sm" onClick={() => onAnalyze(match)}>
                                            {isLoadingAnalysis && selectedMatchId === match.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BarChart2 className="mr-2 h-4 w-4"/>}
                                            Analysieren
                                        </Button>
                                    )
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    }
    
    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Spiele</h1>
                        <p className="text-muted-foreground">Übersicht über alle vergangenen und anstehenden Spiele.</p>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Spielplan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingMatches ? (
                            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin"/></div>
                        ) : (
                             <Tabs defaultValue="upcoming">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="upcoming">Anstehend ({upcoming.length})</TabsTrigger>
                                    <TabsTrigger value="live">Live ({live.length})</TabsTrigger>
                                    <TabsTrigger value="past">Vergangen ({past.length})</TabsTrigger>
                                </TabsList>
                                <TabsContent value="upcoming" className="mt-4">
                                    <MatchList matches={upcoming} onAnalyze={handleAnalyze} isLoadingAnalysis={isLoadingAnalysis} selectedMatchId={selectedMatch?.id} />
                                </TabsContent>
                                <TabsContent value="live" className="mt-4">
                                     <MatchList matches={live} onAnalyze={handleAnalyze} isLoadingAnalysis={isLoadingAnalysis} selectedMatchId={selectedMatch?.id} />
                                </TabsContent>
                                <TabsContent value="past" className="mt-4">
                                     <MatchList matches={past} onAnalyze={handleAnalyze} isLoadingAnalysis={isLoadingAnalysis} selectedMatchId={selectedMatch?.id} />
                                </TabsContent>
                            </Tabs>
                        )}
                    </CardContent>
                </Card>
            </div>
            <GameAnalysisModal
                isOpen={isAnalysisModalOpen}
                onOpenChange={setIsAnalysisModalOpen}
                match={selectedMatch}
                analysis={analysisResult}
                isLoading={isLoadingAnalysis}
            />
            <MatchClosingModal
                isOpen={isClosingModalOpen}
                onOpenChange={setIsClosingModalOpen}
                match={selectedMatch}
            />
        </>
    );
};


const SuperAdminMatchesPage = () => {
    const { matches, isLoading: isLoadingMatches } = useMatches();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMatches = useMemo(() => {
        return matches.filter(match => 
            match.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
            match.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
            match.competition.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [matches, searchTerm]);

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Spiele-Übersicht (Alle Vereine)</CardTitle>
                        <CardDescription>
                            Alle Spiele der Plattform auf einen Blick.
                        </CardDescription>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Suchen (Team, Wettbewerb...)" 
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoadingMatches ? (
                    <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin"/></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Datum</TableHead>
                                <TableHead>Heimteam</TableHead>
                                <TableHead>Gastteam</TableHead>
                                <TableHead>Wettbewerb</TableHead>
                                <TableHead>Resultat</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMatches.map((match) => (
                                <TableRow key={match.id}>
                                    <TableCell>{new Date(match.date).toLocaleDateString('de-CH')}</TableCell>
                                    <TableCell className="font-medium">{match.homeTeam}</TableCell>
                                    <TableCell className="font-medium">{match.awayTeam}</TableCell>
                                    <TableCell>{match.competition}</TableCell>
                                    <TableCell>
                                        {match.status === 'Beendet' ? `${match.homeScore} : ${match.awayScore}` : '-'}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(match.status)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
};


export default function MatchesPage() {
    const { currentUserRole } = useTeam();

    if (currentUserRole === 'Super-Admin') {
        return <SuperAdminMatchesPage />;
    }

    return <ClubMatchesPage />;
}
