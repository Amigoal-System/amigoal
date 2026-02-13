'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Upload, ShieldCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const reports = [
    { id: 1, name: 'J+S Coach-Aktivität Q2 2024', date: '30.06.2024', status: 'Exportiert' },
    { id: 2, name: 'Mitgliederliste SFV per 01.07.2024', date: '01.07.2024', status: 'Exportiert' },
    { id: 3, name: 'Anwesenheitskontrolle Junioren C', date: '30.06.2024', status: 'Entwurf' },
];

export default function JsVerbandPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">J+S / Verband</h1>
                    <p className="text-muted-foreground">Generieren und verwalten Sie hier Ihre offiziellen Berichte.</p>
                </div>
                <Button><Upload className="mr-2 h-4 w-4"/> Neuen Bericht generieren</Button>
            </div>
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
