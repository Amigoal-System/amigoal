
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Play, Settings, Shuffle, Calendar, Users, Map, Clock } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const mockTeams = [
    { id: 1, name: 'FC Junior Lions' }, { id: 2, name: 'Red Star Kids' },
    { id: 3, name: 'Blue Stars Talents' }, { id: 4, name: 'Grasshopper U10' },
    { id: 5, name: 'FC Oerlikon Youngsters' }, { id: 6, name: 'SC Schwamendingen Future' },
    { id: 7, name: 'SV Höngg Minis' }, { id: 8, name: 'FC Seefeld City' },
];

const ScheduleSettings = ({ onGenerate }) => {
    const [numGroups, setNumGroups] = useState(2);
    const [teamsPerGroup, setTeamsPerGroup] = useState(4);
    const [gameTime, setGameTime] = useState(10);
    const [pauseTime, setPauseTime] = useState(2);
    const [availableFields, setAvailableFields] = useState(2);

    const handleGenerateClick = () => {
        onGenerate({
            numGroups,
            teamsPerGroup,
            gameTime,
            pauseTime,
            availableFields,
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5"/>Generator-Einstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Anzahl Gruppen</Label>
                    <Input type="number" value={numGroups} onChange={e => setNumGroups(parseInt(e.target.value))} min="1" />
                </div>
                <div className="space-y-2">
                    <Label>Teams pro Gruppe</Label>
                    <Input type="number" value={teamsPerGroup} onChange={e => setTeamsPerGroup(parseInt(e.target.value))} min="2" />
                </div>
                 <div className="space-y-2">
                    <Label>Verfügbare Plätze</Label>
                    <Input type="number" value={availableFields} onChange={e => setAvailableFields(parseInt(e.target.value))} min="1" />
                </div>
                <Separator />
                <div className="space-y-2">
                    <Label>Spieldauer (Minuten)</Label>
                    <Input type="number" value={gameTime} onChange={e => setGameTime(parseInt(e.target.value))} min="1" />
                </div>
                 <div className="space-y-2">
                    <Label>Pause zwischen Spielen (Minuten)</Label>
                    <Input type="number" value={pauseTime} onChange={e => setPauseTime(parseInt(e.target.value))} min="0" />
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleGenerateClick}>
                    <Play className="mr-2 h-4 w-4"/>Spielplan generieren
                </Button>
            </CardFooter>
        </Card>
    );
};

const GroupCard = ({ group, matches, onScoreChange }) => {
    const standings = useMemo(() => {
        const table = group.teams.map(team => ({
            name: team.name,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
        }));

        matches.forEach(match => {
            if (match.scoreA !== null && match.scoreB !== null) {
                const teamA = table.find(t => t.name === match.teams[0]);
                const teamB = table.find(t => t.name === match.teams[1]);

                if(teamA && teamB) {
                    teamA.played++;
                    teamB.played++;
                    teamA.goalsFor += match.scoreA;
                    teamB.goalsFor += match.scoreB;
                    teamA.goalsAgainst += match.scoreB;
                    teamB.goalsAgainst += match.scoreA;
                    teamA.goalDifference = teamA.goalsFor - teamA.goalsAgainst;
                    teamB.goalDifference = teamB.goalsFor - teamB.goalsAgainst;

                    if (match.scoreA > match.scoreB) {
                        teamA.wins++;
                        teamA.points += 3;
                        teamB.losses++;
                    } else if (match.scoreA < match.scoreB) {
                        teamB.wins++;
                        teamB.points += 3;
                        teamA.losses++;
                    } else {
                        teamA.draws++;
                        teamB.draws++;
                        teamA.points += 1;
                        teamB.points += 1;
                    }
                }
            }
        });
        
        return table.sort((a,b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor);
    }, [group.teams, matches]);


    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Gruppe {String.fromCharCode(65 + group.index)}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                 <div>
                    <h4 className="font-semibold mb-2">Spiele</h4>
                     <div className="space-y-2">
                        {matches.map((match) => (
                            <div key={match.id} className="text-xs p-2 bg-muted/50 rounded-md">
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <p>{match.teams[0]}</p>
                                        <p>{match.teams[1]}</p>
                                    </div>
                                    <div className="flex items-center gap-1 w-20">
                                        <Input type="number" className="h-6 w-10 text-center" value={match.scoreA ?? ''} onChange={(e) => onScoreChange(match.id, 'A', e.target.value)} />
                                        <span>:</span>
                                        <Input type="number" className="h-6 w-10 text-center" value={match.scoreB ?? ''} onChange={(e) => onScoreChange(match.id, 'B', e.target.value)} />
                                    </div>
                                    <div className="text-right w-20">
                                        <Badge variant="secondary">{match.time}</Badge>
                                        <p className="text-muted-foreground">Platz {match.field}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator className="my-4"/>
                
                <div>
                    <h4 className="font-semibold mb-2">Tabelle</h4>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="p-1 h-8">#</TableHead>
                                <TableHead className="p-1 h-8">Team</TableHead>
                                <TableHead className="p-1 h-8 text-center">P</TableHead>
                                <TableHead className="p-1 h-8 text-center">GD</TableHead>
                                <TableHead className="p-1 h-8 text-center">T</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {standings.map((team, idx) => (
                                <TableRow key={team.name}>
                                    <TableCell className="p-1">{idx + 1}</TableCell>
                                    <TableCell className="p-1 font-medium">{team.name}</TableCell>
                                    <TableCell className="p-1 text-center font-bold">{team.points}</TableCell>
                                    <TableCell className="p-1 text-center">{team.goalDifference}</TableCell>
                                    <TableCell className="p-1 text-center">{team.goalsFor}:{team.goalsAgainst}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};


export default function ScheduleGeneratorPage() {
    const params = useParams();
    const tournamentId = params.id;
    const lang = params.lang;
    const { toast } = useToast();
    const [schedule, setSchedule] = useState(null);

    const handleScoreChange = (matchId: number, team: 'A' | 'B', score: string) => {
        setSchedule(prev => {
            const newMatches = prev.matches.map(m => {
                if (m.id === matchId) {
                    return { ...m, [`score${team}`]: score === '' ? null : parseInt(score, 10) }
                }
                return m;
            });
            return { ...prev, matches: newMatches };
        });
    };

    const generateSchedule = (settings) => {
        const { numGroups, teamsPerGroup, gameTime, pauseTime, availableFields } = settings;
        const totalTeamsNeeded = numGroups * teamsPerGroup;

        if (mockTeams.length < totalTeamsNeeded) {
            toast({
                title: "Zu wenige Teams",
                description: `Benötigt: ${totalTeamsNeeded}, Angemeldet: ${mockTeams.length}. Bitte passen Sie die Einstellungen an.`,
                variant: "destructive"
            });
            return;
        }

        const shuffledTeams = [...mockTeams].sort(() => 0.5 - Math.random());
        const groups = Array.from({ length: numGroups }, (_, i) => ({
            index: i,
            teams: shuffledTeams.slice(i * teamsPerGroup, (i + 1) * teamsPerGroup),
        }));

        let allMatches = [];
        let matchIdCounter = 1;
        let gameCounter = 0;
        const gameDuration = gameTime + pauseTime;
        let currentTime = new Date();
        currentTime.setHours(9, 0, 0, 0); // Start time 09:00

        groups.forEach(group => {
            const groupMatches = [];
            for (let i = 0; i < group.teams.length; i++) {
                for (let j = i + 1; j < group.teams.length; j++) {
                     groupMatches.push({
                        id: matchIdCounter++,
                        teams: [group.teams[i].name, group.teams[j].name],
                        groupIndex: group.index,
                        scoreA: null,
                        scoreB: null,
                    });
                }
            }
            allMatches.push(...groupMatches);
        });

        const scheduledMatches = allMatches.map((match, index) => {
            const slot = Math.floor(gameCounter / availableFields);
            const fieldIndex = gameCounter % availableFields;
            
            const matchTime = new Date(currentTime.getTime() + slot * gameDuration * 60000);

            gameCounter++;
            return {
                ...match,
                time: matchTime.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' }),
                field: fieldIndex + 1,
            };
        });

        setSchedule({ groups, matches: scheduledMatches });

        toast({
            title: "Spielplan generiert!",
            description: `${allMatches.length} Spiele wurden erfolgreich geplant.`
        });
    };
    
    const allGamesPlayed = schedule?.matches.every(m => m.scoreA !== null && m.scoreB !== null);
    
    return (
        <div className="space-y-6">
            <Button asChild variant="ghost">
                <Link href={`/${lang}/dashboard/tournaments/${tournamentId}`}>
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Zurück zum Turnier-Cockpit
                </Link>
            </Button>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                <div className="lg:col-span-1">
                    <ScheduleSettings onGenerate={generateSchedule} />
                </div>
                <div className="lg:col-span-3">
                     <Card>
                        <CardHeader>
                            <CardTitle>Generierter Spielplan</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Tabs defaultValue="groups">
                                <TabsList>
                                    <TabsTrigger value="groups">Gruppenphase</TabsTrigger>
                                    <TabsTrigger value="ko">K.O.-Phase</TabsTrigger>
                                </TabsList>
                                <TabsContent value="groups" className="pt-4">
                                     {schedule ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {schedule.groups.map(group => (
                                                <GroupCard 
                                                    key={group.index}
                                                    group={group}
                                                    matches={schedule.matches.filter(m => m.groupIndex === group.index)}
                                                    onScoreChange={handleScoreChange}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 text-muted-foreground">
                                            <p>Bitte generieren Sie einen Spielplan über die Einstellungen.</p>
                                        </div>
                                    )}
                                </TabsContent>
                                 <TabsContent value="ko" className="pt-4">
                                     <div className="text-center py-16 text-muted-foreground">
                                        <p className="mb-4">Die K.O.-Phase kann generiert werden, sobald alle Gruppenspiele erfasst sind.</p>
                                        <Button disabled={!allGamesPlayed}>K.O.-Phase generieren</Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
