
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useInvestorLeads } from '@/hooks/useInvestorLeads';
import { useInvestors } from '@/hooks/useInvestors';
import { InvestorLeadDetailModal } from '@/components/ui/investor-lead-detail-modal';
import { ConvertToInvestorModal } from '@/components/ui/convert-lead-to-investor-modal';
import { useToast } from '@/hooks/use-toast';

const getStatusBadge = (status) => {
    switch (status) {
        case 'Interessent': return <Badge variant="secondary">Interessent</Badge>;
        case 'Kontaktiert': return <Badge className="bg-blue-100 text-blue-800">Kontaktiert</Badge>;
        case 'Präsentiert': return <Badge className="bg-yellow-100 text-yellow-800">Präsentiert</Badge>;
        case 'Verhandlung': return <Badge className="bg-orange-100 text-orange-800">Verhandlung</Badge>;
        case 'Abgeschlossen': return <Badge className="bg-green-100 text-green-800">Abgeschlossen</Badge>;
        case 'Abgelehnt':
        case 'Archiviert':
            return <Badge variant="destructive">{status}</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
    }
};

export default function InvestorLeadsPage() {
    const { leads, isLoading, refetchLeads, updateInvestorLead } = useInvestorLeads();
    const { addInvestor } = useInvestors();
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    const { toast } = useToast();

    const handleOpenDetails = (lead) => {
        setSelectedLead(lead);
        setIsDetailModalOpen(true);
    };

    const handleStatusChange = async (leadId: string, status: string, note?: string) => {
        await updateInvestorLead(leadId, status as any, note);
        toast({ title: "Status aktualisiert." });
    };

    const handleOpenConvertToInvestor = (lead) => {
        setIsDetailModalOpen(false); // Close detail modal first
        setSelectedLead(lead);
        setIsConvertModalOpen(true);
    };

    const handleConfirmConversion = async (investorData) => {
        try {
            await addInvestor(investorData);
            await updateInvestorLead(selectedLead.id, 'Abgeschlossen', 'Zu Investor konvertiert.');
            toast({
                title: "Lead konvertiert!",
                description: `${selectedLead.name} ist jetzt ein Investor.`
            });
            refetchLeads(); // Refresh leads list
        } catch (error) {
             toast({
                title: "Fehler",
                description: "Lead konnte nicht konvertiert werden.",
                variant: "destructive"
            });
        }
        setIsConvertModalOpen(false);
    };

    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Investor Leads</h1>
                        <p className="text-muted-foreground">Verwalten Sie potenzielle Investoren für die Amigoal-Plattform.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Aktuelle Leads</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {isLoading ? <p>Lade Leads...</p> : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Firma</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Erstellt am</TableHead>
                                        <TableHead className="text-right">Aktion</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leads.map(lead => (
                                        <TableRow key={lead.id} className="cursor-pointer" onClick={() => handleOpenDetails(lead)}>
                                            <TableCell className="font-semibold">{lead.name}</TableCell>
                                            <TableCell>{lead.company || '-'}</TableCell>
                                            <TableCell>{getStatusBadge(lead.status)}</TableCell>
                                            <TableCell>{new Date(lead.createdAt).toLocaleDateString('de-CH')}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">Details</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                         )}
                    </CardContent>
                </Card>
            </div>
             <InvestorLeadDetailModal 
                lead={selectedLead}
                isOpen={isDetailModalOpen}
                onOpenChange={setIsDetailModalOpen}
                onStatusChange={handleStatusChange}
                onConvertToInvestor={handleOpenConvertToInvestor}
            />
            <ConvertToInvestorModal
                lead={selectedLead}
                isOpen={isConvertModalOpen}
                onOpenChange={setIsConvertModalOpen}
                onConfirm={handleConfirmConversion}
            />
        </>
    );
}
