
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Stepper, StepperItem, StepperTrigger, StepperIndicator, StepperTitle } from '@/components/ui/stepper';
import { Check, ArrowRight, ArrowLeft, Users, Shield, UserPlus, Wallet, Save, Loader2, User, Home, Mail, Phone, Calendar, Upload, Package, Clock, Trash2, Search, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTeams } from '@/hooks/useTeams';
import { useTeam } from '@/hooks/use-team';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { addMember } from '@/ai/flows/members';
import type { Member } from '@/ai/flows/members.types';
import Image from 'next/image';
import { countries } from '@/lib/countries';
import { Combobox } from './ui/combobox';
import { Separator } from './ui/separator';
import { useClub } from '@/hooks/useClub';
import { useMembers } from '@/hooks/useMembers';
import { getConfiguration } from '@/ai/flows/configurations';
import type { TeamCategory, League } from '@/ai/flows/configurations.types';
import { createTeam } from '@/ai/flows/teams';
import { addEvent } from '@/ai/flows/events';
import { getDay, addDays, nextDay, setHours, setMinutes, setSeconds, formatISO, type Day } from 'date-fns';
import { sendMail } from '@/services/email';

const StepIndicator = ({ step, currentStep, icon, label }) => (
    <div className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${currentStep === step ? 'text-primary' : currentStep > step ? 'text-green-500' : 'text-muted-foreground'}`}>
        {icon}
        <span className="font-medium">{label}</span>
    </div>
);

const Step1_Category = ({ onSelect, selectedCategory, categories }) => (
    <div className="space-y-4">
        <h3 className="font-bold text-lg text-center">In welcher Kategorie spielt die neue Mannschaft?</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map(category => (
                <Button key={category.id} variant={selectedCategory === category.name ? 'default' : 'outline'} className="h-20 text-base" onClick={() => onSelect(category.name)}>
                    {category.name}
                </Button>
            ))}
             <Button variant={selectedCategory === 'Aktive' ? 'default' : 'outline'} className="h-20 text-base" onClick={() => onSelect('Aktive')}>
                Aktive
            </Button>
        </div>
    </div>
);

const Step2_Details = ({ data, setData, leagues, seasons }) => (
    <div className="space-y-4">
         <h3 className="font-bold text-lg">Basisinformationen</h3>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="name">Mannschaftsname</Label>
                <Input id="name" value={data.name} onChange={e => setData(p => ({ ...p, name: e.target.value }))} placeholder="z.B. 1. Mannschaft"/>
            </div>
             <div className="space-y-2">
                <Label htmlFor="season">Saison</Label>
                <Select value={data.season} onValueChange={(val) => setData(p => ({...p, season: val}))}>
                    <SelectTrigger><SelectValue placeholder="Saison auswählen..."/></SelectTrigger>
                    <SelectContent>
                        {seasons.map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2 col-span-2">
                <Label htmlFor="liga">Liga</Label>
                 <Select value={data.liga} onValueChange={(val) => setData(p => ({...p, liga: val}))}>
                    <SelectTrigger><SelectValue placeholder="Liga auswählen..."/></SelectTrigger>
                    <SelectContent>
                        {leagues.map(l => (
                            <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="openSpots">Offene Plätze</Label>
                <Input id="openSpots" type="number" value={data.openSpots} onChange={e => setData(p => ({ ...p, openSpots: parseInt(e.target.value, 10) || 0 }))} placeholder="z.B. 3"/>
            </div>
        </div>
    </div>
);

const Step3_Staff = ({ data, setData, allStaff }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStaff, setSelectedStaff] = useState<Member | null>(null);
    const [role, setRole] = useState('Haupt-Trainer');

    const availableStaff = allStaff.filter(s => 
        !data.staff.some(assigned => assigned.id === s.id) &&
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addStaff = () => {
        if (selectedStaff && role) {
            const staffToAdd = {
                id: selectedStaff.id!,
                firstName: selectedStaff.firstName,
                lastName: selectedStaff.lastName,
                role: role,
            };
            setData(p => ({ ...p, staff: [...p.staff, staffToAdd]}));
            setSelectedStaff(null);
            setRole('Haupt-Trainer');
        }
    };
    
    const removeStaff = (staffId: string) => {
        setData(p => ({...p, staff: p.staff.filter(s => s.id !== staffId)}));
    };

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-lg">Staff zuweisen</h3>
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                     <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Staff suchen..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <ScrollArea className="h-48 border rounded-md p-2">
                        {availableStaff.map(s => (
                            <div key={s.id} className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer rounded-md" onClick={() => setSelectedStaff(s)}>
                                <span>{s.firstName} {s.lastName}</span>
                                {selectedStaff?.id === s.id && <Check className="h-4 w-4 text-primary"/>}
                            </div>
                        ))}
                    </ScrollArea>
                     <div className="flex items-center gap-2">
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Haupt-Trainer">Haupt-Trainer</SelectItem>
                                <SelectItem value="Co-Trainer">Co-Trainer</SelectItem>
                                <SelectItem value="Physio">Physio</SelectItem>
                                <SelectItem value="Betreuer">Betreuer</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button size="sm" onClick={addStaff} disabled={!selectedStaff}><PlusCircle className="mr-2 h-4 w-4"/>Hinzufügen</Button>
                    </div>
                </div>
                 <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Zugewiesener Staff ({data.staff.length})</h4>
                    <ScrollArea className="h-64 border rounded-md p-2">
                        {data.staff.map(s => (
                            <div key={s.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                                 <div>
                                    <p className="font-medium">{s.firstName} {s.lastName}</p>
                                    <p className="text-xs text-muted-foreground">{s.role}</p>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => removeStaff(s.id)}><Trash2 className="h-4 w-4"/></Button>
                            </div>
                        ))}
                    </ScrollArea>
                </div>
            </div>
        </div>
    )
};


const Step4_Players = ({ data, setData, allPlayers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const assignedIds = new Set(data.players.map(s => s.id));
    
    const availablePlayers = allPlayers.filter(s => 
        !assignedIds.has(s.id) &&
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const addPlayer = (player: Member) => {
        const playerWithDetails = {
            id: player.id!,
            firstName: player.firstName,
            lastName: player.lastName,
            position: player.position,
            trikot: player.trikot,
            fee: player.fee,
        };
        setData(p => ({ ...p, players: [...p.players, playerWithDetails]}));
    };
    
    const removePlayer = (playerId: string) => {
        setData(p => ({...p, players: p.players.filter(s => s.id !== playerId)}));
    };

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-lg">Spieler zuweisen</h3>
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                     <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Spieler suchen..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <ScrollArea className="h-48 border rounded-md p-2">
                        {availablePlayers.map(s => (
                            <div key={s.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                                <span>{s.firstName} {s.lastName}</span>
                                <Button size="sm" variant="outline" onClick={() => addPlayer(s)}><PlusCircle className="h-4 w-4"/></Button>
                            </div>
                        ))}
                    </ScrollArea>
                </div>
                 <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Zugewiesene Spieler ({data.players.length})</h4>
                    <ScrollArea className="h-48 border rounded-md p-2">
                        {data.players.map(s => (
                            <div key={s.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                                <span>{s.firstName} {s.lastName}</span>
                                <Button size="sm" variant="ghost" onClick={() => removePlayer(s.id)}><Trash2 className="h-4 w-4"/></Button>
                            </div>
                        ))}
                    </ScrollArea>
                </div>
            </div>
        </div>
    )
};

const Step5_Trainings = ({ data, setData }) => {
    const weekdays = [ "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag" ];
    
    const handleTrainingChange = (id: string, field: string, value: string) => {
        setData(prev => {
            const newTrainings = [...prev.trainings];
            const index = newTrainings.findIndex(t => t.id === id);
            if (index > -1) {
                newTrainings[index] = { ...newTrainings[index], [field]: value };
            }
            return { ...prev, trainings: newTrainings };
        });
    };
    
    const addTraining = () => {
        setData(prev => ({
            ...prev,
            trainings: [...prev.trainings, { id: `training-${Date.now()}`, day: 'Montag', from: '18:30', to: '20:00', location: '' }]
        }));
    };
    
    const removeTraining = (id) => {
        setData(prev => ({
            ...prev,
            trainings: prev.trainings.filter((t) => t.id !== id)
        }));
    };

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-lg">Wöchentliche Trainingszeiten</h3>
            <div className="space-y-3">
                {data.trainings.map((training, index) => (
                    <div key={training.id} className="grid grid-cols-[1fr,1fr,1fr,auto] gap-4 items-end">
                        <div className="space-y-2">
                            <Label>Tag</Label>
                            <Select value={training.day} onValueChange={(val) => handleTrainingChange(training.id, 'day', val)}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    {weekdays.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Von</Label>
                            <Input type="time" value={training.from} onChange={(e) => handleTrainingChange(training.id, 'from', e.target.value)}/>
                        </div>
                        <div className="space-y-2">
                            <Label>Bis</Label>
                            <Input type="time" value={training.to} onChange={(e) => handleTrainingChange(training.id, 'to', e.target.value)}/>
                        </div>
                         <Button variant="ghost" size="icon" onClick={() => removeTraining(training.id)}>
                             <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                    </div>
                ))}
            </div>
            <Button variant="outline" size="sm" onClick={addTraining}>
                <PlusCircle className="mr-2 h-4 w-4"/> Weitere Trainingszeit
            </Button>
        </div>
    )
}

const Step6_Equipment = ({ data, setData }) => {
    const availableEquipment = [ "Trikotsatz (Heim)", "Trikotsatz (Auswärts)", "Bälle (Gr. 5)", "Markierungshütchen", "Trainingsleibchen" ];

    const handleEquipmentToggle = (item) => {
        setData(prev => {
            const currentMaterial = prev.material || [];
            const isSelected = currentMaterial.some(m => m.name === item);
            if (isSelected) {
                return { ...prev, material: currentMaterial.filter(m => m.name !== item) };
            } else {
                return { ...prev, material: [...currentMaterial, { id: `mat-${Date.now()}`, name: item, quantity: 1 }] };
            }
        });
    }

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-lg">Materialzuweisung</h3>
            <div className="flex flex-wrap gap-2">
                {availableEquipment.map(item => (
                    <Button
                        key={item}
                        variant={(data.material || []).some(m => m.name === item) ? 'default' : 'outline'}
                        onClick={() => handleEquipmentToggle(item)}
                    >
                        {item}
                    </Button>
                ))}
            </div>
            <div className="space-y-2">
                <Label htmlFor="garderobe">Garderobe / Kabine</Label>
                <Input id="garderobe" value={data.garderobe || ''} onChange={e => setData(p => ({...p, garderobe: e.target.value}))} placeholder="z.B. Kabine 3"/>
            </div>
        </div>
    );
};


const Step7_Summary = ({ data, setStep }) => {
    const [sendInvite, setSendInvite] = useState('now');
    
    return (
        <div className="space-y-4">
            <h3 className="font-bold text-lg">Zusammenfassung</h3>
            <p><strong>Kategorie:</strong> {data.category}</p>
            <p><strong>Mannschaftsname:</strong> {data.name}</p>
            <p><strong>Liga:</strong> {data.liga}</p>
            <p><strong>Offene Plätze:</strong> {data.openSpots}</p>
            <p><strong>Staff:</strong> {data.staff.map(s => `${s.firstName} ${s.lastName} (${s.role})`).join(', ')}</p>
            <p><strong>Spieler:</strong> {data.players.length} zugewiesen</p>
            <p><strong>Garderobe:</strong> {data.garderobe || 'N/A'}</p>
            <Separator className="my-4"/>
            <div className="space-y-2">
                <Label>Einladungen versenden</Label>
                 <Select value={sendInvite} onValueChange={setSendInvite}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="now">Sofort an alle senden</SelectItem>
                        <SelectItem value="later">Später manuell senden</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

export const CreateTeamWizard = ({ isOpen, onOpenChange, onTeamCreated, defaultRoles }) => {
    const { toast } = useToast();
    const { club, isLoading: isLoadingClub } = useClub();
    const { members, isLoading: isLoadingMembers } = useMembers(club?.id);
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const initialData = {
        name: '',
        category: '',
        liga: '',
        season: '24/25',
        openSpots: 3,
        staff: [],
        players: [],
        trainings: [{ id: `training-${Date.now()}`, day: 'Montag', from: '18:30', to: '20:00', location: '' }],
        material: [],
        garderobe: '',
    };
    const [teamData, setTeamData] = useState(initialData);
    
    const [teamCategories, setTeamCategories] = useState<TeamCategory[]>([]);
    const [leagues, setLeagues] = useState<League[]>([]);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);

    const generateSeasons = () => {
        const currentYear = new Date().getFullYear();
        const seasons = [];
        for (let i = -1; i < 3; i++) {
            const startYear = (currentYear + i).toString().slice(-2);
            const endYear = (currentYear + i + 1).toString().slice(-2);
            seasons.push(`${startYear}/${endYear}`);
        }
        return seasons;
    }
    const seasons = generateSeasons();

    useEffect(() => {
        const loadConfig = async () => {
            if (isOpen) {
                setIsLoadingConfig(true);
                try {
                    const config = await getConfiguration();
                    if (config) {
                        const countryCode = club?.country || 'CH';
                        const categories = (club?.teamCategories?.length > 0) ? club.teamCategories : (config.teamCategories?.[countryCode] || []);
                        setTeamCategories(categories);

                        const countryAssociations = config.leagueStructures?.[countryCode]?.associations || [];
                        const countryLeagues = countryAssociations.flatMap(a => a.leagues) || [];
                        setLeagues(countryLeagues);
                    }
                } catch (e) {
                    console.error(e);
                    toast({ title: 'Fehler beim Laden der Konfiguration', variant: 'destructive' });
                } finally {
                    setIsLoadingConfig(false);
                }
            }
        };
        loadConfig();
    }, [isOpen, club, toast]);
    
    const allStaff = useMemo(() => members.filter(m => m.roles.some(r => ['Trainer', 'Staff', 'Board', 'Manager', 'Facility Manager'].includes(r))), [members]);
    const allPlayers = useMemo(() => members.filter(m => m.roles.includes('Spieler')), [members]);

    const steps = [
        { label: 'Kategorie', icon: <Shield/>, content: <Step1_Category onSelect={(cat) => setTeamData(p => ({...p, category: cat, name: cat}))} selectedCategory={teamData.category} categories={teamCategories}/> },
        { label: 'Details', icon: <Users/>, content: <Step2_Details data={teamData} setData={setTeamData} leagues={leagues} seasons={seasons}/> },
        { label: 'Staff', icon: <UserPlus/>, content: <Step3_Staff data={teamData} setData={setTeamData} allStaff={allStaff} /> },
        { label: 'Spieler', icon: <UserPlus/>, content: <Step4_Players data={teamData} setData={setTeamData} allPlayers={allPlayers} /> },
        { label: 'Training', icon: <Clock/>, content: <Step5_Trainings data={teamData} setData={setTeamData} /> },
        { label: 'Material', icon: <Package />, content: <Step6_Equipment data={teamData} setData={setTeamData} /> },
        { label: 'Abschluss', icon: <Check/>, content: <Step7_Summary data={teamData} setStep={setStep} /> }
    ];

    const resetWizard = () => {
        setStep(0);
        setTeamData(initialData);
    }

    const handleNext = () => {
        if (step === 0 && !teamData.category) {
            toast({ title: "Bitte eine Kategorie wählen.", variant: 'destructive' });
            return;
        }
        if (step === 1 && (!teamData.name || !teamData.liga || !teamData.season)) {
            toast({ title: "Bitte Name, Liga und Saison angeben.", variant: 'destructive' });
            return;
        }
        if (step < steps.length - 1) {
            setStep(s => s + 1);
        }
    }
    
    const getDayNumber = (dayName: string): Day => {
        const dayMap: { [key: string]: Day } = {
            'sonntag': 0, 'montag': 1, 'dienstag': 2, 'mittwoch': 3,
            'donnerstag': 4, 'freitag': 5, 'samstag': 6,
        };
        return dayMap[dayName.toLowerCase()] ?? 0;
    }
    
     const handleSave = async () => {
        if (!club) {
             toast({ title: "Fehler", description: "Kein Verein ausgewählt.", variant: "destructive" });
             return;
        }
        setIsSubmitting(true);
        try {
            const playersForDb = teamData.players.map(p => {
                const fullMember = allPlayers.find(ap => ap.id === p.id);
                if (!fullMember) return null;
                return {
                    id: fullMember.id!,
                    firstName: fullMember.firstName,
                    lastName: fullMember.lastName,
                    position: fullMember.position,
                    trikot: fullMember.trikot,
                    fee: fullMember.fee,
                };
            }).filter((p): p is NonNullable<typeof p> => p !== null);

            const staffForDb = teamData.staff.map(s => {
                const fullMember = allStaff.find(as => as.id === s.id);
                if (!fullMember) return null;
                 return {
                    id: fullMember.id!,
                    firstName: fullMember.firstName,
                    lastName: fullMember.lastName,
                    role: s.role,
                };
            }).filter((s): s is NonNullable<typeof s> => s !== null);

            const createdTeam = await createTeam({
                ...teamData,
                players: playersForDb,
                staff: staffForDb,
                members: teamData.players.length,
                trainer: teamData.staff.map(s => `${s.firstName} ${s.lastName}`).join(', '),
                clubId: club.id!,
            });
            
            const allAssignedMembers = [...teamData.players, ...teamData.staff]
                .map(p => allPlayers.find(m => m.id === p.id) || allStaff.find(m => m.id === p.id))
                .filter(Boolean);

            for (const member of allAssignedMembers) {
                if (member?.email) {
                    await sendMail({
                        to: member.email,
                        subject: `Du wurdest zur Mannschaft "${createdTeam.name}" hinzugefügt`,
                        html: `Hallo ${member.firstName},<br><br>du wurdest soeben zur neuen Mannschaft <strong>${createdTeam.name}</strong> im Verein ${club.name} hinzugefügt.<br><br>Sportliche Grüsse,<br>Dein Amigoal Team`
                    });
                }
            }


            for (const training of teamData.trainings) {
                const dayOfWeek = getDayNumber(training.day);
                let nextTrainingDate = nextDay(new Date(), dayOfWeek);
                
                const [startHour, startMinute] = training.from.split(':').map(Number);
                const [endHour, endMinute] = training.to.split(':').map(Number);

                let fromDate = setSeconds(setMinutes(setHours(nextTrainingDate, startHour), startMinute), 0);
                let toDate = setSeconds(setMinutes(setHours(nextTrainingDate, endHour), endMinute), 0);

                for (let i=0; i<12; i++) {
                    await addEvent({
                        title: `Training: ${createdTeam.name}`,
                        description: `Regelmässiges Training`,
                        from: formatISO(fromDate),
                        to: formatISO(toDate),
                        category: 'Training',
                        attendees: [],
                    });
                    fromDate = addDays(fromDate, 7);
                    toDate = addDays(toDate, 7);
                }
            }


            toast({
                title: "Mannschaft erstellt!",
                description: `${teamData.name} wurde erfolgreich erstellt. Trainings wurden im Kalender eingetragen.`
            });
            onTeamCreated();
            onOpenChange(false);
            resetWizard();
        } catch (error) {
             toast({
                title: "Fehler",
                description: "Mannschaft konnte nicht erstellt werden.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const isLoading = isLoadingClub || isLoadingMembers || isLoadingConfig;
    const currentStepContent = isLoading ? <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin"/></div> : steps[step].content;
    
    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if(!open) resetWizard(); onOpenChange(open); }}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Neue Mannschaft erstellen</DialogTitle>
                </DialogHeader>
                 <div className="flex gap-6 py-4">
                    <div className="w-1/4">
                        <div className="flex flex-col gap-4">
                            {steps.map((s, i) => (
                                <StepIndicator key={i} step={i} currentStep={step} icon={s.icon} label={s.label} />
                            ))}
                        </div>
                    </div>
                    <div className="w-3/4 min-h-[350px]">
                        {currentStepContent}
                    </div>
                </div>
                <DialogFooter className="justify-between">
                     <Button variant="outline" onClick={() => setStep(s => Math.max(0, s-1))} disabled={step === 0}>
                        <ArrowLeft className="mr-2 h-4 w-4"/> Zurück
                    </Button>
                    {step < steps.length - 1 ? (
                        <Button onClick={handleNext}>
                            Weiter <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    ) : (
                        <Button onClick={handleSave} disabled={isSubmitting}>
                           {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                           Mannschaft erstellen
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
