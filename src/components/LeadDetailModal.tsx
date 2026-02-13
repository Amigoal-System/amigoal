
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Edit, Save, Globe, PlusCircle, Trash2, Phone, Archive, Mail, Copy, AlertCircle, UserCog } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { cn } from '@/lib/utils';
import { useRouter, useParams } from 'next/navigation';
import { type Locale } from '@/../i18n.config';
import { TwintIcon } from './icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '@/hooks/use-toast';
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
import { Timeline, TimelineBody, TimelineConnector, TimelineHeader, TimelineIcon, TimelineItem, TimelineTitle } from './ui/timeline';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Combobox } from './ui/combobox';
import type { Lead } from '@/ai/flows/leads.types';


const leadSources = [
    { value: 'Manuell', label: 'Manuell' },
    { value: 'Empfehlung', label: 'Empfehlung' },
    { value: 'Webseite', label: 'Webseite' },
    { value: 'Social Media', label: 'Social Media' },
    { value: 'Veranstaltung', label: 'Veranstaltung' },
    { value: 'Andere', label: 'Andere' },
];


export const LeadDetailModal = ({ lead, isOpen, onOpenChange, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(!lead?.id);
  const [formData, setFormData] = useState<Partial<Lead>>(lead || { id: null, name: '', contact: '', email: '', status: 'Interessent', lastContact: '', address: { street: '', zip: '', city: '' }, tags: [], phone: '', mobile: '', bestContactTime: '', website: '', notes: '', history: [], leadSource: 'Manuell' });
  const [newTag, setNewTag] = useState('');
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as Locale;
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
        if (lead) {
            setFormData({ 
                ...lead, 
                address: lead.address || { street: '', zip: '', city: '' }, 
                tags: lead.tags || [],
                history: lead.history || [],
                leadSource: lead.leadSource || 'Manuell'
            });
            setIsEditing(false);
        } else {
            // Initialize for a new lead
            setFormData({
                id: null,
                name: '',
                contact: '',
                email: '',
                status: 'Interessent',
                lastContact: new Date().toISOString().split('T')[0],
                address: { street: '', zip: '', city: '' },
                tags: [],
                phone: '',
                mobile: '',
                bestContactTime: '',
                website: '',
                notes: '',
                history: [{ date: new Date().toISOString(), text: 'Lead manuell erstellt.' }],
                leadSource: 'Manuell'
            });
            setIsEditing(true);
        }
    }
  }, [lead, isOpen]);


  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleAddressChange = (e) => {
      const { id, value } = e.target;
      setFormData(prev => ({ ...prev, address: { ...(prev.address || {}), [id]: value } }));
  }

  const handleSaveClick = () => {
    const updatedLead = {
        ...formData,
        history: lead ? formData.history : [{date: new Date().toISOString(), text: 'Lead manuell erstellt.'}]
    };
    onSave(updatedLead);
    setIsEditing(false);
  };
  
  const handleCancelClick = () => {
      if(lead) {
        setFormData({ 
            ...lead, 
            address: lead.address || { street: '', zip: '', city: '' },
            tags: lead.tags || [],
            history: lead.history || [],
            leadSource: lead.leadSource || 'Manuell'
        });
        setIsEditing(false);
      } else {
        onOpenChange(false);
      }
  }

  const handleAddTag = () => {
      if(newTag && !formData.tags.includes(newTag)) {
          setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
          setNewTag('');
      }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
      setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleCreateClub = () => {
      const query = new URLSearchParams({
          name: formData.name,
          website: formData.website || '',
          contact: formData.contact,
      });
      router.push(`/${lang}/dashboard/add-club?${query.toString()}`);
  }
  
   const handleWhatsAppClick = () => {
    if (formData.mobile) {
      const phoneNumber = formData.mobile.replace(/\D/g, '');
      window.open(`https://wa.me/${phoneNumber}`, '_blank');
    }
  };

  const handleDelete = () => {
    if(formData.id) {
        onDelete(formData.id);
        onOpenChange(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
                <DialogTitle className="text-2xl font-bold">{formData.name || 'Neuer Lead'}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-muted-foreground">Status:</p>
                    {isEditing ? (
                        <Select value={formData.status} onValueChange={(val) => setFormData(p => ({...p, status: val}))}>
                            <SelectTrigger className="w-[180px] h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Interessent">Interessent</SelectItem>
                                <SelectItem value="Kontaktiert">Kontaktiert</SelectItem>
                                <SelectItem value="Verhandlung">Verhandlung</SelectItem>
                                <SelectItem value="Gewonnen">Gewonnen</SelectItem>
                                <SelectItem value="Verloren">Verloren</SelectItem>
                                <SelectItem value="Onboarding">Onboarding</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <Badge variant="secondary">{formData.status}</Badge>
                    )}
                </div>
            </div>
             {!isEditing && (
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" /> Bearbeiten
                    </Button>
                     <Button variant="outline" size="sm" onClick={handleWhatsAppClick} disabled={!formData.mobile}>
                        <TwintIcon className="mr-2 h-4 w-4" /> Kontaktieren via WhatsApp
                    </Button>
                </div>
            )}
          </div>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-6 -mr-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="name">Verein</Label>
                        <Input id="name" value={formData.name} onChange={handleInputChange} readOnly={!isEditing} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="contact">Kontaktperson</Label>
                        <Input id="contact" value={formData.contact} onChange={handleInputChange} readOnly={!isEditing} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">E-Mail</Label>
                        <Input id="email" type="email" value={formData.email} onChange={handleInputChange} readOnly={!isEditing} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefon</Label>
                            <Input id="phone" value={formData.phone} onChange={handleInputChange} readOnly={!isEditing} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile</Label>
                            <Input id="mobile" value={formData.mobile} onChange={handleInputChange} readOnly={!isEditing} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bestContactTime">Beste Kontaktzeit</Label>
                        <Input id="bestContactTime" value={formData.bestContactTime} onChange={handleInputChange} readOnly={!isEditing} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="website">Webseite</Label>
                         <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <Input id="website" value={formData.website || ''} onChange={handleInputChange} readOnly={!isEditing} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label>Adresse</Label>
                        <div className="grid grid-cols-5 gap-2">
                            <Input id="street" placeholder="Strasse" className="col-span-3" value={formData.address?.street} onChange={handleAddressChange} readOnly={!isEditing} />
                            <Input id="zip" placeholder="PLZ" className="col-span-1" value={formData.address?.zip} onChange={handleAddressChange} readOnly={!isEditing} />
                            <Input id="city" placeholder="Ort" className="col-span-1" value={formData.address?.city} onChange={handleAddressChange} readOnly={!isEditing} />
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="leadSource">Lead-Herkunft</Label>
                        {isEditing ? (
                             <Combobox
                                items={leadSources}
                                value={formData.leadSource}
                                onChange={(val) => setFormData(p => ({...p, leadSource: val}))}
                                placeholder="Quelle auswählen..."
                                allowCustom
                            />
                        ) : (
                            <Input id="leadSource" value={formData.leadSource} readOnly />
                        )}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                         <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                            {formData.tags.map(tag => (
                                <Badge key={tag} variant="default" className="flex items-center gap-1">
                                    {tag}
                                    {isEditing && (
                                        <button onClick={() => handleRemoveTag(tag)} className="opacity-70 hover:opacity-100">
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    )}
                                </Badge>
                            ))}
                         </div>
                         {isEditing && (
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Neues Tag hinzufügen..."
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                />
                                <Button size="icon" onClick={handleAddTag}><PlusCircle className="h-4 w-4"/></Button>
                            </div>
                         )}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="notes">Notizen & Nächste Schritte</Label>
                        <Textarea id="notes" value={formData.notes} onChange={handleInputChange} readOnly={!isEditing} rows={4}/>
                    </div>
                    <div className="space-y-2">
                        <Label>Verlauf</Label>
                        <div className="space-y-3 border p-3 rounded-md bg-muted/50 h-32 overflow-y-auto">
                           <Timeline>
                                {(formData.history || []).slice().reverse().map((item, index) => (
                                    <TimelineItem key={index}>
                                        <TimelineConnector />
                                        <TimelineHeader>
                                            <TimelineIcon><div className="w-2 h-2 rounded-full bg-primary" /></TimelineIcon>
                                            <TimelineTitle>{item.text}</TimelineTitle>
                                        </TimelineHeader>
                                        <TimelineBody>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(item.date), "dd. MMMM yyyy, HH:mm", { locale: de })}
                                            </p>
                                        </TimelineBody>
                                    </TimelineItem>
                                ))}
                            </Timeline>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <DialogFooter className="justify-between">
          <div>
            {lead && !isEditing && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Löschen
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Diesen Lead löschen?</AlertDialogTitle></AlertDialogHeader>
                        <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden und der Lead wird permanent aus der Datenbank entfernt.</AlertDialogDescription>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Endgültig löschen</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </div>
            <div className="flex gap-2">
                {isEditing ? (
                    <>
                        <Button variant="outline" onClick={handleCancelClick}>Abbrechen</Button>
                        <Button onClick={handleSaveClick}>
                            <Save className="mr-2 h-4 w-4" /> Speichern
                        </Button>
                    </>
                ) : (
                    <>
                        {formData.status === 'Gewonnen' && (
                             <Button variant="secondary" onClick={handleCreateClub}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Verein erstellen
                            </Button>
                        )}
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Schliessen
                            </Button>
                        </DialogClose>
                    </>
                )}
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
