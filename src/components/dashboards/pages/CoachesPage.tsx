
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { type Locale } from '@/i18n.config';
import { useMembers } from '@/hooks/useMembers';
import { useTeam } from '@/hooks/use-team';

export default function CoachesPage() {
    const { club, lang } = useTeam();
    const { members, isLoading } = useMembers(club?.id);
    const router = useRouter();

    const coaches = React.useMemo(() => {
        if (!members) return [];
        return members.filter(m => m.roles?.includes('Trainer'));
    }, [members]);
    
    const handleViewDetails = (coachId: string) => {
        router.push(`/${lang}/dashboard/coaches/detail?id=${coachId}`);
    }

    if (isLoading) {
        return <p>Lade Trainer...</p>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Trainer &amp; Staff</h1>
                    <p className="text-muted-foreground">Übersicht aller Trainer und Staff-Mitglieder des Vereins.</p>
                </div>
                <Button><PlusCircle className="mr-2 h-4 w-4"/> Neuen Trainer hinzufügen</Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Rollen</TableHead>
                                <TableHead>Mannschaften</TableHead>
                                <TableHead className="text-right">Aktionen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coaches.map(coach => (
                                <TableRow key={coach.id} className="cursor-pointer" onClick={() => handleViewDetails(coach.id!)}>
                                    <TableCell className="font-semibold flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={coach.avatar || undefined} />
                                            <AvatarFallback>{coach.firstName?.charAt(0)}{coach.lastName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {coach.firstName} {coach.lastName}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {coach.roles?.map(role => <Badge key={role} variant="outline">{role}</Badge>)}
                                        </div>
                                    </TableCell>
                                     <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {coach.teams?.map(team => <Badge key={team} variant="secondary">{team}</Badge>)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <Button variant="ghost" size="sm">
                                             Details anzeigen
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
