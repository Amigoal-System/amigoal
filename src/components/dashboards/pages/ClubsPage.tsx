'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Edit, Archive, PlayCircle, PauseCircle, Globe, List, LayoutGrid, Upload, ArrowUpDown } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClubDetailModal } from '@/components/ClubDetailModal';
import { getAllClubs, updateClubStatus, updateClub } from '@/ai/flows/clubs';
import type { Club } from '@/ai/flows/clubs.types';
import Image from 'next/image';
import { AmigoalLogo } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ClubImportModal } from '@/components/ClubImportModal';

const getStatusBadge = (status: Club['status']) => {
  switch (status) {
    case 'suspended':
      return <Badge variant="destructive">Gesperrt</Badge>;
    case 'archived':
      return <Badge variant="outline">Archiviert</Badge>;
    case 'active':
    default:
      return <Badge className="bg-green-500">Aktiv</Badge>;
  }
};

const ClubCard = ({ club, onOpenModal }: { club: Club, onOpenModal: (club: Club) => void }) => (
    <Card className="flex flex-col cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onOpenModal(club)}>
        <CardHeader className="flex-row items-center gap-4 space-y-0 pb-4">
             {club.logo ? (
                <Image src={club.logo} alt={`${club.name} Logo`} width={48} height={48} className="rounded-full" />
            ) : (
                <AmigoalLogo className="w-12 h-12" />
            )}
            <div className="flex-1">
                <CardTitle className="text-base">{club.name}</CardTitle>
                {club.url && 
                    <a href={`https://${club.url}`} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Globe className="h-3 w-3"/>
                        {club.url}
                    </a>
                }
            </div>
        </CardHeader>
        <CardContent className="flex-1 text-sm">
            <p className="text-muted-foreground">Manager: {club.manager}</p>
        </CardContent>
        <CardFooter>
            {getStatusBadge(club.status)}
        </CardFooter>
    </Card>
);

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const { toast } = useToast();
  const [sortConfig, setSortConfig] = useState<{ key: keyof Club, direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });

  const fetchClubs = async () => {
    setIsLoading(true);
    try {
      const fetchedClubs = await getAllClubs({ includeArchived: true });
      setClubs(fetchedClubs);
    } catch (error) {
      console.error("Failed to fetch clubs:", error);
      toast({
        title: "Fehler beim Laden",
        description: "Die Vereine konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const sortedClubs = useMemo(() => {
    let sortableClubs = [...clubs];
    if (sortConfig !== null) {
      sortableClubs.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (valA === null || valA === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
        if (valB === null || valB === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;

        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableClubs;
  }, [clubs, sortConfig]);

  const requestSort = (key: keyof Club) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  const handleOpenModal = (club: Club) => {
    setSelectedClub(club);
    setIsModalOpen(true);
  };
  
  const handleUpdateClub = async (updatedClub: Club) => {
    await updateClub(updatedClub);
    await fetchClubs();
    toast({ description: "Vereinsdaten aktualisiert."});
  };

  const handleClubStatusChange = async (clubId: string, status: 'active' | 'suspended' | 'archived') => {
    try {
      await updateClubStatus({ clubId, status });
      toast({ description: `Verein wurde auf '${status}' gesetzt.` });
      await fetchClubs();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Der Vereinsstatus konnte nicht geändert werden.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Lade Vereine...</div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">Vereins-Management</h1>
            <p className="text-muted-foreground">Übersicht aller Vereine auf der Amigoal-Plattform.</p>
        </div>
        <div className="flex items-center gap-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant={viewMode === 'list' ? 'default': 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                            <List className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Listenansicht</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant={viewMode === 'grid' ? 'default': 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Gitteransicht</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
             <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                <Upload className="mr-2 h-4 w-4" /> Importieren
            </Button>
            <Button asChild>
                <Link href="/de/dashboard/add-club">
                    <PlusCircle className="mr-2 h-4 w-4" /> Neuen Verein hinzufügen
                </Link>
            </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedClubs.map(club => (
                <ClubCard key={club.id} club={club} onOpenModal={handleOpenModal} />
            ))}
        </div>
      ) : (
         <Card>
            <CardContent className="p-0">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>
                         <Button variant="ghost" onClick={() => requestSort('name')}>
                            Verein <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </TableHead>
                    <TableHead>
                        <Button variant="ghost" onClick={() => requestSort('manager')}>
                            Manager <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </TableHead>
                    <TableHead>Login-E-Mail</TableHead>
                    <TableHead>
                        <Button variant="ghost" onClick={() => requestSort('status')}>
                            Status <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </TableHead>
                    <TableHead>Aktionen</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {sortedClubs.map(club => (
                    <TableRow key={club.id} className="cursor-pointer" onClick={() => handleOpenModal(club)}>
                    <TableCell className="font-semibold flex items-center gap-2">
                        <img src={club.logo || ''} alt={club.name} className="h-8 w-8 rounded-full" />
                        {club.name}
                    </TableCell>
                    <TableCell>{club.manager}</TableCell>
                    <TableCell>{club.clubLoginUser}</TableCell>
                    <TableCell>
                        {getStatusBadge(club.status)}
                    </TableCell>
                    <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                    <MoreHorizontal className="h-4 w-4"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={() => handleOpenModal(club)}>
                                    <Edit className="mr-2 h-4 w-4"/> Details & Bearbeiten
                                </DropdownMenuItem>
                                {club.status === 'archived' ? (
                                    <DropdownMenuItem onClick={() => handleClubStatusChange(club.id!, 'active')} className="text-green-600">
                                        <PlayCircle className="mr-2 h-4 w-4"/> Wiederherstellen
                                    </DropdownMenuItem>
                                ) : (
                                    <>
                                        <DropdownMenuItem onClick={() => handleClubStatusChange(club.id!, club.status === 'suspended' ? 'active' : 'suspended')} className={club.status === 'suspended' ? 'text-green-600' : 'text-orange-600'}>
                                            {club.status === 'suspended' ? <PlayCircle className="mr-2 h-4 w-4"/> : <PauseCircle className="mr-2 h-4 w-4"/>}
                                            {club.status === 'suspended' ? 'Aktivieren' : 'Sperren'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleClubStatusChange(club.id!, 'archived')} className="text-destructive">
                                        <Archive className="mr-2 h-4 w-4"/> Archivieren
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
         </Card>
      )}
      
      {selectedClub && (
          <ClubDetailModal 
            club={selectedClub}
            isOpen={isModalOpen}
            onOpenChange={setIsModalOpen}
            onSave={handleUpdateClub}
            onStatusChange={handleClubStatusChange}
          />
      )}
      <ClubImportModal
        isOpen={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onImportSuccess={fetchClubs}
      />
    </>
  );
}
