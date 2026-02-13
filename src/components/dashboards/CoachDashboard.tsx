'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, X, CheckCircle2, XCircle, PlusCircle, Calendar as CalendarIcon, ArrowLeftCircle, ArrowRightCircle, Trophy, Target, ClipboardList, Clock, Car, Home, Dumbbell, User, ArrowLeft, ArrowRight, RectangleVertical, GripVertical, Mail } from 'lucide-react';
import { PlayerCardModal } from '../PlayerCardModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Image from 'next/image';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Switch } from '../ui/switch';
import { TrainingDetailModal } from '../TrainingDetailModal';
import { ExpenseDetailModal } from '../CreateExpenseModal';
import { CreateExpenseModal } from '../CreateExpenseModal';
import { ViewTaskModal, CreateTaskModal } from '@/components/ViewTaskModal';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type Locale } from '@/../i18n.config';
import { TooltipProvider, Tooltip as UITooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { format, addDays, startOfWeek, subDays, getWeek, isSameDay, isToday, parse, differenceInSeconds } from 'date-fns';
import { de } from 'date-fns/locale';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { DatePicker } from '../ui/date-picker';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { initialLocations } from '@/lib/types/locations';
import { cn } from '@/lib/utils';
import { useTasks } from '@/hooks/useTasks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMembers } from '@/hooks/useMembers';
import { useTeam } from '@/hooks/use-team';
import { UpcomingEventsCard } from '../UpcomingEventsCard';
import { usePlayerSuggestions } from '@/hooks/usePlayerSuggestions';
import { invitePlayerToTrial } from '@/ai/flows/playerPlacement';

const teamData = {
  active: {
    name: "Aktive",
    teams: [
      { id: 1, name: "1. Mannschaft", members: 25, trainer: "Pep Guardiola", liga: "3. Liga" },
      { id: 2, name: "2. Mannschaft", members: 22, trainer: "Zinedine Zidane", liga: "4. Liga" },
    ],
  },
  juniorsA: {
    name: "Junioren A-C",
    teams: [
      { id: 3, name: "Junioren A1", members: 20, trainer: "Jürgen Klopp", liga: "Elite" },
      { id: 4, name: "Junioren B1", members: 21, trainer: "Julian Nagelsmann", liga: "1. Stkl." },
      { id: 5, name: "Junioren C1", members: 24, trainer: "Hansi Flick", liga: "Elite" },
      { id: 6, name: "Junioren C2", members: 23, trainer: "Thomas Tuchel", liga: "2. Stkl." },
    ],
  },
};

const getTeamData = (teamName: string, allMembers: any[]) => {
    for (const category of Object.values(teamData)) {
        const teamInfo = category.teams.find(t => t.name === teamName);
        if (teamInfo) {
            const teamMembers = allMembers.filter(m => m.team === teamName || m.teams?.includes(teamName));
            return {
                ...teamInfo,
                players: teamMembers.map((p, i) => ({
                    ...p,
                    attendance: Math.floor(Math.random() * 30 + 70),
                    goals: Math.floor(Math.random() * 5),
                    assists: Math.floor(Math.random() * 5),
                    performance: ['Top', 'Gut', 'Mittel'][Math.floor(Math.random() * 3)]
                })),
                seasonGoals: [
                    { name: 'Saisonziele', Tore: 40, Karten: 'weniger als 30', Training: 'über 90%' },
                    { name: 'Aktuell', Tore: 25, Karten: '15', Training: '88%' }
                ],
                teamEvaluation: [
                    { subject: 'Fitness', A: 82, fullMark: 100 },
                    { subject: 'Technik', A: 90, fullMark: 100 },
                    { subject: 'Taktik', A: 75, fullMark: 100 },
                    { subject: 'Teamgeist', A: 95, fullMark: 100 },
                    { subject: 'Disziplin', A: 88, fullMark: 100 },
                ],
                cardsToDiscuss: [
                  { id: 1, name: 'Lionel Messi', team: '1. Mannschaft', opponentClub: 'FC City', date: '20.07.2024', gameId: '123456', gameMinute: "78'", cards: ['yellow'], reason: 'Reklamieren', cost: 15, avatar: 'https://placehold.co/40x40.png?text=LM', playerNr: '1234567' },
                ],
                expenses: [
                  { id: 1, type: "Material", description: "Neue Bälle", date: "2024-07-15", sum: 150.00, status: "Genehmigt" },
                ],
                events: [
                  { id: 1, type: 'training', name: '1. Mannschaft', trainer: 'Pep Guardiola', day: 'Montag', date: '2024-07-29', from: '18:30', to: '20:00', field: 'Hauptplatz A', lockerRoom: 1, team: '1. Mannschaft', prepared: true },
                  { id: 4, type: 'match', date: '2024-08-17', opponent: 'FC Metropolis', location: 'Auswärts', result: '-', score: '-', typ: 'Meisterschaft', status: 'Geplant', isCalledUp: true },
                ]
            }
        }
    }
    return null;
}


const getInitialPlayers = (teamName, allMembers) => {
    for (const category of Object.values(teamData)) {
        const teamInfo = category.teams.find(t => t.name === teamName);
        if (teamInfo) {
            const fullTeamData = getTeamData(teamName, allMembers);
            if (fullTeamData && fullTeamData.players) {
                 return fullTeamData.players.map(p => {
                     const attendance = ['confirmed', 'declined', 'pending'][Math.floor(Math.random() * 3)];
                     const reasons = ['Krank', 'Schule', 'Arbeit', 'Verletzt'];
                     const randomReason = reasons[Math.floor(Math.random() * reasons.length)];

                     return {
                        ...p,
                        attendance: attendance,
                        confirmationTimestamp: new Date(new Date().getTime() - Math.random() * 24 * 60 * 60 * 1000).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit'}),
                        cancellationReason: attendance === 'declined' ? randomReason : null
                    }
                 });
            }
        }
    }
    return [];
};



const allClubPlayers = Object.values(teamData)
    .flatMap(category => category.teams.flatMap(team => 
        getInitialPlayers(team.name, []).map(player => ({...player, team: team.name})) || []
    ))
    .map((player, index) => ({...player, id: player.spielerNr || index}));


export const CreateTrainingModal = ({ isOpen, onOpenChange, onSave }) => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [fromTime, setFromTime] = useState('18:30');
    const [toTime, setToTime] = useState('20:00');
    const [location, setLocation] = useState(initialLocations[0].name);
    const [notes, setNotes] = useState('');

    const handleSave = () => {
        onSave({ date, from: fromTime, to: toTime, location, notes });
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ad-hoc Training erstellen</DialogTitle>
                </DialogHeader>
                 <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Datum</Label>
                        <DatePicker date={date} onDateChange={setDate} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fromTime">Von</Label>
                            <Input id="fromTime" type="time" value={fromTime} onChange={(e) => setFromTime(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="toTime">Bis</Label>
                            <Input id="toTime" type="time" value={toTime} onChange={(e) => setToTime(e.target.value)} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="location">Ort</Label>
                        <Select value={location} onValueChange={setLocation}>
                            <SelectTrigger id="location"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {initialLocations.map(loc => <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="notes">Notizen</Label>
                        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Fokus des Trainings, spezielle Übungen etc."/>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={handleSave}>Training speichern</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


const Countdown = ({ targetDate }) => {
    const calculateTimeLeft = () => {
        const difference = differenceInSeconds(new Date(targetDate), new Date());
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                Tage: Math.floor(difference / (60 * 60 * 24)),
                Stunden: Math.floor((difference / (60 * 60)) % 24),
                Minuten: Math.floor((difference / 60) % 60),
                Sekunden: Math.floor(difference % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    return (
        <div className="grid grid-cols-4 gap-2 text-center">
            {Object.entries(timeLeft).length > 0 ? (
                Object.entries(timeLeft).map(([unit, value]) => (
                    <div key={unit} className="p-2 bg-muted rounded-lg">
                        <div className="text-xl font-bold font-mono">{String(value as number).padStart(2, '0')}</div>
                        <div className="text-xs text-muted-foreground">{unit}</div>
                    </div>
                ))
            ) : (
                <div className="col-span-4 p-2 bg-muted rounded-lg">
                    <p className="text-lg font-bold">Spiel hat begonnen!</p>
                </div>
            )}
        </div>
    );
};

const GoalProgress = ({ label, current, goal, icon, isCardGoal = false }) => {
    const percentage = goal > 0 ? (current / goal) * 100 : 0;
    const progressColor = isCardGoal ? (percentage >= 100 ? 'bg-red-500' : 'bg-green-500') : (percentage >= 100 ? 'bg-green-500' : 'bg-primary');
    
    return (
        <div className="flex items-center gap-4">
            <div className="w-8">{icon}</div>
            <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold">{label}</span>
                    <span className="text-muted-foreground">{current} / {goal}</span>
                </div>
                <Progress value={percentage} indicatorClassName={progressColor} />
            </div>
        </div>
    );
};

const initialCarpoolData = [
    { driver: "Familie Müller", seatsAvailable: 2, players: ["Tom M."], maxSeats: 4 },
    { driver: "Familie Weber", seatsAvailable: 1, players: ["Anna W.", "Leo K."], maxSeats: 3 },
];

const RideDetailModal = ({ ride, isOpen, onOpenChange }) => {
    if (!ride) return null;
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Fahrtdetails: {ride.driver}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p><strong>Fahrer:</strong> {ride.driver}</p>
                    <p><strong>Freie Plätze:</strong> {ride.seatsAvailable}</p>
                    <p><strong>Maximale Plätze:</strong> {ride.maxSeats}</p>
                    <h4 className="font-semibold mt-4">Mitfahrer:</h4>
                    <ul>
                        {ride.players.map((player, index) => <li key={index}>- {player}</li>)}
                    </ul>
                </div>
            </DialogContent>
        </Dialog>
    )
}

const CarpoolCard = () => {
    const [carpoolData, setCarpoolData] = useState(initialCarpoolData);
    const [selectedRide, setSelectedRide] = useState(null);
    const [isRideDetailModalOpen, setIsRideDetailModalOpen] = useState(false);

    const needingRide = 5;
    const offeringRide = carpoolData.reduce((acc, curr) => acc + curr.seatsAvailable, 0);

    const handleRideClick = (ride) => {
        setSelectedRide(ride);
        setIsRideDetailModalOpen(true);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Car className="h-5 w-5 text-primary"/> Fahrten</CardTitle>
                    <CardDescription>Übersicht der Mitfahrgelegenheiten zum nächsten Spiel.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-4 bg-red-100 dark:bg-red-900/50 rounded-lg">
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{needingRide}</p>
                            <p className="text-sm font-medium">brauchen eine Fahrt</p>
                        </div>
                        <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-lg">
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{offeringRide}</p>
                            <p className="text-sm font-medium">Plätze sind frei</p>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-semibold">Fahrdienste:</h4>
                        {carpoolData.map((ride, index) => (
                            <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-md cursor-pointer hover:bg-muted" onClick={() => handleRideClick(ride)}>
                                <span>{ride.driver}</span>
                                <span className="font-semibold">{ride.seatsAvailable} freie Plätze</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" className="w-full">Fahrten koordinieren</Button>
                </CardFooter>
            </Card>
            <RideDetailModal ride={selectedRide} isOpen={isRideDetailModalOpen} onOpenChange={setIsRideDetailModalOpen} />
        </>
    )
}

function NextTrainingCard({ nextTraining, lang, activeTeam }) {
    return <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarIcon className="h-5 w-5 text-primary"/> Nächstes Training</CardTitle>
        </CardHeader>
        {nextTraining ? (
            <>
                <CardContent>
                    <p className="text-lg font-semibold">{format(new Date(nextTraining.date), "EEEE, dd.MM.yyyy", { locale: de })}</p>
                    <p className="text-muted-foreground">{nextTraining.from} - {nextTraining.to}</p>
                    <p className="text-sm text-muted-foreground">{nextTraining.field}, Garderobe {nextTraining.lockerRoom}</p>
                </CardContent>
                <CardFooter>
                    <Button asChild className="w-full" variant="outline">
                        <Link href={`/${lang}/dashboard/training-prep?trainingId=${nextTraining.id}`}>Training vorbereiten</Link>
                    </Button>
                </CardFooter>
            </>
        ) : (
            <CardContent><p>Kein Training geplant.</p></CardContent>
        )}
    </Card>;
}

function NextMatchCard({ nextMatch, lang }) {
    return <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-primary"/> Nächstes Spiel</CardTitle>
        </CardHeader>
        {nextMatch ? (
            <>
                <CardContent>
                    <p className="text-lg font-semibold">vs. {nextMatch.opponent}</p>
                    <p className="text-muted-foreground">{format(new Date(nextMatch.date), "EEEE, dd.MM.yyyy", { locale: de })}</p>
                    <p className="text-sm text-muted-foreground">{nextMatch.location}</p>
                     <div className="mt-4">
                        <Countdown targetDate={nextMatch.date} />
                    </div>
                </CardContent>
                <CardFooter>
                     <Button asChild className="w-full" variant="outline">
                        <Link href={`/${lang}/dashboard/match-prep?matchId=${nextMatch.id}`}>Spiel vorbereiten</Link>
                    </Button>
                </CardFooter>
            </>
        ) : (
            <CardContent><p>Kein Spiel geplant.</p></CardContent>
        )}
    </Card>;
}

function TasksCard({ tasks, onTaskCompleted, onTaskSelect }) {
    return <Card>
        <CardHeader>
            <CardTitle>Aufgaben</CardTitle>
        </CardHeader>
        <CardContent>
            {tasks.filter(t => t.status !== 'Done').map(task => (
                <div key={task.id} className="flex items-start gap-3 mb-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => onTaskSelect(task)}>
                    <Checkbox 
                        id={`task-${task.id}`} 
                        className="mt-1"
                        onCheckedChange={() => onTaskCompleted(task.id)}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                        <Label htmlFor={`task-${task.id}`} className="font-medium cursor-pointer">{task.title}</Label>
                        <p className="text-xs text-muted-foreground">{new Date(task.dueDate).toLocaleDateString('de-CH')}</p>
                    </div>
                </div>
            ))}
        </CardContent>
        <CardFooter>
            <CreateTaskModal onSave={()=>{}} />
        </CardFooter>
    </Card>
}

function TeamStatsCard({ team, groupedPlayers, positionOrder }) {
     return <Card className="lg:col-span-2">
        <CardHeader>
            <CardTitle>Team-Statistik</CardTitle>
            <CardDescription>{team.name}</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue={positionOrder[0]}>
                <TabsList>
                    {positionOrder.map(pos => <TabsTrigger key={pos} value={pos}>{pos}</TabsTrigger>)}
                </TabsList>
                {positionOrder.map(pos => (
                    <TabsContent key={pos} value={pos}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Spieler</TableHead>
                                    <TableHead>Anwesenheit</TableHead>
                                    <TableHead>Tore</TableHead>
                                    <TableHead>Assists</TableHead>
                                    <TableHead>Leistung</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {groupedPlayers[pos]?.map(player => (
                                    <TableRow key={player.id}>
                                        <TableCell>{player.name}</TableCell>
                                        <TableCell>{player.attendance}%</TableCell>
                                        <TableCell>{player.goals}</TableCell>
                                        <TableCell>{player.assists}</TableCell>
                                        <TableCell><Badge>{player.performance}</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TabsContent>
                ))}
            </Tabs>
        </CardContent>
    </Card>;
}

function CardsToDiscussCard({ cardsToDiscuss, onCardSelect }) {
    return <Card>
        <CardHeader>
            <CardTitle>Karten zu diskutieren</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
            {cardsToDiscuss.map(c => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card cursor-pointer hover:bg-muted" onClick={() => onCardSelect(c)}>
                <Avatar className="h-10 w-10"><AvatarImage src={c.avatar} data-ai-hint="person portrait"/><AvatarFallback>{c.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar>
                <div className="flex-1 text-sm">
                    <p className="font-bold">{c.name}</p>
                    <div className="text-muted-foreground text-xs">
                        <span>vs. {c.opponentClub}</span>
                        <span className="mx-1">|</span>
                        <span>{c.date}</span>
                    </div>
                </div>
                <div className="flex gap-1">
                    {c.cards.map((cardType, i) => (
                        <RectangleVertical key={i} className={`h-6 w-4 rounded-sm ${cardType === 'yellow' ? 'text-yellow-400 fill-yellow-400' : 'text-red-500 fill-red-500'}`} />
                    ))}
                </div>
            </div>
            ))}
        </CardContent>
    </Card>;
}

function ExpensesCard({ expenses, onExpenseClick, onCreateExpense }) {
    const getExpenseStatusBadge = (status) => {
        switch(status) {
            case 'Genehmigt': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">{status}</Badge>;
            case 'Ausbezahlt': return <Badge className="bg-green-500">{status}</Badge>;
            case 'Offen':
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };
    return <Card>
        <CardHeader>
            <CardTitle>Spesen & Auslagen</CardTitle>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Typ</TableHead>
                        <TableHead>Datum</TableHead>
                        <TableHead>Betrag</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expenses.map(expense => (
                         <TableRow key={expense.id} className="cursor-pointer" onClick={() => onExpenseClick(expense)}>
                            <TableCell>{expense.type}</TableCell>
                            <TableCell>{expense.date}</TableCell>
                            <TableCell>CHF {expense.sum.toFixed(2)}</TableCell>
                            <TableCell>{getExpenseStatusBadge(expense.status)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
         <CardFooter>
            <Button variant="outline" onClick={onCreateExpense}>
                <PlusCircle className="mr-2 h-4 w-4"/> Neue Spesen erfassen
            </Button>
        </CardFooter>
    </Card>;
}

function WeekOverviewCard({ allEvents, weekStartDate, onPrevWeek, onNextWeek, calendarWeek, onTrainingClick }) {
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStartDate, i));
    const getEventIndicator = (date) => {
        const dayEvents = allEvents.filter(e => isSameDay(new Date(e.date), date));
        if (dayEvents.length === 0) return null;
        
        const eventTypes = new Set(dayEvents.map(e => e.type));
        
        let indicatorColor = 'bg-gray-400';
        if (eventTypes.has('match')) indicatorColor = 'bg-yellow-400';
        else if (eventTypes.has('training')) indicatorColor = 'bg-green-500';
        else if (eventTypes.has('sitzung')) indicatorColor = 'bg-orange-400';
        
        return <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${indicatorColor}`}></div>;
    }

    return <Card className="lg:col-span-3">
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Wochenübersicht</CardTitle>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => {}}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Ad-hoc Training
                    </Button>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={onPrevWeek}><ArrowLeft/></Button>
                        <span className="text-sm font-semibold w-24 text-center">KW {calendarWeek}</span>
                        <Button variant="ghost" size="icon" onClick={onNextWeek}><ArrowRight/></Button>
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent className="grid grid-cols-7 gap-2">
            {weekDays.map(day => (
                <div key={day.toISOString()} className="border rounded-lg p-2 text-sm h-32 flex flex-col">
                    <span className={cn("font-semibold", isToday(day) && "text-primary")}>{format(day, 'E, dd.MM', {locale: de})}</span>
                    <div className="flex-grow pt-2 space-y-1 overflow-y-auto">
                        {allEvents.filter(e => isSameDay(new Date(e.date), day)).map(event => (
                            <div key={event.id} className="text-xs p-1 rounded-md bg-muted/50 cursor-pointer hover:bg-muted" onClick={() => event.type === 'training' && onTrainingClick(event)}>
                                {event.type === 'training' ? `${event.from} - ${event.team}` : `${event.time} - ${event.title}`}
                            </div>
                        ))}
                    </div>
                    {getEventIndicator(day)}
                </div>
            ))}
        </CardContent>
    </Card>;
}

export function CoachDashboard({ activeTeam }: { activeTeam: string }) {
    const { members, isLoading: isLoadingMembers } = useMembers();
    const { suggestions, updateSuggestionStatus, isLoading: isLoadingSuggestions } = usePlayerSuggestions(activeTeam);
    const [team, setTeam] = useState(null);
    const [selectedCard, setSelectedCard] = useState(null);
    const [isPlayerCardOpen, setIsPlayerCardOpen] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState('21/22');
    const [weekStartDate, setWeekStartDate] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [selectedTraining, setSelectedTraining] = useState(null);
    const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
    const [isCreateTrainingModalOpen, setIsCreateTrainingModalOpen] = useState(false);
    const [allEvents, setAllEvents] = useState([]);
    const { tasks, addTask, updateTask, archiveTask } = useTasks();
    const [selectedTask, setSelectedTask] = useState(null);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isCreateExpenseModalOpen, setIsCreateExpenseModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const params = useParams();
    const lang = params.lang as Locale;
    const { toast } = useToast();
    
    useEffect(() => {
        if (members && members.length > 0 && activeTeam) {
            const teamData = getTeamData(activeTeam, members);
            setTeam(teamData);
            setAllEvents(teamData?.events || []);
        } else if (!activeTeam) {
            setTeam(null);
            setAllEvents([]);
        }
    }, [activeTeam, members]);
    
    const handleNextWeek = () => setWeekStartDate(addDays(weekStartDate, 7));
    const handlePrevWeek = () => setWeekStartDate(subDays(weekStartDate, 7));

    const calendarWeek = getWeek(weekStartDate, { weekStartsOn: 1, firstWeekContainsDate: 4 });

    const groupedPlayers = useMemo(() => {
        if (!team?.players) return {};
        return team.players.reduce((acc, player) => {
            const position = player.position || 'Unbekannt';
            if (!acc[position]) acc[position] = [];
            acc[position].push(player);
            return acc;
        }, {});
    }, [team?.players]);

    const positionOrder = ['Goalie', 'Verteidigung', 'Mittelfeld', 'Sturm', 'Unbekannt'];
    
    const nextMatch = useMemo(() => {
        const upcoming = allEvents
            .filter(e => e.type === 'match' && new Date(e.date) >= new Date())
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return upcoming.length > 0 ? upcoming[0] : null;
    }, [allEvents]);

    const nextTraining = useMemo(() => {
        const upcoming = allEvents
            .filter(e => e.type === 'training' && new Date(e.date) >= new Date())
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return upcoming.length > 0 ? upcoming[0] : null;
    }, [allEvents]);
    
    const handleTrainingClick = (trainingData) => {
        setSelectedTraining(trainingData);
        setIsTrainingModalOpen(true);
    };

    const handleCreateTraining = (newTrainingData) => {
        const newTraining = {
            id: `training-${Date.now()}`,
            name: activeTeam,
            trainer: 'Pep Guardiola', // This should come from logged in user
            day: format(newTrainingData.date, 'EEEE', { locale: de }),
            date: format(newTrainingData.date, 'yyyy-MM-dd'),
            from: newTrainingData.from,
            to: newTrainingData.to,
            field: newTrainingData.location,
            lockerRoom: Math.floor(Math.random() * 12) + 1,
            team: activeTeam,
            prepared: false,
            type: 'training',
            notes: newTrainingData.notes,
        };
        setAllEvents(prev => [...prev, newTraining]);
        toast({ title: "Training erstellt!", description: `Das Training am ${newTraining.date} wurde hinzugefügt.` });
    };

    const handleExpenseClick = (expense) => {
        setSelectedExpense(expense);
        setIsExpenseModalOpen(true);
    }
    
    const handleSaveTask = (newTask, isAssigned) => {
        addTask(newTask);
        if(isAssigned) {
            toast({
                title: "Aufgabe zugewiesen!",
                description: `Die Aufgabe "${newTask.title}" wurde erstellt und die Empfänger benachrichtigt.`,
            });
        }
    }

    const handleTaskCompleted = (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if(task) {
            archiveTask(taskId);
            toast({
                title: 'Aufgabe erledigt!',
                description: `"${task.title}" wurde ins Archiv verschoben.`,
            });
        }
    };
    
    const teamMembers = useMemo(() => {
        if (!team) return [];
        return members.filter(m => m.teams?.includes(team.name));
    }, [team, members]);

    const handleSuggestionAction = async (suggestionId: string, status: 'accepted' | 'declined') => {
        await updateSuggestionStatus(suggestionId, status);
        toast({ title: `Vorschlag ${status === 'accepted' ? 'angenommen' : 'abgelehnt'}.`});
    };

    const handleInvite = async (suggestion: any) => {
        try {
            await invitePlayerToTrial({
                playerName: suggestion.playerName,
                playerEmail: suggestion.playerIdentifier,
                teamName: suggestion.teamName,
                clubName: suggestion.clubName,
                trialDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), // Example: 1 week from now
            });
            await updateSuggestionStatus(suggestion.id, 'invited');
            toast({ title: 'Einladung versendet', description: `'${suggestion.playerName}' wurde zum Probetraining eingeladen.`});
        } catch (error) {
            console.error(error);
            toast({ title: 'Fehler', description: 'Einladung konnte nicht gesendet werden.', variant: 'destructive'});
        }
    };

    if (isLoadingMembers || !team) {
        return (
             <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold">Keine Mannschaft ausgewählt</h2>
                    <p className="mt-2 text-muted-foreground">Bitte wählen Sie oben eine Mannschaft aus, um das Dashboard anzuzeigen.</p>
                </div>
            </div>
        );
    }


    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            <div className="lg:col-span-3 space-y-6">
                 {suggestions && suggestions.length > 0 && (
                    <Card className="border-primary">
                        <CardHeader>
                            <CardTitle>Offene Spielervorschläge</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Spieler</TableHead>
                                        <TableHead>Vorgeschlagen von</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aktionen</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {suggestions.map(s => (
                                        <TableRow key={s.id}>
                                            <TableCell>{s.playerName}</TableCell>
                                            <TableCell>Scouting-Abteilung</TableCell>
                                            <TableCell><Badge>{s.status}</Badge></TableCell>
                                            <TableCell className="text-right flex gap-2 justify-end">
                                                 <Button size="sm" variant="outline" onClick={() => handleInvite(s)}><Mail className="mr-2 h-4 w-4" /> Zum Probetraining einladen</Button>
                                                <Button size="sm" onClick={() => handleSuggestionAction(s.id, 'accepted')}><Check className="mr-2 h-4 w-4" /> Annehmen</Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleSuggestionAction(s.id, 'declined')}><X className="mr-2 h-4 w-4" /> Ablehnen</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
                <WeekOverviewCard 
                    allEvents={allEvents} 
                    weekStartDate={weekStartDate} 
                    onPrevWeek={handlePrevWeek} 
                    onNextWeek={handleNextWeek} 
                    calendarWeek={calendarWeek}
                    onTrainingClick={handleTrainingClick}
                />
                 <TeamStatsCard team={team} groupedPlayers={groupedPlayers} positionOrder={positionOrder} />
                 <CardsToDiscussCard cardsToDiscuss={team.cardsToDiscuss} onCardSelect={setSelectedCard} />
            </div>
            <div className="lg:col-span-1 space-y-6">
                 <div className="space-y-6">
                    <NextTrainingCard nextTraining={nextTraining} lang={lang} activeTeam={activeTeam} />
                    <NextMatchCard nextMatch={nextMatch} lang={lang} />
                </div>
                 <TasksCard tasks={tasks} onTaskCompleted={handleTaskCompleted} onTaskSelect={setSelectedTask} />
                 <UpcomingEventsCard title="Geburtstage im Team" members={teamMembers} eventType="birthday" showCongratulate />
                 <CarpoolCard />
                <ExpensesCard expenses={team.expenses} onExpenseClick={handleExpenseClick} onCreateExpense={() => setIsCreateExpenseModalOpen(true)} />
            </div>

            {selectedCard && (
                <PlayerCardModal isOpen={!!selectedCard} onOpenChange={() => setSelectedCard(null)} card={selectedCard} onArchive={()=>{}} onPay={() => {}}/>
            )}
             {selectedTraining && (
                <TrainingDetailModal
                    isOpen={isTrainingModalOpen}
                    onOpenChange={setIsTrainingModalOpen}
                    training={selectedTraining}
                />
            )}
             <CreateTrainingModal isOpen={isCreateTrainingModalOpen} onOpenChange={setIsCreateTrainingModalOpen} onSave={handleCreateTraining} />
            <ViewTaskModal task={selectedTask} isOpen={!!selectedTask} onOpenChange={() => setSelectedTask(null)} onUpdate={updateTask} />
            <ExpenseDetailModal expense={selectedExpense} isOpen={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen} />
            <CreateExpenseModal isOpen={isCreateExpenseModalOpen} onOpenChange={setIsCreateExpenseModalOpen} />
        </div>
    );
}

