
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { DatePickerWithRange } from './date-range-picker';
import { DatePicker } from './date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Badge } from './badge';
import { Textarea } from './textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Card, CardHeader, CardContent, CardTitle } from './card';
import { PlusCircle, Trash2, X, GripVertical, UserPlus, Search, Upload, Image as ImageIcon, ClipboardList, Star, Users, Loader2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { cantonPaths } from '@/lib/canton-paths';
import { ScrollArea } from './scroll-area';
import { Checkbox } from './checkbox';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Slider } from './slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useBootcampProviders } from '@/hooks/useBootcampProviders';
import { useTrainingCampProviders } from '@/hooks/useTrainingCampProviders';
import { uploadImagesFlow } from '@/ai/flows/bootcamps';
import { useToast } from '@/hooks/use-toast';

const defaultFocusOptions = ["Technik", "Taktik", "Kondition", "Schusstraining", "Torwarttraining"];
const defaultEvaluationAttributes = [
    { id: 'speed', name: 'Schnelligkeit' },
    { id: 'maturity', name: 'Reife' },
    { id: 'shootingPower', name: 'Schusskraft' },
    { id: 'passingAccuracy', name: 'Passgenauigkeit' },
    { id: 'understanding', name: 'Verständnis' },
];

export const FocusSelector = ({ selected, onToggle, onAdd, disabled }) => {
    const [newFocus, setNewFocus] = useState('');

    const handleAdd = () => {
        if (newFocus && !selected.includes(newFocus)) {
            onAdd(newFocus);
        }
        setNewFocus('');
    };

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
                {defaultFocusOptions.map(focus => (
                    <Button
                        key={focus}
                        type="button"
                        variant={selected.includes(focus) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onToggle(focus)}
                        disabled={disabled}
                    >
                        {focus}
                    </Button>
                ))}
            </div>
             <div className="flex gap-2">
                <Input
                    placeholder="Eigener Fokus..."
                    value={newFocus}
                    onChange={e => setNewFocus(e.target.value)}
                    disabled={disabled}
                />
                <Button type="button" onClick={handleAdd} disabled={disabled || !newFocus}>Hinzufügen</Button>
            </div>
             {selected.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                    {selected.map(focus => (
                        <Badge key={focus} variant="secondary">
                            {focus}
                            <button type="button" onClick={() => onToggle(focus)} disabled={disabled} className="ml-1.5 -mr-1 rounded-full p-0.5 hover:bg-muted-foreground/20">
                                <X className="h-3 w-3"/>
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
};


const TaskSection = ({ title, tasks, staff, onTaskChange, onAddTask, onRemoveTask }) => {
    return (
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
                {tasks.map((task, index) => (
                    <div key={task.id} className="flex items-start gap-2 p-2 border rounded-md bg-muted/50">
                        <GripVertical className="h-5 w-5 text-muted-foreground mt-8 cursor-grab flex-shrink-0" />
                        <div className="flex-grow grid grid-cols-2 gap-2">
                            <div className="col-span-2">
                                <Label className="text-xs">Aufgabe</Label>
                                <Input
                                    placeholder="z.B. Material prüfen"
                                    value={task.title}
                                    onChange={(e) => onTaskChange(task.id, 'title', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Zuweisen an</Label>
                                <Select value={task.assigneeId} onValueChange={val => {
                                    const selectedStaff = staff.find(s => s.id === val);
                                    onTaskChange(task.id, 'assigneeId', val);
                                    onTaskChange(task.id, 'assigneeName', selectedStaff?.name || '');
                                }}>
                                    <SelectTrigger><SelectValue placeholder="Staff wählen..." /></SelectTrigger>
                                    <SelectContent>
                                        {staff.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                 <Label className="text-xs">Fällig am</Label>
                                <DatePicker
                                    date={task.dueDate ? new Date(task.dueDate) : undefined}
                                    onDateChange={(date) => date && onTaskChange(task.id, 'dueDate', date.toISOString().split('T')[0])}
                                />
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="mt-6" onClick={() => onRemoveTask(task.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                <Button variant="outline" size="sm" onClick={onAddTask} className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Aufgabe hinzufügen
                </Button>
            </CardContent>
        </Card>
    );
};


export const BootcampModal = ({ isOpen, onOpenChange, bootcamp, onSave, sourceName, facilities = [], allStaff = [] }) => {
    const [formData, setFormData] = useState<any>(null);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [staffSearchTerm, setStaffSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState('details');
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);

    const { providers: bootcampProviders } = useBootcampProviders();
    const { providers: trainingCampProviders } = useTrainingCampProviders();

    const providerData = useMemo(() => {
        const allProviders = [...bootcampProviders, ...trainingCampProviders];
        return allProviders.find(p => p.name === sourceName);
    }, [bootcampProviders, trainingCampProviders, sourceName]);

    const evaluationAttributes = useMemo(() => {
        return providerData?.evaluationAttributes?.length
            ? providerData.evaluationAttributes
            : defaultEvaluationAttributes;
    }, [providerData]);


    useEffect(() => {
        if (isOpen && bootcamp?.defaultTab) {
            setActiveTab(bootcamp.defaultTab);
        } else if (isOpen) {
            setActiveTab('details');
        }
    }, [isOpen, bootcamp]);

    const handleFocusToggle = (focus) => {
        setFormData(prev => {
            const currentFocus = Array.isArray(prev.focus) ? prev.focus : (prev.focus ? [prev.focus] : []);
            const newFocus = currentFocus.includes(focus)
                ? currentFocus.filter(f => f !== focus)
                : [...currentFocus, focus];
            return { ...prev, focus: newFocus };
        });
    };

    const handleAddCustomFocus = (focus) => {
        setFormData(prev => {
            const currentFocus = Array.isArray(prev.focus) ? prev.focus : (prev.focus ? [prev.focus] : []);
            return {...prev, focus: [...currentFocus, focus]};
        });
    };

    const handleAddStaff = (staffMember) => {
        setFormData(p => ({
            ...p,
            staff: [...(p.staff || []), { id: staffMember.id, name: staffMember.name, role: staffMember.position || 'Staff' }]
        }));
    };

    const handleRemoveStaff = (staffId) => {
         setFormData(p => ({
            ...p,
            staff: p.staff.filter(s => s.id !== staffId)
        }));
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const imageFiles = files.filter(file => file.type.startsWith('image/'));
            
            if (imageFiles.length === 0) return;

            // Check file sizes
            for(const file of imageFiles) {
                if (file.size > 1024 * 1024) { // 1MB limit
                    toast({
                        title: "Datei zu gross",
                        description: `Das Bild "${file.name}" ist grösser als 1MB und kann nicht hochgeladen werden.`,
                        variant: "destructive"
                    });
                    return;
                }
            }

            const currentImageCount = formData.galleryImages?.length || 0;
            if (currentImageCount + imageFiles.length > 4) {
                 toast({
                    title: "Limit erreicht",
                    description: "Sie können maximal 4 Bilder hochladen.",
                    variant: "destructive"
                });
                return;
            }

            imageFiles.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setFormData(prev => ({
                        ...prev,
                        galleryImages: [...prev.galleryImages, event.target?.result as string]
                    }));
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setFormData(p => ({
            ...p,
            galleryImages: p.galleryImages.filter((_, index) => index !== indexToRemove)
        }));
    };


    React.useEffect(() => {
        const initialFinancials = { 
            siblingDiscountPercentage: 0, 
            couponConfig: { code: '', discountType: 'percentage', discountValue: 10, maxUsage: 100 }
        };
        const initialOffer = { price: 0, priceType: 'pro Person', details: '' };

        if (bootcamp) {
            setFormData({
                ...bootcamp,
                dateRange: bootcamp.dateRange ? { from: new Date(bootcamp.dateRange.from), to: new Date(bootcamp.dateRange.to) } : undefined,
                registrationDeadline: bootcamp.registrationDeadline ? new Date(bootcamp.registrationDeadline) : undefined,
                offer: bootcamp.offer || initialOffer,
                registrations: bootcamp.registrations || [],
                waitlist: bootcamp.waitlist || [],
                focus: Array.isArray(bootcamp.focus) ? bootcamp.focus : (bootcamp.focus ? [bootcamp.focus] : []),
                program: bootcamp.program || [],
                staff: bootcamp.staff || [],
                galleryImages: bootcamp.galleryImages || [],
                financials: bootcamp.financials || initialFinancials,
                tasks: bootcamp.tasks || [],
            });
        } else {
             setFormData({
                type: 'bootcamp',
                name: '',
                location: '',
                region: '',
                dateRange: undefined,
                status: 'Entwurf',
                participants: 0,
                maxParticipants: 20,
                registrationDeadline: undefined,
                registrations: [],
                waitlist: [],
                focus: [],
                offer: initialOffer,
                description: '',
                source: sourceName,
                program: [],
                staff: [],
                galleryImages: [],
                financials: initialFinancials,
                tasks: [],
            });
        }
    }, [bootcamp, sourceName, isOpen]);

     const handleSave = async () => {
        setIsUploading(true);
        const dataUris = formData.galleryImages.filter(img => img && img.startsWith('data:'));
        const existingUrls = formData.galleryImages.filter(img => img && !img.startsWith('data:'));

        try {
            let uploadedUrls = [];
            if (dataUris.length > 0) {
                uploadedUrls = await uploadImagesFlow(dataUris);
            }
            
            const finalData = {
                ...formData,
                galleryImages: [...existingUrls, ...uploadedUrls],
                dateRange: formData.dateRange ? { from: formData.dateRange.from.toISOString(), to: formData.dateRange.to.toISOString()} : undefined,
                registrationDeadline: formData.registrationDeadline ? formData.registrationDeadline.toISOString() : undefined,
            };
            
            await onSave(finalData);
            onOpenChange(false);
        } catch (error) {
            toast({
                title: 'Fehler beim Bild-Upload',
                description: 'Die Bilder konnten nicht hochgeladen werden. Bitte versuchen Sie es erneut.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddParticipant = (listType: 'registrations' | 'waitlist') => {
        if (newPlayerName.trim()) {
            const newParticipant = {
                userId: `manual-${Date.now()}`,
                name: newPlayerName.trim(),
                role: 'Teilnehmer'
            };
            setFormData(p => ({...p, [listType]: [...p[listType], newParticipant]}));
            setNewPlayerName('');
        }
    };

    const handleRemoveParticipant = (userId: string, listType: 'registrations' | 'waitlist') => {
        setFormData(p => ({...p, [listType]: p[listType].filter(r => r.userId !== userId)}));
    };
    
    const handleEvaluationChange = (userId: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            registrations: prev.registrations.map(reg => 
                reg.userId === userId ? {
                    ...reg,
                    evaluation: {
                        ...(reg.evaluation || {}),
                        [field]: value
                    }
                } : reg
            )
        }));
    };

    const handleAttendanceChange = (userId: string, date: string, isPresent: boolean) => {
        setFormData(prev => ({
            ...prev,
            registrations: prev.registrations.map(reg =>
                reg.userId === userId ? {
                    ...reg,
                    attendance: {
                        ...(reg.attendance || {}),
                        [date]: isPresent
                    }
                } : reg
            )
        }));
    };

    const addDay = () => {
        const newDay = {
            id: nanoid(),
            day: `Tag ${formData.program.length + 1}`,
            schedule: [],
        };
        setFormData(p => ({ ...p, program: [...p.program, newDay] }));
    };

    const removeDay = (dayId: string) => {
        setFormData(p => ({ ...p, program: p.program.filter(d => d.id !== dayId) }));
    };

    const handleDayNameChange = (dayId: string, newName: string) => {
        setFormData(p => ({
            ...p,
            program: p.program.map(d => d.id === dayId ? { ...d, day: newName } : d),
        }));
    };

    const addScheduleItem = (dayId: string) => {
        const newItem = { id: nanoid(), time: '09:00', activity: '', location: '', focus: '' };
        setFormData(p => ({
            ...p,
            program: p.program.map(d => d.id === dayId ? { ...d, schedule: [...d.schedule, newItem] } : d),
        }));
    };

    const handleScheduleItemChange = (dayId: string, itemId: string, field: string, value: string) => {
        setFormData(p => ({
            ...p,
            program: p.program.map(d =>
                d.id === dayId
                ? { ...d, schedule: d.schedule.map(item => item.id === itemId ? { ...item, [field]: value } : item) }
                : d
            ),
        }));
    };

    const removeScheduleItem = (dayId: string, itemId: string) => {
         setFormData(p => ({
            ...p,
            program: p.program.map(d =>
                d.id === dayId
                ? { ...d, schedule: d.schedule.filter(item => item.id !== itemId) }
                : d
            ),
        }));
    }

    const handleTaskChange = (taskId, field, value) => {
        setFormData(prev => ({
            ...prev,
            tasks: prev.tasks.map(task => task.id === taskId ? { ...task, [field]: value } : task)
        }));
    };

    const handleAddTask = (phase) => {
        const newTask = {
            id: nanoid(),
            title: '',
            assigneeId: null,
            assigneeName: '',
            dueDate: new Date().toISOString().split('T')[0],
            status: 'To Do',
            phase: phase,
        };
        setFormData(prev => ({ ...prev, tasks: [...(prev.tasks || []), newTask] }));
    };

    const handleRemoveTask = (taskId) => {
        setFormData(prev => ({ ...prev, tasks: prev.tasks.filter(task => task.id !== taskId) }));
    };

    const tasksByPhase = useMemo(() => {
        const tasks = formData?.tasks || [];
        return {
            before: tasks.filter(t => t.phase === 'Vor dem Camp'),
            during: tasks.filter(t => t.phase === 'Während dem Camp'),
            after: tasks.filter(t => t.phase === 'Nach dem Camp'),
        };
    }, [formData?.tasks]);


    if (!formData) return null;

    const availableStaff = allStaff.filter(s =>
        !formData.staff?.some(assigned => assigned.id === s.id) &&
        s.name.toLowerCase().includes(staffSearchTerm.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{bootcamp ? 'Bootcamp bearbeiten' : 'Neues Bootcamp erstellen'}</DialogTitle>
                </DialogHeader>
                 <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-7">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="images">Bilder</TabsTrigger>
                        <TabsTrigger value="financials">Finanzen</TabsTrigger>
                        <TabsTrigger value="staff">Staff</TabsTrigger>
                        <TabsTrigger value="program">Programm</TabsTrigger>
                        <TabsTrigger value="tasks">Aufgaben</TabsTrigger>
                        <TabsTrigger value="registrations">Anmeldungen ({formData.registrations?.length || 0})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="pt-4">
                        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name des Bootcamps</Label>
                                <Input id="name" value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} />
                            </div>
                             <div className="space-y-2">
                                <Label>Fokus</Label>
                                <FocusSelector selected={formData.focus} onToggle={handleFocusToggle} onAdd={handleAddCustomFocus} disabled={false} />
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Ort</Label>
                                    <Select value={formData.location} onValueChange={(val) => setFormData(p => ({...p, location: val}))}>
                                        <SelectTrigger><SelectValue placeholder="Anlage auswählen..."/></SelectTrigger>
                                        <SelectContent>
                                            {(facilities || []).map(f => (
                                                <SelectItem key={f.id} value={f.name}>{f.name} ({f.location})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Region</Label>
                                     <Select value={formData.region} onValueChange={(val) => setFormData(p => ({...p, region: val}))}>
                                        <SelectTrigger><SelectValue placeholder="Region auswählen..."/></SelectTrigger>
                                        <SelectContent>
                                            {Object.values(cantonPaths).map(c => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Datum</Label>
                                <DatePickerWithRange date={formData.dateRange} onDateChange={(d) => setFormData(p => ({...p, dateRange: d}))} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="maxParticipants">Max. Teilnehmer</Label>
                                    <Input id="maxParticipants" type="number" value={formData.maxParticipants} onChange={(e) => setFormData(p => ({...p, maxParticipants: parseInt(e.target.value) || 0}))} />
                                </div>
                                 <div className="space-y-2">
                                    <Label>Preis</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="price"
                                            type="number"
                                            value={formData.offer?.price || ''}
                                            onChange={(e) => setFormData(p => ({ ...p, offer: { ...p.offer, price: parseFloat(e.target.value) } }))}
                                            placeholder="z.B. 500"
                                        />
                                        <Select
                                            value={formData.offer?.priceType || 'pro Person'}
                                            onValueChange={(val) => setFormData(p => ({ ...p, offer: { ...p.offer, priceType: val } }))}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pro Person">pro Person</SelectItem>
                                                <SelectItem value="pauschal">pauschal</SelectItem>
                                                <SelectItem value="pro Team">pro Team</SelectItem>
                                                <SelectItem value="Auf Anfrage">Auf Anfrage</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={formData.status} onValueChange={(val) => setFormData(p => ({...p, status: val}))}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Entwurf">Entwurf</SelectItem>
                                            <SelectItem value="Online">Online</SelectItem>
                                            <SelectItem value="In Durchführung">In Durchführung</SelectItem>
                                            <SelectItem value="Abgeschlossen">Abgeschlossen</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Anmeldeschluss</Label>
                                    <DatePicker date={formData.registrationDeadline} onDateChange={(d) => setFormData(p => ({...p, registrationDeadline: d}))} />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="description">Beschreibung</Label>
                                <Textarea id="description" value={formData.description} onChange={(e) => setFormData(p => ({...p, description: e.target.value}))} />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="images" className="pt-4">
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            <Label>Bildergalerie (bis zu 4 Bilder, max. 1MB pro Bild)</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {formData.galleryImages.map((imgSrc, index) => (
                                    <div key={index} className="relative group aspect-video">
                                        <Image src={imgSrc} alt={`Vorschau ${index + 1}`} layout="fill" className="object-cover rounded-md" />
                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <Button size="sm" variant="secondary" onClick={() => setFormData(p => ({...p, featuredImage: imgSrc}))}>
                                                 <Star className={`mr-2 h-4 w-4 ${formData.featuredImage === imgSrc ? 'fill-yellow-400 text-yellow-500' : ''}`} />
                                                 {formData.featuredImage === imgSrc ? 'Featured' : 'Als Titelbild'}
                                            </Button>
                                            <Button size="icon" variant="destructive" onClick={() => handleRemoveImage(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {formData.featuredImage === imgSrc && (
                                            <div className="absolute top-2 left-2 p-1 bg-yellow-400 text-black rounded-full">
                                                <Star className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {formData.galleryImages.length < 4 && (
                                    <div className="aspect-video border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                        <Upload className="h-8 w-8 text-muted-foreground mb-2"/>
                                        <p className="text-sm text-muted-foreground">Bild hinzufügen</p>
                                    </div>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" multiple className="hidden"/>
                        </div>
                    </TabsContent>
                    <TabsContent value="financials" className="pt-4">
                         <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                             <div className="space-y-2">
                                <Label htmlFor="siblingDiscountPercentage">Geschwisterrabatt (in %)</Label>
                                <Input
                                    id="siblingDiscountPercentage"
                                    type="number"
                                    placeholder="z.B. 10"
                                    value={formData.financials?.siblingDiscountPercentage || ''}
                                    onChange={(e) => setFormData(p => ({...p, financials: {...p.financials, siblingDiscountPercentage: parseInt(e.target.value, 10)}}))}
                                />
                                <p className="text-xs text-muted-foreground">Ein Rabatt für das zweite und jedes weitere Kind derselben Anmeldung.</p>
                            </div>
                             <div className="space-y-2 p-4 border rounded-md">
                                <Label className="font-semibold">Coupon-Konfiguration</Label>
                                <div className="space-y-2">
                                    <Label htmlFor="couponCode">Anwendbarer Coupon-Code</Label>
                                    <Input
                                        id="couponCode"
                                        placeholder="z.B. SOMMER2024"
                                        value={formData.financials?.couponConfig?.code || ''}
                                        onChange={(e) => setFormData(p => ({ ...p, financials: { ...p.financials, couponConfig: { ...p.financials.couponConfig, code: e.target.value.toUpperCase() } } }))}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="couponDiscountType">Rabatt-Typ</Label>
                                        <Select value={formData.financials?.couponConfig?.discountType || 'percentage'} onValueChange={(val) => setFormData(p => ({ ...p, financials: { ...p.financials, couponConfig: { ...p.financials.couponConfig, discountType: val } } }))}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">Prozentual (%)</SelectItem>
                                                <SelectItem value="fixed">Fester Betrag (CHF)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="couponDiscountValue">Rabatt-Wert</Label>
                                        <Input
                                            id="couponDiscountValue"
                                            type="number"
                                            value={formData.financials?.couponConfig?.discountValue || ''}
                                            onChange={(e) => setFormData(p => ({ ...p, financials: { ...p.financials, couponConfig: { ...p.financials.couponConfig, discountValue: parseFloat(e.target.value) || 0 } } }))}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="couponMaxUsage">Maximale Einlösungen</Label>
                                    <Input
                                        id="couponMaxUsage"
                                        type="number"
                                        value={formData.financials?.couponConfig?.maxUsage || ''}
                                        onChange={(e) => setFormData(p => ({ ...p, financials: { ...p.financials, couponConfig: { ...p.financials.couponConfig, maxUsage: parseInt(e.target.value) || 0 } } }))}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Diesen Code können Teilnehmer bei der Anmeldung für einen Rabatt eingeben.</p>
                            </div>
                        </div>
                    </TabsContent>
                     <TabsContent value="staff" className="pt-4">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Verfügbarer Staff</h4>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Staff suchen..." className="pl-8" value={staffSearchTerm} onChange={e => setStaffSearchTerm(e.target.value)} />
                                </div>
                                <ScrollArea className="h-48 border rounded-md p-2">
                                    {availableStaff.map(s => (
                                        <div key={s.id} className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer rounded-md" onClick={() => handleAddStaff(s)}>
                                            <span>{s.name} ({s.position})</span>
                                            <UserPlus className="h-4 w-4 text-primary" />
                                        </div>
                                    ))}
                                </ScrollArea>
                            </div>
                             <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Zugewiesener Staff</h4>
                                 <ScrollArea className="h-64 border rounded-md p-2">
                                    {formData.staff?.map(s => (
                                        <div key={s.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                                             <div>
                                                <p className="font-medium">{s.name}</p>
                                                <p className="text-xs text-muted-foreground">{s.role}</p>
                                            </div>
                                            <Button size="sm" variant="ghost" onClick={() => handleRemoveStaff(s.id)}><Trash2 className="h-4 w-4"/></Button>
                                        </div>
                                    ))}
                                </ScrollArea>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="program" className="pt-4">
                       <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            {formData.program.map((day) => (
                                <Card key={day.id}>
                                    <CardHeader className="flex flex-row items-center justify-between p-4">
                                        <Input
                                            value={day.day}
                                            onChange={(e) => handleDayNameChange(day.id, e.target.value)}
                                            className="text-lg font-bold border-0 shadow-none -ml-3 p-1 h-auto"
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => removeDay(day.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 space-y-2">
                                        {day.schedule.map(item => (
                                            <div key={item.id} className="grid grid-cols-[auto,1fr,1fr,1fr,auto] items-center gap-2">
                                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab"/>
                                                <Input placeholder="Zeit (z.B. 09:00)" value={item.time} onChange={(e) => handleScheduleItemChange(day.id, item.id, 'time', e.target.value)}/>
                                                <Input placeholder="Aktivität" value={item.activity} onChange={(e) => handleScheduleItemChange(day.id, item.id, 'activity', e.target.value)}/>
                                                <Input placeholder="Ort" value={item.location || ''} onChange={(e) => handleScheduleItemChange(day.id, item.id, 'location', e.target.value)}/>
                                                <Button variant="ghost" size="icon" onClick={() => removeScheduleItem(day.id, item.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </div>
                                        ))}
                                        <Button variant="outline" size="sm" onClick={() => addScheduleItem(day.id)}>
                                            <PlusCircle className="mr-2 h-4 w-4"/> Programmeintrag
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                            <Button variant="secondary" className="w-full" onClick={addDay}>
                               <PlusCircle className="mr-2 h-4 w-4"/> Tag hinzufügen
                            </Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="tasks" className="pt-4">
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                           <TaskSection
                                title="Vor dem Camp"
                                tasks={tasksByPhase.before}
                                staff={formData.staff}
                                onTaskChange={handleTaskChange}
                                onAddTask={() => handleAddTask('Vor dem Camp')}
                                onRemoveTask={handleRemoveTask}
                           />
                           <TaskSection
                                title="Während dem Camp"
                                tasks={tasksByPhase.during}
                                staff={formData.staff}
                                onTaskChange={handleTaskChange}
                                onAddTask={() => handleAddTask('Während dem Camp')}
                                onRemoveTask={handleRemoveTask}
                            />
                           <TaskSection
                                title="Nach dem Camp"
                                tasks={tasksByPhase.after}
                                staff={formData.staff}
                                onTaskChange={handleTaskChange}
                                onAddTask={() => handleAddTask('Nach dem Camp')}
                                onRemoveTask={handleRemoveTask}
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="registrations" className="pt-4">
                       <ScrollArea className="h-[70vh] -mr-6 pr-6">
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-4">
                                     <Card>
                                        <CardHeader><CardTitle className="text-base">Anmeldungen ({formData.registrations.length})</CardTitle></CardHeader>
                                        <CardContent className="space-y-2">
                                            <Accordion type="multiple" className="w-full">
                                                {formData.registrations.map(reg => (
                                                    <AccordionItem value={reg.userId} key={reg.userId}>
                                                        <AccordionTrigger className="p-2 bg-muted/50 rounded-md hover:bg-muted">
                                                            <div className="flex justify-between items-center w-full pr-2">
                                                                <span>{reg.name}</span>
                                                                <Badge variant={reg.status === 'confirmed' ? 'default' : 'secondary'} className={reg.status === 'confirmed' ? 'bg-green-500' : ''}>{reg.status}</Badge>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="p-4">
                                                            <h4 className="font-semibold mb-2">Bewertung</h4>
                                                            <div className="space-y-3">
                                                                {evaluationAttributes.map(attr => (
                                                                     <div key={attr.id} className="space-y-1">
                                                                        <Label className="text-xs">{attr.name}: {reg.evaluation?.[attr.id] || 0} / 5</Label>
                                                                        <Slider
                                                                            value={[reg.evaluation?.[attr.id] || 0]}
                                                                            onValueChange={(val) => handleEvaluationChange(reg.userId, attr.id, val[0])}
                                                                            max={5}
                                                                            step={1}
                                                                        />
                                                                    </div>
                                                                ))}
                                                                <Textarea placeholder="Positive Bemerkungen..." value={reg.evaluation?.positiveNotes || ''} onChange={(e) => handleEvaluationChange(reg.userId, 'positiveNotes', e.target.value)} />
                                                                <Textarea placeholder="Negative Bemerkungen..." value={reg.evaluation?.negativeNotes || ''} onChange={(e) => handleEvaluationChange(reg.userId, 'negativeNotes', e.target.value)} />
                                                            </div>
                                                            <h4 className="font-semibold mt-4 mb-2">Anwesenheit</h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {formData.program.map(day => (
                                                                    <div key={day.id} className="flex items-center gap-2 p-2 border rounded-md">
                                                                        <Checkbox 
                                                                            id={`att-${reg.userId}-${day.id}`} 
                                                                            checked={reg.attendance?.[day.id]}
                                                                            onCheckedChange={checked => handleAttendanceChange(reg.userId, day.id, !!checked)}
                                                                        />
                                                                        <Label htmlFor={`att-${reg.userId}-${day.id}`} className="text-sm">{day.day}</Label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader><CardTitle className="text-base">Warteliste ({formData.waitlist.length})</CardTitle></CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex gap-2">
                                                <Input value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} placeholder="Name des Spielers"/>
                                                <Button size="sm" onClick={() => handleAddParticipant('waitlist')}>Hinzufügen</Button>
                                            </div>
                                             {formData.waitlist.map(reg => (
                                                <div key={reg.userId} className="flex justify-between items-center text-sm p-1.5 bg-muted/50 rounded-md">
                                                    <span>{reg.name}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveParticipant(reg.userId, 'waitlist')}><Trash2 className="h-4 w-4"/></Button>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                       </ScrollArea>
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={handleSave} disabled={isUploading}>
                        {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {isUploading ? 'Speichere...' : 'Speichern'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
