'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Stepper, StepperItem, StepperTrigger, StepperIndicator, StepperTitle, StepperDescription, StepperSeparator } from '@/components/ui/stepper';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { DatePicker } from './ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Check, Calendar, Tag, ArrowRight, Users, Mail, Search, Send, Sparkles, Loader2, ArrowLeft, MapPin, Globe, Building } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSponsors } from '@/hooks/useSponsors';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useMembers } from '@/hooks/useMembers';
import { Combobox } from './ui/combobox';
import { generateEventDescription } from '@/ai/flows/generateEventDescription';
import { sendMail } from '@/services/email';
import { useTeam } from '@/hooks/use-team';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { GoogleMapsSearch as AddressSearchMap } from '@/components/ui/google-maps-search';
import { createGoogleMeet } from '@/ai/flows/createGoogleMeet';

const Step1 = ({ data, setData, context }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();
    
    const superAdminCategories = [
        { value: 'Webinar', label: 'Webinar' },
        { value: 'Networking', label: 'Networking' },
        { value: 'Wartung', label: 'Wartung' },
        { value: 'Workshop', label: 'Workshop' },
    ];
    const clubAdminCategories = [
        { value: 'Sitzung', label: 'Sitzung' },
        { value: 'Spiel', label: 'Spiel' },
        { value: 'Training', label: 'Training' },
        { value: 'Generalversammlung', label: 'Generalversammlung' },
        { value: 'Club-Event', label: 'Club-Event' }
    ];
    
    const categories = context === 'super-admin' ? superAdminCategories : clubAdminCategories;

    const handleGenerateClick = async () => {
        if (!data.title) return;
        setIsGenerating(true);
        try {
            const result = await generateEventDescription({ title: data.title, keywords: data.description });
            setData(p => ({...p, description: result.description}));
        } catch (e) {
            console.error("Error in generateEventDescription:", e);
            toast({
                title: "Fehler bei der KI-Assistenz",
                description: (e as Error).message,
                variant: "destructive"
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Event-Titel</Label>
                <Input id="title" value={data.title} onChange={(e) => setData(p => ({...p, title: e.target.value}))} placeholder={context === 'super-admin' ? "z.B. Sponsoren-Apéro 2024" : "z.B. Vorstandssitzung"} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="category">Kategorie</Label>
                {context === 'super-admin' ? (
                     <Combobox
                        items={categories}
                        value={data.category}
                        onChange={(val) => setData(p => ({ ...p, category: val }))}
                        placeholder="Kategorie wählen oder erstellen..."
                        allowCustom
                     />
                ) : (
                    <Select value={data.category} onValueChange={(val) => setData(p => ({...p, category: val}))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {categories.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="description">Beschreibung</Label>
                     <Button variant="outline" size="sm" onClick={handleGenerateClick} disabled={isGenerating || !data.title}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                        KI-Assistent
                    </Button>
                </div>
                <Textarea id="description" value={data.description} onChange={(e) => setData(p => ({...p, description: e.target.value}))} placeholder="Geben Sie eine kurze Beschreibung oder Stichworte ein..."/>
            </div>
        </div>
    );
};

const Step2 = ({ data, setData }) => {
    const [isGeneratingMeet, setIsGeneratingMeet] = useState(false);
    const { toast } = useToast();

    const handleGenerateMeetLink = async () => {
        setIsGeneratingMeet(true);
        try {
            const result = await createGoogleMeet({
                title: data.title || 'Neues Event',
                description: data.description || '',
                startDateTime: new Date().toISOString(), // This will be updated later
                endDateTime: new Date(new Date().getTime() + 60*60*1000).toISOString(), // 1 hour later
            });
            if(result.link) {
                setData(p => ({...p, location: result.link}));
                toast({ title: 'Google Meet-Link erstellt!'});
            } else {
                throw new Error("Kein Link zurückgegeben.");
            }
        } catch (error) {
            console.error("Failed to create Google Meet link", error);
            toast({ title: 'Fehler', description: 'Google Meet-Link konnte nicht erstellt werden. Bitte überprüfen Sie Ihre API-Konfiguration.', variant: 'destructive'});
        } finally {
            setIsGeneratingMeet(false);
        }
    };
    
    return (
    <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Datum</Label>
                <DatePicker date={data.date} onDateChange={(d) => setData(p => ({...p, date: d}))} />
            </div>
             <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                    <Label htmlFor="from">Von</Label>
                    <Input id="from" type="time" value={data.from} onChange={(e) => setData(p => ({...p, from: e.target.value}))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="to">Bis</Label>
                    <Input id="to" type="time" value={data.to} onChange={(e) => setData(p => ({...p, to: e.target.value}))} />
                </div>
            </div>
        </div>
        <div className="space-y-2">
            <Label>Ort</Label>
             <RadioGroup value={data.locationType} onValueChange={(val) => setData(p => ({...p, locationType: val, location: ''}))} className="flex gap-4 mb-2">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="physical" id="physical"/>
                    <Label htmlFor="physical">Physisch</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <RadioGroupItem value="online" id="online"/>
                    <Label htmlFor="online">Online</Label>
                </div>
            </RadioGroup>

            {data.locationType === 'physical' ? (
                <AddressSearchMap onLocationSelect={(loc) => setData(p => ({...p, location: loc.label}))} />
            ) : (
                <div className="flex items-center gap-2">
                    <Input id="location" value={data.location} onChange={(e) => setData(p => ({...p, location: e.target.value}))} placeholder="z.B. Zoom-Link, etc." />
                    <Button type="button" variant="outline" onClick={handleGenerateMeetLink} disabled={isGeneratingMeet}>
                        {isGeneratingMeet ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Globe className="mr-2 h-4 w-4"/>}
                        Meet-Link
                    </Button>
                </div>
            )}
        </div>
    </div>
)};

const Step3 = ({ data, setData, attendeesSource }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [manualEmails, setManualEmails] = useState('');

    const filteredAttendees = useMemo(() => {
        return attendeesSource.filter(s => 
            (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
            (s.company || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [attendeesSource, searchTerm]);

    const handleSelect = (attendeeId: string, checked: boolean) => {
        setData(prev => {
            const newAttendees = checked
                ? [...prev.attendees, attendeeId]
                : prev.attendees.filter(id => id !== attendeeId);
            return { ...prev, attendees: newAttendees };
        });
    }

    const handleManualEmailsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setManualEmails(e.target.value);
        const emails = e.target.value.split(/[,;\s]+/).filter(email => email.includes('@'));
        setData(prev => ({ ...prev, manualEmails: emails }));
    };
    
     const getAvatarText = (name: string) => {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`;
        }
        return name.slice(0, 2);
    }

    return (
        <div className="space-y-4">
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Teilnehmer suchen..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <ScrollArea className="h-64 w-full rounded-md border">
                <div className="p-4 space-y-2">
                    {filteredAttendees.map(attendee => (
                         <div key={attendee.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md">
                            <Checkbox 
                                id={`attendee-${attendee.id}`}
                                checked={data.attendees.includes(attendee.id)}
                                onCheckedChange={(checked) => handleSelect(attendee.id, !!checked)}
                           />
                            <Label htmlFor={`attendee-${attendee.id}`} className="flex items-center gap-3 cursor-pointer w-full">
                                 <Avatar className="h-8 w-8">
                                    <AvatarImage src={attendee.logo || attendee.avatar} />
                                    <AvatarFallback>{getAvatarText(attendee.name || attendee.company)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p>{attendee.name || attendee.company}</p>
                                    <p className="text-xs text-muted-foreground">{attendee.email}</p>
                                </div>
                            </Label>
                        </div>
                    ))}
                </div>
            </ScrollArea>
             <div className="space-y-2">
                <Label htmlFor="manual-emails">Externe E-Mails hinzufügen</Label>
                <Textarea
                    id="manual-emails"
                    placeholder="email1@example.com, email2@example.com"
                    value={manualEmails}
                    onChange={handleManualEmailsChange}
                    rows={3}
                />
                 <p className="text-xs text-muted-foreground">Trennen Sie mehrere Adressen mit Komma, Semikolon oder Leerschlag.</p>
            </div>
        </div>
    )
}

const Step4 = ({ data, attendeesSource }) => {
    const attendeesFromDb = attendeesSource.filter(a => data.attendees.includes(a.id));
    const manualAttendees = data.manualEmails?.map(email => ({ id: email, name: email, email: email })) || [];
    const allAttendees = [...attendeesFromDb, ...manualAttendees];

    return (
        <div className="space-y-2 text-sm">
            <p><strong>Titel:</strong> {data.title}</p>
            <p><strong>Kategorie:</strong> {data.category}</p>
            <p><strong>Beschreibung:</strong> {data.description}</p>
            <p><strong>Datum:</strong> {data.date.toLocaleDateString('de-CH')}</p>
            <p><strong>Zeit:</strong> {data.from} - {data.to}</p>
            <p><strong>Ort:</strong> {data.location || 'Noch nicht festgelegt'}</p>
            <p><strong>Eingeladene Teilnehmer:</strong> {allAttendees.length}</p>
            <ul className="list-disc list-inside pl-4 text-muted-foreground">
                {allAttendees.slice(0, 5).map(a => <li key={a.id}>{a.name}</li>)}
                {allAttendees.length > 5 && <li>... und {allAttendees.length - 5} weitere</li>}
            </ul>
        </div>
    )
};


export const CreateEventWizard = ({ isOpen, onOpenChange, onCreateEvent, preselectedDate, context = 'club-admin' }) => {
    const [step, setStep] = useState(0);
    const { toast } = useToast();
    const { sponsors } = useSponsors();
    const { members } = useMembers();
    const { clubName } = useTeam();

    const attendeesSource = context === 'super-admin' ? sponsors.map(s => ({...s, name: s.company})) : members;
    const initialCategory = context === 'super-admin' ? 'Networking' : 'Sitzung';

    const [data, setData] = useState({
        title: '',
        category: initialCategory,
        description: '',
        date: preselectedDate || new Date(),
        from: '19:00',
        to: '20:30',
        location: '',
        locationType: 'physical',
        attendees: [],
        manualEmails: [],
    });

    useEffect(() => {
        if(preselectedDate) {
            setData(p => ({...p, date: preselectedDate}));
        }
    }, [preselectedDate]);
    
    const steps = [
        { label: 'Details', icon: <Tag/>, content: <Step1 data={data} setData={setData} context={context} /> },
        { label: 'Datum & Ort', icon: <Calendar/>, content: <Step2 data={data} setData={setData}/> },
        { label: 'Teilnehmer', icon: <Users/>, content: <Step3 data={data} setData={setData} attendeesSource={attendeesSource}/> },
        { label: 'Bestätigung', icon: <Check/>, content: <Step4 data={data} attendeesSource={attendeesSource} /> }
    ];

    const resetWizard = () => {
        setStep(0);
        setData({
            title: '', category: initialCategory, description: '',
            date: new Date(), from: '19:00', to: '20:30', location: '', locationType: 'physical', attendees: [], manualEmails: [],
        });
    };

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(s => s + 1);
        }
    }
    
    const handleSend = async (type: 'save_the_date' | 'invitation') => {
        
        const attendeesFromDb = data.attendees.map(attendeeId => {
            const source = attendeesSource.find(s => s.id === attendeeId);
            return {
                name: source?.name || source?.company || 'Unbekannt',
                email: source?.email || '',
                status: 'Ausstehend' as const
            }
        });
        
        const manualAttendees = (data.manualEmails || []).map(email => ({
            name: email,
            email: email,
            status: 'Ausstehend' as const
        }));

        const allAttendees = [...attendeesFromDb, ...manualAttendees];

        const newEvent = {
            title: data.title,
            description: data.description,
            from: data.date.toISOString().split('T')[0] + 'T' + data.from + ':00',
            to: data.date.toISOString().split('T')[0] + 'T' + data.to + ':00',
            location: data.location,
            locationType: data.locationType,
            category: data.category,
            attendees: allAttendees,
            clubId: context === 'super-admin' ? 'public' : clubName,
            target: { level: context === 'super-admin' ? 'public' : 'club' } as { level: 'public' | 'club' },
        };

        onCreateEvent(newEvent);
        
        const messageType = type === 'save_the_date' ? 'Save the Date' : 'Einladung';

        try {
            const emailPromises = allAttendees.map(recipient => 
                sendMail({
                    to: recipient.email,
                    subject: `${messageType}: ${newEvent.title}`,
                    html: `Hallo ${recipient.name},<br><br>Du bist zu folgendem Event eingeladen:<br><b>${newEvent.title}</b> am ${new Date(newEvent.from).toLocaleDateString('de-CH')} um ${new Date(newEvent.from).toLocaleTimeString('de-CH', {hour: '2-digit', minute: '2-digit'})} Uhr.<br><br>${newEvent.description}<br><br>Sportliche Grüsse,<br>Dein Amigoal Team`
                })
            );
            await Promise.all(emailPromises);

            toast({ title: "Event erstellt & versendet!", description: `"${data.title}" wurde zum Kalender hinzugefügt und eine "${messageType}" an ${allAttendees.length} Teilnehmer gesendet.`});

        } catch(error) {
             toast({ title: "Fehler beim E-Mail Versand", description: "Das Event wurde erstellt, aber die Einladungen konnten nicht gesendet werden.", variant: "destructive" });
        }
        
        onOpenChange(false);
        resetWizard();
    }

    const renderFooter = () => {
        if (step === steps.length - 1) {
            return (
                <div className="flex w-full justify-between">
                    <Button variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
                        <ArrowLeft className="mr-2 h-4 w-4"/> Zurück
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => handleSend('save_the_date')}>
                           <Mail className="mr-2 h-4 w-4"/> Save the Date senden
                        </Button>
                         <Button onClick={() => handleSend('invitation')}>
                            <Send className="mr-2 h-4 w-4"/> Formelle Einladung senden
                        </Button>
                    </div>
                </div>
            )
        }
        
        return (
             <div className="flex w-full justify-between">
                <Button variant="outline" onClick={() => setStep(s => Math.max(0, s-1))} disabled={step === 0}>
                    <ArrowLeft className="mr-2 h-4 w-4"/> Zurück
                </Button>
                <Button onClick={handleNext}>
                    Weiter 
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if(!open) resetWizard(); onOpenChange(open);}}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Neues Event erstellen</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Stepper value={step} className="mb-8">
                        {steps.map((s, i) => (
                            <React.Fragment key={i}>
                                <StepperItem step={i}>
                                    <StepperTrigger onClick={() => setStep(i)}>
                                        <StepperIndicator>{s.icon}</StepperIndicator>
                                        <StepperTitle>{s.label}</StepperTitle>
                                    </StepperTrigger>
                                </StepperItem>
                                {i < steps.length - 1 && <StepperSeparator/>}
                            </React.Fragment>
                        ))}
                    </Stepper>
                    <div className="min-h-[400px]">
                        {steps[step].content}
                    </div>
                </div>
                 <DialogFooter>
                    {renderFooter()}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
