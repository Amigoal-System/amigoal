
'use client';
import { useEffect, useState, useMemo } from 'react';
import { initialCoachData } from '@/lib/types/coach';
import type { Coach } from '@/lib/types/coach';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Award, Book, UserCheck, ShieldCheck, Calendar, Trophy, BarChart, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineIcon, TimelineTitle, TimelineBody } from '@/components/ui/timeline';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getCoachData } from '@/services/coachService';

const StatCard = ({ title, value, icon: Icon, progress }) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
                <Icon className="h-5 w-5 text-primary"/>
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-4xl font-bold">{value}</p>
            {progress !== undefined && <Progress value={progress} className="mt-2" />}
        </CardContent>
    </Card>
);

const GoalCard = ({ name, value, target, type }) => {
    const isCompleted = type === 'lessIsBetter' ? value <= target : value >= target;
    const progress = type === 'rank' ? (target / value * 100) : (value / target * 100);
    return (
        <div className="p-4 border rounded-lg bg-muted/50">
            <p className="font-semibold">{name}</p>
            <p className="text-2xl font-bold">{value} <span className="text-sm text-muted-foreground">/ {target}</span></p>
            <Progress value={progress} indicatorClassName={isCompleted ? 'bg-green-500' : 'bg-primary'}/>
        </div>
    )
}

export default function CoachDetailPage() {
    const searchParams = useSearchParams();
    const coachId = searchParams.get('id') || initialCoachData.id;
    const [coach, setCoach] = useState<Coach | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const data = await getCoachData(coachId);
            setCoach(data);
        };
        fetchData();
    }, [coachId]);
    
    if (!coach) {
        return <div>Lade Trainerdaten...</div>;
    }

    const {
        name, avatar, teams, roles, memberSince, diplomas, courses, history, info, contract, attendance, seasonGoals, playerRatings, adminRating, feedbackTalks
    } = coach;
    
    const performanceData = [
        { name: 'Saisonziele', value: 85, fill: 'var(--color-goals)' },
        { name: 'Anwesenheit', value: attendance?.training || 0, fill: 'var(--color-attendance)' },
        { name: 'Spieler-Rating', value: (playerRatings?.overall || 0) * 20, fill: 'var(--color-ratings)' },
        { name: 'Vereins-Rating', value: (adminRating || 0) * 20, fill: 'var(--color-admin)' },
    ];
    
    const performanceConfig = {
        goals: { label: 'Saisonziele', color: 'hsl(var(--chart-1))' },
        attendance: { label: 'Anwesenheit', color: 'hsl(var(--chart-2))' },
        ratings: { label: 'Spieler-Rating', color: 'hsl(var(--chart-3))' },
        admin: { label: 'Vereins-Rating', color: 'hsl(var(--chart-4))' },
    };


    return (
        <div className="space-y-6">
            <div className="flex items-center gap-6">
                 <Avatar className="h-24 w-24 border-4 border-primary">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>{name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-4xl font-bold font-headline">{name}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        {roles.map(role => <Badge key={role}>{role}</Badge>)}
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Anwesenheit Training" value={`${attendance?.training || 0}%`} icon={UserCheck} progress={attendance?.training} />
                <StatCard title="Anwesenheit Spiele" value={`${attendance?.games || 0}%`} icon={ShieldCheck} progress={attendance?.games} />
                <StatCard title="Spieler-Bewertung" value={`${playerRatings?.overall || 0}/5`} icon={Star} progress={(playerRatings?.overall || 0) * 20} />
                <StatCard title="Vereins-Bewertung" value={`${adminRating || 0}/5`} icon={Award} progress={(adminRating || 0) * 20} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Saisonziele {contract?.to ? `(bis ${new Date(contract.to).getFullYear()})`: ''}</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {seasonGoals?.map(goal => <GoalCard key={goal.name} {...goal} />)}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Feedback-Gespräche</CardTitle>
                        </CardHeader>
                         <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Datum</TableHead>
                                        <TableHead>Thema</TableHead>
                                        <TableHead>Teilnehmer</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {feedbackTalks?.map(talk => (
                                        <TableRow key={talk.id}>
                                            <TableCell>{new Date(talk.date).toLocaleDateString('de-CH')}</TableCell>
                                            <TableCell className="font-medium">{talk.topic}</TableCell>
                                            <TableCell>{talk.participants}</TableCell>
                                            <TableCell><Badge variant="secondary">{talk.status}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
                 <Card>
                    <CardHeader>
                        <CardTitle>Qualifikationen</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div>
                            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Award className="h-4 w-4"/>Diplome</h3>
                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                                {diplomas?.map(d => <li key={d}>{d}</li>)}
                            </ul>
                        </div>
                        <div>
                             <h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Book className="h-4 w-4"/>Weiterbildungskurse</h3>
                            <ul className="list-disc list-inside text-sm text-muted-foreground">
                                {courses?.map(c => <li key={c}>{c}</li>)}
                            </ul>
                        </div>
                         <div className="border-t pt-4">
                             <h3 className="text-sm font-semibold mb-2">Karriere</h3>
                             <Timeline>
                                {history?.map((h, i) => (
                                    <TimelineItem key={i}>
                                        <TimelineConnector />
                                        <TimelineHeader>
                                            <TimelineIcon><div className="w-2 h-2 rounded-full bg-primary"/></TimelineIcon>
                                            <TimelineTitle>{h.club} ({h.team})</TimelineTitle>
                                        </TimelineHeader>
                                        <TimelineBody>
                                            <p className="text-xs text-muted-foreground">{h.period}</p>
                                        </TimelineBody>
                                    </TimelineItem>
                                ))}
                            </Timeline>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

