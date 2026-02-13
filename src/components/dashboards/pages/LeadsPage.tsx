
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, Edit, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LeadDetailModal } from '@/components/LeadDetailModal';
import { useLeads } from '@/hooks/useLeads';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LeadsPage() {
    const { leads, addLead, updateLead, deleteLead, deleteLeads, isLoading, refetchLeads } = useLeads();
    const [selectedLead, setSelectedLead] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => 
            lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.contact.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [leads, searchTerm]);

    const paginatedLeads = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredLeads.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredLeads, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

    const handleOpenModal = (lead) => {
        setSelectedLead(lead);
        setIsModalOpen(true);
    }
    
    const handleSaveLead = (leadData) => {
        if(leadData.id) {
            updateLead(leadData);
        } else {
            addLead(leadData);
        }
        setIsModalOpen(false);
    }
    
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedLeadIds(paginatedLeads.map(lead => lead.id!));
        } else {
            setSelectedLeadIds([]);
        }
    };

    const handleSelectRow = (leadId: string, isSelected: boolean) => {
        if (isSelected) {
            setSelectedLeadIds(prev => [...prev, leadId]);
        } else {
            setSelectedLeadIds(prev => prev.filter(id => id !== leadId));
        }
    };
    
    const handleDeleteSelected = async () => {
        await deleteLeads(selectedLeadIds);
        setSelectedLeadIds([]);
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Interessent': return <Badge variant="secondary">Interessent</Badge>;
            case 'Kontaktiert': return <Badge className="bg-blue-100 text-blue-800">Kontaktiert</Badge>;
            case 'Verhandlung': return <Badge className="bg-yellow-100 text-yellow-800">Verhandlung</Badge>;
            case 'Gewonnen':
            case 'Onboarding':
                return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
            case 'Verloren':
                return <Badge variant="destructive">{status}</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Lead Management</h1>
                    <p className="text-muted-foreground">Verwalten Sie potenzielle neue Vereine für Amigoal.</p>
                </div>
                <div className="flex items-center gap-2">
                    {selectedLeadIds.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">Aktionen ({selectedLeadIds.length})</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={handleDeleteSelected} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4"/> Ausgewählte löschen
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    <Button onClick={() => handleOpenModal(null)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Neuen Lead hinzufügen
                    </Button>
                </div>
            </div>

             <Card>
                 <CardHeader>
                    <div className="flex justify-between">
                         <CardTitle>Aktive Leads</CardTitle>
                         <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Leads suchen..." 
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? <p>Lade Leads...</p> : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10">
                                        <Checkbox
                                            checked={selectedLeadIds.length === paginatedLeads.length && paginatedLeads.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead>Verein</TableHead>
                                    <TableHead>Kontaktperson</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tags</TableHead>
                                    <TableHead>Letzter Kontakt</TableHead>
                                    <TableHead className="text-right">Aktion</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedLeads.map(lead => (
                                    <TableRow key={lead.id} onClick={() => handleOpenModal(lead)} className="cursor-pointer">
                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                checked={selectedLeadIds.includes(lead.id!)}
                                                onCheckedChange={(checked) => handleSelectRow(lead.id!, !!checked)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-semibold">{lead.name}</TableCell>
                                        <TableCell>{lead.contact}</TableCell>
                                        <TableCell>{getStatusBadge(lead.status)}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {lead.tags?.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(lead.lastContact).toLocaleDateString('de-CH')}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenModal(lead); }}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
                <CardFooter>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Zeige</span>
                            <Select value={String(itemsPerPage)} onValueChange={(val) => setItemsPerPage(Number(val))}>
                                <SelectTrigger className="w-20">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {[10, 25, 50, 100].map(val => (
                                        <SelectItem key={val} value={String(val)}>{val}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                             <span>von {filteredLeads.length} Leads.</span>
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

            {isModalOpen && (
                <LeadDetailModal
                    lead={selectedLead}
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    onSave={handleSaveLead}
                    onDelete={deleteLead}
                />
            )}
        </>
    );
}
