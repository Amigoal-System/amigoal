
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { TrainingCamp } from '@/ai/flows/trainingCamps.types';
import type { Bootcamp, Registration } from '@/ai/flows/bootcamps.types';
import { RequestDetailModal } from '@/components/ui/request-detail-modal';
import { useTrainingCampProviders } from '@/hooks/useTrainingCampProviders';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Mail } from 'lucide-react';
import { updateBootcamp } from '@/ai/flows/bootcamps';
import { InvoiceConfirmationModal } from '@/components/ui/invoice-confirmation-modal';
import { useBootcamps } from '@/hooks/useBootcamps';
import { createCommissionInvoice } from '@/ai/flows/commissionInvoices';

const RegistrationRow = ({ reg, onConfirmClick, onCancelClick, onRowClick }) => {
    
    const getStatusBadge = (status: Registration['status']) => {
        switch(status) {
            case 'confirmed': return <Badge className="bg-green-100 text-green-800">Bestätigt</Badge>;
            case 'pending': return <Badge variant="secondary">Neu</Badge>;
            case 'cancelled': return <Badge variant="destructive">Storniert</Badge>;
        }
    }

    return (
        <TableRow onClick={() => onRowClick(reg)} className="cursor-pointer">
            <TableCell>{reg.name}</TableCell>
            <TableCell>{(reg as any).gender || 'N/A'}</TableCell>
            <TableCell><Badge variant="outline">{reg.campName}</Badge></TableCell>
            <TableCell>{getStatusBadge(reg.status)}</TableCell>
            <TableCell className="text-right">
                {reg.status === 'pending' && (
                     <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" className="text-green-600 hover:bg-green-50 hover:text-green-700" onClick={(e) => { e.stopPropagation(); onConfirmClick(reg); }}>
                            <Check className="h-4 w-4"/> Bestätigen
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-700" onClick={(e) => { e.stopPropagation(); onCancelClick(reg);}}>
                            <X className="h-4 w-4"/> Stornieren
                        </Button>
                    </div>
                )}
                 {reg.status === 'confirmed' && (
                    <Button size="sm" variant="ghost">
                        <Mail className="mr-2 h-4 w-4" /> Kontaktieren
                    </Button>
                 )}
            </TableCell>
        </TableRow>
    )
}


