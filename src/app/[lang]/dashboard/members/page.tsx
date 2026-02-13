
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Search, LayoutGrid, List, Upload, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MemberDetailModal } from '@/components/MemberDetailModal';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useTeam } from '@/hooks/use-team';
import { MemberImportModal } from '@/components/MemberImportModal';
import { CreateMemberWizard } from '@/components/CreateMemberWizard';
import { getAllMembers } from '@/ai/flows/members';
import type { Member } from '@/ai/flows/members.types';
import { deleteAllUsers } from '@/ai/flows/users';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MemberCard = ({ member, onClick }) => (
    <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onClick(member)}>
        <CardContent className="p-4 flex items-center gap-4">
            <Avatar className="h-12 w-12">
                <AvatarImage src={member.avatar}/>
                <AvatarFallback>{member.firstName?.charAt(0)}{member.lastName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="font-semibold">{member.firstName} {member.lastName}</p>
                <p className="text-sm text-muted-foreground">#{member.memberNr}</p>
                 <div className="flex items-center gap-2 mt-1">
                    {member.roles?.map(role => <Badge key={role} variant="outline">{role}</Badge>)}
                    {member.fee && (
                         <Badge variant={member.fee.paid ? 'default' : 'destructive'} className={member.fee.paid ? 'bg-green-500' : ''}>
                            {member.fee.paid ? 'Bezahlt' : 'Offen'}
                        </Badge>
                    )}
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function MembersPage() {
    const { club, currentUserRole } = useTeam();
    const [allMembers, setAllMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [viewMode, setViewMode] = useState('list');
    const { toast } = useToast();

    const isSuperAdmin = currentUserRole === 'Super-Admin';

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const clubIdToFetch = isSuperAdmin ? '*' : club?.id;
            
            if (clubIdToFetch) {
                const membersData = await getAllMembers(clubIdToFetch);
                setAllMembers(membersData);
            } else if (!isSuperAdmin) {
                return;
            }
        } catch (error) {
            console.error("Error fetching members:", error);
            if(!isSuperAdmin) {
              toast({ title: "Fehler beim Laden", description: "Mitglieder konnten nicht geladen werden.", variant: "destructive" });
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [club?.id, isSuperAdmin]);


    const filteredMembers = useMemo(() => {
        return allMembers.filter(member => {
            if (!member) return false;
            
            const feeStatus = member.fee?.paid ? 'Bezahlt' : 'Offen';
            const statusMatch = filter === 'all' || 
                                (filter === 'paid' && feeStatus === 'Bezahlt') ||
                                (filter === 'open' && feeStatus === 'Offen') ||
                                (filter === 'Aktiv' && member.status === 'Aktiv') ||
                                (filter === 'Passiv' && member.status === 'Passiv');

            const searchMatch = searchTerm === '' || 
                                `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (member.clubName && member.clubName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                (member.memberNr && member.memberNr.toLowerCase().includes(searchTerm.toLowerCase()));
            return statusMatch && searchMatch;
        });
    }, [allMembers, filter, searchTerm]);

    const paginatedMembers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredMembers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredMembers, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

    const handleOpenDetailModal = (member = null) => {
        setSelectedMember(member);
        setIsDetailModalOpen(true);
    };

    const handleSaveMember = async (memberData) => {
        // This should be implemented via a hook or direct call
        // For now, it will just close the modal
        setIsDetailModalOpen(false);
        fetchMembers(); // Refetch after save
    };
    
    const handleDeleteMember = async (memberId: string) => {
        // This should be implemented via a hook or direct call
        setIsDetailModalOpen(false);
        fetchMembers(); // Refetch after delete
    }

    const handleClearUsers = async () => {
        try {
            const result = await deleteAllUsers();
            toast({
                title: 'Benutzer gelöscht',
                description: `${result.deletedCount} Benutzer wurden erfolgreich entfernt.`
            });
            fetchMembers();
        } catch (error) {
            console.error("Error clearing users:", error);
            toast({
                title: "Fehler",
                description: "Benutzer konnten nicht gelöscht werden.",
                variant: "destructive",
            });
        }
    }


    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>
    }

    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">{isSuperAdmin ? 'Alle Benutzer' : 'Mitgliederverwaltung'}</h1>
                        <p className="text-muted-foreground">Übersicht aller {isSuperAdmin ? 'Benutzer auf der Plattform' : 'Mitglieder des Vereins'}.</p>
                    </div>
                     {isSuperAdmin ? (
                        <div className="flex items-center gap-2">
                             <Button variant="outline" onClick={() => setIsImportModalOpen(true)}><Upload className="mr-2 h-4 w-4"/> Importieren</Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 className="mr-2 h-4 w-4" /> Benutzerliste leeren (Temp)
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Alle Benutzer löschen?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Diese Aktion kann nicht rückgängig gemacht werden. Alle Benutzer werden dauerhaft aus der Datenbank entfernt.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleClearUsers}>Löschen</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                     ) : (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={() => setIsImportModalOpen(true)}><Upload className="mr-2 h-4 w-4"/> Importieren</Button>
                            <Button onClick={() => setIsWizardOpen(true)}>
                                <PlusCircle className="mr-2 h-4 w-4"/> Neues Mitglied
                            </Button>
                        </div>
                     )}
                </div>

                <Card>
                     <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>{isSuperAdmin ? 'Benutzerliste' : 'Mitgliederliste'}</CardTitle>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Suchen..." 
                                        className="pl-8"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Select value={filter} onValueChange={setFilter}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Alle Status</SelectItem>
                                        <SelectItem value="paid">Bezahlt</SelectItem>
                                        <SelectItem value="open">Offen</SelectItem>
                                        <SelectItem value="Aktiv">Aktiv</SelectItem>
                                        <SelectItem value="Passiv">Passiv</SelectItem>
                                    </SelectContent>
                                </Select>
                                 <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}><List className="h-4 w-4"/></Button>
                                <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}><LayoutGrid className="h-4 w-4"/></Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                       {viewMode === 'list' ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mitglied</TableHead>
                                        {isSuperAdmin && <TableHead>Verein</TableHead>}
                                        <TableHead>Mannschaft</TableHead>
                                        <TableHead>Rollen</TableHead>
                                        <TableHead>Beitrag</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedMembers.map((member) => (
                                        <TableRow key={member.id} className="cursor-pointer" onClick={() => handleOpenDetailModal(member)}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={member.avatar || undefined}/>
                                                        <AvatarFallback>{member.firstName?.charAt(0)}{member.lastName?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p>{member.firstName} {member.lastName}</p>
                                                        <p className="text-xs text-muted-foreground">#{member.memberNr}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            {isSuperAdmin && <TableCell>{member.clubName}</TableCell>}
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {member.teams?.map(t => <Badge key={t} variant="outline">{t}</Badge>)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                 <div className="flex flex-wrap gap-1">
                                                    {member.roles?.map(r => <Badge key={r} variant="secondary">{r}</Badge>)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {member.fee && (
                                                    <Badge variant={member.fee.paid ? 'default' : 'destructive'} className={member.fee.paid ? 'bg-green-500' : ''}>
                                                        {member.fee.paid ? 'Bezahlt' : 'Offen'}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                       ) : (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                               {paginatedMembers.map((member) => (
                                   <MemberCard key={member.id} member={member} onClick={handleOpenDetailModal} />
                               ))}
                           </div>
                       )}
                    </CardContent>
                     <CardFooter>
                        <div className="flex items-center justify-between w-full">
                            <div className="text-xs text-muted-foreground">
                                Zeigt <strong>{paginatedMembers.length}</strong> von <strong>{filteredMembers.length}</strong> {isSuperAdmin ? 'Benutzern' : 'Mitgliedern'}.
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

             <CreateMemberWizard 
                isOpen={isWizardOpen}
                onOpenChange={setIsWizardOpen}
                onMemberCreated={fetchMembers}
            />

            <MemberDetailModal
                member={selectedMember}
                isOpen={isDetailModalOpen}
                onOpenChange={setIsDetailModalOpen}
                onSave={handleSaveMember}
                onDelete={handleDeleteMember}
            />
            <MemberImportModal 
                isOpen={isImportModalOpen}
                onOpenChange={setIsImportModalOpen}
                onImportSuccess={fetchMembers}
            />
        </>
    );
}
