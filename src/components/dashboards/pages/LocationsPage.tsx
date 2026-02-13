'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { GoogleMapsSearch as AddressSearchMap } from '@/components/ui/google-maps-search';
import { initialLocations } from '@/lib/types/locations';


const LocationModal = ({ location, isOpen, onOpenChange, onSave }) => {
    const [formData, setFormData] = useState(null);

    React.useEffect(() => {
        setFormData(location || { id: null, name: '', address: '', type: 'Rasenplatz' });
    }, [location]);

    if (!formData) return null;

    const handleLocationSelect = (loc) => {
        const addressString = [
            loc.address.road,
            loc.address.house_number,
            loc.address.postcode,
            loc.address.city
        ].filter(Boolean).join(', ');
        setFormData(p => ({ ...p, address: addressString }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{formData.id ? 'Standort bearbeiten' : 'Neuen Standort erstellen'}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name des Standorts</Label>
                            <Input id="name" value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="address">Adresse</Label>
                            <Input id="address" value={formData.address} onChange={(e) => setFormData(p => ({...p, address: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Typ</Label>
                            <Input id="type" value={formData.type} onChange={(e) => setFormData(p => ({...p, type: e.target.value}))} />
                        </div>
                    </div>
                    <div className="w-full h-80">
                        <AddressSearchMap onLocationSelect={handleLocationSelect} />
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

export default function LocationsPage() {
    const [locations, setLocations] = useState(initialLocations);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);

    const handleSave = (locationData) => {
        if (locationData.id) {
            setLocations(locations.map(loc => loc.id === locationData.id ? locationData : loc));
        } else {
            setLocations([...locations, { ...locationData, id: Date.now() }]);
        }
        setIsModalOpen(false);
    };

    const handleEdit = (location) => {
        setSelectedLocation(location);
        setIsModalOpen(true);
    };
    
    const handleAddNew = () => {
        setSelectedLocation(null);
        setIsModalOpen(true);
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Standorte</h1>
                        <p className="text-muted-foreground">Verwalten Sie hier alle Standorte wie Sportplätze und Hallen.</p>
                    </div>
                    <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4"/> Neuen Standort hinzufügen</Button>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Adresse</TableHead>
                                    <TableHead>Typ</TableHead>
                                    <TableHead className="text-right">Aktionen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {locations.map(location => (
                                    <TableRow key={location.id}>
                                        <TableCell className="font-semibold">{location.name}</TableCell>
                                        <TableCell>{location.address}</TableCell>
                                        <TableCell>{location.type}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(location)}><Edit className="h-4 w-4"/></Button>
                                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <LocationModal
                location={selectedLocation}
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSave={handleSave}
            />
        </>
    );
}
