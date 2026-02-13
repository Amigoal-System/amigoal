
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Send, FileText, List, LayoutGrid, Phone, Mail as MailIcon, Globe, X, Building, LogIn, LogOut, Info, Loader2, Users, MapPin, Calendar, DollarSign, Trash2, Instagram, Facebook } from 'lucide-react';
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
import type { TrainingCamp, CampRequest, SportsFacility } from '@/ai/flows/trainingCamps.types';
import type { Registration } from '@/ai/flows/camps.types';
import type { Provider } from '@/ai/flows/providers.types';
import { useTrainingCampProviders } from '@/hooks/useTrainingCampProviders';
import { EditProviderModal } from '@/components/EditProviderModal';
import { useTeam } from '@/hooks/use-team';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { EditFacilityModal } from '@/components/ui/edit-facility-modal';
import { deleteAllTrainingCampsForProvider, requestTrainingCamp, updateTrainingCamp, addTrainingCamp } from '@/ai/flows/trainingCamps';
import { RequestDetailModal } from '@/components/ui/request-detail-modal';


const TrainingCampModal = ({ isOpen, onOpenChange, camp, onSave }) => {
    const [formData, setFormData] = useState<Partial<TrainingCamp> | null>(null);

    React.useEffect(() => {
        if (camp) {
             setFormData({
                ...camp,
                date: camp.date ? { from: new Date(camp.date.from), to: new Date(camp.date.to) } : undefined,
            });
        } else {
             setFormData({
                type: 'camp',
                name: '',
                location: '',
                date: { from: new Date(), to: new Date(new Date().setDate(new Date().getDate() + 7)) },
                budget: 0,
                status: 'Entwurf',
                source: 'Intern' 
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
                    <TabsList className="grid w-full grid-cols-1">
                        <TabsTrigger value="details">Details</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="pt-4">
                        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name des Lagers</Label>
                                <Input id="name" value={formData.name || ''} onChange={(e) => setFormData(p => ({...p!, name: e.target.value}))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location">Ort</Label>
                                <Input id="location" value={formData.location || ''} onChange={(e) => setFormData(p => ({...p!, location: e.target.value}))} />
                            </div>
                            <div className="space-y-2">
                                <Label>Datum</Label>
                                <DatePickerWithRange date={formData.date} onDateChange={(d) => setFormData(p => ({...p!, date: d}))} />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="budget">Budget (CHF)</Label>
                                    <Input id="budget" type="number" value={formData.budget || 0} onChange={(e) => setFormData(p => ({...p!, budget: parseInt(e.target.value) || 0}))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                     <Select value={formData.status} onValueChange={(val) => setFormData(p => ({...p!, status: val as any}))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Anfrage">Anfrage</SelectItem>
                                            <SelectItem value="Entwurf">Entwurf</SelectItem>
                                            <SelectItem value="Online">Online</SelectItem>
                                            <SelectItem value="In Durchführung">In Durchführung</SelectItem>
                                            <SelectItem value="Abgeschlossen">Abgeschlossen</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
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

const PlayerTrainingCampPage = () => {
    const { camps, isLoading } = useCamps('camp', 'all');
    const { userEmail, userName, currentUserRole } = useTeam();

    if (isLoading) return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
         <div className="flex flex-col gap-6">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Geplante Trainingslager</h1>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {camps.filter(c => c.status === 'Online').map((camp) => (
                    <Card key={camp.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{camp.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-3 text-sm">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{camp.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{camp.date?.from ? format(new Date(camp.date.from), 'dd.MM.yyyy') : ''} - {camp.date?.to ? format(new Date(camp.date.to), 'dd.MM.yyyy') : ''}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" disabled>
                                Anmelden (Bald verfügbar)
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}

const ClubAdminTrainingCampPage = () => {
    const { camps, addCamp, updateCamp, isLoading } = useCamps('camp', 'club');
    const { toast } = useToast();
    const { lang, clubName, userName, userEmail } = useTeam();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCamp, setSelectedCamp] = useState<TrainingCamp | null>(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const { facilities } = useFacilities();
    const [requestData, setRequestData] = useState<Partial<CampRequest>>({
        contactPerson: userName,
        clubName: clubName,
        email: userEmail,
    });

    const handleOpenModal = (camp: TrainingCamp | null = null) => {
        setSelectedCamp(camp);
        setIsModalOpen(true);
    };

    const handleSaveCamp = async (campData: Partial<TrainingCamp>) => {
        if (campData.id) {
            await updateCamp(campData as TrainingCamp);
        } else {
            await addCamp(campData as Omit<TrainingCamp, 'id'>);
        }
    };
    
    const handleSendRequest = async () => {
        if (!requestData.contactPerson || !requestData.email || !requestData.clubName) {
            toast({ title: 'Bitte füllen Sie die Kontaktinformationen aus.', variant: 'destructive'});
            return;
        }
        try {
            await requestTrainingCamp(requestData as CampRequest);
            toast({
                title: "Anfrage gesendet",
                description: "Ihre Anfrage für die Organisation des Trainingslagers wurde an Amigoal übermittelt."
            });
            setIsRequestModalOpen(false);
        } catch (error) {
             toast({ title: "Fehler beim Senden der Anfrage", variant: 'destructive'});
        }
    };

    const handleRequestInputChange = (field: keyof CampRequest, value: any) => {
        setRequestData(prev => ({ ...prev!, [field]: value }));
    };
    
    if (isLoading) return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <>
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
                            Neues Lager planen
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {camps.map((camp) => (
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
                                    <span>{camp.date?.from ? format(new Date(camp.date.from), 'dd.MM.yyyy') : ''} - {camp.date?.to ? format(new Date(camp.date.to), 'dd.MM.yyyy') : ''}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span>Budget: CHF {camp.budget?.toLocaleString('de-CH') || 'N/A'}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full" onClick={() => handleOpenModal(camp as TrainingCamp)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Details & Verwaltung
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
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
                            <Textarea placeholder="z.B. Naturrasenplatz, All-Inclusive, Flug ab Zürich..." value={requestData.wishes} onChange={(e) => handleRequestInputChange('wishes', e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRequestModalOpen(false)}>Abbrechen</Button>
                        <Button onClick={handleSendRequest}>Anfrage senden</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

const SuperAdminTrainingCampPage = () => {
    const { camps, isLoading: isLoadingCamps } = useCamps('camp', 'all');
    const { facilities, addFacility, updateFacility, deleteFacility, isLoading: isLoadingFacilities } = useFacilities();
    const { providers, addProvider, updateProvider, refetchProviders, isLoading: isLoadingProviders } = useTrainingCampProviders();
    const [view, setView] = useState('list');
    const [requestView, setRequestView] = useState('list');
    const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<TrainingCamp | null>(null);
    const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
    const [editingFacility, setEditingFacility] = useState<SportsFacility | null>(null);
    const [facilityView, setFacilityView] = useState('list');
    const { toast } = useToast();
    
    const allRegions = useMemo(() => {
        const regionsFromProviders = providers.flatMap(p => p.regions);
        const regionsFromFacilities = facilities.map(f => f.location.split(', ')[1]).filter(Boolean);
        return Array.from(new Set([...regionsFromProviders, ...regionsFromFacilities, 'Spanien', 'Türkei', 'Italien', 'Schweiz', 'Deutschland', 'Portugal']));
    }, [providers, facilities]);
    
    const handleOpenProviderModal = (provider: Provider | null = null) => {
        setEditingProvider(provider);
        setIsProviderModalOpen(true);
    };

    const handleSaveProvider = async (providerData: Partial<Provider>) => {
        if (providerData.id) {
            await updateProvider(providerData as Provider);
        } else {
            await addProvider({ ...providerData, type: 'Trainingslager' } as Omit<Provider, 'id'>);
        }
        await refetchProviders();
        setIsProviderModalOpen(false);
    };
    
    const handleOpenRequestModal = (request: TrainingCamp) => {
        setSelectedRequest(request);
        setIsRequestModalOpen(true);
    };

    const handleForwardRequest = (requestId: string, providerId: string) => {
        setIsRequestModalOpen(false);
        const providerName = providers.find(p => p.id === providerId)?.name;
        toast({
            title: "Anfrage weitergeleitet",
            description: `Die Anfrage wurde an ${providerName} gesendet.`
        });
    };
    
    const handleOpenFacilityModal = (facility: SportsFacility | null = null) => {
        setEditingFacility(facility);
        setIsFacilityModalOpen(true);
    };

    const handleSaveFacility = (facilityData: SportsFacility) => {
        if (facilityData.id) {
            updateFacility(facilityData);
        } else {
            addFacility(facilityData);
        }
        setIsFacilityModalOpen(false);
    };

    const handleDeleteFacility = (facilityId: string) => {
        deleteFacility(facilityId);
        setIsFacilityModalOpen(false);
    };

    const requestsFromClubs = useMemo(() => camps.filter(c => c.status === 'Anfrage' && c.source !== 'Externe Anfrage'), [camps]);
    const requestsFromPublic = useMemo(() => camps.filter(c => c.status === 'Anfrage' && c.source === 'Externe Anfrage'), [camps]);

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
                     {isLoadingProviders ? <p>Lade Anbieter...</p> : view === 'grid' ? (
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
                                        <a href={orga.website || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline"><Globe className="h-3 w-3"/>{orga.website}</a>
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
                            <CardDescription>Bearbeiten Sie Anfragen, die von Club-Admins gestellt wurden.</CardDescription>
                        </div>
                        {/* Placeholder for view toggle if needed */}
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Verein</TableHead><TableHead>Reiseziel</TableHead><TableHead>Zeitraum</TableHead><TableHead>Aktion</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {requestsFromClubs.map(req => (
                                <TableRow key={req.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpenRequestModal(req as TrainingCamp)}>
                                    <TableCell className="font-medium">{req.requestDetails?.clubName}</TableCell>
                                    <TableCell>{req.requestDetails?.destination}</TableCell>
                                    <TableCell>{req.requestDetails?.dates ? `${new Date(req.requestDetails.dates.from).toLocaleDateString()} - ${new Date(req.requestDetails.dates.to).toLocaleDateString()}` : 'Unbekannt'}</TableCell>
                                    <TableCell><Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenRequestModal(req as TrainingCamp); }}>Bearbeiten</Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader>
                    <CardTitle>Offene Anfragen von Webseite</CardTitle>
                    <CardDescription>Bearbeiten Sie Anfragen, die über das öffentliche Formular gestellt wurden.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Anfragesteller</TableHead><TableHead>Reiseziel</TableHead><TableHead>Zeitraum</TableHead><TableHead>Aktion</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {requestsFromPublic.map(req => (
                                <TableRow key={req.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpenRequestModal(req as TrainingCamp)}>
                                    <TableCell className="font-medium">{req.requestDetails?.contactPerson}</TableCell>
                                    <TableCell>{req.requestDetails?.destination}</TableCell>
                                    <TableCell>{req.requestDetails?.dates ? `${new Date(req.requestDetails.dates.from).toLocaleDateString()} - ${new Date(req.requestDetails.dates.to).toLocaleDateString()}` : 'Unbekannt'}</TableCell>
                                    <TableCell><Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenRequestModal(req as TrainingCamp); }}>Bearbeiten</Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
                providers={providers}
                onForward={handleForwardRequest}
            />

            <EditFacilityModal
                isOpen={isFacilityModalOpen}
                onOpenChange={setIsFacilityModalOpen}
                facility={editingFacility}
                onSave={handleSaveFacility}
                onDelete={handleDeleteFacility}
            />
        </div>
    );
};

export default function TrainingCampPage() {
    const { currentUserRole } = useTeam();

    if (currentUserRole === 'Super-Admin') {
        return <SuperAdminTrainingCampPage />;
    }
    
    if (currentUserRole === 'Trainingslager-Anbieter') {
        return <div/>;
    }
    
    if (currentUserRole === 'Player' || currentUserRole === 'Parent') {
        return <PlayerTrainingCampPage />;
    }
    
    return <ClubAdminTrainingCampPage />;
}

    