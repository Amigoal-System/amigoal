
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from './ui/badge';
import { X, PlusCircle, Globe, Instagram, Facebook } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export const EditProviderModal = ({ isOpen, onOpenChange, provider, onSave, allFacilities, allRegions }) => {
    const [formData, setFormData] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [newRegion, setNewRegion] = useState('');
    const [selectedFacility, setSelectedFacility] = useState('');

    React.useEffect(() => {
        if (isOpen) {
            setFormData(provider || { id: null, name: '', contact: '', regions: [], facilities: [], commission: '', website: '', instagram: '', facebook: '', email: '', phone: '' });
        }
    }, [provider, isOpen]);

    if (!isOpen || !formData) return null;

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value}));
    };
    
    const handleRegionAdd = () => {
        if (selectedRegion && !formData.regions.includes(selectedRegion)) {
            setFormData(prev => ({...prev, regions: [...prev.regions, selectedRegion]}));
            setSelectedRegion('');
        }
    };
    
    const handleNewRegionAdd = () => {
        if (newRegion && !allRegions.includes(newRegion) && !formData.regions.includes(newRegion)) {
             setFormData(prev => ({...prev, regions: [...prev.regions, newRegion]}));
             setNewRegion('');
        }
    };
    
    const handleRegionRemove = (regionToRemove: string) => {
        setFormData(prev => ({...prev, regions: prev.regions.filter(r => r !== regionToRemove)}));
    };
    
    const handleFacilityAdd = () => {
        const facilityToAdd = allFacilities.find(f => f.id.toString() === selectedFacility);
        if (facilityToAdd && !formData.facilities.some(f => f.id === facilityToAdd.id)) {
            setFormData(prev => ({...prev, facilities: [...prev.facilities, facilityToAdd]}));
            setSelectedFacility('');
        }
    };
    
     const handleFacilityRemove = (facilityId: string) => {
        setFormData(prev => ({...prev, facilities: prev.facilities.filter(f => f.id !== facilityId)}));
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{formData.id ? 'Anbieter bearbeiten' : 'Neuen Anbieter erstellen'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                     <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={formData.name || ''} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contact">Kontaktperson</Label>
                        <Input id="contact" value={formData.contact || ''} onChange={handleChange} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="email">E-Mail</Label>
                            <Input id="email" type="email" value={formData.email || ''} onChange={handleChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="phone">Telefon</Label>
                            <Input id="phone" type="tel" value={formData.phone || ''} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="website">Webseite</Label>
                         <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                            <Input id="website" value={formData.website || ''} onChange={handleChange} className="pl-9"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="instagram">Instagram</Label>
                             <div className="relative">
                                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <Input id="instagram" value={formData.instagram || ''} onChange={handleChange} className="pl-9"/>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="facebook">Facebook</Label>
                             <div className="relative">
                                <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <Input id="facebook" value={formData.facebook || ''} onChange={handleChange} className="pl-9"/>
                            </div>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Regionen</Label>
                            <div className="p-2 border rounded-md min-h-[40px] flex flex-wrap gap-2">
                                {formData.regions?.map(region => (
                                    <Badge key={region} variant="secondary" className="flex items-center gap-1">
                                        {region}
                                        <button onClick={() => handleRegionRemove(region)}><X className="h-3 w-3"/></button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                                    <SelectTrigger><SelectValue placeholder="Region wählen..."/></SelectTrigger>
                                    <SelectContent>
                                        {allRegions.filter(r => !formData.regions?.includes(r)).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleRegionAdd} disabled={!selectedRegion}><PlusCircle className="h-4 w-4" /></Button>
                            </div>
                            <div className="flex gap-2">
                                <Input placeholder="Neue Region..." value={newRegion} onChange={(e) => setNewRegion(e.target.value)} />
                                <Button onClick={handleNewRegionAdd} disabled={!newRegion}><PlusCircle className="h-4 w-4" /></Button>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Sportanlagen</Label>
                            <div className="p-2 border rounded-md min-h-[40px] flex flex-wrap gap-2">
                                {formData.facilities?.map(f => (
                                     <Badge key={f.id} variant="outline" className="flex items-center gap-1">
                                        {f.name}
                                        <button onClick={() => handleFacilityRemove(f.id)}><X className="h-3 w-3"/></button>
                                    </Badge>
                                ))}
                            </div>
                             <div className="flex gap-2">
                                <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                                    <SelectTrigger><SelectValue placeholder="Anlage wählen..."/></SelectTrigger>
                                    <SelectContent>
                                        {allFacilities.filter(f => !formData.facilities?.some(fac => fac.id === f.id)).map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleFacilityAdd} disabled={!selectedFacility}><PlusCircle className="h-4 w-4" /></Button>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="commission">Kommission</Label>
                            <Input id="commission" value={formData.commission} onChange={handleChange} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={() => onSave(formData)}>Speichern</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
