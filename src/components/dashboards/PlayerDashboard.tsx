
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageSquare, ArrowRight, Wallet, Users, BarChart, FileText, Trophy, ClipboardList, Dumbbell, User, Home, CheckCircle, AlertTriangle, Check, X, Car, Search, Plus, Minus, ShoppingCart, Video, XCircle, Edit, Save, RectangleVertical } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type Locale } from '@/../i18n.config';
import { Progress } from '../ui/progress';
import { useToast } from '@/hooks/use-toast';
import { DeclineEventModal } from '../ui/decline-event-modal';
import { Countdown } from '../ui/countdown';
import { cn } from '@/lib/utils';
import { AmigoalLogo } from '../icons';
import { PlayerInvoiceDetailModal } from '../ui/player-invoice-detail-modal';
import confetti from 'canvas-confetti';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarningDetailModal } from '../ui/warning-detail-modal';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import Image from 'next/image';
import { PlayerCardModal } from '../PlayerCardModal';
import { Textarea } from '../ui/textarea';
import { playerPerformanceData } from '@/lib/player-performance-data';
import { useTasks } from '@/hooks/useTasks';
import { ViewTaskModal, CreateTaskModal } from '@/components/ViewTaskModal';
import { Checkbox } from '../ui/checkbox';
import { useAbsences } from '@/hooks/useAbsences';
import { useMatches } from '@/hooks/useMatches';
import { useTrainings } from '@/hooks/useTrainings';
import { useCards } from '@/hooks/useCards';
import { useFeedback } from '@/hooks/useFeedback';
import { useCarpool } from '@/hooks/useCarpool';
import { useTeam } from '@/hooks/use-team';

