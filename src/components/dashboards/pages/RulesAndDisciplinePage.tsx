

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, ShieldCheck, BookOpen, AlertTriangle, AlertCircle, Gavel } from 'lucide-react';
import { PlayerCardModal } from '@/components/PlayerCardModal';
import { useToast } from '@/hooks/use-toast';
import { useCards } from '@/hooks/useCards';
import { useFeedback } from '@/hooks/useFeedback';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WarningDetailModal } from '@/components/ui/warning-detail-modal';
import { useTeam } from '@/hooks/use-team';
import { getConfiguration, updateConfiguration } from '@/ai/flows/configurations';
import type { ClubRule } from '@/ai/flows/configurations.types';
import { RulesEditorModal } from '@/components/ui/rules-editor-modal';

const TeamRules = [
    { id: 't1', text: 'Abmeldungen für Trainings müssen bis spätestens 2 Stunden vor Beginn erfolgen.', mandatory: true },
    { id: 't2', text: 'Jeder Spieler ist für das Aufräumen seines Platzes in der Garderobe verantwortlich.', mandatory: true },
];

const RuleItem = ({ rule }: { rule: ClubRule }) => (
    <li className="flex items-start gap-3">
        {rule.mandatory ? (
            <Gavel className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        ) : (
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
        )}
        <span>{rule.text}</span>
    </li>
);

export default function RulesAndDisciplinePage() {
    const { cards, archiveCard, isLoading: isLoadingCards } = useCards();
    const { feedback, isLoading: isLoadingFeedback } = useFeedback('player-101');
    const [selectedCard, setSelectedCard] = useState(null);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [selectedWarning, setSelectedWarning] = useState(null);
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const { toast } = useToast();
    const { currentUserRole } = useTeam();
    const [clubRules, setClubRules] = useState<ClubRule[]>([]);
    const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
    
    useEffect(() => {
        const fetchRules = async () => {
            const config = await getConfiguration();
            setClubRules(config?.clubRules || []);
        }
        fetchRules();
    }, []);

    const handleSaveRules = async (newRules: ClubRule[]) => {
        const config = await getConfiguration();
        await updateConfiguration({ ...config, clubRules: newRules });
        setClubRules(newRules);
        toast({ title: "Regeln aktualisiert!" });
    };

    const handleCardClick = (card) => {
        setSelectedCard(card);
        setIsCardModalOpen(true);
    };
    
    const handleWarningClick = (warning) => {
        setSelectedWarning(warning);
        setIsWarningModalOpen(true);
    };

    const handleArchive = async (cardToArchive, paidBy) => {
        await archiveCard(cardToArchive.id, paidBy);
        setIsCardModalOpen(false);
        toast({
          title: `Karte von ${cardToArchive.name} archiviert`,
          description: `Die Kosten wurden von ${paidBy} übernommen.`,
        });
    };
    
    const handlePay = (cardToPay) => {
        console.log("Pay action for", cardToPay);
    }
    
    const canEditClubRules = currentUserRole === 'Club-Admin' || currentUserRole === 'Board';
    const canEditTeamRules = currentUserRole === 'Coach';

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Verhaltenskodex & Bussen</h1>
                        <p className="text-muted-foreground">Verwalten Sie das Regelwerk und verfolgen Sie Vorfälle.</p>
                    </div>
                </div>

                <Tabs defaultValue="rules">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="rules">Regelwerk</TabsTrigger>
                        <TabsTrigger value="incidents">Vorfälle & Bussen</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="rules" className="mt-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary"/> Offizielle Vereinsregeln</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-4">
                                        {clubRules.map(rule => <RuleItem key={rule.id} rule={rule} />)}
                                    </ul>
                                </CardContent>
                                {canEditClubRules && (
                                    <CardFooter>
                                        <Button variant="outline" onClick={() => setIsRulesModalOpen(true)}><Edit className="mr-2 h-4 w-4"/> Vereinsregeln bearbeiten</Button>
                                    </CardFooter>
                                )}
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary"/> Mannschaftsregeln</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {TeamRules.map(rule => (
                                             <li key={rule.id} className="flex items-start gap-3">
                                                <Gavel className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <span>{rule.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                 {canEditTeamRules && (
                                    <CardFooter>
                                        <Button variant="outline"><Edit className="mr-2 h-4 w-4"/> Mannschaftsregeln bearbeiten</Button>
                                    </CardFooter>
                                )}
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="incidents" className="mt-4 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Offene Karten & Bussen</CardTitle>
                                <CardDescription>
                                    Klicken Sie auf eine Zeile, um die Details zu sehen oder die Busse als bezahlt zu markieren.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Spieler</TableHead>
                                            <TableHead>Datum</TableHead>
                                            <TableHead>Grund</TableHead>
                                            <TableHead>Kosten</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoadingCards ? <TableRow><TableCell colSpan={4}>Lade Bussen...</TableCell></TableRow> : cards.filter(c => c.status === 'Offen').map((card) => (
                                            <TableRow key={card.id} className="cursor-pointer" onClick={() => handleCardClick(card)}>
                                                <TableCell className="font-medium">{card.name}</TableCell>
                                                <TableCell>{card.date}</TableCell>
                                                <TableCell>{card.reason}</TableCell>
                                                <TableCell>CHF {card.cost.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Verwarnungen & Feedback</CardTitle>
                                <CardDescription>Andere erfasste Vorfälle, die keine direkten Bussen sind.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Spieler</TableHead>
                                            <TableHead>Datum</TableHead>
                                            <TableHead>Typ</TableHead>
                                            <TableHead>Beschreibung</TableHead>
                                            <TableHead>Von</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoadingFeedback ? <TableRow><TableCell colSpan={5}>Lade Feedback...</TableCell></TableRow> : feedback.map(item => (
                                            <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleWarningClick(item)}>
                                                <TableCell>Lionel Messi</TableCell>
                                                <TableCell>{item.date}</TableCell>
                                                <TableCell>
                                                    <Badge variant={item.type === 'Verwarnung' ? 'destructive' : 'secondary'}>{item.type}</Badge>
                                                </TableCell>
                                                <TableCell>{item.description}</TableCell>
                                                <TableCell>{item.author}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            {selectedCard && <PlayerCardModal card={selectedCard} isOpen={isCardModalOpen} onOpenChange={setIsCardModalOpen} onArchive={handleArchive} onPay={handlePay} />}
            {selectedWarning && <WarningDetailModal warning={selectedWarning} isOpen={isWarningModalOpen} onOpenChange={setIsWarningModalOpen} />}
             <RulesEditorModal
                isOpen={isRulesModalOpen}
                onOpenChange={setIsRulesModalOpen}
                rules={clubRules}
                onSave={handleSaveRules}
                title="Vereinsregeln bearbeiten"
            />
        </>
    );
}

  
