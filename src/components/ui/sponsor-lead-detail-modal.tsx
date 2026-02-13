
'use client';

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './card';
import { Mail, Phone, Building, Briefcase, Target, Search } from 'lucide-react';
import { ScrollArea } from './scroll-area';
import { Input } from './input';
import type { SponsorLead } from '@/ai/flows/sponsorLeads.types';
import type { Club } from '@/ai/flows/clubs.types';

export const SponsorLeadDetailModal = ({ lead, isOpen, onOpenChange, onContact, seekingClubs }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClubs = useMemo(() => {
        // Add a guard clause to prevent error if seekingClubs is undefined
        if (!seekingClubs) {
            return [];
        }
        return seekingClubs.filter(club => 
            club.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [seekingClubs, searchTerm]);
    
    if (!lead) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{lead.company}</DialogTitle>
                    <DialogDescription>{lead.industry}</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto">
                    {/* Left: Sponsor Info */}
                    <div className="space-y-4">
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Kontaktinformationen</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <p className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground"/> {lead.contact}</p>
                                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground"/> {lead.email}</p>
                            </CardContent>
                             <CardFooter>
                                <Button className="w-full" variant="outline" onClick={() => onContact(lead)}>
                                    <Mail className="mr-2 h-4 w-4" /> E-Mail senden
                                </Button>
                             </CardFooter>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Interesse</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{lead.interest}</p>
                                {lead.packages && lead.packages.length > 0 && (
                                    <div className="mt-2">
                                        <h4 className="font-semibold text-xs mb-1">Gewählte Pakete:</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {lead.packages.map(pkg => <Badge key={pkg}>{pkg}</Badge>)}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Club List */}
                     <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Mögliche Vereine für Match</h3>
                         <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Verein suchen..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <ScrollArea className="h-72 border rounded-md">
                             <div className="p-2 space-y-1">
                                {filteredClubs.length > 0 ? filteredClubs.map((club: Club) => (
                                    <div key={club.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-md">
                                        <div>
                                            <p className="font-semibold">{club.name}</p>
                                            <p className="text-xs text-muted-foreground">{club.league}</p>
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-center text-muted-foreground p-4">Keine passenden Vereine gefunden.</p>}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Schliessen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
