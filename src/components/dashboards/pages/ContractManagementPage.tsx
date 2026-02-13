'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, Edit, Trash2, Printer, Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getContractsForMember } from '@/ai/flows/contracts';
import type { Contract } from '@/ai/flows/contracts.types';
import { useMembers } from '@/hooks/useMembers';
import { useTeam } from '@/hooks/use-team';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlayerContractPDF } from '@/components/ui/player-contract-pdf';
import { useReactToPrint } from 'react-to-print';

export default function ContractManagementPage() {
    const { club } = useTeam();
    const { members, isLoading: isLoadingMembers } = useMembers(club?.id);
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [isLoadingContracts, setIsLoadingContracts] = useState(false);
    const { toast } = useToast();
    const pdfComponentRef = useRef<HTMLDivElement>(null);

    const selectedMember = useMemo(() => {
        return members.find(m => m.id === selectedMemberId);
    }, [members, selectedMemberId]);
    
    useEffect(() => {
        if (members.length > 0 && !selectedMemberId) {
            setSelectedMemberId(members[0].id!);
        }
    }, [members, selectedMemberId]);

    useEffect(() => {
        const fetchContracts = async () => {
            if (!selectedMemberId) return;
            setIsLoadingContracts(true);
            try {
                const fetchedContracts = await getContractsForMember(selectedMemberId);
                setContracts(fetchedContracts);
            } catch (error) {
                console.error("Error fetching contracts:", error);
                toast({ title: "Fehler beim Laden der Verträge", variant: "destructive" });
            } finally {
                setIsLoadingContracts(false);
            }
        };

        fetchContracts();
    }, [selectedMemberId, toast]);
    
    const handlePrint = useReactToPrint({
      content: () => pdfComponentRef.current,
    });

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Vertragsmanagement</h1>
                        <p className="text-muted-foreground">Verwalten Sie hier alle Spieler- und Staff-Verträge.</p>
                    </div>
                     <div className="flex gap-2">
                        <Select onValueChange={setSelectedMemberId} value={selectedMemberId || ''}>
                            <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Mitglied auswählen..." />
                            </SelectTrigger>
                            <SelectContent>
                                {isLoadingMembers ? (
                                    <SelectItem value="loading" disabled>Lade Mitglieder...</SelectItem>
                                ) : (
                                    members.map(member => (
                                        <SelectItem key={member.id} value={member.id!}>{member.firstName} {member.lastName}</SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        <Button><PlusCircle className="mr-2 h-4 w-4"/> Neuen Vertrag aufsetzen</Button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {isLoadingContracts ? <p>Lade Verträge...</p> : contracts.map(contract => (
                         <Card key={contract.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-lg">{contract.name}</CardTitle>
                                    <Badge variant={contract.status === 'Aktiv' ? 'default' : 'secondary'} className={contract.status === 'Aktiv' ? 'bg-green-500' : ''}>{contract.status}</Badge>
                                </div>
                                <CardDescription>Gültig: {new Date(contract.from).toLocaleDateString('de-CH')} - {new Date(contract.to).toLocaleDateString('de-CH')}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-2 text-sm">
                                <h4 className="font-semibold">Wichtigste Klauseln:</h4>
                                <ul className="list-disc list-inside text-muted-foreground">
                                    {contract.clauses.slice(0, 3).map((clause, i) => <li key={i}>{clause}</li>)}
                                </ul>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" onClick={handlePrint}><Printer className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon"><Share2 className="h-4 w-4"/></Button>
                                <Button variant="outline" size="sm"><Edit className="mr-2 h-4 w-4"/>Bearbeiten</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

            </div>
             <div className="hidden">
                {contracts.length > 0 && <PlayerContractPDF ref={pdfComponentRef} contract={contracts[0]}/>}
            </div>
        </>
    );
}
