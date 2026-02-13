

'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Calendar, MapPin, Users, DollarSign, Send, FileText, CheckCircle, List, LayoutGrid, Phone, Mail as MailIcon, Globe, UserPlus, X, Loader2, GripVertical, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { DatePicker } from '@/components/ui/date-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useBootcamps } from '@/hooks/useBootcamps';
import { useTeam } from '@/hooks/use-team';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBootcampProviders } from '@/hooks/useBootcampProviders';
import type { Provider } from '@/ai/flows/providers.types';
import { useFacilities } from '@/hooks/useCamps';
import { EditProviderModal } from '@/components/EditProviderModal';
import { cantonPaths } from '@/lib/canton-paths';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { deleteAllBootcampsForProvider, addBootcamp, updateBootcamp } from '@/ai/flows/bootcamps';
import { cn } from '@/lib/utils';
import { deleteAllBootcampProviders } from '@/ai/flows/bootcampProviders';
import { nanoid } from 'nanoid';
import { BootcampModal } from '@/components/ui/bootcamp-modal';

const ProviderBootcampPage = () => {
    const { userName } = useTeam();
    const { camps, addCamp, updateCamp, isLoading } = useBootcamps(userName);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBootcamp, setSelectedBootcamp] = useState(null);

    const handleOpenBootcampModal = (bootcamp = null, defaultTab: string = 'details') => {
        setSelectedBootcamp({...bootcamp, defaultTab });
        setIsBootcampModalOpen(true);
    };

    const handleSave = async (bootcampData) => {
        if (bootcampData.id) {
            await updateCamp(bootcampData);
        } else {
            await addCamp(bootcampData);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Meine Bootcamps</h1>
                    <p className="text-muted-foreground">Verwalten Sie hier die von Ihnen angebotenen Bootcamps.</p>
                </div>
                <Button onClick={() => handleOpenBootcampModal()}><PlusCircle className="mr-2 h-4 w-4"/> Neues Bootcamp</Button>
            </div>
            {isLoading ? (
                 <p>Lade Bootcamps...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {camps.map(camp => (
                        <Card key={camp.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle>{camp.name}</CardTitle>
                                    <Badge variant={camp.status === 'Online' ? 'default' : 'secondary'} className={cn(camp.status === 'Online' ? 'bg-green-500' : '')}>{camp.status}</Badge>
                                </div>
                                <CardDescription>{Array.isArray(camp.focus) ? camp.focus.join(', ') : camp.focus}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <p className="flex items-center gap-2"><MapPin className="h-4 w-4"/> {camp.location}</p>
                                <p className="flex items-center gap-2"><Calendar className="h-4 w-4"/> {camp.dateRange?.from ? new Date(camp.dateRange.from).toLocaleDateString('de-CH') : ''} - {camp.dateRange?.to ? new Date(camp.dateRange.to).toLocaleDateString('de-CH') : ''}</p>
                                <p className="flex items-center gap-2"><Users className="h-4 w-4"/> {camp.registrations?.length || 0} / {camp.maxParticipants} Teilnehmer</p>
                                <p className="flex items-center gap-2"><DollarSign className="h-4 w-4"/> {camp.offer?.price || 'N/A'}</p>
                            </CardContent>
                             <CardFooter className="flex-col items-start gap-2">
                                <Button variant="outline" size="sm" className="w-full" onClick={() => handleOpenBootcampModal(camp, 'registrations')}>Spieler verwalten</Button>
                                <Button variant="secondary" size="sm" className="w-full" onClick={() => handleOpenBootcampModal(camp)}>Details bearbeiten</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
             <BootcampModal 
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                bootcamp={selectedBootcamp}
                onSave={handleSave}
                sourceName={userName}
            />
        </div>
    );
}

const SuperAdminBootcampPage = () => {
    const { camps, addCamp, updateCamp, isLoading: isLoadingCamps } = useBootcamps('all');
    const { facilities } = useFacilities();
    const { providers, addProvider, updateProvider, refetchProviders, isLoading: isLoadingProviders } = useBootcampProviders();
    const [view, setView] = useState('list');
    const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
    const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
    const [isBootcampModalOpen, setIsBootcampModalOpen] = useState(false);
    const [editingBootcamp, setEditingBootcamp] = useState(null);

    const handleSaveProvider = async (providerData) => {
        if (providerData.id) {
            await updateProvider(providerData);
        } else {
            await addProvider({ ...providerData, type: 'Bootcamp' });
        }
        await refetchProviders();
        setIsProviderModalOpen(false);
    };
    
    const handleSaveBootcamp = async (bootcampData) => {
        if (bootcampData.id) {
            await updateBootcamp(bootcampData);
        } else {
            await addBootcamp(bootcampData);
        }
    };
    
    const handleOpenBootcampModal = (bootcamp = null) => {
        setEditingBootcamp(bootcamp);
        setIsBootcampModalOpen(true);
    };
    
    const handleOpenProviderModal = (provider = null) => {
        setEditingProvider(provider);
        setIsProviderModalOpen(true);
    };

    const groupedBootcamps = useMemo(() => {
        const groups: { [key: string]: any[] } = {
            'Amigoal': []
        };
        providers.forEach(p => groups[p.name] = []);
        camps.forEach(camp => {
            const source = camp.source || 'Amigoal';
            if (!groups[source]) {
                groups[source] = [];
            }
            groups[source].push(camp);
        });
        return groups;
    }, [providers, camps]);
    
    const allRegions = useMemo(() => {
        const regionsFromProviders = providers.flatMap(p => p.regions);
        const regionsFromFacilities = facilities.map(f => f.location.split(', ')[1]).filter(Boolean);
        return Array.from(new Set([...regionsFromProviders, ...regionsFromFacilities, 'Spanien', 'Türkei', 'Italien', 'Schweiz', 'Deutschland', 'Portugal']));
    }, [providers, facilities]);

    const handleClearAllData = async () => {
        // Clear all bootcamps from all providers
        for (const provider of providers) {
            await deleteAllBootcampsForProvider(provider.name);
        }
        // Also clear amigoal-specific bootcamps
        await deleteAllBootcampsForProvider('Amigoal');
        
        // Then delete all bootcamp providers
        await deleteAllBootcampProviders();
        
        await refetchProviders();
    }
    
    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Bootcamp-Verwaltung (Super-Admin)</h1>
                    <p className="text-muted-foreground">Übersicht aller Bootcamps von allen Anbietern.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => handleOpenProviderModal(null)}><PlusCircle className="mr-2 h-4 w-4"/>Anbieter hinzufügen</Button>
                    <Button onClick={() => handleOpenBootcampModal(null)}><PlusCircle className="mr-2 h-4 w-4"/>Amigoal Bootcamp</Button>
                    <Button variant="destructive" onClick={handleClearAllData}>
                        <Trash2 className="mr-2 h-4 w-4" /> Alle löschen
                    </Button>
                </div>
            </div>

            {isLoadingProviders || isLoadingCamps ? <p>Lade Daten...</p> : (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>Bootcamp Anbieter</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Kontakt</TableHead>
                                        <TableHead>Kommission</TableHead>
                                        <TableHead className="text-right">Aktion</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {providers.map(p => (
                                        <TableRow key={p.id}>
                                            <TableCell>{p.name}</TableCell>
                                            <TableCell>{p.contact}</TableCell>
                                            <TableCell>{p.commission}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenProviderModal(p)}><Edit className="h-4 w-4"/></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {Object.entries(groupedBootcamps).map(([providerName, providerCamps]) => (
                        <Card key={providerName}>
                            <CardHeader>
                                <CardTitle>{providerName}</CardTitle>
                                <CardDescription>{providerCamps.length} Bootcamp(s)</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {providerCamps.map(camp => (
                                    <Card key={camp.id} className="flex flex-col">
                                        <CardHeader>
                                            <CardTitle className="text-lg">{camp.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2 text-sm flex-1">
                                            <p className="flex items-center gap-2"><MapPin className="h-4 w-4"/> {camp.location}</p>
                                            <p className="flex items-center gap-2"><Users className="h-4 w-4"/> {camp.registrations?.length || 0} / {camp.maxParticipants} Teilnehmer</p>
                                            <Progress value={((camp.registrations?.length || 0) / (camp.maxParticipants || 1)) * 100} className="h-2 mt-1" />
                                        </CardContent>
                                        <CardFooter className="flex-col items-start gap-2">
                                            <Button variant="outline" size="sm" className="w-full" onClick={() => handleOpenBootcampModal(camp, 'registrations')}>Spieler verwalten</Button>
                                            <Button variant="secondary" size="sm" className="w-full" onClick={() => handleOpenBootcampModal(camp)}>Details bearbeiten</Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                                {providerCamps.length === 0 && <p className="text-sm text-muted-foreground">Keine Bootcamps von diesem Anbieter.</p>}
                            </CardContent>
                        </Card>
                    ))}
                </>
            )}

            <BootcampModal 
                isOpen={isBootcampModalOpen}
                onOpenChange={setIsBootcampModalOpen}
                bootcamp={editingBootcamp}
                onSave={handleSaveBootcamp}
                sourceName="Amigoal"
            />
            <EditProviderModal 
                isOpen={isProviderModalOpen}
                onOpenChange={setIsProviderModalOpen}
                provider={editingProvider}
                onSave={handleSaveProvider}
                allFacilities={facilities}
                allRegions={allRegions}
            />
        </div>
    )
}

export default function BootcampPageRouter() {
    const { currentUserRole } = useTeam();
    
    if (currentUserRole === 'Super-Admin') {
        return <SuperAdminBootcampPage />;
    }
    
    // Default to provider view if not Super-Admin
    return <ProviderBootcampPage />;
}
