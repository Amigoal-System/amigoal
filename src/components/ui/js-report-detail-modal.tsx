
'use client';

import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from './button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';
import { ScrollArea } from './scroll-area';
import { Badge } from './badge';
import { useAbsences } from '@/hooks/useAbsences';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import type { Training } from '@/ai/flows/trainings.types';
import type { Member } from '@/ai/flows/members.types';

const AttendanceStatusIcon = ({ status }) => {
    switch (status) {
        case 'confirmed':
        case 'confirmed_driving':
        case 'confirmed_needs_ride':
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'declined':
            return <XCircle className="h-4 w-4 text-red-500" />;
        default:
            return <HelpCircle className="h-4 w-4 text-gray-400" />;
    }
}

const TeamAttendanceTable = ({ teamName, trainings, members }: {teamName: string, trainings: Training[], members: Member[]}) => {
    const teamMembers = useMemo(() => members.filter(m => m.teams?.includes(teamName)), [members, teamName]);
    const teamMemberIds = useMemo(() => teamMembers.map(m => m.id!), [teamMembers]);
    
    const { getAbsenceStatus, isLoading } = useAbsences(teamMemberIds);

    if (isLoading) return <p>Lade Anwesenheiten...</p>;

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Spieler</TableHead>
                    {trainings.map(t => (
                        <TableHead key={t.id} className="text-center">{new Date(t.date).toLocaleDateString('de-CH', {day: '2-digit', month: '2-digit'})}</TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {teamMembers.map(member => (
                    <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.firstName} {member.lastName}</TableCell>
                        {trainings.map(t => {
                             const status = getAbsenceStatus(t.id, member.id!);
                             return (
                                <TableCell key={`${t.id}-${member.id}`} className="text-center">
                                    <AttendanceStatusIcon status={status} />
                                </TableCell>
                            )
                        })}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export const JsReportDetailModal = ({ isOpen, onOpenChange, report, allMembers }) => {

    const teamsWithTrainings = useMemo(() => {
        if (!report?.trainings) return [];

        const teamsMap = new Map<string, any[]>();
        report.trainings.forEach(training => {
            const teamName = training.team;
            if (!teamsMap.has(teamName)) {
                teamsMap.set(teamName, []);
            }
            teamsMap.get(teamName)!.push(training);
        });

        return Array.from(teamsMap.entries()).map(([name, trainings]) => ({
            name,
            trainings
        }));
    }, [report]);

    if (!isOpen || !report) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{report.title}</DialogTitle>
                    <DialogDescription>
                        Detailansicht der Trainingsanwesenheiten für den ausgewählten Zeitraum.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[70vh] w-full pr-4 -mr-2">
                    <Accordion type="multiple" defaultValue={teamsWithTrainings.map(t => t.name)}>
                        {teamsWithTrainings.map(team => (
                            <AccordionItem key={team.name} value={team.name}>
                                <AccordionTrigger>{team.name} ({team.trainings.length} Trainings)</AccordionTrigger>
                                <AccordionContent>
                                    <TeamAttendanceTable 
                                        teamName={team.name}
                                        trainings={team.trainings}
                                        members={allMembers}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Schliessen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
