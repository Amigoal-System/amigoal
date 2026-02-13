'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Label } from './label';
import { Slider } from './slider';
import { Textarea } from './textarea';
import { Save, Trash2 } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

const scoutingAttributes = [
    { key: 'technik', label: 'Technik' },
    { key: 'spielintelligenz', label: 'Spielintelligenz' },
    { key: 'athletik', label: 'Athletik' },
    { key: 'mentalitaet', label: 'Mentalität' },
];

export const PlayerScoutingDetailModal = ({ player, isOpen, onOpenChange, onSave, onRemove }) => {
    const [formData, setFormData] = useState(null);
    const { toast } = useToast();

    useEffect(() => {
        if (player) {
            setFormData({
                ...player,
                id: player.id || player.spielerNr, // Ensure ID is set correctly
                attributes: player.attributes || { technik: 6, spielintelligenz: 7, athletik: 5, mentalitaet: 8 },
                potential: player.potential || 0,
            });
        }
    }, [player]);

    if (!player) return null;

    const handleSave = () => {
        if (!formData || !formData.id) {
            toast({
                title: "Fehler",
                description: "Spieler-ID fehlt. Kann nicht speichern.",
                variant: "destructive",
            });
            return;
        }
        onSave(formData);
        onOpenChange(false);
    };

    const handleRemove = () => {
        if (!formData || !formData.id) {
             toast({
                title: "Fehler",
                description: "Spieler-ID fehlt. Kann nicht gelöscht werden.",
                variant: "destructive",
            });
            return;
        }
        onRemove(formData.id);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="w-16 h-16">
                            <AvatarImage src={formData?.avatarUrl} />
                            <AvatarFallback>{formData?.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                             <DialogTitle className="text-2xl font-bold">{formData?.name}</DialogTitle>
                            <DialogDescription>
                                {formData?.position} | {formData?.teamName} | Jahrgang: {formData?.birthYear}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="space-y-3">
                        <Label htmlFor="scoutRating">Potenzial-Score: {formData?.potential.toFixed(1) || 0}/5</Label>
                        <Slider
                            id="potential"
                            min={0}
                            max={5}
                            step={0.1}
                            value={[formData?.potential || 0]}
                            onValueChange={(value) => setFormData(p => ({ ...p, potential: value[0] }))}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        {scoutingAttributes.map(({key, label}) => (
                             <div key={key} className="space-y-1">
                                <Label className="text-xs">{label}: {formData?.attributes[key] || 0} / 10</Label>
                                <Slider
                                    min={0}
                                    max={10}
                                    step={1}
                                    value={[formData?.attributes[key] || 0]}
                                    onValueChange={(value) => setFormData(p => ({ ...p, attributes: {...p.attributes, [key]: value[0]} }))}
                                />
                            </div>
                        ))}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="scoutNotes">Einschätzung & Notizen</Label>
                        <Textarea 
                            id="scoutNotes" 
                            rows={6}
                            value={formData?.scoutNotes || ''}
                            onChange={(e) => setFormData(p => ({...p, scoutNotes: e.target.value}))}
                            placeholder="Stärken, Schwächen, Entwicklungspotenzial..."
                        />
                    </div>
                </div>
                <DialogFooter className="justify-between">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Von Watchlist entfernen
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Wirklich entfernen?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Möchten Sie {formData?.name} wirklich von Ihrer Watchlist entfernen?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction onClick={handleRemove}>Entfernen</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4"/> Speichern
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
