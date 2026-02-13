
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, ArrowRight, Users, Trophy, BarChart2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type Locale } from '@/../i18n.config';
import { useTeams } from '@/hooks/useTeams';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { useTeam } from '@/hooks/use-team';
import { useMembers } from '@/hooks/useMembers';
import { UpcomingEventsCard } from '../UpcomingEventsCard';

const StatCard = ({ title, value, icon: Icon, description, href, lang }) => (
    <Link href={`/${lang}${href}`} className="block">
        <Card className="hover:bg-muted/50 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    </Link>
);


export function ClubManagerDashboard() {
    const params = useParams();
    const lang = params.lang as Locale;
    const { club, isLoading: isLoadingClub } = useTeam();
    const { members, isLoading: isLoadingMembers } = useMembers(club?.id);
    const { categorizedTeams, isLoading: isLoadingTeams } = useTeams(club?.id);

    const allTeams = useMemo(() => {
        return Object.values(categorizedTeams).flat();
    }, [categorizedTeams]);

    const totalPlayers = members.length;
    const openInvoices = members.filter(m => m.fee && !m.fee.paid).length;
    
    const isLoading = isLoadingMembers || isLoadingTeams || isLoadingClub;


    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5); // Changed for better layout

    const paginatedTeams = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return allTeams.slice(startIndex, startIndex + itemsPerPage);
    }, [allTeams, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(allTeams.length / itemsPerPage);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-headline">Club Dashboard: {club?.name}</h1>
                <div className="flex items-center gap-2">
                     <Button asChild>
                        <Link href={`/${lang}/dashboard/teams`}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Neue Mannschaft
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Gesamtmitglieder" value={isLoading ? '...' : totalPlayers} icon={Users} description="Alle aktiven & passiven Mitglieder" href="/dashboard/members" lang={lang} />
                <StatCard title="Anzahl Mannschaften" value={isLoading ? '...' : allTeams.length} icon={Trophy} description="In allen Altersklassen" href="/dashboard/teams" lang={lang}/>
                <StatCard title="Anstehende Spiele" value="0" icon={BarChart2} description="In der nächsten Woche" href="/dashboard/matches" lang={lang}/>
                <StatCard title="Offene Rechnungen" value={isLoading ? '...' : openInvoices} icon={BarChart2} description="Über alle Mitglieder" href="/dashboard/invoices" lang={lang}/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mannschafts-Übersicht</CardTitle>
                            <CardDescription>Ein schneller Überblick über alle Teams im Verein.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Team</TableHead>
                                        <TableHead>Liga</TableHead>
                                        <TableHead>Trainer</TableHead>
                                        <TableHead>Spieler</TableHead>
                                        <TableHead>Aktion</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={5} className="text-center">Lade Mannschaften...</TableCell></TableRow>
                                    ) : paginatedTeams.map((team) => (
                                        <TableRow key={team.id || team.name}>
                                            <TableCell className="font-medium">{team.name}</TableCell>
                                            <TableCell>{team.liga || 'N/A'}</TableCell>
                                            <TableCell>{team.trainer || 'N/A'}</TableCell>
                                            <TableCell>{team.members}</TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/${lang}/dashboard/teams`}>Details</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                        <CardFooter>
                            <div className="flex items-center justify-between w-full">
                                <div className="text-xs text-muted-foreground">
                                    Zeigt <strong>{paginatedTeams.length}</strong> von <strong>{allTeams.length}</strong> Mannschaften.
                                </div>
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1))}} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
                                        </PaginationItem>
                                        <PaginationItem>
                                            <span className="font-medium text-sm">Seite {currentPage} von {totalPages}</span>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1))}} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}/>
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
                 <div className="lg:col-span-1 flex flex-col gap-6">
                    <UpcomingEventsCard title="Nächste Geburtstage" members={members} eventType="birthday" />
                    <UpcomingEventsCard title="Anstehende Jubiläen" members={members} eventType="anniversary" />
                </div>
            </div>
        </div>
    );
}