const OfferRideModal = ({ isOpen, onOpenChange, onOffer }) => {
    const [seats, setSeats] = useState(1);

    const handleOffer = () => {
        onOffer(seats);
        onOpenChange(false);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle>Fahrt anbieten</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Label>Wie viele freie Plätze hast du?</Label>
                     <div className="flex items-center justify-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => setSeats(s => Math.max(1, s - 1))}><Minus /></Button>
                        <span className="text-4xl font-bold w-16 text-center">{seats}</span>
                        <Button variant="outline" size="icon" onClick={() => setSeats(s => s + 1)}><Plus /></Button>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={handleOffer}>Angebot erstellen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const SearchRideModal = ({ isOpen, onOpenChange, carpoolData }) => {
    const { toast } = useToast();
    
    const handleRequestSeat = (driver) => {
        toast({
            title: 'Platz angefragt!',
            description: `Ihre Anfrage wurde an ${'\'\''}{driver.name} gesendet.`
        })
    }

    return (
         <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Fahrt suchen</DialogTitle>
                    <DialogDescription>
                        Finden Sie eine Mitfahrgelegenheit zum nächsten Auswärtsspiel.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3 max-h-96 overflow-y-auto">
                    {carpoolData.map((ride, index) => (
                        <Card key={index}>
                            <CardContent className="p-4 flex items-center justify-between">
                                 <div>
                                    <p className="font-semibold">{ride.driverName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Mitfahrer: {ride.passengers?.map(p => p.name).join(', ') || 'Keine'}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{ride.seatsAvailable}</p>
                                    <p className="text-xs text-muted-foreground">freie Plätze</p>
                                </div>
                                 <Button 
                                    size="sm"
                                    onClick={() => handleRequestSeat(ride.driver)}
                                    disabled={ride.seatsAvailable === 0}
                                >
                                    Platz anfragen
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}

const CarpoolCard = ({ matchId }) => {
    const { carpools, addCarpool, isLoading } = useCarpool(matchId);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const { toast } = useToast();
    const { user, userName } = useTeam();

    const handleOfferRide = async (seats: number) => {
        if (!user || !userName || !matchId) {
            toast({ title: 'Fehler', description: 'Benutzerinformationen nicht verfügbar.', variant: 'destructive'});
            return;
        }

        if (carpools.some(c => c.driverId === user.uid)) {
             toast({
                title: 'Fahrdienst bereits angeboten',
                description: 'Sie haben bereits eine Fahrt für dieses Spiel angeboten.',
                variant: 'destructive'
            });
            return;
        }

        await addCarpool({
            driverId: user.uid,
            driverName: userName,
            seatsAvailable: seats,
            maxSeats: seats,
            matchId: matchId,
            passengers: [],
        });
    };
    
    if (isLoading) return <Card><CardHeader><CardTitle>Fahrdienst</CardTitle></CardHeader><CardContent><p>Laden...</p></CardContent></Card>;

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Car className="h-5 w-5 text-primary"/> Fahrdienst</CardTitle>
                    <CardDescription>Koordinieren Sie die Fahrten zu den Auswärtsspielen.</CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col gap-2">
                    <Button className="w-full" onClick={() => setIsSearchModalOpen(true)}>
                        <Search className="mr-2 h-4 w-4" /> Fahrt suchen
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => setIsOfferModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Fahrt anbieten
                    </Button>
                </CardFooter>
            </Card>
            <OfferRideModal 
                isOpen={isOfferModalOpen}
                onOpenChange={setIsOfferModalOpen}
                onOffer={handleOfferRide}
            />
            <SearchRideModal
                isOpen={isSearchModalOpen}
                onOpenChange={setIsSearchModalOpen}
                carpoolData={carpools}
            />
        </>
    )
}

const NextEvents = ({ activeTeam }) => {
    const { user } = useTeam();
    const { trainings } = useTrainings();
    const { matches } = useMatches();
    const { addAbsence, getAbsenceStatus, isLoading: isAbsencesLoading } = useAbsences(user?.uid);
    const [isTrainingDeclineModalOpen, setIsTrainingDeclineModalOpen] = useState(false);
    const [isMatchDeclineModalOpen, setIsMatchDeclineModalOpen] = useState(false);
    const [showTransportOptions, setShowTransportOptions] = useState(false);
    const { toast } = useToast();
    
    const nextTraining = useMemo(() => {
         return trainings
            .filter(e => new Date(e.date) >= new Date() && e.team === activeTeam)
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    }, [trainings, activeTeam]);

     const nextMatch = useMemo(() => {
        return matches
            .filter(e => new Date(e.date) >= new Date() && (e as any).isCalledUp)
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    }, [matches]);

    const trainingAttendance = getAbsenceStatus(nextTraining?.id);
    const matchAttendance = getAbsenceStatus(nextMatch?.id);

    const handleDecline = (type: 'training' | 'match', reason: string) => {
        const eventId = type === 'training' ? nextTraining?.id : nextMatch?.id;
        if (!eventId) return;

        addAbsence({
            eventId: eventId,
            memberId: user.uid,
            reason: reason,
            status: 'declined',
        });
        type === 'training' ? setIsTrainingDeclineModalOpen(false) : setIsMatchDeclineModalOpen(false);
    }
    
    const handleAttendanceChange = (type: 'training' | 'match') => {
        if (type === 'match' && nextMatch?.location === 'Auswärts') {
            setShowTransportOptions(true);
        } else {
             addAbsence({ eventId: nextTraining.id, memberId: user.uid, status: 'confirmed' });
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
    }
    
    const handleTransportChoice = (drivesSelf: boolean) => {
        const newStatus = drivesSelf ? 'confirmed_driving' : 'confirmed_needs_ride';
        addAbsence({ eventId: nextMatch.id, memberId: user.uid, status: newStatus });
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setShowTransportOptions(false);
    };

    const renderAttendanceFooter = (type: 'training' | 'match', attendance: string) => {
        if (showTransportOptions && type === 'match') {
             return (
                <div className="flex w-full gap-2">
                    <Button className="w-full" onClick={() => handleTransportChoice(true)}>
                        <Car className="mr-2 h-4 w-4" /> Ich fahre selbst
                    </Button>
                    <Button className="w-full" variant="secondary" onClick={() => handleTransportChoice(false)}>
                        <Users className="mr-2 h-4 w-4" /> Ich suche eine Fahrt
                    </Button>
                </div>
            )
        }
        
        switch (attendance) {
            case 'pending':
                return (
                    <div className="w-full space-y-2">
                        <p className="text-sm font-medium text-center">Anwesend?</p>
                        <div className="flex gap-2 w-full">
                            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => handleAttendanceChange(type)}>
                                <Check className="mr-2 h-4 w-4"/> Ja
                            </Button>
                            <Button className="w-full" variant="destructive" onClick={() => type === 'training' ? setIsTrainingDeclineModalOpen(true) : setIsMatchDeclineModalOpen(true)}>
                                <X className="mr-2 h-4 w-4"/> Nein
                            </Button>
                        </div>
                    </div>
                );
            case 'confirmed':
                 return <Badge className="w-full justify-center p-2 text-base bg-green-500 hover:bg-green-600"><CheckCircle className="mr-2 h-5 w-5"/> Zugesagt</Badge>;
            case 'confirmed_driving':
                 return <Badge className="w-full justify-center p-2 text-base bg-green-500 hover:bg-green-600"><CheckCircle className="mr-2 h-5 w-5"/> Zugesagt (Fährt selbst)</Badge>;
            case 'confirmed_needs_ride':
                return <Badge className="w-full justify-center p-2 text-base bg-blue-500 hover:bg-blue-600"><CheckCircle className="mr-2 h-5 w-5"/> Zugesagt (Benötigt Fahrt)</Badge>;
            case 'declined':
                return <Badge variant="destructive" className="w-full justify-center p-2 text-base"><XCircle className="mr-2 h-5 w-5"/> Abgesagt</Badge>;
            default:
                 return null;
        }
    }
    
    return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
             <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Nächstes Training</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                 {nextTraining ? (
                    <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex flex-col items-center justify-center p-2 bg-primary/10 text-primary rounded-lg">
                            <span className="text-xs font-bold">{new Date(nextTraining.date).toLocaleDateString('de-CH', { month: 'short' }).toUpperCase()}</span>
                            <span className="text-2xl font-bold">{new Date(nextTraining.date).getDate()}</span>
                        </div>
                        <div className="text-sm">
                            <p className="font-semibold">{nextTraining.from} - {nextTraining.to}</p>
                            <p className="text-muted-foreground">Trainingseinheit</p>
                        </div>
                    </div>
                 ) : (
                    <p className="text-sm text-muted-foreground">Kein Training geplant.</p>
                 )}
            </CardContent>
            {nextTraining && (
                <CardFooter>
                    {renderAttendanceFooter('training', trainingAttendance)}
                </CardFooter>
            )}
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Nächstes Spiel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 {nextMatch ? (
                    <div className="flex justify-between items-center">
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-1">
                                <AmigoalLogo className="w-16 h-16"/>
                            </div>
                            <p className="font-semibold">Amigoal FC</p>
                        </div>
                        <span className="text-2xl font-bold text-muted-foreground">vs</span>
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center mb-1">
                                <Image src={'https://placehold.co/80x80.png?text=FCR'} width={64} height={64} alt={nextMatch.opponent} data-ai-hint="team logo"/>
                            </div>
                            <p className="font-semibold">{nextMatch.opponent}</p>
                        </div>
                    </div>
                 ) : (
                    <p className="text-sm text-muted-foreground">Kein Spiel geplant.</p>
                 )}
            </CardContent>
            {nextMatch?.isCalledUp && (
                 <CardFooter>
                    {renderAttendanceFooter('match', matchAttendance)}
                </CardFooter>
            )}
        </Card>
        <DeclineEventModal 
            isOpen={isTrainingDeclineModalOpen} 
            onOpenChange={setIsTrainingDeclineModalOpen} 
            onConfirm={(reason) => handleDecline('training', reason)} 
            onReportInjury={(details) => console.log('Injury reported from training decline:', details)} 
        />
        <DeclineEventModal 
            isOpen={isMatchDeclineModalOpen} 
            onOpenChange={setIsMatchDeclineModalOpen} 
            onConfirm={(reason) => handleDecline('match', reason)} 
            onReportInjury={(details) => console.log('Injury reported from match decline:', details)} 
        />
    </div>
    )
};


const StrengthsWeaknessesCard = () => {
    const [isEditing, setIsEditing] = useState(false);
    const { toast } = useToast();
    const [playerData, setPlayerData] = useState({
        strengths: "Schuss, Spielübersicht, Ballgefühl",
        weaknesses: "Kondition, Schnelligkeit",
    });

    const trainerData = {
        strengths: "Schuss, Spielübersicht",
        weaknesses: "Kondition, Defensivarbeit",
        notes: "Lionel hat grosses Potenzial, muss aber an seiner Ausdauer und Defensiv-Disziplin arbeiten.",
    };

    const handleSave = () => {
        setIsEditing(false);
        toast({
            title: "Einschätzung gespeichert!",
            description: "Deine Selbsteinschätzung wurde aktualisiert und der Trainer wurde benachrichtigt.",
        });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle>Stärken / Schwächen</CardTitle>
                    <CardDescription>Deine Selbsteinschätzung im Vergleich zur Trainerbewertung.</CardDescription>
                </div>
                {isEditing ? (
                    <Button size="sm" onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Speichern</Button>
                ) : (
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4"/> Bearbeiten</Button>
                )}
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Meine Einschätzung</h3>
                    <div className="space-y-2">
                        <Label htmlFor="player-strengths">Meine Stärken</Label>
                        <Textarea 
                            id="player-strengths"
                            value={playerData.strengths}
                            onChange={(e) => setPlayerData(p => ({...p, strengths: e.target.value}))}
                            readOnly={!isEditing}
                            className={!isEditing ? 'border-none bg-muted/50' : ''}
                            placeholder="z.B. Dribbling, Passspiel..."
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="player-weaknesses">Meine Schwächen</Label>
                        <Textarea 
                            id="player-weaknesses"
                            value={playerData.weaknesses}
                            onChange={(e) => setPlayerData(p => ({...p, weaknesses: e.target.value}))}
                            readOnly={!isEditing}
                            className={!isEditing ? 'border-none bg-muted/50' : ''}
                            placeholder="z.B. Kopfball, Linker Fuss..."
                        />
                    </div>
                </div>
                <div className="space-y-4">
                     <h3 className="font-semibold text-lg">Einschätzung des Trainers</h3>
                    <div className="space-y-2">
                        <Label>Stärken</Label>
                        <p className="p-3 text-sm rounded-md bg-muted/50 border min-h-10">{trainerData.strengths}</p>
                    </div>
                     <div className="space-y-2">
                        <Label>Schwächen</Label>
                        <p className="p-3 text-sm rounded-md bg-muted/50 border min-h-10">{trainerData.weaknesses}</p>
                    </div>
                     <div className="space-y-2">
                        <Label>Anmerkungen</Label>
                        <p className="p-3 text-sm rounded-md bg-muted/50 border min-h-10">{trainerData.notes}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const DisciplineAndFeedbackCard = ({ onWarningClick, onCardClick }) => {
    const { cards } = useCards();
    const { feedback } = useFeedback('player-101');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><RectangleVertical className="h-5 w-5 text-primary"/>Karten</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Datum</TableHead>
                                <TableHead>Karte</TableHead>
                                <TableHead>Grund</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cards.map((card, i) => (
                                <TableRow key={i} className="cursor-pointer hover:bg-muted/50" onClick={() => onCardClick(card)}>
                                    <TableCell>{card.date}</TableCell>
                                    <TableCell><RectangleVertical className="w-4 h-6 text-yellow-500 fill-yellow-400"/></TableCell>
                                    <TableCell>{card.reason}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary"/>Feedback &amp; Verwarnungen</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Datum</TableHead>
                                <TableHead>Typ</TableHead>
                                <TableHead>Beschreibung</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {feedback.map((item, index) => (
                                <TableRow key={index} className="cursor-pointer hover:bg-muted/50" onClick={() => onWarningClick(item)}>
                                    <TableCell>{item.date}</TableCell>
                                    <TableCell><Badge variant={item.type === 'Verwarnung' ? 'destructive' : 'secondary'}>{item.type}</Badge></TableCell>
                                    <TableCell>{item.description}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

const TasksCard = ({ tasks, onTaskCompleted, onTaskSelect }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Offene Aufgaben</CardTitle>
            </CardHeader>
            <CardContent>
                {tasks.filter(t => t.status !== 'Done').map(task => (
                    <div key={task.id} className="flex items-start gap-3 mb-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => onTaskSelect(task)}>
                        <Checkbox 
                            id={`task-${'\'\'\''}{task.id}`} 
                            className="mt-1"
                            onCheckedChange={() => onTaskCompleted(task.id)}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <div>
                            <Label htmlFor={`task-${'\'\'\''}{task.id}`} className="font-medium cursor-pointer">{task.title}</Label>
                            <p className="text-xs text-muted-foreground">{new Date(task.dueDate).toLocaleDateString('de-CH')}</p>
                        </div>
                    </div>
                ))}
                {tasks.filter(t => t.status !== 'Done').length === 0 && (
                    <p className="text-sm text-muted-foreground text-center">Keine offenen Aufgaben. Gut gemacht!</p>
                )}
            </CardContent>
            <CardFooter>
                 <Button asChild variant="outline" className="w-full">
                     <Link href="/dashboard/tasks">Alle Aufgaben anzeigen</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}


export function PlayerDashboard() {
    const params = useParams();
    const { activeTeam } = useTeam();
    const lang = params.lang as Locale;
    const [selectedWarning, setSelectedWarning] = useState(null);
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [isPlayerCardModalOpen, setIsPlayerCardModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const { tasks, updateTask, archiveTask } = useTasks();
    const [selectedTask, setSelectedTask] = useState(null);
    const { toast } = useToast();
    
    const performance = playerPerformanceData['Lionel Messi'];
    
    const handleWarningClick = (warning: any) => {
        setSelectedWarning(warning);
        setIsWarningModalOpen(true);
    }
    
    const handleCardClick = (card: any) => {
        setSelectedCard(card);
        setIsPlayerCardModalOpen(true);
    };

    const handleArchiveCard = (cardToArchive: any, paidBy: string) => {
        console.log(`Archiving card ${cardToArchive.id}, paid by ${paidBy}`);
    };
    
    const handlePayClick = (invoice: any) => {
        setSelectedInvoice(invoice);
        setIsInvoiceModalOpen(true);
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

    if (!activeTeam) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                 <h1 className="text-2xl font-bold">Keiner Mannschaft zugewiesen</h1>
                 <p className="text-muted-foreground mt-2">Du scheinst aktuell keinem Team zugeordnet zu sein. Dein Dashboard wird angezeigt, sobald du einem Team zugewiesen bist.</p>
                 <Button className="mt-4" asChild>
                     <Link href="/dashboard/chat">Trainer kontaktieren</Link>
                 </Button>
            </div>
        )
    }


    return (
         <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Dashboard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <NextEvents activeTeam={activeTeam} />
                </div>
                 <div className="lg:col-span-1 space-y-6">
                     <TasksCard tasks={tasks} onTaskCompleted={handleTaskCompleted} onTaskSelect={setSelectedTask} />
                     <CarpoolCard matchId={'match-123'} />
                 </div>
            </div>

            <div className="space-y-6">
                 <DisciplineAndFeedbackCard onWarningClick={handleWarningClick} onCardClick={handleCardClick} />
                 <StrengthsWeaknessesCard />
            </div>

             <WarningDetailModal
                isOpen={isWarningModalOpen}
                onOpenChange={setIsWarningModalOpen}
                warning={selectedWarning}
            />
            <PlayerCardModal
                card={selectedCard}
                isOpen={isPlayerCardModalOpen}
                onOpenChange={setIsPlayerCardModalOpen}
                onArchive={handleArchiveCard}
                onPay={handlePayClick}
            />
            <PlayerInvoiceDetailModal 
                isOpen={isInvoiceModalOpen}
                onOpenChange={setIsInvoiceModalOpen}
                invoice={selectedInvoice}
            />
             <ViewTaskModal task={selectedTask} isOpen={!!selectedTask} onOpenChange={() => setSelectedTask(null)} onUpdate={updateTask} />
        </div>
    );
}

    