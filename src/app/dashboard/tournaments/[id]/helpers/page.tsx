
'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, UserPlus, PlusCircle, User, Clock, Edit, Trash2, Mail, ExternalLink } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { EmailComposerModal } from '@/components/ui/email-composer-modal';

const initialHelpers = [
  { id: '1', name: 'Peter Lustig', phone: '079 123 45 67', email: 'peter@lustig.de', notes: 'Erfahren am Grill' },
  { id: '2', name: 'Erika Muster', phone: '078 987 65 43', email: 'erika@muster.ch', notes: 'Kann nur Vormittags' },
  { id: '3', name: 'Max Power', phone: '077 555 12 34', email: 'max@power.com', notes: '' },
  { id: '4', name: 'Anna Konda', phone: '076 111 22 33', email: 'anna@konda.org', notes: 'Flexibel einsetzbar' },
];

const initialStations = [
  { 
    id: '1',
    name: 'Grillstand', 
    shifts: [
      { id: '101', time: '10:00 - 12:00', needed: 2, assigned: ['1'] },
      { id: '102', time: '12:00 - 14:00', needed: 2, assigned: [] },
      { id: '103', time: '14:00 - 16:00', needed: 2, assigned: [] },
    ]
  },
  { 
    id: '2',
    name: 'Getränkeverkauf', 
    shifts: [
      { id: '201', time: '10:00 - 12:00', needed: 1, assigned: ['2'] },
      { id: '202', time: '12:00 - 14:00', needed: 2, assigned: ['3'] },
      { id: '203', time: '14:00 - 16:00', needed: 2, assigned: [] },
    ]
  },
  { 
    id: '3',
    name: 'Aufbau & Logistik', 
    shifts: [
      { id: '301', time: '08:00 - 10:00', needed: 4, assigned: ['4'] },
    ]
  }
];