export default function ProviderRequestsPage({ initialBootcamps = [] }) {
    const { toast } = useToast();
    const { refetchBootcamps } = useBootcamps();
    const [allBootcamps, setAllBootcamps] = useState<Bootcamp[]>(initialBootcamps);
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);


    // Refresh data on component mount to ensure it's up-to-date
    useEffect(() => {
        setAllBootcamps(initialBootcamps);
    }, [initialBootcamps]);
    
    const allRegistrations = useMemo(() => {
        if (!allBootcamps) return [];
        return allBootcamps.flatMap(camp => 
            (camp.registrations || [])
                .map(reg => ({ ...reg, campName: camp.name, bootcampId: camp.id!, bootcamp: camp }))
        );
    }, [allBootcamps]);

    const newRegistrations = useMemo(() => allRegistrations.filter(r => r.status === 'pending'), [allRegistrations]);
    const confirmedRegistrations = useMemo(() => allRegistrations.filter(r => r.status === 'confirmed'), [allRegistrations]);
    const cancelledRegistrations = useMemo(() => allRegistrations.filter(r => r.status === 'cancelled'), [allRegistrations]);

    const handleConfirmClick = (registration: any) => {
        setSelectedRegistration(registration);
        setIsInvoiceModalOpen(true);
        setIsDetailModalOpen(false); // Close detail if open
    };
    
    const handleRowClick = (registration: any) => {
        setSelectedRegistration(registration);
        setIsDetailModalOpen(true);
    };

    const handleInvoiceConfirm = async (invoiceDetails: { sendNow: boolean; scheduledDate?: Date }) => {
        if (!selectedRegistration) return;

        // 1. Update status
        await handleRegistrationStatus(selectedRegistration.bootcampId, selectedRegistration.userId, 'confirmed');

        // 2. Create commission invoice for Amigoal
        const pricePerPerson = parseFloat((selectedRegistration.bootcamp.offer?.price || '0').replace(/[^0-9.,-]+/g, "").replace(",", "."));
        const totalAmount = pricePerPerson * (selectedRegistration.participants?.length || 1);
        const commissionRate = 0.05; // 5%
        const commissionAmount = totalAmount * commissionRate;

        await createCommissionInvoice({
            providerId: selectedRegistration.bootcamp.source,
            providerName: selectedRegistration.bootcamp.source, // Assuming source is the provider name
            bootcampId: selectedRegistration.bootcamp.id,
            bootcampName: selectedRegistration.bootcamp.name,
            registrationId: selectedRegistration.userId,
            customerName: selectedRegistration.contactName,
            bookingAmount: totalAmount,
            commissionAmount: commissionAmount,
            status: 'Offen'
        });

        // 3. Handle invoice sending logic (simulation)
        const sendTime = invoiceDetails.sendNow
            ? 'sofort'
            : `am ${invoiceDetails.scheduledDate?.toLocaleDateString('de-CH')}`;
        toast({
            title: "Anmeldung bestätigt & Provision erfasst",
            description: `Die Kundenrechnung wird ${sendTime} versendet. Die Amigoal-Provision wurde vermerkt.`,
        });

        setIsInvoiceModalOpen(false);
        setSelectedRegistration(null);
    };

    const handleRegistrationStatus = async (bootcampId: string, userId: string, newStatus: 'confirmed' | 'cancelled') => {
        const campToUpdate = allBootcamps.find(c => c.id === bootcampId);
        if (!campToUpdate) return;
        
        const updatedRegistrations = campToUpdate.registrations!.map(r => 
            r.userId === userId ? { ...r, status: newStatus } : r
        );
        
        const updatedCamp = { ...campToUpdate, registrations: updatedRegistrations };

        try {
            await updateBootcamp(updatedCamp);
            setAllBootcamps(prevCamps => prevCamps.map(c => c.id === bootcampId ? updatedCamp : c));
            if (newStatus !== 'confirmed') { // Toast only for direct actions, not after invoice modal
                 toast({
                    title: `Anmeldung ${newStatus === 'confirmed' ? 'bestätigt' : 'storniert'}.`
                });
            }
            refetchBootcamps();
        } catch (error) {
             toast({
                title: `Fehler`,
                description: 'Der Status konnte nicht aktualisiert werden.',
                variant: 'destructive',
            });
        }
    };

    const RegistrationTable = ({ registrations }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Teilnehmer</TableHead>
                    <TableHead>Geschlecht</TableHead>
                    <TableHead>Bootcamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {registrations.length > 0 ? (
                    registrations.map(reg => (
                        <RegistrationRow 
                            key={`${reg.userId}-${reg.bootcampId}`} 
                            reg={reg} 
                            onConfirmClick={handleConfirmClick}
                            onCancelClick={() => handleRegistrationStatus(reg.bootcampId, reg.userId, 'cancelled')} 
                            onRowClick={handleRowClick}
                        />
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                            Keine Anmeldungen in dieser Kategorie.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Anfragen & Buchungen</CardTitle>
                    <CardDescription>
                        Verwalten Sie hier alle Anmeldungen für Ihre Bootcamps.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="new">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="new">Neu ({newRegistrations.length})</TabsTrigger>
                            <TabsTrigger value="confirmed">Bestätigt ({confirmedRegistrations.length})</TabsTrigger>
                            <TabsTrigger value="cancelled">Storniert ({cancelledRegistrations.length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="new" className="mt-4">
                            <RegistrationTable registrations={newRegistrations} />
                        </TabsContent>
                        <TabsContent value="confirmed" className="mt-4">
                            <RegistrationTable registrations={confirmedRegistrations} />
                        </TabsContent>
                        <TabsContent value="cancelled" className="mt-4">
                            <RegistrationTable registrations={cancelledRegistrations} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
            {selectedRegistration && (
                <InvoiceConfirmationModal
                    isOpen={isInvoiceModalOpen}
                    onOpenChange={setIsInvoiceModalOpen}
                    registration={selectedRegistration}
                    bootcamp={selectedRegistration.bootcamp}
                    onConfirm={handleInvoiceConfirm}
                />
            )}
             {isDetailModalOpen && (
                <RequestDetailModal
                    isOpen={isDetailModalOpen}
                    onOpenChange={setIsDetailModalOpen}
                    request={selectedRegistration}
                    providers={[]} // Not needed here
                    onForward={() => {}}
                    onConfirm={handleConfirmClick}
                    onCancel={() => handleRegistrationStatus(selectedRegistration.bootcampId, selectedRegistration.userId, 'cancelled')}
                />
            )}
        </>
    );
}
