
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, FileWarning, MoreHorizontal, Edit, Archive, PlayCircle, PauseCircle } from 'lucide-react';
import { ClubDunningModal } from '@/components/ClubDetailModal';
import { useClubs } from '@/hooks/useClubs';
import { useProviders } from '@/hooks/useProviders';
import { updateClubStatus } from '@/ai/flows/clubs';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SaasInvoicesPage() {
    const { clubs, isLoading: isLoadingClubs, refetchClubs } = useClubs();
    const { providers: bootcampProviders, isLoading: isLoadingBootcamp } = useProviders('Bootcamp');
    const { providers: campProviders, isLoading: isLoadingCamps } = useProviders('Trainingslager');
    
    const [selectedClub, setSelectedClub] = useState(null);
    const [isDunningModalOpen, setIsDunningModalOpen] = useState(false);
    const { toast } = useToast();

    const overdueItems = useMemo(() => {
        const overdueClubs = (clubs || [])
            .filter(c => c.status === 'active' && c.paymentStatus === 'Overdue')
            .map(c => ({
                id: c.id!,
                name: c.name,
                manager: c.manager,
                amount: 'CHF 99.00', // Assuming a standard price for now
                overdueSince: c.overdueSince || 'unbekannt',
                status: 'Überfällig',
                entityType: 'Club',
                raw: c,
            }));

        // Here we can add logic for overdue providers if they have payment status
        // For now, we'll just use clubs as an example
        const allItems = [...overdueClubs];

        return allItems;
    }, [clubs]);

    const handleOpenDunningModal = (item) => {
        if (item.entityType === 'Club') {
            setSelectedClub(item.raw);
            setIsDunningModalOpen(true);
        } else {
            toast({ title: "Aktion nicht unterstützt", description: "Mahnungen für diesen Typ sind noch nicht implementiert." });
        }
    };
    
    const handleStatusChange = async (clubId: string, status: 'active' | 'suspended' | 'archived') => {
        try {
          await updateClubStatus({ clubId, status });
          toast({ description: `Verein wurde auf '${status}' gesetzt.` });
          refetchClubs();
        } catch (error) {
          toast({
            title: "Fehler",
            description: "Der Vereinsstatus konnte nicht geändert werden.",
            variant: "destructive",
          });
        }
    };


    const isLoading = isLoadingClubs || isLoadingBootcamp || isLoadingCamps;

    return (
        <>
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">SaaS-Abrechnungen & Mahnwesen</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Überfällige Rechnungen</CardTitle>
                    <CardDescription>
                        Übersicht aller Kunden mit ausstehenden Zahlungen für ihr Amigoal-Abonnement.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? <p>Lade Rechnungen...</p> : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kunde</TableHead>
                                    <TableHead>Typ</TableHead>
                                    <TableHead>Kontakt</TableHead>
                                    <TableHead>Betrag</TableHead>
                                    <TableHead>Überfällig seit</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aktionen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {overdueItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell><Badge variant="outline">{item.entityType}</Badge></TableCell>
                                        <TableCell>{item.manager}</TableCell>
                                        <TableCell>{item.amount}</TableCell>
                                        <TableCell>
                                            <Badge variant="destructive">{item.overdueSince}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{item.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleOpenDunningModal(item)}>
                                                        <FileWarning className="mr-2 h-4 w-4"/> Mahnen
                                                    </DropdownMenuItem>
                                                    {item.entityType === 'Club' && (
                                                         <DropdownMenuItem onClick={() => handleStatusChange(item.id, 'suspended')}>
                                                            <PauseCircle className="mr-2 h-4 w-4"/> Konto sperren
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
        {selectedClub && (
            <ClubDunningModal
                club={selectedClub}
                isOpen={isDunningModalOpen}
                onOpenChange={setIsDunningModalOpen}
            />
        )}
        </>
    );
}
