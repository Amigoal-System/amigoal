
'use client';

import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { FileDown, Upload, Loader2, FileCheck2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { addClub } from '@/ai/flows/clubs';
import { Input } from './ui/input';
import { Label } from './ui/label';

const CSV_HEADERS = [
    "Name", "Manager", "Login-Benutzername", "Kontakt E-Mail", "Subdomain", "Template"
];

export const ClubImportModal = ({ isOpen, onOpenChange, onImportSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importedCount, setImportedCount] = useState(0);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleDownloadTemplate = () => {
        const exampleRow = [
            "FC Musterstadt", "Max Mustermann", "admin@fcmuster", "max.m@fcmuster.ch", "fcmusterstadt", "Modern"
        ];
        const csvContent = "data:text/csv;charset=utf-8," 
            + CSV_HEADERS.join(",") 
            + "\n" 
            + exampleRow.map(val => `"${val}"`).join(",");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "amigoal_vereine_vorlage.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = () => {
        if (!file) {
            toast({ title: "Keine Datei ausgewählt", variant: 'destructive' });
            return;
        }

        setIsImporting(true);
        setImportedCount(0);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const clubsToCreate = results.data as any[];
                let successCount = 0;

                for (const club of clubsToCreate) {
                    try {
                        const newClubData = {
                            name: club.Name,
                            manager: club.Manager,
                            clubLoginUser: club['Login-Benutzername'],
                            contactEmail: club['Kontakt E-Mail'],
                            subdomain: club.Subdomain,
                            template: club.Template || 'Modern',
                            logo: `https://placehold.co/80x80.png?text=${club.Name?.substring(0,2).toUpperCase() || 'FC'}`,
                            paymentStatus: 'Paid' as const,
                            overdueSince: null,
                            url: `${club.Subdomain}.amigoal.app`,
                            hasWebsite: true,
                        };
                        
                        if (!newClubData.name || !newClubData.manager || !newClubData.contactEmail) {
                            console.warn("Skipping row due to missing required data:", club);
                            continue;
                        }

                        await addClub(newClubData);
                        successCount++;
                        setImportedCount(prev => prev + 1);
                    } catch (error) {
                        console.error(`Failed to import club: ${club.Name}`, error);
                    }
                }

                toast({
                    title: "Import abgeschlossen",
                    description: `${successCount} von ${clubsToCreate.length} Vereinen wurden erfolgreich importiert.`
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
                    <DialogTitle>Vereine importieren</DialogTitle>
                    <DialogDescription>
                        Laden Sie eine CSV-Datei hoch, um mehrere Vereine auf einmal zu erstellen.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Anleitung</h4>
                        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                            <li>Laden Sie die CSV-Vorlage herunter.</li>
                            <li>Füllen Sie die Spalten für jeden Verein aus. Die Spaltenüberschriften müssen exakt beibehalten werden.</li>
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
