
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, FileDown, Printer, Share2, ClipboardList, Dumbbell, UserPlus, Search, Star, CheckCircle, XCircle, HelpCircle, AlertTriangle, Home, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useToast } from '@/hooks/use-toast';
import { isPast, format, differenceInHours, parse } from 'date-fns';
import { de } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { initialLocations } from '@/app/dashboard/locations/page';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { ScrollArea } from './ui/scroll-area';

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

const getTeamData = (teamName: string) => {
    for (const category of Object.values(teamData)) {
        const teamInfo = category.teams.find(t => t.name === teamName);
        if (teamInfo) {
            // In a real app, this would fetch detailed data. For now, we use mock.
            return {
                ...teamInfo,
                players: Array.from({ length: teamInfo.members }, (_, i) => ({
                    id: `${'\'\'\''}{teamInfo.id}00${i + 1}`,
                    spielerNr: `${'\'\'\''}{teamInfo.id}00${i + 1}`,
                    name: `Spieler ${'\'\'\''}{i + 1}`,
                    position: ['Goalie', 'Verteidigung', 'Mittelfeld', 'Sturm'][i % 4],
                    geb: '2005-01-01',
                    trikot: i + 1,
                    attendance: Math.floor(Math.random() * 30 + 70),
                    goals: Math.floor(Math.random() * 5),
                    assists: Math.floor(Math.random() * 5),
                    performance: ['Top', 'Gut', 'Mittel'][Math.floor(Math.random() * 3)]
                })),
            }
        }
    }
    return null;
}


