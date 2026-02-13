
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { HonoraryMember } from '@/ai/flows/wallOfFame.types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2 } from 'lucide-react';

const emptyMember: Omit<HonoraryMember, 'id'> = {
  name: '',
  title: '',
  image: '',
  dataAiHint: '',
  achievements: [],
};

export const WallOfFameModal = ({ member, isOpen, onOpenChange, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<HonoraryMember>>(member || emptyMember);
  const [achievementsText, setAchievementsText] = useState('');

  useEffect(() => {
    if (member) {
      setFormData(member);
      setAchievementsText(member.achievements.join('\n'));
    } else {
      setFormData(emptyMember);
      setAchievementsText('');
    }
  }, [member, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    if (id === 'achievements') {
      setAchievementsText(value);
    } else {
      setFormData(prev => ({ ...prev, [id]: value }));
    }
  };

  const handleSave = () => {
    const achievementsArray = achievementsText.split('\n').filter(a => a.trim() !== '');
    onSave({ ...formData, achievements: achievementsArray });
  };
  
  const handleDelete = () => {
    if(formData.id) {
        onDelete(formData.id);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{member ? `Ehrenmitglied bearbeiten` : 'Neues Ehrenmitglied hinzufügen'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={formData.name || ''} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="title">Titel</Label>
                <Input id="title" value={formData.title || ''} onChange={handleInputChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="image">Bild-URL</Label>
                <Input id="image" value={formData.image || ''} onChange={handleInputChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="dataAiHint">Bild-Hinweis (für KI)</Label>
                <Input id="dataAiHint" value={formData.dataAiHint || ''} onChange={handleInputChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="achievements">Verdienste (eine pro Zeile)</Label>
                <Textarea id="achievements" value={achievementsText} onChange={handleInputChange} rows={5}/>
            </div>
        </div>
        <DialogFooter className="justify-between">
            <div>
            {member && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Löschen
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                            <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Löschen bestätigen</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button onClick={handleSave}>Speichern</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
