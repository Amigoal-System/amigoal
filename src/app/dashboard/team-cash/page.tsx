
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, ArrowDown, ArrowUp, Edit, User, Crown } from 'lucide-react';
import { AddTransactionModal } from '@/components/AddTransactionModal';
import { getTeamCashData, settleDebt, updateKeeper } from '@/ai/flows/teamCash';
import type { TeamCashData, Keeper } from '@/ai/flows/teamCash.types';
import { useToast } from '@/hooks/use-toast';
import { useTeam } from '@/hooks/use-team';
import { useMembers } from '@/hooks/useMembers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const CoachTeamCashPage = ({ activeTeam }) => {
    const { club } = useTeam();
    const { members, isLoading: isLoadingMembers } = useMembers(club?.id);
    const [teamCashData, setTeamCashData] = useState<TeamCashData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditingKeeper, setIsEditingKeeper] = useState(false);
    const [selectedKeeperId, setSelectedKeeperId] = useState<string | null>(null);
    const { toast } = useToast();

    const teamMembers = useMemo(() => {
        if (!members || !activeTeam) return [];
        return members.filter(m => m.teams?.includes(activeTeam));
    }, [members, activeTeam]);

    const fetchTeamData = async () => {
        if (!activeTeam) return;
        setIsLoading(true);
        try {
            const data = await getTeamCashData(activeTeam);
            setTeamCashData(data);
            setSelectedKeeperId(data.keeper?.id?.toString() || null);
        } catch (error) {
            console.error("Failed to fetch team cash data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamData();
    }, [activeTeam]);
    
    const handleSettleDebt = async (memberId: number) => {
        if (!teamCashData) return;
        try {
            const updatedData = await settleDebt({ teamId: activeTeam, memberDebt: { memberId }});
            setTeamCashData(updatedData);
            toast({
                title: "Schulden beglichen!",
                description: "Die Transaktion wurde erfolgreich verbucht."
            });
        } catch(error) {
             console.error("Failed to settle debt:", error);
             toast({
                title: "Fehler",
                description: "Schulden konnten nicht beglichen werden.",
                variant: "destructive",
            });
        }
    };
    
    const handleKeeperChange = async () => {
        if (!selectedKeeperId || !teamMembers) return;
        const selectedMember = teamMembers.find(m => m.id === selectedKeeperId);
        if (selectedMember) {
            const newKeeper: Keeper = { id: parseInt(selectedMember.id, 10), name: `${selectedMember.firstName} ${selectedMember.lastName}` };
            try {
                await updateKeeper({ teamId: activeTeam, keeper: newKeeper });
                setTeamCashData(prev => prev ? { ...prev, keeper: newKeeper } : null);
                setIsEditingKeeper(false);
                toast({ title: "Kassenwart geändert" });
            } catch(e) {
                console.error(e);
                toast({ title: "Fehler beim Speichern", variant: 'destructive'});
            }
        }
    };

    const { balance, negativeBalance, totalDebt } = useMemo(() => {
        if (!teamCashData) return { balance: 0, negativeBalance: [], totalDebt: 0 };
        const negative = teamCashData.members.filter(m => m.balance < 0);
        const debt = negative.reduce((acc, curr) => acc + Math.abs(curr.balance), 0);
        return {
            balance: teamCashData.balance,
            negativeBalance: negative,
            totalDebt: debt
        };
    }, [teamCashData]);

    if (isLoading || isLoadingMembers) {
        return <p>Lade Mannschaftskasse...</p>;
    }
    
    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Mannschaftskasse: {activeTeam}</h1>
                        <p className="text-muted-foreground">Übersicht aller Einnahmen, Ausgaben und Schulden.</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Kontostand</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-4xl font-bold">CHF {balance.toFixed(2)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Offene Bussen</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <p className="text-4xl font-bold text-red-500">CHF {totalDebt.toFixed(2)}</p>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Crown className="text-yellow-500"/> Kassenwart</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isEditingKeeper ? (
                                <Select onValueChange={setSelectedKeeperId} value={selectedKeeperId || ''}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kassenwart auswählen..."/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teamMembers.map(m => (
                                            <SelectItem key={m.id} value={m.id!}>{m.firstName} {m.lastName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <p className="text-xl font-bold">{teamCashData?.keeper?.name || 'Nicht bestimmt'}</p>
                            )}
                        </CardContent>
                         <CardFooter>
                            {isEditingKeeper ? (
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={handleKeeperChange}>Speichern</Button>
                                    <Button size="sm" variant="ghost" onClick={() => setIsEditingKeeper(false)}>Abbrechen</Button>
                                </div>
                            ) : (
                                <Button size="sm" variant="outline" onClick={() => setIsEditingKeeper(true)}><Edit className="mr-2 h-4 w-4"/> Ändern</Button>
                            )}
                         </CardFooter>
                    </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Letzte Transaktionen</CardTitle>
                            <CardDescription>Die neusten Einnahmen und Ausgaben.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableBody>
                                    {teamCashData?.transactions.slice(-5).reverse().map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell>
                                                {t.type === 'Einzahlung' ? <ArrowUp className="text-green-500"/> : <ArrowDown className="text-red-500"/>}
                                            </TableCell>
                                            <TableCell>
                                                <p className="font-medium">{t.description}</p>
                                                <p className="text-sm text-muted-foreground">{new Date(t.date).toLocaleDateString('de-CH')}</p>
                                            </TableCell>
                                            <TableCell className={`text-right font-semibold ${t.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                CHF {t.amount.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={() => setIsModalOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4"/> Neue Transaktion
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Offene Bussen / Schulden</CardTitle>
                             <CardDescription>Spieler mit negativem Saldo.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Table>
                               <TableBody>
                                   {negativeBalance.map(m => (
                                       <TableRow key={m.id}>
                                           <TableCell className="font-medium">{m.name}</TableCell>
                                           <TableCell className="text-right font-semibold text-red-500">CHF {m.balance.toFixed(2)}</TableCell>
                                           <TableCell className="text-right">
                                               <Button size="sm" onClick={() => handleSettleDebt(m.id)}>Begleichen</Button>
                                           </TableCell>
                                       </TableRow>
                                   ))}
                               </TableBody>
                           </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
             {isModalOpen && (
                <AddTransactionModal
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    teamId={activeTeam}
                    onTransactionAdded={fetchTeamData}
                    members={teamMembers}
                />
            )}
        </>
    );
}

const PlayerTeamCashPage = ({ activeTeam }) => {
    const { user } = useTeam();
    const [teamCashData, setTeamCashData] = useState<TeamCashData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTeamData = async () => {
            if (!activeTeam) return;
            setIsLoading(true);
            try {
                const data = await getTeamCashData(activeTeam);
                setTeamCashData(data);
            } catch (error) {
                console.error("Failed to fetch team cash data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTeamData();
    }, [activeTeam]);
    
    // In a real app, we'd get the user's member ID
    const myId = 101; 

    const myBalance = useMemo(() => {
        return teamCashData?.members.find(m => m.id === myId)?.balance || 0;
    }, [teamCashData, myId]);
    
    const myTransactions = useMemo(() => {
        return teamCashData?.transactions.filter(t => t.memberId === myId) || [];
    }, [teamCashData, myId]);

     if (isLoading) {
        return <p>Lade Finanzen...</p>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Meine Mannschaftskasse</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                    <CardHeader><CardTitle>Mein Saldo</CardTitle></CardHeader>
                    <CardContent>
                         <p className={`text-4xl font-bold ${myBalance < 0 ? 'text-red-500' : 'text-green-500'}`}>
                            CHF {myBalance.toFixed(2)}
                        </p>
                        {myBalance < 0 && <Button className="mt-4 w-full">Schulden begleichen</Button>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Crown className="text-yellow-500"/> Kassenwart</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-xl font-bold">{teamCashData?.keeper?.name || 'Nicht bestimmt'}</p>
                        <p className="text-sm text-muted-foreground">Verantwortlich für die Kasse</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader><CardTitle>Meine Transaktionen</CardTitle></CardHeader>
                <CardContent>
                     <Table>
                        <TableBody>
                            {myTransactions.map(t => (
                                <TableRow key={t.id}>
                                    <TableCell>
                                        {t.type === 'Einzahlung' ? <ArrowUp className="text-green-500"/> : <ArrowDown className="text-red-500"/>}
                                    </TableCell>
                                    <TableCell>
                                        <p className="font-medium">{t.description}</p>
                                        <p className="text-sm text-muted-foreground">{new Date(t.date).toLocaleDateString('de-CH')}</p>
                                    </TableCell>
                                    <TableCell className={`text-right font-semibold ${t.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        CHF {t.amount.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

export default function TeamCashPageRouter() {
    const { currentUserRole, activeTeam } = useTeam();

    if (!activeTeam) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Mannschaftskasse</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Bitte wählen Sie zuerst eine aktive Mannschaft aus, um die Kasse anzuzeigen.</p>
                </CardContent>
            </Card>
        )
    }

    if (currentUserRole === 'Player' || currentUserRole === 'Parent') {
        return <PlayerTeamCashPage activeTeam={activeTeam} />
    }
    
    // Default to Coach/Admin view
    return <CoachTeamCashPage activeTeam={activeTeam} />
}
