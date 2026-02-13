
'use client';
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ShieldCheck, Download, Upload } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Papa from 'papaparse';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

const reports = [
    { id: 1, name: 'J+S Coach-Aktivität Q2 2024', date: '30.06.2024', status: 'Exportiert' },
    { id: 2, name: 'Mitgliederliste SFV per 01.07.2024', date: '01.07.2024', status: 'Exportiert' },
    { id: 3, name: 'Anwesenheitskontrolle Junioren C', date: '30.06.2024', status: 'Entwurf' },
];

export default function JsVerbandPage() {
    const { toast } = useToast();
    const [importedData, setImportedData] = useState<any[]>([]);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setImportedData(results.data);
                toast({
                    title: 'Datei importiert',
                    description: `${results.data.length} Einträge wurden aus der CSV-Datei geladen.`
                })
            },
            error: (error) => {
                toast({
                    title: 'Import-Fehler',
                    description: 'Die CSV-Datei konnte nicht gelesen werden.',
                    variant: 'destructive',
                })
            }
        });
    };

    const handleExport = () => {
        if (importedData.length === 0) {
            toast({ title: "Keine Daten zum Exportieren", variant: "destructive" });
            return;
        }
        const csv = Papa.unparse(importedData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "report_export.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">J+S / Verband</h1>
                    <p className="text-muted-foreground">Generieren und verwalten Sie hier Ihre offiziellen Berichte.</p>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Daten Import & Export</CardTitle>
                    <CardDescription>
                        Importieren Sie Anwesenheitslisten oder exportieren Sie formatierte Berichte für den Verband.
                    </CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-1">
                            <label htmlFor="csv-upload" className="font-semibold text-sm">Trainingsanwesenheiten importieren (CSV)</label>
                            <p className="text-xs text-muted-foreground">Laden Sie eine CSV-Datei mit den Anwesenheiten hoch, um sie zu verarbeiten.</p>
                        </div>
                        <Button asChild variant="outline">
                            <label htmlFor="csv-upload-btn" className="cursor-pointer">
                                <Upload className="mr-2 h-4 w-4" /> Datei auswählen
                            </label>
                        </Button>
                        <Input id="csv-upload-btn" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                    </div>
                    {importedData.length > 0 && (
                        <div className="space-y-2">
                             <h3 className="text-sm font-semibold">Vorschau der importierten Daten:</h3>
                            <div className="max-h-64 overflow-y-auto border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {Object.keys(importedData[0]).map(key => <TableHead key={key}>{key}</TableHead>)}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {importedData.slice(0, 5).map((row, index) => (
                                            <TableRow key={index}>
                                                {Object.values(row).map((val: any, i) => <TableCell key={i}>{val}</TableCell>)}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                 {importedData.length > 5 && <p className="text-center text-xs text-muted-foreground p-2">... und {importedData.length - 5} weitere Zeilen.</p>}
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                     <Button onClick={handleExport} disabled={importedData.length === 0}>
                        <Download className="mr-2 h-4 w-4"/> Importierte Daten als Report exportieren
                    </Button>
                </CardFooter>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Generierte Berichte</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Bericht</TableHead>
                                <TableHead>Datum</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Download</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.map(report => (
                                <TableRow key={report.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-muted-foreground"/>
                                        {report.name}
                                    </TableCell>
                                    <TableCell>{report.date}</TableCell>
                                    <TableCell>{report.status}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <FileDown className="h-4 w-4"/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter>
                    <p className="text-xs text-muted-foreground">{reports.length} Berichte gefunden.</p>
                </CardFooter>
            </Card>
        </div>
    )
}
