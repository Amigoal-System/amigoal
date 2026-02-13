
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, Calendar, Clock, BarChart, TrendingUp, TrendingDown, Target, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { playerPerformanceData } from '@/lib/player-performance-data';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { useTrainings } from '@/hooks/useTrainings';
import { useTeam } from '@/hooks/use-team';
import { useAbsences } from '@/hooks/useAbsences';
import { DeclineEventModal } from '@/components/ui/decline-event-modal';
import { format, isPast } from 'date-fns';
import { de } from 'date-fns/locale';

export default function PlayerTrainingPage() {
    const { toast } = useToast();
    const { user, activeTeam } = useTeam();
    const { trainings, isLoading: isLoadingTrainings } = useTrainings(activeTeam);
    const { addAbsence, getAbsenceStatus, isLoading: isLoadingAbsences } = useAbsences(user?.uid);
    const [filter, setFilter] = useState('upcoming');
    const [isDeclineModalOpen, setIsDeclineModalOpen] = useState<string | null>(null);

    const performance = playerPerformanceData['Lionel Messi']; // Mock data for current user

    const handleAttendance = (eventId: string, status: 'confirmed' | 'declined', reason?: string) => {
        if (!user) return;
        addAbsence({
            eventId,
            memberId: user.uid,
            status,
            reason
        });
        toast({ title: `Rückmeldung für Training gespeichert: ${status === 'confirmed' ? 'Zusage' : 'Absage'}` });
    };

    const handleDeclineConfirm = (reason: string) => {
        if(isDeclineModalOpen) {
            handleAttendance(isDeclineModalOpen, 'declined', reason);
        }
        setIsDeclineModalOpen(null);
    }
    
    const { upcomingTrainings, pastTrainings } = useMemo(() => {
        const now = new Date();
        return {
            upcomingTrainings: trainings.filter(t => new Date(t.date) >= now).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
            pastTrainings: trainings.filter(t => new Date(t.date) < now).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
        };
    }, [trainings]);

    const filteredTrainings = filter === 'upcoming' ? upcomingTrainings : pastTrainings;

    const stats = {
        total: trainings.length,
        attended: trainings.length - trainings.filter(t => getAbsenceStatus(t.id) === 'declined').length,
        rate: trainings.length > 0 ? (((trainings.length - trainings.filter(t => getAbsenceStatus(t.id) === 'declined').length) / trainings.length) * 100).toFixed(0) : 0,
        trend: 5, // Mock data
    };

    if (isLoadingTrainings || isLoadingAbsences) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Meine Trainings</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Anwesenheit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-5xl font-bold">{stats.rate}%</div>
                        <p className="text-sm text-muted-foreground">{stats.attended} von {stats.total} Trainings besucht</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Letzte 5 Trainings</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-2">
                        {[true, true, true, false, true].map((attended, i) => (
                           attended ? <Check key={i} className="h-6 w-6 text-green-500"/> : <X key={i} className="h-6 w-6 text-red-500"/>
                        ))}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="text-3xl font-bold flex items-center text-green-500">
                             <TrendingUp className="h-8 w-8 mr-2"/> +{stats.trend}%
                         </div>
                         <p className="text-sm text-muted-foreground">im Vergleich zum Vormonat</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Trainingsübersicht</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                        <Button variant={filter === 'upcoming' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('upcoming')}>Anstehende</Button>
                        <Button variant={filter === 'past' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('past')}>Vergangene</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                         <TableHeader>
                            <TableRow>
                                <TableHead>Datum</TableHead>
                                <TableHead>Zeit</TableHead>
                                <TableHead>Ort</TableHead>
                                <TableHead>Deine Teilnahme</TableHead>
                                <TableHead className="text-right">Aktionen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTrainings.map(t => {
                                const status = getAbsenceStatus(t.id);
                                return (
                                <TableRow key={t.id}>
                                    <TableCell>{format(new Date(t.date), "eeee, dd.MM.yyyy", { locale: de })}</TableCell>
                                    <TableCell>{t.from} - {t.to}</TableCell>
                                    <TableCell>{t.field}</TableCell>
                                    <TableCell>
                                        {status === 'confirmed' && <Badge className="bg-green-500">Zusage</Badge>}
                                        {status === 'declined' && <Badge variant="destructive">Absage</Badge>}
                                        {status === 'pending' && <Badge variant="secondary">Offen</Badge>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {status === 'pending' && !isPast(new Date(t.date)) && (
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAttendance(t.id!, 'confirmed')}>
                                                    <Check className="mr-2 h-4 w-4"/> Zusagen
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => setIsDeclineModalOpen(t.id!)}>
                                                    <X className="mr-2 h-4 w-4"/> Absagen
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Leistungsentwicklung</CardTitle>
                    <CardDescription>Deine durchschnittliche Leistung im Training und Spiel.</CardDescription>
                </CardHeader>
                 <CardContent>
                     <ResponsiveContainer width="100%" height={300}>
                         <RechartsBarChart data={performance.game}>
                            <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false}/>
                            <YAxis domain={[0, 100]} hide/>
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))' }} />
                            <Bar dataKey="value" name="Leistung" radius={[4, 4, 0, 0]}>
                                {performance.game.map((entry, index) => (
                                    <Cell key={`cell-${index}`} className={entry.colorClass}/>
                                ))}
                            </Bar>
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            
            <DeclineEventModal 
                isOpen={!!isDeclineModalOpen}
                onOpenChange={() => setIsDeclineModalOpen(null)}
                onConfirm={handleDeclineConfirm}
                onReportInjury={(details) => console.log('Injury reported', details)}
            />
        </div>
    );
}
