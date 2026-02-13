'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, PlusCircle, Trash2, Edit } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const documents = [
    { id: 1, name: 'Spielervertrag_Messi_24-25.pdf', type: 'Vertrag', category: 'Spieler', date: '01.07.2024' },
    { id: 2, name: 'Protokoll_Vorstandssitzung_Q2.pdf', type: 'Protokoll', category: 'Vorstand', date: '15.06.2024' },
    { id: 3, name: 'Sponsoringvertrag_Hauptsponsor.pdf', type: 'Vertrag', category: 'Sponsoring', date: '20.05.2024' },
    { id: 4, name: 'J&S_Abrechnung_2023.xlsx', type: 'Abrechnung', category: 'Finanzen', date: '10.01.2024' },
]

export default function DocumentsPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Dokumenten-Management</h1>
                    <p className="text-muted-foreground">Zentrale Ablage für alle wichtigen Vereinsdokumente.</p>
                </div>
                <Button><PlusCircle className="mr-2 h-4 w-4"/> Neues Dokument hochladen</Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Dokumentenablage</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Dokument</TableHead>
                                <TableHead>Typ</TableHead>
                                <TableHead>Kategorie</TableHead>
                                <TableHead>Datum</TableHead>
                                <TableHead className="text-right">Aktionen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.map(doc => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <FileText className="h-4 w-4"/>
                                        {doc.name}
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{doc.type}</Badge></TableCell>
                                    <TableCell><Badge variant="secondary">{doc.category}</Badge></TableCell>
                                    <TableCell>{doc.date}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4"/></Button>
                                        <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter>
                    <p className="text-xs text-muted-foreground">{documents.length} Dokument(e) gefunden.</p>
                </CardFooter>
            </Card>
        </div>
    )
}
