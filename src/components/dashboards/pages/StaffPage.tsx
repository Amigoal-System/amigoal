
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, Save, List, LayoutGrid, SlidersHorizontal, User, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useStaff } from '@/hooks/useStaff'; 
import type { AmigoalStaff, HistoryItem } from '@/ai/flows/amigoalStaff.types';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { useTeam } from '@/hooks/use-team';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TestimonialSlider } from '@/components/ui/testimonial-slider';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { EmailComposerModal } from '@/components/ui/email-composer-modal';


const availableRoles = ['Super-Admin', 'Marketing', 'Administration', 'Finanzen', 'Techniker'];

const StaffModal = ({ staffMember, isOpen, onOpenChange, onSave }) => {
    const [formData, setFormData] = useState<Partial<AmigoalStaff> | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(staffMember || {
                name: '', email: '', roles: [], status: 'Aktiv',
                address: {}, employment: {}, skills: { qualifications: [], knowhow: [], languages: [] }, history: [], avatar: null
            });
        }
    }, [staffMember, isOpen]);

    if (!formData) return null;
    
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => prev ? ({ ...prev, avatar: event.target?.result as string }) : null);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({...prev!, [e.target.id]: e.target.value}));
    };
    
    const handleNestedChange = (obj: string, field: string, value: string | number) => {
        setFormData(prev => ({
            ...prev!,
            [obj]: { ...(prev[obj] || {}), [field]: value }
        }));
    };

    const handleSkillsChange = (type: 'qualifications' | 'knowhow' | 'languages', value: string) => {
        setFormData(prev => ({
            ...prev!,
            skills: { ...(prev.skills || {}), [type]: value.split(',').map(s => s.trim()) }
        }));
    };
    
    const handleRoleToggle = (role: string) => {
        setFormData(prev => {
            if (!prev) return null;
            const newRoles = prev.roles?.includes(role)
                ? prev.roles.filter(r => r !== role)
                : [...(prev.roles || []), role];
            return {...prev, roles: newRoles};
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{formData.id ? 'Staff-Mitglied bearbeiten' : 'Neues Staff-Mitglied'}</DialogTitle>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-y-auto pr-4 -mr-4">
                    <Tabs defaultValue="personal">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="personal">Persönlich</TabsTrigger>
                            <TabsTrigger value="employment">Anstellung</TabsTrigger>
                            <TabsTrigger value="skills">Fähigkeiten</TabsTrigger>
                        </TabsList>
                        <TabsContent value="personal" className="pt-4 space-y-4">
                             <div className="flex items-center gap-4">
                                <div className="w-24 h-24 rounded-full border bg-muted flex items-center justify-center cursor-pointer" onClick={handleAvatarClick}>
                                    {formData.avatar ? <Image src={formData.avatar} alt="Avatar" width={96} height={96} className="w-full h-full object-cover rounded-full"/> : <User className="w-12 h-12 text-muted-foreground"/>}
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" value={formData.name || ''} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="position">Position</Label>
                                        <Input id="position" value={formData.position || ''} onChange={handleInputChange} />
                                    </div>
                                </div>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">E-Mail</Label>
                                    <Input id="email" type="email" value={formData.email || ''} onChange={handleInputChange} placeholder="name@amigoal.ch" />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="phone">Telefon</Label>
                                    <Input id="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Adresse</Label>
                                <div className="grid grid-cols-5 gap-2">
                                    <Input placeholder="Strasse" value={formData.address?.street || ''} onChange={(e) => handleNestedChange('address', 'street', e.target.value)} className="col-span-3"/>
                                    <Input placeholder="PLZ" value={formData.address?.zip || ''} onChange={(e) => handleNestedChange('address', 'zip', e.target.value)} className="col-span-1"/>
                                    <Input placeholder="Ort" value={formData.address?.city || ''} onChange={(e) => handleNestedChange('address', 'city', e.target.value)} className="col-span-1"/>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <Label htmlFor="birthdate">Geburtsdatum</Label>
                                    <Input id="birthdate" type="date" value={formData.birthdate || ''} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ahvNumber">AHV-Nummer</Label>
                                    <Input id="ahvNumber" value={formData.ahvNumber || ''} onChange={handleInputChange} />
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="employment" className="pt-4 space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <Label htmlFor="entryDate">Eintrittsdatum</Label>
                                    <Input id="entryDate" type="date" value={formData.employment?.entryDate || ''} onChange={(e) => handleNestedChange('employment', 'entryDate', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="exitDate">Austrittsdatum</Label>
                                    <Input id="exitDate" type="date" value={formData.employment?.exitDate || ''} onChange={(e) => handleNestedChange('employment', 'exitDate', e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="workload">Pensum (%)</Label>
                                    <Input id="workload" type="number" value={formData.employment?.workload || ''} onChange={(e) => handleNestedChange('employment', 'workload', e.target.value)} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="salary">Lohn (pro Monat)</Label>
                                    <Input id="salary" type="number" value={formData.employment?.salary || ''} onChange={(e) => handleNestedChange('employment', 'salary', e.target.value)} />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label>Rollen</Label>
                                <div className="grid grid-cols-3 gap-2 p-3 border rounded-md">
                                    {availableRoles.map(role => (
                                        <div key={role} className="flex items-center gap-2">
                                            <Checkbox id={`role-${role}`} checked={formData.roles?.includes(role)} onCheckedChange={() => handleRoleToggle(role)} />
                                            <Label htmlFor={`role-${role}`}>{role}</Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="status">Mitarbeiterstatus</Label>
                                <Select value={formData.status} onValueChange={val => handleInputChange({ target: { id: 'status', value: val } })}>
                                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Aktiv">Aktiv</SelectItem>
                                        <SelectItem value="Inaktiv">Inaktiv</SelectItem>
                                        <SelectItem value="Gesperrt">Gesperrt</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="agreements">Vereinbarungen</Label>
                                <Textarea id="agreements" value={formData.agreements || ''} onChange={handleInputChange} rows={3}/>
                            </div>
                        </TabsContent>
                         <TabsContent value="skills" className="pt-4 space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="qualifications">Qualifikationen (Komma-getrennt)</Label>
                                <Textarea id="qualifications" value={formData.skills?.qualifications?.join(', ') || ''} onChange={(e) => handleSkillsChange('qualifications', e.target.value)} rows={2}/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="knowhow">Know-How / Spezialgebiete (Komma-getrennt)</Label>
                                <Textarea id="knowhow" value={formData.skills?.knowhow?.join(', ') || ''} onChange={(e) => handleSkillsChange('knowhow', e.target.value)} rows={2}/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="languages">Sprachen (Komma-getrennt)</Label>
                                <Textarea id="languages" value={formData.skills?.languages?.join(', ') || ''} onChange={(e) => handleSkillsChange('languages', e.target.value)} rows={2}/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="notes">Notizen / Spezielles</Label>
                                <Textarea id="notes" value={formData.notes || ''} onChange={handleInputChange} rows={4}/>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={() => onSave(formData)}><Save className="mr-2 h-4 w-4"/> Speichern</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function StaffPage() {
    const { staff, isLoading, addStaff, updateStaff, deleteStaff, fetchStaff } = useStaff();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStaffMember, setSelectedStaffMember] = useState<AmigoalStaff | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const { lang } = useTeam();
    
    const handleSave = async (staffData: any) => {
        try {
            if (staffData.id) {
                await updateStaff(staffData);
                toast({ title: 'Mitarbeiter aktualisiert' });
            } else {
                await addStaff(staffData);
                toast({ title: 'Mitarbeiter hinzugefügt' });
            }
            fetchStaff();
            setIsModalOpen(false);
        } catch(e) {
            toast({ title: 'Fehler beim Speichern', description: (e as Error).message, variant: 'destructive'});
        }
    };
    
    const handleDelete = async (staffId: string) => {
        try {
            await deleteStaff(staffId);
            toast({ title: 'Mitarbeiter gelöscht' });
            fetchStaff();
        } catch(e) {
             toast({ title: 'Fehler beim Löschen', variant: 'destructive'});
        }
    };

    const handleOpenModal = (staffMember: AmigoalStaff | null) => {
        setSelectedStaffMember(staffMember);
        setIsModalOpen(true);
    };

    if (isLoading) return <p>Lade Staff...</p>

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Staff Management</CardTitle>
                            <CardDescription>Verwalten Sie die internen Mitarbeiter.</CardDescription>
                        </div>
                        <Button onClick={() => handleOpenModal(null)}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Neues Mitglied
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Rollen</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aktionen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staff.map(member => (
                                <TableRow key={member.id} className="cursor-pointer" onClick={() => handleOpenModal(member)}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={member.avatar || undefined} />
                                            <AvatarFallback>{member.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        {member.name}
                                    </TableCell>
                                    <TableCell>{member.position}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {member.roles.map(role => <Badge key={role} variant="outline">{role}</Badge>)}
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant={member.status === 'Aktiv' ? 'default' : 'destructive'} className={member.status === 'Aktiv' ? 'bg-green-500' : ''}>{member.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenModal(member);}}><Edit className="h-4 w-4"/></Button>
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Wirklich löschen?</AlertDialogTitle>
                                                    <AlertDialogDescription>Möchten Sie "{member.name}" wirklich löschen?</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(member.id!)}>Löschen</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <StaffModal 
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                staffMember={selectedStaffMember}
                onSave={handleSave}
            />
        </>
    );
}

```
- src/app/dashboard/staff/page.tsx
- src/components/dashboards/pages/StaffPage.tsx
- src/components/navigation/ProviderNav.tsx
- src/ai/flows/bootcamps.ts
- src/app/dashboard/page.tsx
- src/app/dashboard/layout.tsx