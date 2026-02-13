
'use client';

import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from './button';
import { FileDown, Upload, Loader2, FileCheck2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import { addMedicalContact } from '@/ai/flows/medicalContacts';
import { Input } from './input';
import { Label } from './label';

const CSV_HEADERS = [
    "Anrede", "Titel", "Vorname", "Nachname", "Ansprechperson", "Fachgebiet",
    "Strasse", "PLZ", "Ort", "Telefon", "Email", "Webseite", "Instagram", "Linkedin", "Facebook"
];

export const MedicalContactImportModal = ({ isOpen, onOpenChange, onImportSuccess }) => {
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
            "Herr", "Dr. med.", "Hans", "Muster", "", "Orthopäde",
            "Bahnhofstrasse 1", "8001", "Zürich", "044 123 45 67", "hans.muster@klinik.ch",
            "https://klinik-muster.ch", "klinik_muster", "hans-muster-linkedin", "klinik.muster.fb"
        ];
        const csvContent = "data:text/csv;charset=utf-8," 
            + CSV_HEADERS.join(",") 
            + "\n" 
            + exampleRow.map(val => `"${val}"`).join(",");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "amigoal_kontakte_vorlage.csv");
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
                const contactsToCreate = results.data as any[];
                let successCount = 0;

                for (const contact of contactsToCreate) {
                    try {
                        const newContactData = {
                            salutation: contact.Anrede,
                            title: contact.Titel || null,
                            firstName: contact.Vorname,
                            lastName: contact.Nachname,
                            contactPerson: contact.Ansprechperson,
                            specialty: contact.Fachgebiet,
                            address: {
                                street: contact.Strasse,
                                zip: contact.PLZ,
                                city: contact.Ort,
                            },
                            phone: contact.Telefon,
                            email: contact.Email,
                            website: contact.Webseite || null,
                            instagram: contact.Instagram || null,
                            linkedin: contact.Linkedin || null,
                            facebook: contact.Facebook || null,
                            notes: '',
                            history: [],
                            agreements: { financial: '', other: '' },
                        };
                        
                        if (!newContactData.firstName || !newContactData.lastName) continue;

                        await addMedicalContact(newContactData as any);
                        successCount++;
                        setImportedCount(prev => prev + 1);
                    } catch (error) {
                        console.error(`Failed to import contact: ${contact.Vorname} ${contact.Nachname}`, error);
                    }
                }

                toast({
                    title: "Import abgeschlossen",
                    description: `${successCount} von ${contactsToCreate.length} Kontakten wurden importiert.`
                });
                setIsImporting(false);
                onImportSuccess();
                onOpenChange(false);
            },
            error: (error) => {
                console.error("CSV parsing error:", error);
                toast({ title: "Fehler beim Lesen der Datei", variant: 'destructive' });
                setIsImporting(false);
            }
        });
    };
    
    React.useEffect(() => {
        if (!isOpen) {
            setFile(null);
            setImportedCount(0);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Kontakte importieren</DialogTitle>
                    <DialogDescription>
                        Laden Sie eine CSV-Datei hoch, um mehrere Kontakte auf einmal zu erstellen.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <h4 className="font-semibold text-sm mb-2">Anleitung</h4>
                        <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                            <li>Laden Sie die CSV-Vorlage herunter.</li>
                            <li>Füllen Sie die Spalten für jeden Kontakt aus.</li>
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
