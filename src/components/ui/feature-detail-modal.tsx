
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar, User, Tag, Sparkles, PlusCircle, Trash2, Edit, Save, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

const statusOptions = [
    { value: 'review', label: 'Zur Prüfung' },
    { value: 'planned', label: 'Geplant' },
    { value: 'inProgress', label: 'In Entwicklung' },
    { value: 'beta', label: 'Beta' },
    { value: 'done', label: 'Fertig' },
    { value: 'rejected', label: 'Abgelehnt' },
];

const categoryOptions = [
    { value: 'New Feature', label: 'Neues Feature' },
    { value: 'Improvement', label: 'Verbesserung' },
    { value: 'ai', label: 'KI-Funktion' },
    { value: 'Bug Report', label: 'Fehlerbehebung' },
    { value: 'Other', label: 'Anderes' },
];


export const FeatureDetailModal = ({ feature, isOpen, onOpenChange, onUpdateFeature }) => {
  if (!feature) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(feature);
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    setFormData(feature);
  }, [feature]);

  const handleInputChange = (field, value) => {
      setFormData(prev => ({...prev, [field]: value}));
  };

  const handleTaskToggle = (taskId) => {
    const updatedTasks = formData.tasks.map(task =>
      task.id === taskId ? { ...task, done: !task.done } : task
    );
    setFormData(prev => ({...prev, tasks: updatedTasks}));
  };

  const handleAddTask = () => {
    if (newTaskText.trim() === '') return;
    const newTask = {
      id: Date.now(),
      text: newTaskText,
      done: false,
    };
    const updatedTasks = [...formData.tasks, newTask];
    setFormData(prev => ({...prev, tasks: updatedTasks}));
    setNewTaskText('');
  };

  const handleRemoveTask = (taskId) => {
    const updatedTasks = formData.tasks.filter(task => task.id !== taskId);
    setFormData(prev => ({...prev, tasks: updatedTasks}));
  };

  const handleSave = () => {
      onUpdateFeature(formData);
      setIsEditing(false);
  }
  
  const completedTasks = formData.tasks.filter(t => t.done).length;
  const progress = formData.tasks.length > 0 ? (completedTasks / formData.tasks.length) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{formData.name}</DialogTitle>
          <DialogDescription>{formData.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                 <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="h-4 w-4"/>Timeline</Label>
                    {isEditing ? (
                        <Input value={formData.timeline} onChange={(e) => handleInputChange('timeline', e.target.value)} />
                    ) : (
                        <p className="font-semibold">{formData.timeline}</p>
                    )}
                 </div>
                 <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs text-muted-foreground"><User className="h-4 w-4"/>Assigned</Label>
                    {isEditing ? (
                        <Input value={formData.assignedTo} onChange={(e) => handleInputChange('assignedTo', e.target.value)} />
                    ) : (
                        <p className="font-semibold">{formData.assignedTo || 'Unassigned'}</p>
                    )}
                 </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs text-muted-foreground"><Tag className="h-4 w-4"/>Status</Label>
                    {isEditing ? (
                        <Select value={formData.status} onValueChange={(val) => handleInputChange('status', val)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {statusOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    ) : (
                         <p className="font-semibold capitalize">{statusOptions.find(o => o.value === formData.status)?.label || formData.status}</p>
                    )}
                 </div>
                 <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-xs text-muted-foreground">
                        {formData.category === 'ai' ? <Sparkles className="h-4 w-4"/> : <div className="w-4 h-4"/>}
                        Category
                    </Label>
                     {isEditing ? (
                        <Select value={formData.category} onValueChange={(val) => handleInputChange('category', val)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                               {categoryOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                     ) : (
                         <p className="font-semibold capitalize">{formData.category}</p>
                     )}
                 </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Checkliste zur Umsetzung</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 mb-4">
                        <Label>Fortschritt</Label>
                        <Progress value={progress} />
                        <p className="text-xs text-muted-foreground text-right">{completedTasks} von {formData.tasks.length} Aufgaben erledigt.</p>
                    </div>
                     <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {formData.tasks.map((task) => (
                          <div key={task.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 group">
                            <Checkbox 
                                id={`task-${'\'\'\''}{task.id}`} 
                                checked={task.done}
                                onCheckedChange={() => handleTaskToggle(task.id)}
                                disabled={!isEditing}
                            />
                            <label
                              htmlFor={`task-${'\'\'\''}{task.id}`}
                              className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {task.text}
                            </label>
                            {isEditing && (
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveTask(task.id)}>
                                <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      {isEditing && (
                        <div className="mt-4 flex items-center gap-2">
                            <Input 
                                placeholder="Neue Aufgabe hinzufügen..."
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                            />
                            <Button size="icon" onClick={handleAddTask}>
                                <PlusCircle className="h-4 w-4" />
                            </Button>
                        </div>
                      )}
                </CardContent>
            </Card>
        </div>
        <DialogFooter>
            {isEditing ? (
                 <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}><X className="mr-2 h-4 w-4"/>Abbrechen</Button>
                    <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/>Speichern</Button>
                 </div>
            ) : (
                <div className="flex justify-between w-full">
                    <Button variant="outline" onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4"/>Bearbeiten</Button>
                    <DialogClose asChild>
                        <Button type="button">Schliessen</Button>
                    </DialogClose>
                </div>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
