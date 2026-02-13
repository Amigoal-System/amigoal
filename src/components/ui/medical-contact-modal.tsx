
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Badge } from './badge';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Stethoscope, HeartPulse, Building, BrainCircuit, Plus, Globe, Instagram, Facebook, Trash2, ArrowLeft, ArrowRight, Save, User, Home, Mail, Phone, Linkedin, Handshake, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Stepper, StepperItem, StepperTrigger, StepperIndicator, StepperTitle, StepperSeparator } from './stepper';

const emptyContact = {
    salutation: 'Herr',
    title: '',
    firstName: '',
    lastName: '',
    contactPerson: '',
    specialty: '',
    address: {
      street: '',
      zip: '',
      city: '',
    },
    phone: '',
    email: '',
    website: '',
    instagram: '',
    linkedin: '',
    facebook: '',
    notes: '',
    history: [],
    agreement: {
        financial: '',
        other: '',
    },
};

const predefinedSpecialties = [
    { label: 'Arzt', icon: <Stethoscope className="h-5 w-5" /> },
    { label: 'Physiotherapeut', icon: <HeartPulse className="h-5 w-5" /> },
    { label: 'Klinik', icon: <Building className="h-5 w-5" /> },
    { label: 'Mental-Coach', icon: <BrainCircuit className="h-5 w-5" /> },
];

const SpecialtySelector = ({ selected, onSelect }) => {
    const [allSpecialties, setAllSpecialties] = useState(predefinedSpecialties);
    const [customValue, setCustomValue] = useState('');

    const handleAddCustom = () => {
        if (customValue && !allSpecialties.some(s => s.label === customValue)) {
            setAllSpecialties(prev => [...prev, { label: customValue, icon: <Plus className="h-5 w-5"/> }]);
            onSelect(customValue);
            setCustomValue('');
        }
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {allSpecialties.map(({ label, icon }) => (
                    <Button
                        key={label}
                        type="button"
                        variant={selected === label ? 'default' : 'outline'}
                        className="h-20 flex-col gap-1"
                        onClick={() => onSelect(label)}
                    >
                        {icon}
                        <span className="text-xs">{label}</span>
                    </Button>
                ))}
            </div>
             <div className="relative flex gap-2">
                <Input 
                    placeholder="Oder ein benutzerdefiniertes Fachgebiet..."
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustom(); } }}
                />
                <Button type="button" onClick={handleAddCustom} disabled={!customValue.trim()}>
                    <Plus className="h-4 w-4"/>
                </Button>
            </div>
        </div>
    );
};

const Step1 = ({ formData, setData, handleInputChange, handleSelectChange, handleSpecialtySelect }) => (
    <div className="space-y-4">
        <h3 className="font-bold text-lg">Stammdaten</h3>
         <div className="grid grid-cols-4 gap-4 items-end">
             <div className="space-y-2 col-span-1">
                <Label htmlFor="salutation">Anrede</Label>
                <Select value={formData.salutation || 'Herr'} onValueChange={val => handleSelectChange('salutation', val)}>
                    <SelectTrigger id="salutation"><SelectValue placeholder="Anrede"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Herr">Herr</SelectItem>
                        <SelectItem value="Frau">Frau</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2 col-span-1">
                <Label htmlFor="title">Titel</Label>
                <Select value={formData.title || 'none'} onValueChange={val => handleSelectChange('title', val)}>
                    <SelectTrigger id="title"><SelectValue placeholder="Kein Titel"/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Dr. med.">Dr. med.</SelectItem>
                        <SelectItem value="Prof. Dr.">Prof. Dr.</SelectItem>
                        <SelectItem value="none">Kein Titel</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2 col-span-2">
                <Label htmlFor="firstName">Vor- & Nachname</Label>
                 <div className="flex gap-2">
                    <Input id="firstName" value={formData.firstName || ''} onChange={handleInputChange} placeholder="Max" />
                    <Input id="lastName" value={formData.lastName || ''} onChange={handleInputChange} placeholder="Mustermann"/>
                </div>
            </div>
        </div>
         <div className="space-y-2">
            <Label htmlFor="contactPerson">Ansprechperson (falls Klinik)</Label>
            <Input id="contactPerson" value={formData.contactPerson || ''} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
            <Label>Fachgebiet</Label>
            <SpecialtySelector 
                selected={formData.specialty}
                onSelect={handleSpecialtySelect}
            />
        </div>
    </div>
);

const Step2 = ({ formData, handleInputChange, handleAddressChange }) => (
    <div className="space-y-4">
        <h3 className="font-bold text-lg">Kontaktdaten</h3>
        <div className="space-y-2">
            <Label>Adresse</Label>
            <div className="grid grid-cols-5 gap-2">
                <Input id="street" placeholder="Strasse & Nr." className="col-span-3" value={formData.address?.street || ''} onChange={handleAddressChange}/>
                <Input id="zip" placeholder="PLZ" className="col-span-1" value={formData.address?.zip || ''} onChange={handleAddressChange}/>
                <Input id="city" placeholder="Ort" className="col-span-1" value={formData.address?.city || ''} onChange={handleAddressChange}/>
            </div>
        </div>
         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                 <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input id="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} className="pl-9"/>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                 <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input id="email" type="email" value={formData.email || ''} onChange={handleInputChange} className="pl-9"/>
                </div>
            </div>
        </div>
    </div>
);

