'use client';

import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { FileDown, Upload, Loader2, FileCheck2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { useTeam } from '@/hooks/use-team';
import { createTeam } from '@/ai/flows/teams';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useMembers } from '@/hooks/useMembers';

export const TeamImportModal = ({ isOpen, onOpenChange, onImportSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importedCount, setImportedCount] = useState(0);
    const { club } = useTeam();
    const { members, isLoading: isLoadingMembers } = useMembers(club?.id);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleDownloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,Name,Kategorie,Liga,Trainer,Staff,Spieler\n1. Mannschaft,Aktive,3. Liga,Pep Guardiola,Co-Trainer Name,\"Lionel Messi,Cristiano Ronaldo\"";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "amigoal_team_import_vorlage.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = async () => {
        if (!file) {
            toast({ title: "Keine Datei ausgewählt", variant: 'destructive' });
            return;
        }
        if (!club?.id) {
            toast({ title: "Verein nicht gefunden", description: "Es konnte kein aktiver Verein für den Import gefunden werden.", variant: "destructive"});
            return;
        }
        if (isLoadingMembers) {
            toast({ title: "Bitte warten", description: "Mitgliederdaten werden noch geladen.", variant: "default" });
            return;
        }

        setIsImporting(true);
        setImportedCount(0);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const teamsToCreate = results.data as any[];
                let successCount = 0;
                
                for (const team of teamsToCreate) {
                    try {
                        const playerNames = (team.Spieler || '').split(',').map(name => name.trim()).filter(Boolean);
                        const coachName = team.Trainer?.trim();
                        const staffNames = (team.Staff || '').split(',').map(name => name.trim()).filter(Boolean);

                        const findMemberByName = (name: string) => members.find(m => `${m.firstName} ${m.lastName}`.toLowerCase() === name.toLowerCase());

                        const players = playerNames.map(findMemberByName).filter(Boolean).map(p => ({ id: p!.id, firstName: p!.firstName, lastName: p!.lastName, position: p!.position, trikot: p!.trikot, fee: p!.fee }));
                        const coach = coachName ? findMemberByName(coachName) : null;
                        const staff = staffNames.map(findMemberByName).filter(Boolean);
                        
                        if (coach && !staff.some(s => s.id === coach.id)) {
                            staff.push(coach);
                        }

                        await createTeam({
                            clubId: club.id!,
                            name: team.Name,
                            category: team.Kategorie,
                            liga: team.Liga,
                            trainer: coach ? `${coach.firstName} ${coach.lastName}` : team.Trainer,
                            members: players.length,
                            staff: staff.map(s => ({ id: s!.id!, firstName: s!.firstName, lastName: s!.lastName, role: s!.roles[0] || 'Staff'})),
                            players: players,
                            trainings: [],
                            material: [],
                        });
                        successCount++;
                        setImportedCount(successCount);
                    } catch (error) {
                        console.error(`Failed to import team: ${team.Name}`, error);
                    }
                }

                toast({
                    title: "Import abgeschlossen",
                    description: `${successCount} von ${teamsToCreate.length} Mannschaften wurden erfolgreich importiert.`
                });
                setIsImporting(false);
                onImportSuccess(); // Refetch teams on parent page
                onOpenChange(false);
            },
            error: (error) => {
                console.error("CSV parsing error:", error);
                toast({ title: "Fehler beim Lesen der Datei", description: "Stellen Sie sicher, dass es eine gültige CSV-Datei ist.", variant: 'destructive' });
                setIsImporting(false);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Mannschaften importieren</DialogTitle>
                    <DialogDescription>
                        Laden Sie eine CSV-Datei hoch, um mehrere Mannschaften inklusive Spieler und Staff zu erstellen.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Anleitung</h4>
                        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                            <li>Laden Sie die CSV-Vorlage herunter.</li>
                            <li>Füllen Sie die Spalten aus. Die Namen in `Trainer`, `Staff` und `Spieler` müssen exakt mit bestehenden Mitgliedern übereinstimmen.</li>
                            <li>Trennen Sie mehrere Spieler/Staff-Mitglieder mit einem Komma (,).</li>
                            <li>Speichern Sie die Datei und laden Sie sie hier hoch.</li>
                        </ol>
                    </div>
                     <Button variant="outline" onClick={handleDownloadTemplate}>
                        <FileDown className="mr-2 h-4 w-4"/> Vorlage herunterladen
                    </Button>

                    <div className="space-y-2">
                        <Label htmlFor="csv-upload">CSV-Datei hochladen</Label>
                        <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} />
                         {file && <p className="text-xs text-muted-foreground flex items-center gap-2"><FileCheck2 className="h-4 w-4"/> {file.name}</p>}
                    </div>

                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={handleImport} disabled={!file || isImporting || isLoadingMembers}>
                        {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4" />}
                        {isImporting ? `Importiere (${importedCount})...` : 'Importieren'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
