

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUpDown, Award, Star, Target } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Legend, ResponsiveContainer, Tooltip as RechartsTooltip, PolarRadiusAxis } from 'recharts';
import { Slider } from '@/components/ui/slider';
import { Badge } from './ui/badge';
import { Label } from './ui/label';


const teamStatsData = [
    { spielerNr: 1234567, vorname: 'Manuel', name: 'Meierheinz', geburtstag: '15.08.2010', alter: 10, trikot: 7, position: 'Sturm', anwesenheitWoche: 66, anwesenheitTotal: 79, spielzeitLetztes: 35, spielzeitTotal: 72, startformation: '8/10', auswechslung: '2/10', tore: 5, gelbe: 1, gelbRote: 0, rote: 0 },
    { spielerNr: 1234568, vorname: 'Jonas', name: 'Müller', geburtstag: '12.04.2011', alter: 9, trikot: 10, position: 'Mittelfeld', anwesenheitWoche: 90, anwesenheitTotal: 85, spielzeitLetztes: 45, spielzeitTotal: 88, startformation: '10/10', auswechslung: '0/10', tore: 8, gelbe: 0, gelbRote: 0, rote: 0 },
    { spielerNr: 1234569, vorname: 'Lukas', name: 'Schmidt', geburtstag: '03.11.2010', alter: 10, trikot: 5, position: 'Verteidigung', anwesenheitWoche: 75, anwesenheitTotal: 82, spielzeitLetztes: 45, spielzeitTotal: 90, startformation: '10/10', auswechslung: '0/10', tore: 1, gelbe: 2, gelbRote: 0, rote: 0 },
];

const gameOverviewData = [
    { spielNr: 1234567, gegner: 'FC Auswärts', ort: 'Auswärts', typ: 'Meisterschaft', datum: '15.08.2020', anpfiff: '10:00', tore: 4, gegentore: 1, gelbeKarten: 1, gelbRoteKarten: 0, roteKarten: 0, leistungTeam: 8.7, besterSpieler: 'Jonas Müller' },
    { spielNr: 1234568, gegner: 'FC Heim', ort: 'Heim', typ: 'Meisterschaft', datum: '22.08.2020', anpfiff: '10:00', tore: 2, gegentore: 2, gelbeKarten: 2, gelbRoteKarten: 1, roteKarten: 0, leistungTeam: 7.3, besterSpieler: 'Manuel Meierheinz' },
    { spielNr: 1234569, gegner: 'FC Cup', ort: 'Auswärts', typ: 'Cup', datum: '29.08.2020', anpfiff: '14:00', tore: 5, gegentore: 4, gelbeKarten: 0, gelbRoteKarten: 0, roteKarten: 0, leistungTeam: 9.1, besterSpieler: 'Lukas Schmidt' },
];

const teamPerformance = {
    training: { fitness: 80, fussspiel: 70, kampfwillen: 85, kondition: 75, technik: 78, ballgefuehl: 88, schussstaerke: 72, mentaleStaerke: 81 },
    spiel: { fitness: 85, fussspiel: 75, kampfwillen: 90, kondition: 80, technik: 82, ballgefuehl: 92, schussstaerke: 78, mentaleStaerke: 85 }
};

const playerPerformance = {
    'Manuel Meierheinz': { training: { fitness: 82, fussspiel: 75, kampfwillen: 88, kondition: 78, technik: 81, ballgefuehl: 91, schussstaerke: 85, mentaleStaerke: 83 }, spiel: { fitness: 88, fussspiel: 80, kampfwillen: 92, kondition: 82, technik: 85, ballgefuehl: 95, schussstaerke: 88, mentaleStaerke: 87 } },
    'Jonas Müller': { training: { fitness: 85, fussspiel: 80, kampfwillen: 90, kondition: 82, technik: 85, ballgefuehl: 94, schussstaerke: 80, mentaleStaerke: 88 }, spiel: { fitness: 90, fussspiel: 85, kampfwillen: 95, kondition: 88, technik: 88, ballgefuehl: 98, schussstaerke: 85, mentaleStaerke: 92 } },
    'Lukas Schmidt': { training: { fitness: 78, fussspiel: 68, kampfwillen: 82, kondition: 72, technik: 75, ballgefuehl: 85, schussstaerke: 70, mentaleStaerke: 78 }, spiel: { fitness: 82, fussspiel: 72, kampfwillen: 85, kondition: 75, technik: 78, ballgefuehl: 88, schussstaerke: 75, mentaleStaerke: 81 } },
}

