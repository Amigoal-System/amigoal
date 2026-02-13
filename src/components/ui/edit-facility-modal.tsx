
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { Trash2, PlusCircle, Image as ImageIcon, Star, Upload, X, Edit, Save, Building } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Image from 'next/image';
import { ScrollArea } from './scroll-area';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

const ReviewStars = ({ rating, setRating, isEditing }) => (
    <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
            <Star
                key={star}
                className={`h-5 w-5 cursor-pointer ${isEditing ? 'hover:scale-110' : ''} transition-all
                    ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                onClick={() => isEditing && setRating(star)}
            />
        ))}
    </div>
);

const FeatureSelector = ({ selectedFeatures, onToggle, onAdd, isEditing }) => {
    const predefinedFeatures = ['Naturrasen', 'Kunstrasen', 'Flutlicht', 'Garderoben', 'Kraftraum', 'Restaurant'];
    const [newFeature, setNewFeature] = useState('');

    const handleAdd = () => {
        if(newFeature.trim() && !selectedFeatures.includes(newFeature.trim())) {
            onAdd(newFeature.trim());
            setNewFeature('');
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-12 bg-muted/50">
                {predefinedFeatures.map(feature => (
                    <Button
                        key={feature}
                        type="button"
                        variant={selectedFeatures.includes(feature) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => isEditing && onToggle(feature)}
                        disabled={!isEditing}
                        className={!isEditing ? 'cursor-not-allowed' : ''}
                    >
                        {feature}
                    </Button>
                ))}
            </div>
             {isEditing && (
                <div className="flex gap-2">
                    <Input 
                        placeholder="Eigenes Merkmal..." 
                        value={newFeature} 
                        onChange={e => setNewFeature(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && handleAdd()}
                    />
                    <Button type="button" onClick={handleAdd} disabled={!newFeature.trim()}>Hinzufügen</Button>
                </div>
            )}
             {selectedFeatures.length > 0 && !isEditing && (
                <div className="flex flex-wrap gap-1 pt-2">
                    {selectedFeatures.map(feature => (
                        <Badge key={feature} variant="secondary">
                            {feature}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
};


export const EditFacilityModal = ({ isOpen, onOpenChange, facility, onSave, onDelete }) => {
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(!facility?.id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const initialData = facility || { id: null, name: '', location: '', description: '', features: [], images: [], rating: 0, reviews: [], address: '', contactEmail: '', contactPhone: '', owner: 'Eigenbesitz', pitchDetails: { naturalGrass: 0, artificialGrass: 0, smallPitches: 0 } };
      setFormData(initialData);
      setIsEditing(!facility?.id); // Automatically go into edit mode for new facilities
    }
  }, [facility, isOpen]);

  if (!isOpen || !formData) return null;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handlePitchDetailChange = (field: string, value: string) => {
    setFormData(prev => ({...prev, pitchDetails: {...(prev.pitchDetails || {}), [field]: parseInt(value) || 0}}));
  };
  
  const handleFeatureToggle = (feature) => {
    setFormData(prev => {
        const newFeatures = prev.features.includes(feature)
            ? prev.features.filter(f => f !== feature)
            : [...prev.features, feature];
        return { ...prev, features: newFeatures };
    });
  };

  const handleCustomFeatureAdd = (feature) => {
      setFormData(prev => ({...prev, features: [...prev.features, feature]}));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({...prev, images: [...prev.images, event.target?.result as string]}));
            };
            reader.readAsDataURL(file);
        });
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
      setFormData(p => ({...p, images: p.images.filter((_, index) => index !== indexToRemove)}));
  };

  const handleDeleteClick = () => {
    if (formData.id) {
        onDelete(formData.id);
    }
  }

  const handleSaveClick = () => {
      onSave(formData);
      setIsEditing(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
            <div className="flex justify-between items-start">
                <DialogTitle className="text-2xl font-bold">{formData.name || 'Neue Sportanlage'}</DialogTitle>
                {!isEditing && (
                     <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4"/> Bearbeiten
                    </Button>
                )}
            </div>
            <DialogDescription>{formData.location}</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
            {/* Left Column */}
            <div className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="name">Name der Anlage</Label>
                    <Input id="name" value={formData.name || ''} onChange={handleChange} readOnly={!isEditing} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="location">Ort (z.B. Stadt, Land)</Label>
                    <Input id="location" value={formData.location || ''} onChange={handleChange} readOnly={!isEditing} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="address">Vollständige Adresse</Label>
                    <Textarea id="address" value={formData.address || ''} onChange={handleChange} rows={2} readOnly={!isEditing}/>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="contactEmail">Kontakt E-Mail</Label>
                        <Input id="contactEmail" type="email" value={formData.contactEmail || ''} onChange={handleChange} readOnly={!isEditing}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="contactPhone">Kontakt Telefon</Label>
                        <Input id="contactPhone" type="tel" value={formData.contactPhone || ''} onChange={handleChange} readOnly={!isEditing}/>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Beschreibung</Label>
                    <Textarea id="description" value={formData.description || ''} onChange={handleChange} rows={4} readOnly={!isEditing}/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="owner">Eigentümer</Label>
                    <Select value={formData.owner} onValueChange={(val) => setFormData(p => ({ ...p, owner: val }))} disabled={!isEditing}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Eigenbesitz">Eigenbesitz</SelectItem>
                            <SelectItem value="Zugelieferer">Zugelieferer / Gemietet</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {/* Right Column */}
            <div className="space-y-6">
                 <div className="space-y-2">
                    <Label htmlFor="features">Ausstattung</Label>
                     <FeatureSelector 
                        selectedFeatures={formData.features || []}
                        onToggle={handleFeatureToggle}
                        onAdd={handleCustomFeatureAdd}
                        isEditing={isEditing}
                     />
                </div>
                 <div className="space-y-2">
                     <Label>Anzahl Plätze</Label>
                     <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                            <Label htmlFor="naturalGrass" className="text-xs">Naturrasen</Label>
                            <Input id="naturalGrass" type="number" value={formData.pitchDetails?.naturalGrass || 0} onChange={(e) => handlePitchDetailChange('naturalGrass', e.target.value)} readOnly={!isEditing}/>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="artificialGrass" className="text-xs">Kunstrasen</Label>
                             <Input id="artificialGrass" type="number" value={formData.pitchDetails?.artificialGrass || 0} onChange={(e) => handlePitchDetailChange('artificialGrass', e.target.value)} readOnly={!isEditing}/>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="smallPitches" className="text-xs">Kleinplätze</Label>
                             <Input id="smallPitches" type="number" value={formData.pitchDetails?.smallPitches || 0} onChange={(e) => handlePitchDetailChange('smallPitches', e.target.value)} readOnly={!isEditing}/>
                        </div>
                    </div>
                 </div>
                <div className="space-y-2">
                    <Label>Bildergalerie</Label>
                    <ScrollArea className="h-40 w-full border rounded-md p-2">
                        <div className="grid grid-cols-3 gap-2">
                            {formData.images?.map((img, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <Image src={img} alt={`Anlage Bild ${index+1}`} layout="fill" className="object-cover rounded-md"/>
                                    {isEditing && (
                                        <Button size="icon" variant="destructive" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => handleRemoveImage(index)}>
                                            <Trash2 className="h-3 w-3"/>
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                     {isEditing && (
                        <div className="flex gap-2">
                             <Button asChild variant="outline" className="w-full">
                               <Label htmlFor="image-upload" className="cursor-pointer">
                                  <Upload className="mr-2 h-4 w-4"/> Bild hochladen
                               </Label>
                            </Button>
                            <input id="image-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} ref={fileInputRef}/>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <DialogFooter className="justify-between">
            <div>
              {formData.id && (
                  <AlertDialog>
                      <AlertDialogTrigger asChild>
                           <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4"/>Löschen</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Wirklich löschen?</AlertDialogTitle></AlertDialogHeader>
                           <AlertDialogDescription>Möchten Sie die Anlage "{formData.name}" wirklich löschen?</AlertDialogDescription>
                           <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteClick}>Löschen</AlertDialogAction>
                           </AlertDialogFooter>
                      </AlertDialogContent>
                  </AlertDialog>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Schliessen</Button>
              {isEditing && (
                  <Button onClick={handleSaveClick}><Save className="mr-2 h-4 w-4"/>Speichern</Button>
              )}
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
