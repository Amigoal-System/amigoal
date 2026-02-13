

'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Handshake, Search, ArrowRight, Building, Mail, SearchCheck, Target, List, LayoutGrid, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSponsors } from '@/hooks/useSponsors';
import { useTeam } from '@/hooks/use-team';
import { useToast } from '@/hooks/use-toast';
import { SponsorDetailModal } from '@/components/SponsorDetailModal';
import { useSponsorTypes } from '@/hooks/useSponsorTypes';
import { SponsorDashboard } from '@/components/dashboards/SponsorDashboard';
import { getAllClubs } from '@/ai/flows/clubs';
import type { Club } from '@/ai/flows/clubs.types';
import { ClubSponsorshipDetailModal } from '@/components/ui/club-sponsorship-detail-modal';
import { SponsorLeadDetailModal } from '@/components/ui/sponsor-lead-detail-modal';
import { useSponsorLeads } from '@/hooks/useSponsorLeads';
import { proposeSponsorshipMatch } from '@/ai/flows/proposeSponsorshipMatch';
import { useSponsorshipProposals } from '@/hooks/useSponsorshipProposals';


const ClubAdminSponsoringPage = () => {
    const { sponsors, addSponsor, updateSponsor, deleteSponsor, isLoading } = useSponsors();
    const { sponsorTypes, isLoading: isLoadingTypes } = useSponsorTypes();
    const [selectedSponsor, setSelectedSponsor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { toast } = useToast();

    const handleOpenModal = (sponsor = null) => {
        setSelectedSponsor(sponsor);
        setIsModalOpen(true);
    };

    const handleSaveSponsor = (sponsorData: any) => {
        if(sponsorData.id) {
            updateSponsor(sponsorData);
        } else {
            addSponsor(sponsorData);
        }
    };
    
    if (isLoading || isLoadingTypes) {
        return <div>Lade Sponsoren...</div>;
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Sponsoring-Verwaltung</h1>
                        <p className="text-muted-foreground">Verwalten Sie Ihre Sponsoren und deren Pakete.</p>
                    </div>
                     <Button onClick={() => toast({title: "Anfrage gesendet!", description: "Ihre Anfrage wurde an den Plattform-Admin weitergeleitet."})}>
                        <SearchCheck className="mr-2 h-4 w-4"/> Sponsor suchen
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Aktive Sponsoren</CardTitle>
                            <Button size="sm" onClick={() => handleOpenModal(null)}>
                                <Handshake className="mr-2 h-4 w-4"/> Neuen Sponsor hinzufügen
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sponsor</TableHead>
                                    <TableHead>Pakete</TableHead>
                                    <TableHead>Betrag</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Vertragsende</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sponsors.map((sponsor) => (
                                    <TableRow key={sponsor.id} className="cursor-pointer" onClick={() => handleOpenModal(sponsor)}>
                                        <TableCell className="font-medium">{sponsor.company}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {sponsor.types.map(type => {
                                                    const typeInfo = sponsorTypes.find(t => t.name === type);
                                                    return <Badge key={type} style={typeInfo ? {backgroundColor: typeInfo?.color, color: 'white'} : {}}>{type}</Badge>
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell>CHF {sponsor.amount.toLocaleString('de-CH')}</TableCell>
                                        <TableCell>
                                            <Badge variant={sponsor.paymentStatus === 'Paid' ? 'default' : 'destructive'} className={sponsor.paymentStatus === 'Paid' ? 'bg-green-500' : ''}>
                                                {sponsor.paymentStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(sponsor.contractEnd).toLocaleDateString('de-CH')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <SponsorDetailModal 
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                sponsor={selectedSponsor}
                onSave={handleSaveSponsor}
                onDelete={deleteSponsor}
                sponsorTypes={sponsorTypes}
            />
        </>
    )
}

const SuperAdminSponsoringMarketplace = () => {
    const [clubSearch, setClubSearch] = useState('');
    const [sponsorSearch, setSponsorSearch] = useState('');
    const [allClubs, setAllClubs] = useState<Club[]>([]);
    const [isLoadingClubs, setIsLoadingClubs] = useState(true);
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);
    const [isClubModalOpen, setIsClubModalOpen] = useState(false);
    const { sponsorLeads, isLoading: isLoadingLeads } = useSponsorLeads();
    const { proposals, isLoading: isLoadingProposals } = useSponsorshipProposals();
    const [selectedSponsorLead, setSelectedSponsorLead] = useState(null);
    const [isSponsorLeadModalOpen, setIsSponsorLeadModalOpen] = useState(false);
    const { toast } = useToast();
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const proposedClubIds = useMemo(() => new Set(proposals?.map(p => p.clubId) || []), [proposals]);
    const proposedSponsorIds = useMemo(() => new Set(proposals?.map(p => p.sponsorLeadId) || []), [proposals]);

    const fetchClubs = useCallback(async () => {
        setIsLoadingClubs(true);
        try {
            const clubs = await getAllClubs({ includeArchived: false });
            setAllClubs(clubs);
        } catch (error) {
            console.error("Failed to load clubs", error);
        } finally {
            setIsLoadingClubs(false);
        }
    }, []);

    useEffect(() => {
        fetchClubs();
    }, [fetchClubs]);

    const seekingClubs = useMemo(() => {
        return allClubs.filter(c => 
            c.seekingSponsorship &&
            c.name.toLowerCase().includes(clubSearch.toLowerCase())
        );
    }, [allClubs, clubSearch]);

    const filteredSponsors = sponsorLeads.filter(s => s.company.toLowerCase().includes(sponsorSearch.toLowerCase()));
    
    const handleMatchPropose = async (club: Club, sponsor: any) => {
        try {
            await proposeSponsorshipMatch({ club, sponsor });
            toast({
                title: `Match für '${club.name}' vorgeschlagen`,
                description: `Eine Benachrichtigung wurde an ${sponsor.company} und den Club gesendet.`,
            });
            setIsClubModalOpen(false);
        } catch (error) {
            console.error("Failed to propose match:", error);
            toast({ title: "Fehler", description: "Vorschlag konnte nicht gesendet werden.", variant: "destructive"});
        }
    };
    
    const handleContactSponsor = (lead: any) => {
         toast({
            title: "Kontaktanfrage",
            description: `Eine E-Mail-Vorlage für ${lead.company} wurde vorbereitet.`,
        });
        setIsSponsorLeadModalOpen(false);
    }

    const ClubsView = () => {
        if (viewMode === 'grid') {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {seekingClubs.map(club => (
                        <Card key={club.id} className="cursor-pointer hover:shadow-lg" onClick={() => {setSelectedClub(club); setIsClubModalOpen(true);}}>
                           <CardHeader>
                                <CardTitle className="text-base">{club.name}</CardTitle>
                                <CardDescription>{club.league}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1">
                                    {proposedClubIds.has(club.id!) && <Badge variant="default" className="bg-yellow-500">Vorgeschlagen</Badge>}
                                    {club.sponsorshipNeeds?.map(need => <Badge key={need} variant="secondary">{need}</Badge>)}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }
        return (
            <Table>
                <TableHeader><TableRow><TableHead>Verein</TableHead><TableHead>Liga</TableHead><TableHead>Gesuchte Pakete</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aktion</TableHead></TableRow></TableHeader>
                <TableBody>
                    {seekingClubs.map(club => (
                        <TableRow key={club.id} className="cursor-pointer" onClick={() => { setSelectedClub(club); setIsClubModalOpen(true); }}>
                            <TableCell className="font-medium flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground"/>{club.name}</TableCell>
                            <TableCell>{club.league}</TableCell>
                            <TableCell><div className="flex flex-wrap gap-1">{club.sponsorshipNeeds?.map(pkg => <Badge key={pkg} variant="secondary">{pkg}</Badge>)}</div></TableCell>
                            <TableCell>{proposedClubIds.has(club.id!) && <Badge variant="default" className="bg-yellow-500">Vorgeschlagen</Badge>}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedClub(club); setIsClubModalOpen(true);}}>
                                    <Target className="mr-2 h-4 w-4" /> Match vorschlagen
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    const SponsorsView = () => {
        if (viewMode === 'grid') {
            return (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {filteredSponsors.map(sponsor => (
                         <Card key={sponsor.id} className="cursor-pointer hover:shadow-lg" onClick={() => { setSelectedSponsorLead(sponsor); setIsSponsorLeadModalOpen(true);}}>
                           <CardHeader>
                                <CardTitle className="text-base">{sponsor.company}</CardTitle>
                                <CardDescription>{sponsor.industry}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {proposedSponsorIds.has(sponsor.id!) && <Badge variant="default" className="bg-yellow-500">Vorgeschlagen</Badge>}
                                <p className="text-sm text-muted-foreground mt-2">{sponsor.interest}</p>
                            </CardContent>
                        </Card>
                     ))}
                 </div>
            );
        }
        return (
            <Table>
                <TableHeader><TableRow><TableHead>Firma</TableHead><TableHead>Branche</TableHead><TableHead>Interesse</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Aktion</TableHead></TableRow></TableHeader>
                <TableBody>
                    {filteredSponsors.map(sponsor => (
                        <TableRow key={sponsor.id} className="cursor-pointer" onClick={() => { setSelectedSponsorLead(sponsor); setIsSponsorLeadModalOpen(true);}}>
                            <TableCell className="font-medium flex items-center gap-2"><Handshake className="h-4 w-4 text-muted-foreground"/>{sponsor.company}</TableCell>
                            <TableCell>{sponsor.industry}</TableCell>
                            <TableCell>{sponsor.interest}</TableCell>
                            <TableCell>{proposedSponsorIds.has(sponsor.id!) && <Badge variant="default" className="bg-yellow-500">Vorgeschlagen</Badge>}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedSponsorLead(sponsor); setIsSponsorLeadModalOpen(true);}}>
                                    <Mail className="mr-2 h-4 w-4"/> Kontaktieren
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };
    
    const isLoadingData = isLoadingClubs || isLoadingLeads || isLoadingProposals;

    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Sponsoring Marktplatz</h1>
                        <p className="text-muted-foreground">Übersicht über sponsorensuchende Vereine und potenzielle Sponsoren.</p>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}><List className="h-4 w-4"/></Button>
                        <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}><LayoutGrid className="h-4 w-4"/></Button>
                    </div>
                </div>

                <Tabs defaultValue="seeking-clubs">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="seeking-clubs">Suchende Vereine ({seekingClubs.length})</TabsTrigger>
                        <TabsTrigger value="sponsor-pool">Sponsoren-Pool ({filteredSponsors.length})</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="seeking-clubs" className="mt-4">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Vereine auf Sponsorensuche</CardTitle>
                                    <div className="relative w-64">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Verein suchen..." className="pl-8" value={clubSearch} onChange={(e) => setClubSearch(e.target.value)} />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ClubsView />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="sponsor-pool" className="mt-4">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Potenzielle Sponsoren</CardTitle>
                                    <div className="relative w-64">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input placeholder="Sponsor suchen..." className="pl-8" value={sponsorSearch} onChange={(e) => setSponsorSearch(e.target.value)} />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <SponsorsView />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            <ClubSponsorshipDetailModal 
                club={selectedClub}
                isOpen={isClubModalOpen}
                onOpenChange={setIsClubModalOpen}
                onMatch={handleMatchPropose}
                sponsors={sponsorLeads}
            />
             <SponsorLeadDetailModal 
                lead={selectedSponsorLead}
                isOpen={isSponsorLeadModalOpen}
                onOpenChange={setIsSponsorLeadModalOpen}
                onContact={handleContactSponsor}
                seekingClubs={seekingClubs}
            />
        </>
    );
}

export default function SponsoringPageRouter() {
    const { currentUserRole } = useTeam();
    
    if (currentUserRole === 'Super-Admin' || currentUserRole === 'Marketing') {
        return <SuperAdminSponsoringMarketplace />;
    }

    if (currentUserRole === 'Sponsor') {
        return <SponsorDashboard />;
    }
    
    return <ClubAdminSponsoringPage />;
}