const getInitialPlayers = (teamName) => {
    for (const category of Object.values(teamData)) {
        const teamInfo = category.teams.find(t => t.name === teamName);
        if (teamInfo) {
            const fullTeamData = getTeamData(teamName);
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
        getTeamData(team.name)?.players.map(player => ({...player, team: team.name})) || []
    ))
    .map((player, index) => ({...player, id: player.spielerNr || index}));


export const TrainingDetailModal = ({ isOpen, onOpenChange, training }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [intensity, setIntensity] = useState([60]);
    const [details, setDetails] = useState("Text text text text text text text text text...");
    const [guestPlayers, setGuestPlayers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();
    const [players, setPlayers] = useState([]);
    const [priority, setPriority] = useState('Medium');
    const [trainingType, setTrainingType] = useState('Standard');
    const [selectedTask, setSelectedTask] = useState('material');
    const [taskAssignments, setTaskAssignments] = useState({
        material: null,
        garderobe: null,
        aufwaermen: null,
    });
    
     const tasks = [
        { id: 'material', icon: <Dumbbell className="w-8 h-8" />, label: 'Material' },
        { id: 'garderobe', icon: <Home className="w-8 h-8" />, label: 'Garderobe' },
        { id: 'aufwaermen', icon: <ClipboardList className="w-8 h-8" />, label: 'Aufwärmen' },
    ];
    
    const confirmedPlayers = useMemo(() => players.filter(p => p.attendance === 'confirmed'), [players]);

    const availablePlayers = useMemo(() => {
        return allClubPlayers.filter(p => 
            !guestPlayers.some(gp => gp.id === p.id) &&
            !players.some(squadPlayer => squadPlayer.spielerNr === p.spielerNr) &&
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [players, guestPlayers, searchTerm]);


    useEffect(() => {
        if (training) {
            setPlayers(getInitialPlayers(training.team));
        }
    }, [training]);


    if (!training) return null;
    
    const handlePlayerTaskAssignment = (playerId: number) => {
        setTaskAssignments(prev => {
            const currentAssignment = prev[selectedTask];
            const newAssignments = { ...prev };

            Object.keys(newAssignments).forEach(key => {
                if (newAssignments[key] === playerId) {
                    newAssignments[key] = null;
                }
            });
            
            newAssignments[selectedTask] = currentAssignment === playerId ? null : playerId;
            
            return newAssignments;
        });
    };
    
    const handleInvitePlayer = (player) => {
        if (!guestPlayers.some(gp => gp.id === player.id)) {
            setGuestPlayers([...guestPlayers, player]);
            toast({
                title: "Spieler eingeladen & belohnt",
                description: `${'\'\'\''}{player.name} wurde zum Training eingeladen und hat 10 AMIGO Tokens erhalten.`,
            });
        }
    };
    
    const handleRemoveGuest = (playerId) => {
        setGuestPlayers(guestPlayers.filter(p => p.id !== playerId));
    };

    const markAsAbsent = (playerIdToUpdate: string) => {
        setPlayers(prevPlayers => prevPlayers.map(p => 
            p.spielerNr === playerIdToUpdate
                ? { ...p, attendance: 'declined', cancellationReason: 'Nicht abgemeldet' }
                : p
        ));
        toast({
            title: "Spieler abwesend gemeldet",
            variant: "destructive"
        });
    };
    
    const getStatusBadge = (status, date, time) => {
        const trainingDateTime = parse(`${'\'\'\''}{date} ${'\'\'\''}{time}`, 'yyyy-MM-dd HH:mm', new Date());
        const hoursUntilTraining = differenceInHours(trainingDateTime, new Date());
        const isResponseOverdue = hoursUntilTraining < 2 && status === 'pending';

        if (isResponseOverdue) {
            return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3"/> Frist abgelaufen</Badge>;
        }

        switch(status) {
            case 'confirmed': return <Badge className="bg-green-100 text-green-800">Zusage</Badge>;
            case 'declined': return <Badge variant="destructive">Absage</Badge>;
            case 'pending':
            default: return <Badge variant="secondary">Offen</Badge>;
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-bold">Details Training</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[80vh]">
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle>Übersicht</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                    <TableBody>
                                        <TableRow><TableCell className="font-semibold text-muted-foreground">Trainer</TableCell><TableCell>{training.trainer}</TableCell></TableRow>
                                        <TableRow><TableCell className="font-semibold text-muted-foreground">Mannschaft</TableCell><TableCell>{training.team}</TableCell></TableRow>
                                        <TableRow><TableCell className="font-semibold text-muted-foreground">Datum</TableCell><TableCell>{new Date(training.date).toLocaleDateString('de-CH')}</TableCell></TableRow>
                                        <TableRow><TableCell className="font-semibold text-muted-foreground">Zeit</TableCell><TableCell>{training.from} - {training.to}</TableCell></TableRow>
                                        <TableRow><TableCell className="font-semibold text-muted-foreground">Ort</TableCell><TableCell>{training.field}</TableCell></TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Details & Bewertung</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-2">
                                        <Label>Priorität</Label>
                                        <Select value={priority} onValueChange={setPriority} disabled={!isEditing}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="High">Hoch</SelectItem>
                                                <SelectItem value="Medium">Mittel</SelectItem>
                                                <SelectItem value="Low">Niedrig</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Trainingstyp</Label>
                                        <Select value={trainingType} onValueChange={setTrainingType} disabled={!isEditing}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Standard">Standard</SelectItem>
                                                <SelectItem value="Taktik">Taktik</SelectItem>
                                                <SelectItem value="Kondition">Kondition</SelectItem>
                                                <SelectItem value="Regeneration">Regeneration</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Intensität: {intensity[0]}%</Label>
                                    <Slider value={intensity} onValueChange={setIntensity} max={100} step={1} disabled={!isEditing}/>
                                </div>
                                <div className="space-y-1">
                                    <Label>Bemerkungen / Bewertung:</Label>
                                    <Textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Bewertung der Trainingsleistung, Notizen etc." readOnly={!isEditing}/>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Aufgabenverteilung</CardTitle>
                                <CardDescription>Wählen Sie Spieler aus, die zugesagt haben.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                 <div className="flex justify-around items-center mb-6">
                                    {tasks.map(task => (
                                        <div key={task.id} className="flex flex-col items-center gap-2 text-center cursor-pointer text-muted-foreground" onClick={() => setSelectedTask(task.id)}>
                                            <div className={cn("p-3 rounded-full transition-colors", selectedTask === task.id ? 'bg-primary/20 text-primary' : 'bg-muted')}>
                                                {task.icon}
                                            </div>
                                            <span className={cn("text-xs font-semibold", selectedTask === task.id && 'text-primary')}>{task.label}</span>
                                            {selectedTask === task.id && <div className="h-1 w-8 bg-primary rounded-full mt-1"></div>}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-4 gap-4">
                                    {confirmedPlayers.map(player => (
                                         <div key={player.id} className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => handlePlayerTaskAssignment(player.id)}>
                                            <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border-2",
                                                taskAssignments[selectedTask] === player.id ? 'bg-yellow-400 text-black border-yellow-500' : 'bg-green-500 text-white border-green-600'
                                            )}>
                                                {player.trikot}
                                            </div>
                                            <p className="text-xs text-center font-medium">{player.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle>Kader & Anwesenheit</CardTitle></CardHeader>
                            <CardContent>
                                <Table>
                                     <TableHeader>
                                        <TableRow>
                                            <TableHead>Spieler</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Zeit</TableHead>
                                            <TableHead>Grund</TableHead>
                                            <TableHead>Aktion</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {players.map(player => {
                                            const trainingDateTime = parse(`${'\'\'\''}{training.date} ${'\'\'\''}{training.from}`, 'yyyy-MM-dd HH:mm', new Date());
                                            const hoursUntilTraining = differenceInHours(trainingDateTime, new Date());
                                            const isResponseOverdue = hoursUntilTraining < 2 && player.attendance === 'pending';
                                            const hasPassed = isPast(trainingDateTime);
                                            const canMarkAbsent = (isResponseOverdue || hasPassed) && player.attendance === 'pending';
                                            
                                            return (
                                                <TableRow key={player.id}>
                                                    <TableCell className="font-medium flex items-center gap-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={player.avatar} />
                                                            <AvatarFallback>{player.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                        {player.name}
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(player.attendance, training.date, training.from)}</TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">{player.confirmationTimestamp}</TableCell>
                                                    <TableCell className="text-xs">{player.cancellationReason || '-'}</TableCell>
                                                    <TableCell>
                                                        {canMarkAbsent && (
                                                            <Button size="sm" variant="destructive" onClick={() => markAsAbsent(player.spielerNr)}>Abwesend</Button>
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
                            <CardHeader><CardTitle>Gastspieler einladen</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Spieler aus anderen Teams suchen..."
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                {searchTerm && (
                                    <div className="border rounded-md max-h-32 overflow-y-auto">
                                        {availablePlayers.map(player => (
                                            <div key={player.id} className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer" onClick={() => handleInvitePlayer(player)}>
                                                <div className="flex items-center gap-2">
                                                     <Avatar className="w-8 h-8">
                                                        <AvatarImage src={player.avatar} />
                                                        <AvatarFallback>{player.name.slice(0,2)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-medium">{player.name}</p>
                                                        <p className="text-xs text-muted-foreground">{player.team}</p>
                                                    </div>
                                                </div>
                                                <UserPlus className="h-4 w-4 text-primary" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div>
                                    <Label className="text-xs text-muted-foreground">Eingeladene Gäste ({guestPlayers.length})</Label>
                                    <div className="mt-2 space-y-2">
                                        {guestPlayers.map(player => (
                                            <div key={player.id} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage src={player.avatar} />
                                                        <AvatarFallback>{player.name.slice(0,2)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-medium">{player.name}</p>
                                                        <p className="text-xs text-muted-foreground">{player.team}</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveGuest(player.id)}><X className="h-4 w-4"/></Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                </ScrollArea>
                <DialogFooter className="p-6 pt-0">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Abbrechen</Button>
                            <Button onClick={() => setIsEditing(false)}>Speichern</Button>
                        </>
                    ) : (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>Bearbeiten</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