const radarChartMetrics = [
    { name: "Fitness", key: "fitness" },
    { name: "Fussspiel", key: "fussspiel" },
    { name: "Kampfwillen", key: "kampfwillen" },
    { name: "Kondition", key: "kondition" },
    { name: "Technik", key: "technik" },
    { name: "Ballgefühl", key: "ballgefuehl" },
    { name: "Schussstärke", key: "schussstaerke" },
    { name: "Mentale Stärke", key: "mentaleStaerke" },
];

const SkillBar = ({ value }) => (
    <div className="w-full h-2.5 bg-muted rounded-full">
        <div className="h-full bg-primary rounded-full" style={{ width: `${value}%` }}></div>
    </div>
);

export const CoachStatistics = () => {
    const [selectedPlayer1, setSelectedPlayer1] = useState('Manuel Meierheinz');
    const [selectedPlayer2, setSelectedPlayer2] = useState('Jonas Müller');

    const radarChartDataTeam = radarChartMetrics.map(metric => ({
        subject: metric.name,
        training: teamPerformance.training[metric.key],
        spiel: teamPerformance.spiel[metric.key],
    }));
    
    const radarChartDataPlayers = radarChartMetrics.map(metric => ({
        subject: metric.name,
        player1: playerPerformance[selectedPlayer1]?.spiel[metric.key] || 0,
        player2: playerPerformance[selectedPlayer2]?.spiel[metric.key] || 0,
    }));


    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Statistik Mannschaft</CardTitle>
                        <Select defaultValue="20/21">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="20/21">Saison 20/21</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>SpielerNr</TableHead><TableHead>Vorname</TableHead><TableHead>Name</TableHead><TableHead>Geburtstag</TableHead><TableHead>Alter</TableHead><TableHead>Trikot</TableHead><TableHead>Position</TableHead><TableHead>Anwesenheit Training (Woche)</TableHead><TableHead>Anwesenheit Training (Total)</TableHead><TableHead>Spielzeit (letztes)</TableHead><TableHead>Spielzeit (Total)</TableHead><TableHead>Start</TableHead><TableHead>Ein/Aus</TableHead><TableHead>Tore</TableHead><TableHead>Gelb</TableHead><TableHead>G/R</TableHead><TableHead>Rot</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teamStatsData.map(p => (
                                <TableRow key={p.spielerNr}>
                                    <TableCell>{p.spielerNr}</TableCell><TableCell>{p.vorname}</TableCell><TableCell>{p.name}</TableCell><TableCell>{p.geburtstag}</TableCell><TableCell>{p.alter}</TableCell><TableCell>{p.trikot}</TableCell><TableCell>{p.position}</TableCell><TableCell>{p.anwesenheitWoche}%</TableCell><TableCell>{p.anwesenheitTotal}%</TableCell><TableCell>{p.spielzeitLetztes} min</TableCell><TableCell>{p.spielzeitTotal}%</TableCell><TableCell>{p.startformation}</TableCell><TableCell>{p.auswechslung}</TableCell><TableCell>{p.tore}</TableCell><TableCell>{p.gelbe}</TableCell><TableCell>{p.gelbRote}</TableCell><TableCell>{p.rote}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                         <TableFooter>
                            <TableRow>
                                <TableCell colSpan={7} className="font-bold">Total / Ø</TableCell>
                                <TableCell>Ø { (teamStatsData.length > 0 ? teamStatsData.reduce((a, b) => a + b.anwesenheitWoche, 0) / teamStatsData.length : 0).toFixed(0) }%</TableCell>
                                <TableCell>Ø { (teamStatsData.length > 0 ? teamStatsData.reduce((a, b) => a + b.anwesenheitTotal, 0) / teamStatsData.length : 0).toFixed(0) }%</TableCell>
                                <TableCell>Ø { (teamStatsData.length > 0 ? teamStatsData.reduce((a, b) => a + b.spielzeitLetztes, 0) / teamStatsData.length : 0).toFixed(0) } min</TableCell>
                                <TableCell>Ø { (teamStatsData.length > 0 ? teamStatsData.reduce((a, b) => a + b.spielzeitTotal, 0) / teamStatsData.length : 0).toFixed(0) }%</TableCell>
                                <TableCell>Σ {teamStatsData.reduce((a, b) => a + parseInt(b.startformation.split('/')[0]), 0)}</TableCell>
                                <TableCell>Σ {teamStatsData.reduce((a, b) => a + parseInt(b.auswechslung.split('/')[0]), 0)}</TableCell>
                                <TableCell>Σ {teamStatsData.reduce((a, b) => a + b.tore, 0)}</TableCell>
                                <TableCell>Σ {teamStatsData.reduce((a, b) => a + b.gelbe, 0)}</TableCell>
                                <TableCell>Σ {teamStatsData.reduce((a, b) => a + b.gelbRote, 0)}</TableCell>
                                <TableCell>Σ {teamStatsData.reduce((a, b) => a + b.rote, 0)}</TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Spieleübersicht</CardTitle>
                         <Select defaultValue="20/21">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="20/21">Saison 20/21</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>SpielNr</TableHead><TableHead>Gegner</TableHead><TableHead>Ort</TableHead><TableHead>Typ</TableHead><TableHead>Datum</TableHead><TableHead>Anpfiff</TableHead><TableHead>Tore</TableHead><TableHead>Gegentore</TableHead><TableHead>Gelb</TableHead><TableHead>G/R</TableHead><TableHead>Rot</TableHead><TableHead>Leistung</TableHead><TableHead>Bester Spieler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {gameOverviewData.map(g => (
                                <TableRow key={g.spielNr}>
                                    <TableCell>{g.spielNr}</TableCell><TableCell>{g.gegner}</TableCell><TableCell>{g.ort}</TableCell><TableCell>{g.typ}</TableCell><TableCell>{g.datum}</TableCell><TableCell>{g.anpfiff}</TableCell><TableCell>{g.tore}</TableCell><TableCell>{g.gegentore}</TableCell><TableCell>{g.gelbeKarten}</TableCell><TableCell>{g.gelbRoteKarten}</TableCell><TableCell>{g.roteKarten}</TableCell><TableCell>{g.leistungTeam}</TableCell><TableCell className="font-bold">{g.besterSpieler}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
             <Card>
                 <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Ø Übersicht Leistung</CardTitle>
                        <Select defaultValue="20/21">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="20/21">Saison 20/21</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                             <h3 className="font-bold text-center">Training</h3>
                             {radarChartMetrics.map(metric => (
                                <div key={metric.key} className="space-y-1">
                                    <Label className="text-xs">{metric.name}</Label>
                                    <SkillBar value={teamPerformance.training[metric.key]}/>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-4 p-4 bg-yellow-50 rounded-lg">
                            <h3 className="font-bold text-center">Spiel</h3>
                             {radarChartMetrics.map(metric => (
                                <div key={metric.key} className="space-y-1">
                                    <Label className="text-xs">{metric.name}</Label>
                                    <SkillBar value={teamPerformance.spiel[metric.key]}/>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                         <ResponsiveContainer width="100%" height={400}>
                            <RadarChart data={radarChartDataTeam}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar name="Training" dataKey="training" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                                <Radar name="Spiel" dataKey="spiel" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                                <Legend />
                                <RechartsTooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Spielervergleich</CardTitle>
                        <Select defaultValue="20/21">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="20/21">Saison 20/21</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                             <Select value={selectedPlayer1} onValueChange={setSelectedPlayer1}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {Object.keys(playerPerformance).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                             {radarChartMetrics.map(metric => (
                                <div key={metric.key} className="space-y-1">
                                    <Label className="text-xs">{metric.name}</Label>
                                    <SkillBar value={playerPerformance[selectedPlayer1]?.spiel[metric.key] || 0}/>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-4 p-4 bg-yellow-50 rounded-lg">
                            <Select value={selectedPlayer2} onValueChange={setSelectedPlayer2}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {Object.keys(playerPerformance).filter(p => p !== selectedPlayer1).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                             {radarChartMetrics.map(metric => (
                                <div key={metric.key} className="space-y-1">
                                    <Label className="text-xs">{metric.name}</Label>
                                    <SkillBar value={playerPerformance[selectedPlayer2]?.spiel[metric.key] || 0}/>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                         <ResponsiveContainer width="100%" height={400}>
                            <RadarChart data={radarChartDataPlayers}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                <Radar name={selectedPlayer1} dataKey="player1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                                <Radar name={selectedPlayer2} dataKey="player2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                                <Legend />
                                <RechartsTooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};
