
'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Stepper, StepperItem, StepperTrigger, StepperIndicator, StepperTitle } from '@/components/ui/stepper';
import { Check, ArrowRight, ArrowLeft, Users, Shield, UserPlus, Wallet, Save, Loader2, User, Home, Mail, Phone, Calendar, Upload } from 'lucide-react';
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

const availableRoles = ["Spieler", "Trainer", "Vorstand", "Passivmitglied", "Gönner", "Schiedsrichter", "Sponsor", "Fan", "Marketing", "Finanzen", "Administration", "Elternteil"];

const leadSources = [
    { value: 'empfehlung', label: 'Empfehlung' },
    { value: 'webseite', label: 'Webseite' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'event', label: 'Veranstaltung' },
    { value: 'andere', label: 'Andere' },
];

const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
    }
    return age;
};

const StepIndicator = ({ step, currentStep, icon, label }) => (
    <div className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${currentStep === step ? 'text-primary' : currentStep > step ? 'text-green-500' : 'text-muted-foreground'}`}>
        {icon}
        <span className="font-medium">{label}</span>
    </div>
);

const Step1_Personalien = ({ data, setData }) => {
    const isParent = data.roles.includes('Elternteil');
    const age = calculateAge(data.geb);
    const isMinor = age > 0 && age < 18;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setData(p => ({ ...p, avatar: event.target?.result as string }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    return (
        <ScrollArea className="h-[55vh] pr-4">
            <div className="space-y-4">
                <h3 className="font-bold text-lg">Persönliche Angaben</h3>
                 <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full border bg-muted flex items-center justify-center cursor-pointer" onClick={handleAvatarClick}>
                        {data.avatar ? <Image src={data.avatar} alt="Avatar" width={96} height={96} className="w-full h-full object-cover rounded-full"/> : <User className="w-12 h-12 text-muted-foreground"/>}
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
                    </div>
                    <div className="flex-1 grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                             <Label htmlFor="salutation">Anrede</Label>
                             <Select value={data.salutation} onValueChange={(val) => setData(p => ({...p, salutation: val}))}>
                                <SelectTrigger id="salutation"><SelectValue placeholder="Anrede wählen..."/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Herr">Herr</SelectItem>
                                    <SelectItem value="Frau">Frau</SelectItem>
                                    <SelectItem value="Unbekannt">Keine Angabe</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="firstName">Vorname</Label>
                                <Input id="firstName" value={data.firstName} onChange={e => setData(p => ({ ...p, firstName: e.target.value }))} placeholder="Max"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Nachname</Label>
                                <Input id="lastName" value={data.lastName} onChange={e => setData(p => ({ ...p, lastName: e.target.value }))} placeholder="Mustermann"/>
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">E-Mail</Label>
                        <Input id="email" type="email" value={data.email} onChange={e => setData(p => ({ ...p, email: e.target.value }))} placeholder="max@beispiel.com"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="alternativeEmail">Alternative E-Mail</Label>
                        <Input id="alternativeEmail" type="email" value={data.alternativeEmail || ''} onChange={e => setData(p => ({ ...p, alternativeEmail: e.target.value }))} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="geb">Geburtsdatum</Label>
                        <Input id="geb" type="date" value={data.geb} onChange={e => setData(p => ({ ...p, geb: e.target.value }))}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="nationality">Nationalität</Label>
                        <Combobox
                            items={countries}
                            value={data.nationality}
                            onChange={(val) => setData(p => ({ ...p, nationality: val }))}
                            placeholder="Land auswählen..."
                        />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label>Adresse</Label>
                    <div className="grid grid-cols-5 gap-2">
                        <Input id="street" placeholder="Strasse & Nr." className="col-span-3" value={data.address.street} onChange={e => setData(p => ({...p, address: {...p.address, street: e.target.value}}))}/>
                        <Input id="zip" type="number" placeholder="PLZ" className="col-span-1" value={data.address.zip} onChange={e => setData(p => ({...p, address: {...p.address, zip: e.target.value}}))}/>
                        <Input id="city" placeholder="Ort" className="col-span-1" value={data.address.city} onChange={e => setData(p => ({...p, address: {...p.address, city: e.target.value}}))}/>
                    </div>
                 </div>
                 <div className="space-y-2">
                     <Label>Telefonnummern</Label>
                     <div className="grid grid-cols-3 gap-2">
                         <Input id="phonePrivate" placeholder="Privat" value={data.phonePrivate} onChange={e => setData(p => ({...p, phonePrivate: e.target.value}))}/>
                         <Input id="phoneMobile" placeholder="Mobil" value={data.phoneMobile} onChange={e => setData(p => ({...p, phoneMobile: e.target.value}))}/>
                         <Input id="phoneBusiness" placeholder="Geschäft" value={data.phoneBusiness} onChange={e => setData(p => ({...p, phoneBusiness: e.target.value}))}/>
                     </div>
                 </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="ahvNumber">AHV-Nummer</Label>
                        <Input id="ahvNumber" value={data.ahvNumber || ''} onChange={e => setData(p => ({...p, ahvNumber: e.target.value}))} placeholder="756.xxxx.xxxx.xx" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="passportNumber">Pass-Nummer</Label>
                        <Input id="passportNumber" value={data.passportNumber || ''} onChange={e => setData(p => ({...p, passportNumber: e.target.value}))} />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                         <Label htmlFor="leadSource">Lead-Herkunft</Label>
                         <Combobox 
                            items={leadSources}
                            value={data.leadSource}
                            onChange={(val) => setData(p => ({...p, leadSource: val}))}
                            placeholder="Quelle auswählen..."
                            allowCustom
                         />
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="jsNumber">J+S-Nummer</Label>
                        <Input id="jsNumber" value={data.jsNumber || ''} onChange={e => setData(p => ({...p, jsNumber: e.target.value}))} />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="status">Mitgliederstatus</Label>
                         <Select value={data.status} onValueChange={(val) => setData(p => ({...p, status: val}))}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Aktiv">Aktiv</SelectItem>
                                <SelectItem value="Passiv">Passiv</SelectItem>
                                <SelectItem value="Ehemalig">Ehemalig</SelectItem>
                                 <SelectItem value="Ausgetreten">Ausgetreten</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor="maritalStatus">Zivilstand</Label>
                         <Select value={data.maritalStatus} onValueChange={(val) => setData(p => ({...p, maritalStatus: val}))}>
                            <SelectTrigger><SelectValue placeholder="Zivilstand wählen..."/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Ledig">Ledig</SelectItem>
                                <SelectItem value="Verheiratet">Verheiratet</SelectItem>
                                <SelectItem value="Geschieden">Geschieden</SelectItem>
                                <SelectItem value="Verwitwet">Verwitwet</SelectItem>
                                <SelectItem value="Unbekannt">Unbekannt</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                 </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="entryDate">Eintrittsdatum</Label>
                        <Input id="entryDate" type="date" value={data.entryDate} onChange={e => setData(p => ({...p, entryDate: e.target.value}))}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="exitDate">Austrittsdatum (optional)</Label>
                        <Input id="exitDate" type="date" value={data.exitDate || ''} onChange={e => setData(p => ({...p, exitDate: e.target.value}))}/>
                    </div>
                 </div>
                 {(isParent || isMinor) && (
                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-semibold">
                            {isParent ? 'Angaben zum Kind' : 'Angaben eines Elternteils (da Mitglied minderjährig)'}
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="parentName">Name</Label>
                                <Input id="parentName" value={data.parent?.name || ''} onChange={e => setData(p => ({ ...p, parent: {...p.parent, name: e.target.value} }))} placeholder="Erika Musterfrau"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="parentEmail">E-Mail</Label>
                                <Input id="parentEmail" type="email" value={data.parent?.email || ''} onChange={e => setData(p => ({ ...p, parent: {...p.parent, email: e.target.value} }))} placeholder="erika@musterfrau.ch"/>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
    )
}
const Step2_Roles = ({ data, setData }) => {
    const handleRoleToggle = (role: string) => {
        setData(prev => {
            const newRoles = prev.roles.includes(role) 
                ? prev.roles.filter(r => r !== role)
                : [...prev.roles, role];
            return { ...prev, roles: newRoles };
        })
    };

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-lg">Rollen im Verein</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2 p-3 border rounded-md">
                {availableRoles.map(role => (
                    <div key={role} className="flex items-center space-x-2">
                        <Checkbox 
                            id={`role-${role}`}
                            checked={data.roles.includes(role)} 
                            onCheckedChange={() => handleRoleToggle(role)}
                        />
                        <label htmlFor={`role-${role}`} className="text-sm font-medium leading-none">{role}</label>
                    </div>
                ))}
            </div>
        </div>
    )
}
const Step3_Team = ({ data, setData }) => {
    const { categorizedTeams, isLoading } = useTeams();
    const allTeams = useMemo(() => Object.values(categorizedTeams).flat(), [categorizedTeams]);

    const handleTeamToggle = (teamName: string) => {
        setData(prev => {
            const newTeams = prev.teams.includes(teamName) 
                ? prev.teams.filter(t => t !== teamName)
                : [...prev.teams, teamName];
            return { ...prev, teams: newTeams };
        });
    };

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-lg">Mannschaftszuweisung</h3>
            {isLoading ? <p>Lade Teams...</p> : (
                <ScrollArea className="h-[45vh] border rounded-md p-4">
                    {Object.entries(categorizedTeams).map(([category, teams]) => (
                        <div key={category}>
                            <h4 className="font-semibold mb-2">{category}</h4>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {(teams as any[]).map(team => (
                                    <div key={team.name} className="flex items-center space-x-2">
                                        <Checkbox 
                                            id={`team-${team.name}`}
                                            checked={data.teams.includes(team.name)}
                                            onCheckedChange={() => handleTeamToggle(team.name)}
                                        />
                                        <label htmlFor={`team-${team.name}`}>{team.name}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </ScrollArea>
            )}
        </div>
    )
};
const Step4_Finances = ({ data, setData }) => {
    // In a real app, these seasons would come from the club's financial settings
    const availableSeasons = ['24/25', '23/24', '22/23'];

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-lg">Finanzen & Mitgliedsbeitrag</h3>
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="amount">Beitrag (CHF)</Label>
                    <Input id="amount" type="number" value={data.fee.amount} onChange={e => setData(p => ({...p, fee: {...p.fee, amount: parseFloat(e.target.value)}}))}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="season">Saison</Label>
                     <Select value={data.fee.season} onValueChange={(val) => setData(p => ({...p, fee: {...p.fee, season: val}}))}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            {availableSeasons.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>Zahlungsstatus</Label>
                    <Select value={data.fee.paid ? 'Bezahlt' : 'Offen'} onValueChange={(val) => setData(p => ({...p, fee: {...p.fee, paid: val === 'Bezahlt'}}))}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Bezahlt">Bezahlt</SelectItem>
                            <SelectItem value="Offen">Offen</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
const Step5_Summary = ({ data, clubSubdomain }) => {
    
    const loginUser = useMemo(() => {
        if (data.firstName && data.lastName && clubSubdomain) {
            const firstName = data.firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
            const lastName = data.lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
            return `${firstName}.${lastName}@${clubSubdomain}`;
        }
        return 'Wird generiert...';
    }, [data.firstName, data.lastName, clubSubdomain]);

    return (
        <ScrollArea className="h-[55vh] pr-4">
            <div className="space-y-2 text-sm">
                <h3 className="font-bold text-lg mb-4">Zusammenfassung</h3>
                <p><strong>Login-Benutzername:</strong> <span className="font-mono bg-muted p-1 rounded-sm">{loginUser}</span></p>
                <Separator className="my-3"/>
                <p><strong>Anrede:</strong> {data.salutation}</p>
                <p><strong>Name:</strong> {data.firstName} {data.lastName}</p>
                <p><strong>E-Mail:</strong> {data.email}</p>
                <p><strong>Alternative E-Mail:</strong> {data.alternativeEmail || '-'}</p>
                <p><strong>Geburtstag:</strong> {data.geb}</p>
                <p><strong>Nationalität:</strong> {data.nationality}</p>
                <p><strong>AHV-Nummer:</strong> {data.ahvNumber || '-'}</p>
                <p><strong>Pass-Nummer:</strong> {data.passportNumber || '-'}</p>
                <p><strong>J+S-Nummer:</strong> {data.jsNumber || '-'}</p>
                <Separator className="my-3"/>
                <p><strong>Rollen:</strong> {data.roles.join(', ')}</p>
                <p><strong>Mannschaften:</strong> {data.teams.join(', ')}</p>
                <p><strong>Mitgliedsbeitrag:</strong> CHF {data.fee.amount} für Saison {data.fee.season} ({data.fee.paid ? 'Bezahlt' : 'Offen'})</p>
                {(data.roles.includes('Elternteil') || (calculateAge(data.geb) > 0 && calculateAge(data.geb) < 18)) && data.parent?.name && (
                    <>
                        <Separator className="my-3"/>
                        <p><strong>Elternteil:</strong> {data.parent.name} ({data.parent.email})</p>
                    </>
                )}
            </div>
        </ScrollArea>
    )
}

export const CreateMemberWizard = ({ isOpen, onOpenChange, onMemberCreated }) => {
    const { toast } = useToast();
    const { club, isLoading: isLoadingClub } = useClub();
    const { members, isLoading: isLoadingMembers } = useMembers(club?.name);
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const initialData: Partial<Member> & { parent?: {name: string, email: string}} = {
        salutation: 'Unbekannt',
        firstName: '', lastName: '', email: '', geb: '', address: { street: '', zip: '', city: '' },
        roles: ['Spieler'], teams: [],
        team: '',
        fee: { season: '24/25', amount: 300, date: new Date().toISOString().split('T')[0], paid: false },
        parent: { name: '', email: '' },
        avatar: '',
        nationality: 'Schweiz',
        maritalStatus: 'Unbekannt',
        leadSource: '',
        phonePrivate: '', phoneMobile: '', phoneBusiness: '',
        status: 'Aktiv',
        memberNr: '', // Will be generated
        memberSince: new Date().toISOString().split('T')[0],
        entryDate: new Date().toISOString().split('T')[0],
        exitDate: null,
        alternativeEmail: '', jsNumber: '', ahvNumber: '', passportNumber: '',
    };
    const [data, setData] = useState(initialData);
    
    const isPlayerOrCoach = data.roles.includes('Spieler') || data.roles.includes('Trainer');

    const steps = [
        { label: 'Personalien', icon: <User/>, content: <Step1_Personalien data={data} setData={setData} /> },
        { label: 'Rollen', icon: <Shield/>, content: <Step2_Roles data={data} setData={setData} /> },
        ...(isPlayerOrCoach ? [{ label: 'Team', icon: <Users/>, content: <Step3_Team data={data} setData={setData} /> }] : []),
        { label: 'Finanzen', icon: <Wallet/>, content: <Step4_Finances data={data} setData={setData} /> },
        { label: 'Abschluss', icon: <Check/>, content: <Step5_Summary data={data} clubSubdomain={club?.subdomain}/> }
    ];

    const resetWizard = () => {
        setStep(0);
        setData(initialData);
    }

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(s => s + 1);
        }
    }
    
     const handleSave = async () => {
        setIsSubmitting(true);
        try {
            const loginUser = `${data.firstName?.toLowerCase().replace(/[^a-z0-9]/g, '')}.${data.lastName?.toLowerCase().replace(/[^a-z0-9]/g, '')}@${club?.subdomain}`;

            const memberData: Omit<Member, 'id'> = {
                salutation: data.salutation,
                firstName: data.firstName!,
                lastName: data.lastName!,
                email: data.email,
                geb: data.geb,
                address: data.address,
                roles: data.roles!,
                teams: data.teams,
                team: data.teams?.[0] || null,
                fee: {
                    ...data.fee!,
                    date: typeof data.fee!.date === 'string' ? data.fee!.date : (data.fee!.date as Date).toISOString().split('T')[0],
                },
                status: data.status!,
                memberNr: String(Math.floor(1000 + Math.random() * 9000)),
                memberSince: typeof data.entryDate! === 'string' ? data.entryDate! : (data.entryDate as Date).toISOString().split('T')[0],
                entryDate: typeof data.entryDate! === 'string' ? data.entryDate! : (data.entryDate as Date).toISOString().split('T')[0],
                exitDate: data.exitDate || null,
                clubId: club!.id,
                clubName: club!.name,
                clubLoginUser: loginUser,
                avatar: data.avatar || null,
                nationality: data.nationality,
                maritalStatus: data.maritalStatus,
                leadSource: data.leadSource,
                phonePrivate: data.phonePrivate,
                phoneMobile: data.phoneMobile,
                phoneBusiness: data.phoneBusiness,
                alternativeEmail: data.alternativeEmail || null,
                jsNumber: data.jsNumber || null,
                ahvNumber: data.ahvNumber || null,
                passportNumber: data.passportNumber || null,
                position: data.position,
                suspension: data.suspension,
                trikot: data.trikot,
                newsletterGroups: data.newsletterGroups
            };
            
            await addMember(memberData);
            toast({
                title: "Mitglied erstellt!",
                description: `Ein Willkommens-E-Mail wurde an ${data.email} gesendet.`
            });
            onMemberCreated();
            onOpenChange(false);
            resetWizard();
        } catch (error) {
            console.error("Failed to create member:", error);
            toast({ title: "Fehler", description: "Mitglied konnte nicht erstellt werden.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }

    const currentStepContent = (isLoadingClub || isLoadingMembers) ? <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin"/></div> : steps[step].content;
    
    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if(!open) resetWizard(); onOpenChange(open); }}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Neues Mitglied erstellen</DialogTitle>
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
                           Mitglied erstellen & einladen
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
