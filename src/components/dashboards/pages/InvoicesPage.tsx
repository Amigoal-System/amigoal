'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, FileWarning } from 'lucide-react';
import { OverdueInvoiceModal } from '@/components/OverdueInvoiceModal';
import { useTeam } from '@/hooks/use-team';
import { useMembers } from '@/hooks/useMembers';

export default function InvoicesPage() {
    const { club, currentUserRole } = useTeam();
    const { members, isLoading } = useMembers(club?.id);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const overdueInvoices = React.useMemo(() => {
        if (!members) return [];
        return members.filter(m => m.fee && !m.fee.paid).map(m => ({
            id: m.id,
            name: `${m.firstName} ${m.lastName}`,
            avatar: m.avatar,
            description: `Mitgliederbeitrag ${m.fee.season}`,
            amount: m.fee.amount,
            dueDate: new Date(new Date(m.fee.date).setMonth(new Date(m.fee.date).getMonth() + 1)).toLocaleDateString('de-CH'),
            status: 'Überfällig',
            roles: m.roles,
            teams: m.teams,
            team: m.teams?.[0], // for compatibility
            memberNr: m.memberNr,
            saison: m.fee.season,
            summe: `CHF ${m.fee.amount.toFixed(2)}`
        }));
    }, [members]);

    const handleOpenModal = (invoice) => {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
    };

    if (isLoading) {
        return <div>Lade Rechnungen...</div>
    }

    return (
        <>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold font-headline">Mitgliederbeiträge & Rechnungen</h1>
                <Card>
                    <CardHeader>
                        <CardTitle>Offene Rechnungen</CardTitle>
                        <CardDescription>
                            Übersicht aller Mitglieder mit ausstehenden Beitragszahlungen.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mitglied</TableHead>
                                    <TableHead>Betrag</TableHead>
                                    <TableHead>Fällig am</TableHead>
                                    <TableHead className="text-right">Aktion</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {overdueInvoices.map(invoice => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">{invoice.name}</TableCell>
                                        <TableCell>CHF {invoice.amount.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge variant="destructive">{invoice.dueDate}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="outline" onClick={() => handleOpenModal(invoice)}>
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
            <OverdueInvoiceModal
                invoice={selectedInvoice}
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </>
    );
}
