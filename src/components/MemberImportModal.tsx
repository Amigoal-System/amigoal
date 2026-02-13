
'use client';

import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { FileDown, Upload, Loader2, FileCheck2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { addMember } from '@/ai/flows/members';
import type { Member } from '@/ai/flows/members.types';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useTeam } from '@/hooks/use-team';
import { getAllClubs } from '@/ai/flows/clubs';
import type { Club } from '@/ai/flows/clubs.types';
import { useMembers } from '@/hooks/useMembers';

const CSV_HEADERS = [
    "Anrede", "Vorname", "Nachname", "Email", "Geburtsdatum",
    "Rollen", "Mannschaften", "Vereinsname",
    "Status", "Eintrittsdatum", "Position", "Trikotnummer",
    "Strasse", "PLZ", "Ort", "Nationalitaet",
    "Telefon Privat", "Telefon Mobil",
    "Username", "AHV-Nummer", "Pass-Nummer", "J+S-Nummer",
    "Beitrag Betrag", "Beitrag Saison", "Beitrag Bezahlt"
];


export const MemberImportModal = ({ isOpen, onOpenChange, onImportSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importedCount, setImportedCount] = useState(0);
    const { club, currentUserRole } = useTeam();
    const { toast } = useToast();
    const isSuperAdmin = currentUserRole === 'Super-Admin';

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleDownloadTemplate = () => {
        const exampleRow = [
            "Herr", "Max", "Mustermann", "max@beispiel.com", "1995-08-15",
            "Spieler,Fan", "1. Mannschaft", isSuperAdmin ? "FC Awesome" : "",
            "Aktiv", new Date().toISOString().split('T')[0], "Sturm", "10",
            "Musterstrasse 1", "8000", "Zürich", "Schweiz",
            "044 123 45 67", "079 123 45 67",
            "max.mustermann@fcawesome", "756.1234.5678.90", "X1234567", "123-456-789",
            "350", "24/25", "ja"
        ];
        const csvContent = "data:text/csv;charset=utf-8," 
            + CSV_HEADERS.join(",") 
            + "\n" 
            + exampleRow.map(val => `"${val}"`).join(",");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "amigoal_mitglieder_vorlage.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = () => {
        if (!file) {
            toast({ title: "Keine Datei ausgewählt", variant: 'destructive' });
            return;
        }
        if (!isSuperAdmin && !club) {
            toast({ title: "Kein Verein aktiv", description: "Es konnte kein Verein für den Import gefunden werden.", variant: "destructive" });
            return;
        }

        setIsImporting(true);
        setImportedCount(0);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const membersToCreate = results.data as any[];
                let successCount = 0;

                const allClubs = isSuperAdmin ? await getAllClubs({ includeArchived: false }) : [];
                const clubMap = new Map(allClubs.map(c => [c.name.toLowerCase(), c.id]));
                
                for (const member of membersToCreate) {
                    try {
                        const memberClubName = isSuperAdmin ? member.Vereinsname : club!.name;
                        let memberClubId: string;
                        let clubSubdomain: string;

                        if (isSuperAdmin) {
                            if (!memberClubName) {
                                console.warn("Super-Admin Import: Skipping row due to missing 'Vereinsname'", member);
                                continue;
                            }
                            const foundClubId = clubMap.get(memberClubName.toLowerCase());
                            if (!foundClubId) {
                                console.warn(`Club "${memberClubName}" not found for member "${member.Vorname} ${member.Nachname}". Skipping.`);
                                continue;
                            }
                            memberClubId = foundClubId;
                            clubSubdomain = allClubs.find(c => c.id === memberClubId)?.subdomain || memberClubName.toLowerCase().replace(/[^a-z0-9]/g, '');
                        } else {
                            memberClubId = club!.id!;
                            clubSubdomain = club!.subdomain!;
                        }

                        const clubLoginUser = member["Username"] || `${member.Vorname?.toLowerCase()}.${member.Nachname?.toLowerCase()}@${clubSubdomain}`;

                        const newMemberData: Omit<Member, 'id'> = {
                            salutation: member.Anrede || 'Unbekannt',
                            firstName: member.Vorname,
                            lastName: member.Nachname,
                            email: member.Email,
                            geb: member['Geburtsdatum'],
                            roles: member['Rollen']?.split(',').map(r => r.trim()) || ['Spieler'],
                            teams: member['Mannschaften']?.split(',').map(t => t.trim()) || [],
                            status: member.Status || 'Aktiv',
                            entryDate: member['Eintrittsdatum'] || new Date().toISOString().split('T')[0],
                            memberSince: member['Eintrittsdatum'] || new Date().toISOString().split('T')[0],
                            position: member.Position,
                            trikot: Number(member.Trikotnummer) || undefined,
                            address: {
                                street: member.Strasse,
                                zip: member.PLZ,
                                city: member.Ort,
                            },
                            nationality: member.Nationalitaet,
                            phonePrivate: member['Telefon Privat'],
                            phoneMobile: member['Telefon Mobil'],
                            memberNr: String(Math.floor(10000 + Math.random() * 90000)),
                            clubId: memberClubId,
                            clubName: memberClubName,
                            clubLoginUser: clubLoginUser,
                            ahvNumber: member['AHV-Nummer'] || null,
                            passportNumber: member['Pass-Nummer'] || null,
                            jsNumber: member['J+S-Nummer'] || null,
                            fee: {
                                season: member['Beitrag Saison'] || '24/25',
                                amount: Number(member['Beitrag Betrag']) || 0,
                                date: new Date().toISOString().split('T')[0],
                                paid: (member['Beitrag Bezahlt'] || 'nein').toLowerCase() === 'ja',
                            },
                        };
                        
                        if (!newMemberData.firstName || !newMemberData.lastName) continue;

                        await addMember(newMemberData);
                        successCount++;
                        setImportedCount(prev => prev + 1);
                    } catch (error) {
                        console.error(`Failed to import member: ${member.Vorname} ${member.Nachname}`, error);
                    }
                }

                toast({
                    title: "Import abgeschlossen",
                    description: `${successCount} von ${membersToCreate.length} Mitgliedern wurden erfolgreich importiert.`
                });
                setIsImporting(false);
                onImportSuccess();
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
                    <DialogTitle>Mitglieder importieren</DialogTitle>
                    <DialogDescription>
                        Laden Sie eine CSV-Datei hoch, um mehrere Mitglieder auf einmal zu erstellen.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Anleitung</h4>
                        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                            <li>Laden Sie die CSV-Vorlage herunter.</li>
                            <li>Füllen Sie die Spalten für jedes Mitglied aus. Die Spaltenüberschriften müssen exakt beibehalten werden.</li>
                            <li>Trennen Sie mehrere Rollen oder Mannschaften mit einem Komma (z.B. "Spieler,Trainer").</li>
                             {isSuperAdmin && <li>Als Super-Admin müssen Sie den exakten Vereinsnamen in der Spalte `Vereinsname` angeben.</li>}
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
                    <Button onClick={handleImport} disabled={!file || isImporting}>
                        {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4" />}
                        {isImporting ? `Importiere (${importedCount})...` : 'Importieren'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
