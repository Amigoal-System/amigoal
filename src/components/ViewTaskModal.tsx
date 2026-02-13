
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import { Save, Edit } from 'lucide-react';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';


const mockUsers = [
    { id: 'pep-g', name: 'Pep Guardiola' },
    { id: 'marina-g', name: 'Marina G.' },
    { id: 'max-m', name: 'Max Mustermann' },
];

export const CreateTaskModal = ({ isOpen, onOpenChange, onSave }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState<Date | undefined>(new Date());
    const [priority, setPriority] = useState('Medium');
    const [assignee, setAssignee] = useState('self');
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDueDate(new Date());
        setPriority('Medium');
        setAssignee('self');
    };

    const handleSave = () => {
        if (!title) {
            toast({ title: "Titel fehlt", description: "Bitte geben Sie einen Titel für die Aufgabe an.", variant: "destructive" });
            return;
        }
        
        setIsSaving(true);
        const newTask = { title, description, dueDate: dueDate?.toISOString(), priority, assignee };
        onSave(newTask, assignee !== 'self');
        
        setTimeout(() => {
            toast({ title: "Aufgabe erstellt!", description: `Die Aufgabe "${title}" wurde hinzugefügt.` });
            onOpenChange(false);
            resetForm();
            setIsSaving(false);
        }, 500);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            onOpenChange(open);
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Neue Aufgabe erstellen</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Titel</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Beschreibung</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Fälligkeitsdatum</Label>
                            <DatePicker date={dueDate} onDateChange={setDueDate} />
                        </div>
                        <div className="space-y-2">
                            <Label>Priorität</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="High">Hoch</SelectItem>
                                    <SelectItem value="Medium">Mittel</SelectItem>
                                    <SelectItem value="Low">Niedrig</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label>Zuweisen an</Label>
                        <Select value={assignee} onValueChange={setAssignee}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="self">Mich selbst</SelectItem>
                                {mockUsers.map(user => <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={handleSave} disabled={isSaving}>Speichern</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export const ViewTaskModal = ({ task, isOpen, onOpenChange, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(task);

    useEffect(() => {
        setFormData(task);
        setIsEditing(false); // Reset edit mode when task changes
    }, [task]);

    if (!task) return null;

    const handleInputChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const handleSave = () => {
        onUpdate(formData);
        setIsEditing(false);
    };

    return (
         <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Aufgabe bearbeiten' : task.title}</DialogTitle>
                    <DialogDescription>
                        Fällig am: {new Date(task.dueDate).toLocaleDateString('de-CH')}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                     {isEditing ? (
                        <>
                             <div className="space-y-2">
                                <Label htmlFor="edit-title">Titel</Label>
                                <Input id="edit-title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-description">Beschreibung</Label>
                                <Textarea id="edit-description" value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Priorität</Label>
                                <Select value={formData.priority} onValueChange={(val) => handleInputChange('priority', val)}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="High">Hoch</SelectItem>
                                        <SelectItem value="Medium">Mittel</SelectItem>
                                        <SelectItem value="Low">Niedrig</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-1">
                                <Label>Beschreibung</Label>
                                <p className="text-sm p-3 bg-muted rounded-md min-h-20">{task.description || 'Keine Beschreibung.'}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <div><Label>Priorität</Label><p><Badge>{task.priority}</Badge></p></div>
                                <div><Label>Status</Label><p><Badge variant="outline">{task.status}</Badge></p></div>
                                <div><Label>Von</Label><p>{task.from}</p></div>
                            </div>
                        </>
                    )}
                </div>
                <DialogFooter>
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Abbrechen</Button>
                            <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Speichern</Button>
                        </>
                    ) : (
                        <>
                             <Button variant="outline" onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4"/> Bearbeiten</Button>
                             <DialogClose asChild>
                                <Button>Schliessen</Button>
                             </DialogClose>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
