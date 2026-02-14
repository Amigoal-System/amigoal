
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTeam } from '@/hooks/use-team';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Calendar, MapPin, Users, DollarSign, Send, FileText, List, LayoutGrid, Phone, Mail as MailIcon, Globe, X, Building, LogIn, LogOut, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useCamps, useFacilities } from '@/hooks/useCamps';


const TrainingCampModal = ({ isOpen, onOpenChange, camp, onSave }) => {
    const [formData, setFormData] = useState(null);

    React.useEffect(() => {
        if (camp) {
             setFormData({
                ...camp,
                date: camp.date ? { from: new Date(camp.date.from), to: new Date(camp.date.to) } : undefined
            });
        } else {
             setFormData({
                type: 'camp',
                name: '',
                location: '',
                date: { from: new Date(), to: new Date(new Date().setDate(new Date().getDate() + 7)) },
                budget: 0,
                status: 'In Planung',
                minParticipants: 20,
                registrations: [],
                source: 'FC Amigoal' // Assuming Club Admin creates this
            });
        }
    }, [camp]);


    const handleSave = () => {
        onSave({
            ...formData,
            date: formData.date ? { from: formData.date.from.toISOString(), to: formData.date.to.toISOString()} : undefined
        });
        onOpenChange(false);
    };
    
    if (!formData) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{camp ? 'Trainingslager bearbeiten' : 'Neues Trainingslager planen'}</DialogTitle>
                </DialogHeader>
                 <Tabs defaultValue="details">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="registrations">Anmeldungen ({formData.registrations?.length || 0})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="pt-4">
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name des Lagers</Label>
                                <Input id="name" value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Ort</Label>
                                <Input id="location" value={formData.location} onChange={(e) => setFormData(p => ({...p, location: e.target.value}))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Datum</Label>
                                <DatePickerWithRange date={formData.date} onDateChange={(d) => setFormData(p => ({...p, date: d}))} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="budget">Budget (CHF)</Label>
                                    <Input id="budget" type="number" value={formData.budget} onChange={(e) => setFormData(p => ({...p, budget: parseInt(e.target.value) || 0}))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="minParticipants">Mind. Teilnehmer</Label>
                                    <Input id="minParticipants" type="number" value={formData.minParticipants} onChange={(e) => setFormData(p => ({...p, minParticipants: parseInt(e.target.value) || 0}))} />
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="registrations" className="pt-4">
                        <div className="py-4 max-h-60 overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow><TableHead>Name</TableHead><TableHead>Rolle</TableHead></TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formData.registrations?.map(reg => (
                                        <TableRow key={reg.userId}>
                                            <TableCell>{reg.name}</TableCell>
                                            <TableCell>{reg.role}</TableCell>
                                        </TableRow>
                                    ))}
                                     {(!formData.registrations || formData.registrations.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-muted-foreground">Noch keine Anmeldungen.</TableCell>
                                        </TableRow>
                                     )}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={handleSave}>Speichern</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const CoachRequestModal = ({ onOpenChange, isOpen }) => {
    const { toast } = useToast();
    const [requestTarget, setRequestTarget] = useState('club');

    const handleSendRequest = () => {
        const targetText = requestTarget === 'club' ? 'an den Verein' : 'an Amigoal';
        toast({
            title: "Anfrage gesendet",
            description: `Ihre Anfrage für die Organisation des Trainingslagers wurde ${targetText} übermittelt.`
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Trainingslager Organisation anfragen</DialogTitle>
                    <DialogDescription>
                        Lassen Sie die Organisation von Ihrem Verein oder von Amigoal übernehmen.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                     <div>
                        <Label className="mb-2 block">Anfrage richten an:</Label>
                        <Select value={requestTarget} onValueChange={setRequestTarget}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="club">Meinen Verein</SelectItem>
                                <SelectItem value="amigoal">Amigoal (externer Service)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Textarea placeholder="Beschreiben Sie Ihre Wünsche für das Trainingslager (z.B. gewünschte Destination, Anzahl Testspiele, etc.)..." rows={5}/>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={handleSendRequest}>Anfrage senden</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const PlayerTrainingCampPage = () => {
    const { camps, toggleRegistration, isLoading } = useCamps('camp', 'all');
    // Mock current user
    const currentUser = { userId: 'player-101', name: 'Lionel Messi', role: 'Spieler' };

    if (isLoading) return <div>Lade geplante Trainingslager...</div>;

    return (
         <div className="flex flex-col gap-6">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Geplante Trainingslager</h1>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {camps.filter(c => c.status === 'Geplant').map((camp) => {
                    const isRegistered = camp.registrations?.some(reg => reg.userId === currentUser.userId);
                    const progress = (camp.minParticipants ?? 0) > 0 ? ((camp.registrations?.length ?? 0) / (camp.minParticipants ?? 0)) * 100 : 0;
                    return (
                        <Card key={camp.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{camp.name}</CardTitle>
                                <CardDescription>{camp.status}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{camp.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>{format(new Date(camp.date.from), 'dd.MM.yyyy')} - {format(new Date(camp.date.to), 'dd.MM.yyyy')}</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><Users className="h-3 w-3"/>Anmeldungen</span>
                                        <span>{camp.registrations?.length || 0} / {camp.minParticipants}</span>
                                    </div>
                                    <Progress value={progress} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant={isRegistered ? "destructive" : "default"} onClick={() => toggleRegistration(camp.id, currentUser)}>
                                    {isRegistered ? <><LogOut className="mr-2 h-4 w-4"/> Abmelden</> : <><LogIn className="mr-2 h-4 w-4"/> Anmelden</>}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

const ClubAdminTrainingCampPage = () => {
    const { camps, addCamp, updateCamp, isLoading } = useCamps('camp', 'club');
    const { facilities } = useFacilities();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCamp, setSelectedCamp] = useState(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [requestData, setRequestData] = useState({
        destination: '',
        dates: undefined,
        participants: '',
        budget: '',
        contactPerson: '',
        requirements: '',
        facility: ''
    });
    const { toast } = useToast();

    const handleOpenModal = (camp = null) => {
        setSelectedCamp(camp);
        setIsModalOpen(true);
    };

    const handleSaveCamp = (campData) => {
        if (campData.id) {
            updateCamp(campData);
        } else {
            addCamp(campData);
        }
    };
    
    const handleSendRequest = () => {
        toast({
            title: "Anfrage gesendet",
            description: "Ihre Anfrage für die Organisation des Trainingslagers wurde an Amigoal übermittelt."
        });
        setIsRequestModalOpen(false);
    };

    const handleRequestInputChange = (field, value) => {
        setRequestData(prev => ({ ...prev, [field]: value }));
    };
    
    if (isLoading) return <div>Lade Trainingslager...</div>;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Trainingslager Management</h1>
                <div className="flex gap-2">
                     <Button variant="outline" onClick={() => setIsRequestModalOpen(true)}>
                        <Send className="mr-2 h-4 w-4" />
                        Organisation anfragen
                    </Button>
                    <Button onClick={() => handleOpenModal()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Neues Trainingslager planen
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {camps.map((camp) => {
                    const progress = (camp.minParticipants ?? 0) > 0 ? ((camp.registrations?.length ?? 0) / (camp.minParticipants ?? 0)) * 100 : 0;
                    return (
                        <Card key={camp.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{camp.name}</CardTitle>
                                <CardDescription>{camp.status}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{camp.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>{format(new Date(camp.date.from), 'dd.MM.yyyy')} - {format(new Date(camp.date.to), 'dd.MM.yyyy')}</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><Users className="h-3 w-3"/>Anmeldungen</span>
                                        <span>{camp.registrations?.length || 0} / {camp.minParticipants}</span>
                                    </div>
                                    <Progress value={progress} />
                                </div>
                                 <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span>Budget: CHF {camp.budget?.toLocaleString('de-CH')}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                 <Button variant="outline" className="w-full" onClick={() => handleOpenModal(camp)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Details & Verwaltung
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
             <TrainingCampModal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                camp={selectedCamp}
                onSave={handleSaveCamp}
            />
            <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Anfrage für Trainingslager-Organisation</DialogTitle>
                        <DialogDescription>
                            Füllen Sie die Eckdaten aus. Das Amigoal-Team wird sich mit Vorschlägen bei Ihnen melden.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                         <div className="space-y-2">
                            <Label>Reisezeitraum</Label>
                            <DatePickerWithRange date={requestData.dates} onDateChange={(d) => handleRequestInputChange('dates', d)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Bevorzugte Region (optional)</Label>
                            <Input placeholder="z.B. Spanien, Türkei, Italien" value={requestData.destination} onChange={(e) => handleRequestInputChange('destination', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label>Gewünschte Sportanlage (optional)</Label>
                             <Select onValueChange={(value) => handleRequestInputChange('facility', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Anlage auswählen..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {facilities.map(f => (
                                        <SelectItem key={f.id} value={f.name}>{f.name} ({f.location})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Teilnehmer (ca.)</Label>
                                <Input type="number" placeholder="z.B. 40" value={requestData.participants} onChange={(e) => handleRequestInputChange('participants', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Budget (optional)</Label>
                                <Input type="number" placeholder="z.B. 20000" value={requestData.budget} onChange={(e) => handleRequestInputChange('budget', e.target.value)} />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Ihre Kontaktperson</Label>
                            <Input placeholder="Name" value={requestData.contactPerson} onChange={(e) => handleRequestInputChange('contactPerson', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Anforderungen / Wünsche</Label>
                            <Textarea placeholder="z.B. Naturrasenplatz, All-Inclusive, Flug ab Zürich..." value={requestData.requirements} onChange={(e) => handleRequestInputChange('requirements', e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRequestModalOpen(false)}>Abbrechen</Button>
                        <Button onClick={handleSendRequest}>Anfrage senden</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const EditProviderModal = ({ isOpen, onOpenChange, provider, onSave, allFacilities, allRegions }) => {
    const [formData, setFormData] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [newRegion, setNewRegion] = useState('');
    const [selectedFacility, setSelectedFacility] = useState('');

    React.useEffect(() => {
        if (isOpen) {
            setFormData(provider || { id: null, name: '', contact: '', regions: [], facilities: [], commission: '', website: '', email: '', phone: '' });
        }
    }, [provider, isOpen]);

    if (!isOpen || !formData) return null;

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value}));
    };
    
    const handleRegionAdd = () => {
        if (selectedRegion && !formData.regions.includes(selectedRegion)) {
            setFormData(prev => ({...prev, regions: [...prev.regions, selectedRegion]}));
            setSelectedRegion('');
        }
    };
    
    const handleNewRegionAdd = () => {
        if (newRegion && !allRegions.includes(newRegion) && !formData.regions.includes(newRegion)) {
             setFormData(prev => ({...prev, regions: [...prev.regions, newRegion]}));
             setNewRegion('');
        }
    };
    
    const handleRegionRemove = (regionToRemove: string) => {
        setFormData(prev => ({...prev, regions: prev.regions.filter(r => r !== regionToRemove)}));
    };
    
    const handleFacilityAdd = () => {
        const facilityToAdd = allFacilities.find(f => f.id.toString() === selectedFacility);
        if (facilityToAdd && !formData.facilities.some(f => f.id === facilityToAdd.id)) {
            setFormData(prev => ({...prev, facilities: [...prev.facilities, facilityToAdd]}));
            setSelectedFacility('');
        }
    };
    
     const handleFacilityRemove = (facilityId: string) => {
        setFormData(prev => ({...prev, facilities: prev.facilities.filter(f => f.id !== facilityId)}));
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{formData.id ? 'Anbieter bearbeiten' : 'Neuen Anbieter erstellen'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                     <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contact">Kontaktperson</Label>
                        <Input id="contact" value={formData.contact} onChange={handleChange} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="email">E-Mail</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="phone">Telefon</Label>
                            <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="website">Webseite</Label>
                        <Input id="website" value={formData.website} onChange={handleChange} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Regionen</Label>
                            <div className="p-2 border rounded-md min-h-[40px] flex flex-wrap gap-2">
                                {formData.regions.map(region => (
                                    <Badge key={region} variant="secondary" className="flex items-center gap-1">
                                        {region}
                                        <button onClick={() => handleRegionRemove(region)}><X className="h-3 w-3"/></button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                                    <SelectTrigger><SelectValue placeholder="Region wählen..."/></SelectTrigger>
                                    <SelectContent>
                                        {allRegions.filter(r => !formData.regions.includes(r)).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleRegionAdd} disabled={!selectedRegion}><PlusCircle className="h-4 w-4" /></Button>
                            </div>
                            <div className="flex gap-2">
                                <Input placeholder="Neue Region..." value={newRegion} onChange={(e) => setNewRegion(e.target.value)} />
                                <Button onClick={handleNewRegionAdd} disabled={!newRegion}><PlusCircle className="h-4 w-4" /></Button>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Sportanlagen</Label>
                            <div className="p-2 border rounded-md min-h-[40px] flex flex-wrap gap-2">
                                {formData.facilities.map(f => (
                                     <Badge key={f.id} variant="outline" className="flex items-center gap-1">
                                        {f.name}
                                        <button onClick={() => handleFacilityRemove(f.id)}><X className="h-3 w-3"/></button>
                                    </Badge>
                                ))}
                            </div>
                             <div className="flex gap-2">
                                <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                                    <SelectTrigger><SelectValue placeholder="Anlage wählen..."/></SelectTrigger>
                                    <SelectContent>
                                        {allFacilities.filter(f => !formData.facilities.some(fac => fac.id === f.id)).map(f => <SelectItem key={f.id} value={f.id.toString()}>{f.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleFacilityAdd} disabled={!selectedFacility}><PlusCircle className="h-4 w-4" /></Button>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="commission">Kommission</Label>
                            <Input id="commission" value={formData.commission} onChange={handleChange} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={() => onSave(formData)}>Speichern</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const RequestDetailModal = ({ isOpen, onOpenChange, request, providers, onForward }) => {
    const [selectedProvider, setSelectedProvider] = useState('');

    if (!isOpen || !request) return null;

    const handleForwardClick = () => {
        if (selectedProvider) {
            onForward(request.id, selectedProvider);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Anfrage von: {request.club}</DialogTitle>
                    <DialogDescription>Details der Trainingslager-Anfrage.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Anfrage-Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <div><Label className="text-muted-foreground">Club</Label><p>{request.club}</p></div>
                            <div><Label className="text-muted-foreground">Kontaktperson</Label><p>{request.contactPerson}</p></div>
                            <div><Label className="text-muted-foreground">Reisezeitraum</Label><p>{request.dates}</p></div>
                            <div><Label className="text-muted-foreground">Teilnehmer (ca.)</Label><p>{request.participants}</p></div>
                            <div className="col-span-2"><Label className="text-muted-foreground">Bevorzugte Region</Label><p>{request.destination || '-'}</p></div>
                            <div className="col-span-2"><Label className="text-muted-foreground">Gewünschte Anlage</Label><p>{request.facility || '-'}</p></div>
                            <div className="col-span-2"><Label className="text-muted-foreground">Anforderungen</Label><p className="p-2 bg-muted/50 rounded-md whitespace-pre-wrap">{request.requirements || 'Keine spezifischen Anforderungen.'}</p></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">An Anbieter weiterleiten</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             <Label>Anbieter auswählen</Label>
                             <Select onValueChange={setSelectedProvider} value={selectedProvider}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Passenden Anbieter auswählen..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {providers.length > 0 ? (
                                        providers.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)
                                    ) : (
                                        <SelectItem value="none" disabled>Keine passenden Anbieter gefunden</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {providers.length} von {providers.length} Anbietern vorgeschlagen.
                                {request.facility && ` (gefiltert nach Anlage: ${request.facility})`}
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" disabled={!selectedProvider} onClick={handleForwardClick}>
                                <Send className="mr-2 h-4 w-4"/> Anfrage weiterleiten
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const EditFacilityModal = ({ isOpen, onOpenChange, facility, onSave, onDelete }) => {
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(facility || { id: null, name: '', location: '', features: [] });
    }
  }, [facility, isOpen]);

  if (!isOpen || !formData) return null;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleFeaturesChange = (e) => {
    setFormData(prev => ({...prev, features: e.target.value.split(',').map(f => f.trim())}));
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{formData.id ? 'Sportanlage bearbeiten' : 'Neue Sportanlage erstellen'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name der Anlage</Label>
            <Input id="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Ort (z.B. Stadt, Land)</Label>
            <Input id="location" value={formData.location} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="features">Ausstattung (Komma-getrennt)</Label>
            <Textarea id="features" value={formData.features.join(', ')} onChange={handleFeaturesChange} />
          </div>
        </div>
        <DialogFooter className="justify-between">
            <div>
              {formData.id && (
                  <Button variant="destructive" onClick={() => onDelete(formData.id)}>Löschen</Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
              <Button onClick={() => onSave(formData)}>Speichern</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const SuperAdminTrainingCampPage = () => {
    const [providers, setProviders] = useState([
        { id: 1, name: 'TUI Sports', contact: 'Peter Pan', regions: ['Spanien', 'Türkei'], facilities: [], commission: '10%', website: 'tui-sports.com', email: 'peter.pan@tui.com', phone: '+41 79 123 45 67' },
        { id: 2, name: 'ITS Coop Travel', contact: 'Erika Musterfrau', regions: ['Italien', 'Schweiz'], facilities: [], commission: '8%', website: 'its-coop.ch', email: 'erika.m@its.ch', phone: '+41 44 123 45 67' },
    ]);
    const { facilities, addFacility, updateFacility, deleteFacility, isLoading: isLoadingFacilities } = useFacilities();
    const [requests, setRequests] = useState([
        { id: 1, club: 'FC Amigoal', destination: 'Mallorca', dates: '15.07.24 - 25.07.24', participants: 40, budget: 20000, contactPerson: 'Pep Guardiola', requirements: 'Naturrasenplatz, All-Inclusive', facility: 'LaLiga Training Center', status: 'Neu' },
        { id: 2, club: 'FC Regensdorf', destination: 'Region Antalya', dates: '20.01.25 - 30.01.25', participants: 35, budget: null, contactPerson: 'Max Mustermann', requirements: 'Mind. 2 Testspiele gegen lokale Teams.', facility: '', status: 'In Bearbeitung' },
    ]);
    const [view, setView] = useState('list');
    const [requestView, setRequestView] = useState('list');
    const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
    const [editingFacility, setEditingFacility] = useState(null);
    const [facilityView, setFacilityView] = useState('list');
    const { toast } = useToast();

    const allRegions = useMemo(() => {
        const regionsFromProviders = providers.flatMap(p => p.regions);
        const regionsFromFacilities = facilities.map(f => f.location.split(', ')[1]).filter(Boolean);
        return Array.from(new Set([...regionsFromProviders, ...regionsFromFacilities, 'Spanien', 'Türkei', 'Italien', 'Schweiz', 'Deutschland', 'Portugal']));
    }, [providers, facilities]);
    
    const handleOpenProviderModal = (provider = null) => {
        setEditingProvider(provider);
        setIsProviderModalOpen(true);
    };

    const handleSaveProvider = (providerData) => {
        if (providerData.id) {
            setProviders(prev => prev.map(p => p.id === providerData.id ? providerData : p));
        } else {
            setProviders(prev => [...prev, {...providerData, id: Date.now()}]);
        }
        setIsProviderModalOpen(false);
    };
    
     const handleOpenRequestModal = (request) => {
        setSelectedRequest(request);
        setIsRequestModalOpen(true);
    };

    const handleForwardRequest = (requestId, providerId) => {
        setRequests(prev => prev.map(r => r.id === requestId ? {...r, status: 'In Bearbeitung'} : r));
        setIsRequestModalOpen(false);
        const providerName = providers.find(p => p.id.toString() === providerId)?.name;
        toast({
            title: "Anfrage weitergeleitet",
            description: `Die Anfrage wurde an ${providerName} gesendet.`
        });
    };

    const handleOpenFacilityModal = (facility = null) => {
        setEditingFacility(facility);
        setIsFacilityModalOpen(true);
    };

    const handleSaveFacility = (facilityData) => {
        if (facilityData.id) {
            updateFacility(facilityData);
        } else {
            addFacility(facilityData);
        }
        setIsFacilityModalOpen(false);
    };
    
     const matchingProviders = useMemo(() => {
        if (!selectedRequest?.facility) return providers;
        return providers.filter(p => p.facilities.some(f => f.name === selectedRequest.facility));
    }, [selectedRequest, providers]);
    
    const RequestsGridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map(req => (
                <Card key={req.id} className="cursor-pointer hover:shadow-lg" onClick={() => handleOpenRequestModal(req)}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{req.club}</CardTitle>
                            <Badge variant={req.status === 'Neu' ? 'destructive' : 'default'}>{req.status}</Badge>
                        </div>
                        <CardDescription>{req.destination}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                        <p><span className="font-semibold">Datum:</span> {req.dates}</p>
                        <p><span className="font-semibold">Teilnehmer:</span> {req.participants}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    )


    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                     <div className="flex items-center justify-between">
                        <CardTitle>Anbieter verwalten</CardTitle>
                        <div className="flex items-center gap-2">
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant={view === 'list' ? 'default': 'ghost'} size="icon" onClick={() => setView('list')}>
                                            <List className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Listenansicht</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant={view === 'grid' ? 'default': 'ghost'} size="icon" onClick={() => setView('grid')}>
                                            <LayoutGrid className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Grid-Ansicht</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <Button size="sm" onClick={() => handleOpenProviderModal()}>
                                <PlusCircle className="mr-2 h-4 w-4"/>Neuer Anbieter
                            </Button>
                        </div>
                    </div>
                    <CardDescription>Verwalten Sie hier die Partner für die Organisation von Trainingslagern.</CardDescription>
                </CardHeader>
                <CardContent>
                     {view === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {providers.map(orga => (
                                <Card key={orga.id}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{orga.name}</CardTitle>
                                        <CardDescription>{orga.contact}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-1 text-sm">
                                        <p><span className="font-semibold">Regionen:</span> {Array.isArray(orga.regions) ? orga.regions.join(', ') : orga.regions}</p>
                                        <p><span className="font-semibold">Kommission:</span> {orga.commission}</p>
                                        <p className="flex items-center gap-1"><MailIcon className="h-3 w-3" />{orga.email}</p>
                                        <p className="flex items-center gap-1"><Phone className="h-3 w-3" />{orga.phone}</p>
                                        <a href={`https://${orga.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline"><Globe className="h-3 w-3"/>{orga.website}</a>
                                    </CardContent>
                                    <CardFooter>
                                        <Button variant="outline" size="sm" onClick={() => handleOpenProviderModal(orga)}>Bearbeiten</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Kontakt</TableHead>
                                    <TableHead>E-Mail</TableHead>
                                    <TableHead>Telefon</TableHead>
                                    <TableHead>Regionen</TableHead>
                                    <TableHead>Kommission</TableHead>
                                    <TableHead>Aktion</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {providers.map(orga => (
                                    <TableRow key={orga.id}>
                                        <TableCell className="font-medium">{orga.name}</TableCell>
                                        <TableCell>{orga.contact}</TableCell>
                                        <TableCell>{orga.email}</TableCell>
                                        <TableCell>{orga.phone}</TableCell>
                                        <TableCell>{Array.isArray(orga.regions) ? orga.regions.join(', ') : orga.regions}</TableCell>
                                        <TableCell>{orga.commission}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" onClick={() => handleOpenProviderModal(orga)}>Bearbeiten</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                     <div className="flex items-center justify-between">
                        <CardTitle>Sportanlagen verwalten</CardTitle>
                        <div className="flex items-center gap-2">
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant={facilityView === 'list' ? 'default': 'ghost'} size="icon" onClick={() => setFacilityView('list')}>
                                            <List className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Listenansicht</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant={facilityView === 'grid' ? 'default': 'ghost'} size="icon" onClick={() => setFacilityView('grid')}>
                                            <LayoutGrid className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Grid-Ansicht</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <Button size="sm" onClick={() => handleOpenFacilityModal()}>
                                <PlusCircle className="mr-2 h-4 w-4"/>Neue Anlage
                            </Button>
                        </div>
                    </div>
                    <CardDescription>Fügen Sie die verfügbaren Sportanlagen hinzu und bearbeiten Sie diese.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingFacilities ? <div>Lade Anlagen...</div> : facilityView === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {facilities.map(facility => (
                                <Card key={facility.id} className="cursor-pointer hover:shadow-lg" onClick={() => handleOpenFacilityModal(facility)}>
                                    <CardHeader>
                                        <CardTitle className="text-base">{facility.name}</CardTitle>
                                        <CardDescription>{facility.location}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="text-xs list-disc list-inside">
                                            {facility.features.map((f, i) => <li key={i}>{f}</li>)}
                                        </ul>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Ort</TableHead><TableHead>Ausstattung</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {facilities.map(f => (
                                    <TableRow key={f.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpenFacilityModal(f)}>
                                        <TableCell className="font-semibold">{f.name}</TableCell>
                                        <TableCell>{f.location}</TableCell>
                                        <TableCell>{f.features.join(', ')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Offene Anfragen von Vereinen</CardTitle>
                            <CardDescription>Bearbeiten Sie Anfragen von Vereinen und leiten Sie diese an Anbieter weiter.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant={requestView === 'list' ? 'default': 'ghost'} size="icon" onClick={() => setRequestView('list')}>
                                            <List className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Listenansicht</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant={requestView === 'grid' ? 'default': 'ghost'} size="icon" onClick={() => setRequestView('grid')}>
                                            <LayoutGrid className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Grid-Ansicht</p></TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {requestView === 'list' ? (
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Verein</TableHead>
                                    <TableHead>Reiseziel</TableHead>
                                    <TableHead>Anlage</TableHead>
                                    <TableHead>Zeitraum</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Aktion</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map(req => (
                                    <TableRow key={req.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpenRequestModal(req)}>
                                        <TableCell className="font-medium">{req.club}</TableCell>
                                        <TableCell>{req.destination}</TableCell>
                                        <TableCell>{req.facility || '-'}</TableCell>
                                        <TableCell>{req.dates}</TableCell>
                                        <TableCell><Badge variant={req.status === 'Neu' ? 'destructive' : 'default'}>{req.status}</Badge></TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenRequestModal(req); }}>
                                                Bearbeiten
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <RequestsGridView />
                    )}
                </CardContent>
            </Card>

             <EditProviderModal 
                isOpen={isProviderModalOpen}
                onOpenChange={setIsProviderModalOpen}
                provider={editingProvider}
                onSave={handleSaveProvider}
                allFacilities={facilities}
                allRegions={allRegions}
            />

            <RequestDetailModal
                isOpen={isRequestModalOpen}
                onOpenChange={setIsRequestModalOpen}
                request={selectedRequest}
                providers={matchingProviders}
                onForward={handleForwardRequest}
            />

            <EditFacilityModal
                isOpen={isFacilityModalOpen}
                onOpenChange={setIsFacilityModalOpen}
                facility={editingFacility}
                onSave={handleSaveFacility}
                onDelete={deleteFacility}
            />
        </div>
    )
}

export default function TrainingCampPage() {
    const { currentUserRole } = useTeam();
    
    if (currentUserRole === 'Super-Admin') {
        return <SuperAdminTrainingCampPage />;
    }
    if (currentUserRole === 'Club-Admin' || currentUserRole === 'Coach') {
        return <ClubAdminTrainingCampPage />;
    }
    return <PlayerTrainingCampPage />;
}
