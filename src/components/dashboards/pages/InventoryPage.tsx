'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, Package } from 'lucide-react';

const inventoryItems = [
    { id: 1, name: 'Bälle (Gr. 5)', category: 'Trainingsmaterial', quantity: 50, status: 'Auf Lager' },
    { id: 2, name: 'Markierungshütchen (Set)', category: 'Trainingsmaterial', quantity: 20, status: 'Auf Lager' },
    { id: 3, name: 'Trikotsatz Heim (Erwachsene)', category: 'Ausrüstung', quantity: 2, status: 'Im Einsatz' },
    { id: 4, name: 'Erste-Hilfe-Koffer', category: 'Medizinisch', quantity: 5, status: 'Niedrig' },
]

export default function InventoryPage() {
    const [inventory, setInventory] = useState(inventoryItems);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Auf Lager': return <Badge className="bg-green-100 text-green-800">{status}</Badge>;
            case 'Im Einsatz': return <Badge variant="secondary">{status}</Badge>;
            case 'Niedrig': return <Badge variant="destructive">{status}</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Inventar & Material</h1>
                    <p className="text-muted-foreground">Verwalten Sie das Material und die Ausrüstung des Vereins.</p>
                </div>
                <Button><PlusCircle className="mr-2 h-4 w-4"/> Neuen Gegenstand erfassen</Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Inventarliste</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Gegenstand</TableHead>
                                <TableHead>Kategorie</TableHead>
                                <TableHead>Menge</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aktionen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inventory.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Package className="h-4 w-4 text-muted-foreground"/>
                                        {item.name}
                                    </TableCell>
                                    <TableCell>{item.category}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{getStatusBadge(item.status)}</TableCell>
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
                    <p className="text-xs text-muted-foreground">{inventory.length} Gegenstände im Inventar.</p>
                </CardFooter>
            </Card>
        </div>
    )
}
