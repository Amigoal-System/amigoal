
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { getAllClubs } from '@/ai/flows/clubs';
import { useTeams } from '@/hooks/useTeams';
import type { Club } from '@/ai/flows/clubs.types';

export const BulkAssignModal = ({ isOpen, onOpenChange, selectedUserCount, onSave }) => {
    const [allClubs, setAllClubs] = useState<Club[]>([]);
    const [selectedClubId, setSelectedClubId] = useState<string>('');
    const [selectedTeamName, setSelectedTeamName] = useState<string>('');
    const { categorizedTeams, isLoading: isLoadingTeams } = useTeams(selectedClubId);
    const allTeamsInClub = React.useMemo(() => Object.values(categorizedTeams).flat(), [categorizedTeams]);
    const { toast } = useToast();

    useEffect(() => {
        const fetchClubs = async () => {
            const clubs = await getAllClubs({ includeArchived: false });
            setAllClubs(clubs);
        };
        if (isOpen) {
            fetchClubs();
        } else {
            // Reset state when modal closes
            setSelectedClubId('');
            setSelectedTeamName('');
        }
    }, [isOpen]);

    const handleSave = () => {
        if (!selectedClubId) {
            toast({ title: 'Bitte wählen Sie einen Verein aus.', variant: 'destructive' });
            return;
        }
        const selectedClub = allClubs.find(c => c.id === selectedClubId);
        onSave({ clubId: selectedClubId, clubName: selectedClub?.name, teamName: selectedTeamName });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Massen-Zuweisung</DialogTitle>
                    <DialogDescription>
                        Weisen Sie die ausgewählten {selectedUserCount} Benutzer einem Verein oder einer Mannschaft zu.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="club-select">Verein zuweisen</Label>
                        <Select onValueChange={setSelectedClubId} value={selectedClubId}>
                            <SelectTrigger id="club-select">
                                <SelectValue placeholder="Verein auswählen..." />
                            </SelectTrigger>
                            <SelectContent>
                                {allClubs.map(club => (
                                    <SelectItem key={club.id} value={club.id!}>{club.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     {selectedClubId && (
                        <div className="space-y-2">
                            <Label htmlFor="team-select">Mannschaft zuweisen (optional)</Label>
                            <Select onValueChange={setSelectedTeamName} value={selectedTeamName}>
                                <SelectTrigger id="team-select">
                                    <SelectValue placeholder={isLoadingTeams ? "Lade Teams..." : "Mannschaft auswählen..."} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">Keine Mannschaftszuweisung</SelectItem>
                                    {allTeams.map(team => (
                                        <SelectItem key={team.id} value={team.name}>{team.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={handleSave}>Zuweisung speichern</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
