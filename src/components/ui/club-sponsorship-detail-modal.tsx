
'use client';

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Users, Globe, Target, Search } from 'lucide-react';
import { Input } from './input';
import type { Club } from '@/ai/flows/clubs.types';
import type { SponsorLead } from '@/ai/flows/sponsorLeads.types';

export const ClubSponsorshipDetailModal = ({ club, isOpen, onOpenChange, onMatch, sponsors }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSponsor, setSelectedSponsor] = useState<SponsorLead | null>(null);

    const filteredSponsors = useMemo(() => {
        if (!sponsors) return [];
        return sponsors.filter(s => s.company.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [sponsors, searchTerm]);
    
    if (!club) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Match für: {club.name}</DialogTitle>
                    <DialogDescription>Wählen Sie einen passenden Sponsor aus dem Pool aus, um ihn dem Verein vorzuschlagen.</DialogDescription>
                </DialogHeader>
                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                    {/* Left: Club Info */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Vereins-Informationen</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <p className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground"/> {club.memberCount || 'N/A'} Mitglieder</p>
                                <p className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground"/> <a href={club.website || '#'} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{club.website || 'Keine Webseite'}</a></p>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Gesuchte Sponsoring-Pakete</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-2">
                                {club.sponsorshipNeeds?.map(need => (
                                    <Badge key={need} variant="secondary">{need}</Badge>
                                ))}
                                {(!club.sponsorshipNeeds || club.sponsorshipNeeds.length === 0) && <p className="text-xs text-muted-foreground">Kein spezifischer Bedarf angegeben.</p>}
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader>
                                <CardTitle className="text-base">Vermittlungsprovision</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm">Bei erfolgreicher Vermittlung erhält Amigoal eine Provision von <strong>15%</strong> vom Verein.</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Sponsor List */}
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Sponsor suchen..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="space-y-2 h-96 overflow-y-auto pr-2">
                            {filteredSponsors.map(sponsor => (
                                <div key={sponsor.id} className={`p-3 border rounded-lg cursor-pointer ${selectedSponsor?.id === sponsor.id ? 'border-primary ring-2 ring-primary' : 'hover:bg-muted/50'}`} onClick={() => setSelectedSponsor(sponsor)}>
                                    <p className="font-semibold">{sponsor.company}</p>
                                    <p className="text-xs text-muted-foreground">{sponsor.industry} - Interesse: {sponsor.interest}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={() => onMatch(club, selectedSponsor)} disabled={!selectedSponsor}>
                        <Target className="mr-2 h-4 w-4" /> Match vorschlagen & benachrichtigen
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
