
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAllAmigoalContracts, addAmigoalContract, updateAmigoalContract, deleteAmigoalContract } from '@/ai/flows/amigoalContracts';
import type { AmigoalContract } from '@/ai/flows/amigoalContracts.types';
import { ContractModal } from '@/components/ui/saas-contract-modal';


export default function SaasContractsPage() {
    const [contracts, setContracts] = useState<AmigoalContract[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState<AmigoalContract | null>(null);
    const { toast } = useToast();
    
    const fetchContracts = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAllAmigoalContracts();
            setContracts(data);
        } catch (error) {
            toast({ title: 'Fehler', description: 'Verträge konnten nicht geladen werden.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        fetchContracts();
    }, [fetchContracts]);

    const handleSave = async (data: any) => {
        try {
            if (data.id) {
                await updateAmigoalContract(data as AmigoalContract);
                toast({ title: "Vertrag aktualisiert." });
            } else {
                await addAmigoalContract(data as Omit<AmigoalContract, 'id'>);
                toast({ title: "Vertrag erstellt." });
            }
            fetchContracts();
        } catch (error) {
            toast({ title: "Fehler beim Speichern", variant: "destructive" });
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteAmigoalContract(id);
            toast({ title: "Vertrag gelöscht." });
            fetchContracts();
        } catch (error) {
            toast({ title: "Fehler beim Löschen.", variant: "destructive" });
        }
    }
    
    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'Active': return <Badge className="bg-green-500">Aktiv</Badge>;
            case 'Expired': return <Badge variant="secondary">Abgelaufen</Badge>;
            case 'Terminated': return <Badge variant="destructive">Gekündigt</Badge>;
            case 'Draft': return <Badge variant="outline">Entwurf</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };
    
    const handleOpenModal = (contract: AmigoalContract | null) => {
        setSelectedContract(contract);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">SaaS-Verträge</h1>
                        <p className="text-muted-foreground">Verwalten Sie hier alle Verträge zwischen Amigoal und seinen Partnern.</p>
                    </div>
                    <Button onClick={() => handleOpenModal(null)}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Neuen Vertrag erstellen
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Vertragsübersicht</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <p>Lade Verträge...</p> : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Vertragspartner</TableHead>
                                        <TableHead>Partner-Typ</TableHead>
                                        <TableHead>Vertragsart</TableHead>
                                        <TableHead>Startdatum</TableHead>
                                        <TableHead>Enddatum</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aktionen</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contracts.map(contract => (
                                        <TableRow key={contract.id}>
                                            <TableCell className="font-medium">{contract.partnerName}</TableCell>
                                            <TableCell><Badge variant="outline">{contract.partnerType}</Badge></TableCell>
                                            <TableCell>{contract.contractType}</TableCell>
                                            <TableCell>{new Date(contract.startDate).toLocaleDateString('de-CH')}</TableCell>
                                            <TableCell>{new Date(contract.endDate).toLocaleDateString('de-CH')}</TableCell>
                                            <TableCell>{getStatusBadge(contract.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(contract)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(contract.id!)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
            {isModalOpen && (
                <ContractModal 
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    contract={selectedContract}
                    onSave={handleSave}
                />
            )}
        </>
    );
}