const Step3 = ({ formData, handleInputChange }) => (
    <div className="space-y-4">
        <h3 className="font-bold text-lg">Online-Präsenz</h3>
        <div className="space-y-2">
            <Label htmlFor="website">Webseite</Label>
            <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <Input id="website" value={formData.website || ''} onChange={handleInputChange} className="pl-9" placeholder="www.beispiel.ch"/>
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <div className="flex items-center">
                <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md h-10">instagram.com/</span>
                <Input id="instagram" value={formData.instagram || ''} onChange={handleInputChange} className="rounded-l-none" placeholder="benutzername"/>
            </div>
        </div>
         <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
             <div className="flex items-center">
                <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md h-10">linkedin.com/in/</span>
                <Input id="linkedin" value={formData.linkedin || ''} onChange={handleInputChange} className="rounded-l-none" placeholder="benutzername"/>
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <div className="flex items-center">
                <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md h-10">facebook.com/</span>
                <Input id="facebook" value={formData.facebook || ''} onChange={handleInputChange} className="rounded-l-none" placeholder="benutzername"/>
            </div>
        </div>
    </div>
);

const Step4 = ({ formData, handleInputChange }) => (
     <div className="space-y-4">
        <h3 className="font-bold text-lg">Vereinbarungen</h3>
         <div className="space-y-2">
            <Label htmlFor="financial">Finanzielles</Label>
            <Textarea id="financial" value={formData.agreement?.financial || ''} onChange={(e) => handleInputChange({ target: { id: 'agreement.financial', value: e.target.value } })} rows={6} placeholder="Provision, Abrechnungsmodell, Versicherungsleistungen..."/>
        </div>
         <div className="space-y-2">
            <Label htmlFor="other">Sonstiges</Label>
            <Textarea id="other" value={formData.agreement?.other || ''} onChange={(e) => handleInputChange({ target: { id: 'agreement.other', value: e.target.value } })} rows={6} placeholder="Exklusivität, Geheimhaltung, weitere Abmachungen..."/>
        </div>
    </div>
);


const Step5 = ({ formData, handleInputChange }) => (
    <div className="space-y-4">
        <h3 className="font-bold text-lg">Notizen & Verlauf</h3>
         <div className="space-y-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea id="notes" value={formData.notes || ''} onChange={handleInputChange} rows={6}/>
        </div>
         {formData.id && (
            <div className="space-y-2 pt-4 border-t">
                <h4 className="font-semibold">Kontakthistorie</h4>
                <div className="border rounded-lg max-h-40 overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Datum</TableHead>
                                <TableHead>Spieler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {formData.history?.length > 0 ? formData.history.map((entry, index) => (
                                <TableRow key={index}>
                                    <TableCell>{new Date(entry.date).toLocaleDateString('de-CH')}</TableCell>
                                    <TableCell>{entry.user}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground">Noch keine Einträge.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )}
    </div>
);

export const MedicalContactDetailModal = ({ isOpen, onOpenChange, contact, onSave, onDelete }) => {
    const [formData, setFormData] = useState(contact || emptyContact);
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setFormData(contact || emptyContact);
            setStep(0);
        }
    }, [contact, isOpen]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        if (id.includes('.')) {
            const [obj, field] = id.split('.');
            setFormData(prev => ({ ...prev, [obj]: { ...prev[obj], [field]: value } }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleSelectChange = (id: string, value: string) => {
        const finalValue = value === 'none' ? null : value;
        setFormData(prev => ({ ...prev, [id]: finalValue }));
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, address: { ...(prev.address || {}), [id]: value }}));
    };
    
    const handleSpecialtySelect = (specialty: string) => {
        setFormData(prev => ({ ...prev, specialty }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    const handleDeleteClick = () => {
        if (formData.id) {
            onDelete(formData.id);
        }
    };
    
    const handleNext = () => setStep(s => Math.min(s + 1, steps.length - 1));
    const handleBack = () => setStep(s => Math.max(0, s - 1));
    
    const steps = [
        { label: 'Stammdaten', icon: <User />, content: <Step1 formData={formData} setData={setFormData} handleSelectChange={handleSelectChange} handleInputChange={handleInputChange} handleSpecialtySelect={handleSpecialtySelect} /> },
        { label: 'Kontaktdaten', icon: <Home />, content: <Step2 formData={formData} handleInputChange={handleInputChange} handleAddressChange={handleAddressChange} /> },
        { label: 'Online', icon: <Globe />, content: <Step3 formData={formData} handleInputChange={handleInputChange} /> },
        { label: 'Vereinbarungen', icon: <Handshake />, content: <Step4 formData={formData} handleInputChange={handleInputChange} /> },
        { label: 'Notizen', icon: <FileText />, content: <Step5 formData={formData} handleInputChange={handleInputChange} /> },
    ];
    
    if (!isOpen || !formData) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{formData.id ? 'Kontakt bearbeiten' : 'Neuen Kontakt hinzufügen'}</DialogTitle>
                </DialogHeader>
                 <div className="py-4">
                     <Stepper value={step} className="mb-8">
                        {steps.map((s, i) => (
                            <React.Fragment key={i}>
                                <StepperItem step={i}>
                                    <StepperTrigger onClick={() => setStep(i)}>
                                        <StepperIndicator>{s.icon}</StepperIndicator>
                                        <StepperTitle>{s.label}</StepperTitle>
                                    </StepperTrigger>
                                </StepperItem>
                                {i < steps.length - 1 && <StepperSeparator />}
                            </React.Fragment>
                        ))}
                    </Stepper>
                    <div className="min-h-[300px]">
                        {steps[step].content}
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
                                   <AlertDialogDescription>Möchten Sie diesen Kontakt wirklich löschen?</AlertDialogDescription>
                                   <AlertDialogFooter>
                                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteClick}>Löschen</AlertDialogAction>
                                   </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                      )}
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleBack} disabled={step === 0}>Zurück</Button>
                        {step < steps.length - 1 ? (
                             <Button onClick={handleNext}>Weiter<ArrowRight className="ml-2 h-4 w-4"/></Button>
                        ) : (
                             <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/>Speichern</Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
