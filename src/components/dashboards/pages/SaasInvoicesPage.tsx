'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, FileWarning } from 'lucide-react';
import { ClubDunningModal } from '@/components/ClubDetailModal';

const overdueInvoices = [
    { id: 1, clubName: 'FC Unterstrass', manager: 'Peter Keller', amount: 'CHF 99.00', overdueSince: '15 Tage', status: '1. Mahnung' },
    { id: 2, name: 'FC Red Star ZH', manager: 'Erika Schmid', amount: 'CHF 99.00', overdueSince: '32 Tage', status: '2. Mahnung' },
    { id: 3, name: 'FC Blue Stars', manager: 'Max Fischer', amount: 'CHF 99.00', overdueSince: '5 Tage', status: 'Erinnerung' },
];

export default function SaasInvoicesPage() {
    const [selectedClub, setSelectedClub] = useState(null);
    const [isDunningModalOpen, setIsDunningModalOpen] = useState(false);
    
    const handleOpenDunningModal = (club) => {
        setSelectedClub(club);
        setIsDunningModalOpen(true);
    };

    return (
        <>
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">SaaS-Abrechnungen & Mahnwesen</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Überfällige Rechnungen</CardTitle>
                    <CardDescription>
                        Übersicht aller Vereine mit ausstehenden Zahlungen für ihr Amigoal-Abonnement.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Verein</TableHead>
                                <TableHead>Manager</TableHead>
                                <TableHead>Betrag</TableHead>
                                <TableHead>Überfällig seit</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aktion</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {overdueInvoices.map(invoice => (
                                <TableRow key={invoice.id} className="cursor-pointer" onClick={() => handleOpenDunningModal(invoice)}>
                                    <TableCell className="font-medium">{invoice.clubName}</TableCell>
                                    <TableCell>{invoice.manager}</TableCell>
                                    <TableCell>{invoice.amount}</TableCell>
                                    <TableCell>
                                        <Badge variant="destructive">{invoice.overdueSince}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{invoice.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="outline" onClick={() => handleOpenDunningModal(invoice)}>
                                            <FileWarning className="mr-2 h-4 w-4"/> Mahnen
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <ClubDunningModal
            club={selectedClub}
            isOpen={isDunningModalOpen}
            onOpenChange={setIsDunningModalOpen}
        />
        </>
    );
}
