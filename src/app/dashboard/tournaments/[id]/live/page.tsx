
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, Save } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const mockMatches = [
    { id: 1, time: '10:00', field: 1, teamA: 'FC Junior Lions', teamB: 'Red Star Kids', scoreA: null, scoreB: null, status: 'pending' },
    { id: 2, time: '10:00', field: 2, teamA: 'Blue Stars Talents', teamB: 'Grasshopper U10', scoreA: null, scoreB: null, status: 'pending' },
    { id: 3, time: '10:15', field: 1, teamA: 'FC Oerlikon Youngsters', teamB: 'SC Schwamendingen Future', scoreA: 2, scoreB: 1, status: 'finished' },
    { id: 4, time: '10:15', field: 2, teamA: 'SV Höngg Minis', teamB: 'FC Seefeld City', scoreA: null, scoreB: null, status: 'pending' },
    { id: 5, time: '10:30', field: 1, teamA: 'FC Junior Lions', teamB: 'Blue Stars Talents', scoreA: null, scoreB: null, status: 'pending' },
    { id: 6, time: '10:30', field: 2, teamA: 'Red Star Kids', teamB: 'Grasshopper U10', scoreA: null, scoreB: null, status: 'pending' },
];

export default function LiveResultPage() {
    const params = useParams();
    const tournamentId = params.id;
    const lang = params.lang;
    const { toast } = useToast();
    const [matches, setMatches] = useState(mockMatches);

    const handleScoreChange = (matchId, team, value) => {
        setMatches(prev => prev.map(m => {
            if (m.id === matchId) {
                return { ...m, [team === 'A' ? 'scoreA' : 'scoreB']: value === '' ? null : Number(value) };
            }
            return m;
        }));
    };
    
    const handleSaveScore = (matchId) => {
        const match = matches.find(m => m.id === matchId);
        if (match.scoreA === null || match.scoreB === null) {
            toast({
                title: "Unvollständiges Resultat",
                description: "Bitte tragen Sie beide Torzahlen ein.",
                variant: "destructive"
            });
            return;
        }
        
        setMatches(prev => prev.map(m => m.id === matchId ? {...m, status: 'finished'} : m));

        toast({
            title: "Resultat gespeichert!",
            description: `${match.teamA} ${match.scoreA} : ${match.scoreB} ${match.teamB}`,
        });
    };

    const upcomingMatches = useMemo(() => {
        return matches.filter(m => m.status === 'pending').sort((a,b) => a.time.localeCompare(b.time));
    }, [matches]);

    return (
        <div className="space-y-6">
            <Button asChild variant="ghost">
                <Link href={`/${lang}/dashboard/tournaments/${tournamentId}`}>
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Zurück zum Turnier-Cockpit
                </Link>
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle>Live-Resultate erfassen</CardTitle>
                    <CardDescription>
                        Tragen Sie hier die Ergebnisse der Spiele in Echtzeit ein. Die öffentlichen Boards werden sofort aktualisiert.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {upcomingMatches.length > 0 ? upcomingMatches.map(match => (
                        <Card key={match.id} className="p-4 bg-muted/50">
                            <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-4">
                                <div className="text-right font-semibold">{match.teamA}</div>
                                <div className="flex items-center gap-2">
                                     <Input 
                                        type="number" 
                                        className="w-16 h-12 text-center text-xl font-bold"
                                        value={match.scoreA ?? ''}
                                        onChange={(e) => handleScoreChange(match.id, 'A', e.target.value)}
                                     />
                                     <span>:</span>
                                      <Input 
                                        type="number" 
                                        className="w-16 h-12 text-center text-xl font-bold"
                                        value={match.scoreB ?? ''}
                                        onChange={(e) => handleScoreChange(match.id, 'B', e.target.value)}
                                      />
                                </div>
                                <div className="font-semibold">{match.teamB}</div>
                                <div className="flex flex-col items-center gap-2">
                                    <Button size="sm" onClick={() => handleSaveScore(match.id)}>
                                        <Save className="mr-2 h-4 w-4"/> Speichern
                                    </Button>
                                    <Badge variant="outline">Platz {match.field} - {match.time}</Badge>
                                </div>
                            </div>
                        </Card>
                     )) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4"/>
                            <p className="font-semibold">Alle Spiele sind erfasst!</p>
                            <p className="text-sm">Sie können nun die K.O.-Phase im Spielplan-Generator erstellen.</p>
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
    );
}