const HelperModal = ({ isOpen, onOpenChange, helper, onSave, onDelete }) => {
    const [formData, setFormData] = useState(null);

    React.useEffect(() => {
        if (isOpen) {
            setFormData(helper || { id: null, name: '', phone: '', email: '', notes: '' });
        }
    }, [helper, isOpen]);

    if (!isOpen || !formData) return null;

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{formData.id ? 'Helfer bearbeiten' : 'Neuen Helfer hinzufügen'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={formData.name} onChange={handleChange} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefon</Label>
                            <Input id="phone" value={formData.phone} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-Mail</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notizen</Label>
                        <Textarea id="notes" value={formData.notes} onChange={handleChange} />
                    </div>
                </div>
                <DialogFooter className="justify-between">
                    <div>
                        {formData.id && (
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">Löschen</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Helfer löschen?</AlertDialogTitle></AlertDialogHeader>
                                    <AlertDialogDescription>Möchten Sie {formData.name} wirklich aus der Helferliste entfernen?</AlertDialogDescription>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDelete(formData.id)}>Löschen</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
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

const StationModal = ({ isOpen, onOpenChange, station, onSave, onDelete }) => {
    const [formData, setFormData] = useState(null);

    React.useEffect(() => {
        if (isOpen) {
            setFormData(station || { id: null, name: '', shifts: [] });
        }
    }, [station, isOpen]);

    if (!isOpen || !formData) return null;

    const handleShiftChange = (shiftId, field, value) => {
        setFormData(prev => ({
            ...prev,
            shifts: prev.shifts.map(shift =>
                shift.id === shiftId ? { ...shift, [field]: value } : shift
            )
        }));
    };

    const addShift = () => {
        setFormData(prev => ({
            ...prev,
            shifts: [...prev.shifts, { id: Date.now().toString(), time: '', needed: 1, assigned: [] }]
        }));
    };

    const removeShift = (shiftId) => {
        setFormData(prev => ({ ...prev, shifts: prev.shifts.filter(s => s.id !== shiftId) }));
    };

    return (
         <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{formData.id ? 'Station bearbeiten' : 'Neue Station erstellen'}</DialogTitle>
                </DialogHeader>
                 <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="space-y-2">
                        <Label htmlFor="station-name">Name der Station</Label>
                        <Input id="station-name" value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))}/>
                    </div>
                    <div className="space-y-3">
                        <Label>Schichten</Label>
                        {formData.shifts.map(shift => (
                            <div key={shift.id} className="flex items-center gap-2 p-2 border rounded-md">
                                 <Input 
                                    placeholder="z.B. 10:00 - 12:00" 
                                    className="flex-1"
                                    value={shift.time}
                                    onChange={(e) => handleShiftChange(shift.id, 'time', e.target.value)}
                                />
                                <Input 
                                    type="number" 
                                    className="w-20"
                                    value={shift.needed}
                                    onChange={(e) => handleShiftChange(shift.id, 'needed', parseInt(e.target.value) || 1)}
                                />
                                <Button variant="ghost" size="icon" onClick={() => removeShift(shift.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" className="w-full" onClick={addShift}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Schicht hinzufügen
                        </Button>
                    </div>
                 </div>
                 <DialogFooter className="justify-between">
                     <div>
                        {formData.id && (
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">Station löschen</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Station löschen?</AlertDialogTitle></AlertDialogHeader>
                                    <AlertDialogDescription>Möchten Sie die Station "{formData.name}" und alle zugehörigen Schichten wirklich löschen?</AlertDialogDescription>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDelete(formData.id)}>Löschen</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                        <Button onClick={() => onSave(formData)}>Speichern</Button>
                    </div>
                 </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const AssignHelperModal = ({ availableHelpers, onAssign }) => {
    const [selectedHelperId, setSelectedHelperId] = useState('');
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                    <UserPlus className="mr-2 h-4 w-4"/> Zuweisen
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle>Helfer zuweisen</DialogTitle></DialogHeader>
                <div className="py-4">
                    <Select onValueChange={setSelectedHelperId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Helfer auswählen..." />
                        </SelectTrigger>
                        <SelectContent>
                            {availableHelpers.map(h => (
                                <SelectItem key={h.id} value={h.id.toString()}>{h.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Abbrechen</Button></DialogClose>
                    <DialogClose asChild>
                        <Button onClick={() => onAssign(selectedHelperId)} disabled={!selectedHelperId}>
                            Zuweisen
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function HelperPlanningPage() {
    const params = useParams();
    const tournamentId = params.id;
    const lang = params.lang;
    
    const [helpers, setHelpers] = useState(initialHelpers);
    const [stations, setStations] = useState(initialStations);
    const [isHelperModalOpen, setIsHelperModalOpen] = useState(false);
    const [editingHelper, setEditingHelper] = useState(null);
    const [isStationModalOpen, setIsStationModalOpen] = useState(false);
    const [editingStation, setEditingStation] = useState(null);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    
    const assignedHelperIds = useMemo(() => {
        return new Set(stations.flatMap(s => s.shifts.flatMap(sh => sh.assigned)));
    }, [stations]);
    
    const availableHelpers = useMemo(() => {
        return helpers.filter(h => !assignedHelperIds.has(h.id));
    }, [helpers, assignedHelperIds]);
    
    const handleAssign = (stationName: string, shiftId: string, helperId: string) => {
        const helper = helpers.find(h => h.id === helperId);
        if (!helper) return;

        setStations(prevStations => prevStations.map(station => {
            if (station.name === stationName) {
                return {
                    ...station,
                    shifts: station.shifts.map(shift => {
                        if (shift.id === shiftId && shift.assigned.length < shift.needed) {
                            return { ...shift, assigned: [...shift.assigned, helper.id] };
                        }
                        return shift;
                    })
                };
            }
            return station;
        }));
    };
    
    const handleUnassign = (stationName: string, shiftId: string, helperId: string) => {
         setStations(prevStations => prevStations.map(station => {
            if (station.name === stationName) {
                return {
                    ...station,
                    shifts: station.shifts.map(shift => {
                        if (shift.id === shiftId) {
                            return { ...shift, assigned: shift.assigned.filter(id => id !== helperId) };
                        }
                        return shift;
                    })
                };
            }
            return station;
        }));
    }

    const handleOpenHelperModal = (helper) => {
        setEditingHelper(helper);
        setIsHelperModalOpen(true);
    }
    
    const handleSaveHelper = (helperData) => {
        if (helperData.id) {
            setHelpers(prev => prev.map(h => h.id === helperData.id ? helperData : h));
        } else {
            setHelpers(prev => [...prev, { ...helperData, id: Date.now().toString() }]);
        }
        setIsHelperModalOpen(false);
    }

    const handleDeleteHelper = (helperId) => {
        setHelpers(prev => prev.filter(h => h.id !== helperId));
        // Also remove from any shifts
        setStations(prevStations => prevStations.map(station => ({
            ...station,
            shifts: station.shifts.map(shift => ({
                ...shift,
                assigned: shift.assigned.filter(id => id !== helperId)
            }))
        })));
        setIsHelperModalOpen(false);
    }
    
    const handleOpenStationModal = (station) => {
        setEditingStation(station);
        setIsStationModalOpen(true);
    }

    const handleSaveStation = (stationData) => {
        if (stationData.id) {
            setStations(prev => prev.map(s => s.id === stationData.id ? stationData : s));
        } else {
            setStations(prev => [...prev, { ...stationData, id: Date.now().toString() }]);
        }
        setIsStationModalOpen(false);
    };

    const handleDeleteStation = (stationId) => {
        setStations(prev => prev.filter(s => s.id !== stationId));
        setIsStationModalOpen(false);
    };
    
    const getHelperById = (id: string) => helpers.find(h => h.id === id);


    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Button asChild variant="ghost">
                        <Link href={`/${lang}/dashboard/tournaments/${tournamentId}`}>
                            <ArrowLeft className="mr-2 h-4 w-4"/>
                            Zurück zum Turnier-Cockpit
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                         <Button variant="outline" asChild>
                            <Link href={`/${lang}/dashboard/tournaments/${tournamentId}/public-helpers`} target="_blank">
                                <ExternalLink className="mr-2 h-4 w-4"/>Öffentlichen Plan ansehen
                            </Link>
                        </Button>
                        <Button onClick={() => setIsEmailModalOpen(true)}>
                            <Mail className="mr-2 h-4 w-4"/>Helfer benachrichtigen
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <div>
                                    <CardTitle>Schichtplan</CardTitle>
                                    <CardDescription>
                                        Weisen Sie Helfer den verschiedenen Stationen und Schichten zu.
                                    </CardDescription>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => handleOpenStationModal(null)}>
                                    <PlusCircle className="mr-2 h-4 w-4"/>Station hinzufügen
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                            {stations.map(station => (
                                <div key={station.id}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold">{station.name}</h3>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleOpenStationModal(station)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            {station.shifts.map(shift => (
                                                <Card key={shift.id} className="p-3 bg-muted/50">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="flex items-center gap-2 text-sm font-medium">
                                                            <Clock className="h-4 w-4"/> {shift.time}
                                                        </div>
                                                        <Badge variant="outline">
                                                            {shift.assigned.length} / {shift.needed} Helfer
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {shift.assigned.map(helperId => {
                                                            const helper = getHelperById(helperId);
                                                            return helper ? (
                                                                <div key={helper.id} className="bg-primary/10 text-primary-foreground p-2 rounded-md flex justify-between items-center text-sm">
                                                                    <span className="font-semibold text-primary">{helper.name}</span>
                                                                    <button onClick={() => handleUnassign(station.name, shift.id, helper.id)}>
                                                                        <X className="h-4 w-4 text-primary/50 hover:text-primary"/>
                                                                    </button>
                                                                </div>
                                                            ) : null
                                                        })}
                                                        {Array.from({ length: shift.needed - shift.assigned.length }).map((_, i) => (
                                                            <AssignHelperModal key={i} availableHelpers={availableHelpers} onAssign={(helperId) => handleAssign(station.name, shift.id, helperId)} />
                                                        ))}
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                </div>
                            ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Helfer-Pool</CardTitle>
                                    <Button size="sm" onClick={() => handleOpenHelperModal(null)}><UserPlus className="mr-2 h-4 w-4"/>Hinzufügen</Button>
                                </div>
                                <CardDescription>{helpers.length} Helfer insgesamt erfasst.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {helpers.map(helper => (
                                        <div key={helper.id} className="flex items-center gap-3 p-2 rounded-lg border cursor-pointer hover:bg-muted" onClick={() => handleOpenHelperModal(helper)}>
                                            <Avatar>
                                                <AvatarFallback>{helper.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold text-sm">{helper.name}</p>
                                                <p className="text-xs text-muted-foreground">{helper.phone}</p>
                                            </div>
                                            <div className="flex-grow"></div>
                                            {assignedHelperIds.has(helper.id) && <Badge variant="default" className="bg-green-500">Eingeteilt</Badge>}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <HelperModal 
                isOpen={isHelperModalOpen}
                onOpenChange={setIsHelperModalOpen}
                helper={editingHelper}
                onSave={handleSaveHelper}
                onDelete={handleDeleteHelper}
            />
            <StationModal
                isOpen={isStationModalOpen}
                onOpenChange={setIsStationModalOpen}
                station={editingStation}
                onSave={handleSaveStation}
                onDelete={handleDeleteStation}
            />
             <EmailComposerModal
                isOpen={isEmailModalOpen}
                onOpenChange={setIsEmailModalOpen}
                recipients={helpers}
                initialSubject={`Dein Helfer-Einsatz am Turnier`}
                initialBody={`Hallo zusammen,\n\nanbei der Link zum Online-Helferplan. Bitte prüft eure Einsätze.\n\n${typeof window !== 'undefined' ? `${window.location.origin}/${lang}/dashboard/tournaments/${tournamentId}/public-helpers` : ''}\n\nVielen Dank für euren Einsatz!\nDas OK`}
            />
        </>
    );
}

