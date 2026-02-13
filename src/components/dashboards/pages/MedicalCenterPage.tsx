
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Upload, Map } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MedicalContactDetailModal } from '@/components/ui/medical-contact-modal';
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
import { useMedicalContacts } from '@/hooks/useMedicalContacts';
import { useToast } from '@/hooks/use-toast';
import { MedicalContactImportModal } from '@/components/ui/medical-contact-import-modal';
import { FindOnMapModal } from '@/components/ui/find-on-map-modal';

const SuperAdminView = () => {
    const { contacts, isLoading, addContact, updateContact, deleteContact, refetchContacts } = useMedicalContacts();
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);

    const handleOpenModal = (contact = null) => {
        setSelectedContact(contact);
        setIsDetailModalOpen(true);
    };

    const handleSaveContact = async (contactData) => {
        if (contactData.id) {
            await updateContact(contactData);
        } else {
            await addContact(contactData);
        }
        setIsDetailModalOpen(false);
    };

    const handleDeleteContact = (contactId) => {
        deleteContact(contactId);
    };
    
    const handleSelectFromMap = (place) => {
        const nameParts = place.label.split(',')[0];
        const newContact = {
            name: nameParts,
            address: {
                street: `${place.address.road || ''} ${place.address.house_number || ''}`.trim(),
                zip: place.address.postcode,
                city: place.address.city || place.address.town || place.address.village,
            },
        };
        setSelectedContact(newContact);
        setIsDetailModalOpen(true);
    }

    const formatName = (contact) => {
        return [contact.salutation, contact.title, contact.firstName, contact.lastName].filter(Boolean).join(' ');
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Medizinisches Netzwerk</CardTitle>
                            <CardDescription>Verwalten Sie hier Ihre Kontakte zu Ärzten, Physiotherapeuten und Kliniken.</CardDescription>
                        </div>
                         <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                                <Upload className="mr-2 h-4 w-4"/> Importieren
                            </Button>
                             <Button variant="outline" onClick={() => setIsMapModalOpen(true)}>
                                <Map className="mr-2 h-4 w-4"/> Auf Karte suchen
                            </Button>
                            <Button onClick={() => handleOpenModal(null)}>
                                <PlusCircle className="mr-2 h-4 w-4"/> Neuen Kontakt hinzufügen
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? <p>Lade Kontakte...</p> : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Fachgebiet</TableHead>
                                    <TableHead>Ort</TableHead>
                                    <TableHead>Telefon</TableHead>
                                    <TableHead className="text-right">Aktionen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {contacts.map(contact => (
                                    <TableRow key={contact.id} onClick={() => handleOpenModal(contact)} className="cursor-pointer">
                                        <TableCell className="font-medium">{formatName(contact)}</TableCell>
                                        <TableCell><Badge variant="secondary">{contact.specialty}</Badge></TableCell>
                                        <TableCell>{contact.address?.city || ''}</TableCell>
                                        <TableCell>{contact.phone}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenModal(contact); }}>
                                                <Edit className="h-4 w-4"/>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>Kontakt wirklich löschen?</AlertDialogTitle></AlertDialogHeader>
                                                    <AlertDialogDescription>
                                                        Möchten Sie "{formatName(contact)}" wirklich aus Ihrem Netzwerk entfernen? Diese Aktion kann nicht rückgängig gemacht werden.
                                                    </AlertDialogDescription>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteContact(contact.id!)}>Löschen</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <MedicalContactDetailModal 
                isOpen={isDetailModalOpen}
                onOpenChange={setIsDetailModalOpen} 
                contact={selectedContact} 
                onSave={handleSaveContact} 
                onDelete={handleDeleteContact}
            />
            <MedicalContactImportModal
                isOpen={isImportModalOpen}
                onOpenChange={setIsImportModalOpen}
                onImportSuccess={refetchContacts}
            />
            <FindOnMapModal
                isOpen={isMapModalOpen}
                onOpenChange={setIsMapModalOpen}
                onSelectLocation={handleSelectFromMap}
            />
        </>
    );
};

const CoachView = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Medical Center (Coach-Ansicht)</CardTitle>
                <CardDescription>Übersicht über den Verletzungsstatus Ihrer Mannschaft.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    {/* ... Table for injuries ... */}
                </Table>
            </CardContent>
        </Card>
    );
};

const PlayerView = () => (
    <Card>
        <CardHeader>
            <CardTitle>Medical Center (Spieler)</CardTitle>
            <CardDescription>Deine persönliche Gesundheitsübersicht.</CardDescription>
        </CardHeader>
        <CardContent>
            <p>Hier siehst du bald deine Verletzungshistorie und Reha-Pläne.</p>
        </CardContent>
    </Card>
);

export default function MedicalCenterPage({ currentUserRole }) {
    switch(currentUserRole) {
        case 'Super-Admin':
            return <SuperAdminView />;
        case 'Coach':
            return <CoachView />;
        case 'Player':
            return <PlayerView />;
        default:
             return (
                <Card>
                    <CardHeader>
                        <CardTitle>Medical Center</CardTitle>
                        <CardDescription>
                            Hier werden medizinische Informationen verwaltet.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Für Ihre Rolle ist hier keine spezifische Ansicht konfiguriert.</p>
                    </CardContent>
                </Card>
            );
    }
}
