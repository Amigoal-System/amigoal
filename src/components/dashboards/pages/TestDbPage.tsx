
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Trash2, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createTestDocument, getTestDocuments, deleteTestDocument, type TestData } from '@/ai/flows/testFlow';

export default function TestDbPage() {
    const [testData, setTestData] = useState<TestData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newItem, setNewItem] = useState({ name: '', value: 0 });
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getTestDocuments();
            setTestData(data);
        } catch (e: any) {
            console.error("Error fetching test data:", e);
            setError("Fehler beim Laden der Daten. Ist die Firestore-Datenbank aktiv und sind die Regeln korrekt konfiguriert? (siehe FEHLERANALYSE.md)");
            toast({
                title: "Datenbankfehler",
                description: e.message,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddItem = async () => {
        if (!newItem.name || newItem.value <= 0) {
            toast({ title: 'Ungültige Eingabe', description: 'Bitte geben Sie einen Namen und einen positiven Wert ein.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        try {
            await createTestDocument({
                ...newItem,
                createdAt: new Date().toISOString(),
            });
            toast({ title: 'Dokument erstellt' });
            setNewItem({ name: '', value: 0 });
            await fetchData();
        } catch (e: any) {
             setError("Fehler beim Erstellen des Dokuments. Überprüfen Sie die Firestore-Regeln.");
             toast({ title: "Fehler beim Erstellen", description: e.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeleteItem = async (docId: string) => {
        setIsLoading(true);
        try {
            await deleteTestDocument(docId);
            toast({ title: 'Dokument gelöscht' });
            await fetchData();
        } catch (e: any) {
            setError("Fehler beim Löschen des Dokuments. Prüfen Sie die Berechtigungen.");
            toast({ title: "Fehler beim Löschen", description: e.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Datenbank-Test</CardTitle>
                <CardDescription>
                    Diese Seite dient zum Testen der serverseitigen Firestore-Verbindung über Genkit-Flows.
                    Sie interagiert mit einer Collection namens `test-collection`.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="bg-destructive/10 border border-destructive/50 text-destructive p-3 rounded-md mb-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 mt-0.5"/>
                        <div>
                            <h4 className="font-bold">Verbindungsfehler</h4>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-2 mb-4">
                    <Input 
                        placeholder="Name" 
                        value={newItem.name} 
                        onChange={e => setNewItem({...newItem, name: e.target.value})}
                        disabled={isLoading}
                    />
                    <Input 
                        type="number" 
                        placeholder="Wert" 
                        value={newItem.value || ''} 
                        onChange={e => setNewItem({...newItem, value: parseInt(e.target.value, 10) || 0})}
                        disabled={isLoading}
                    />
                    <Button onClick={handleAddItem} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlusCircle className="mr-2 h-4 w-4"/>}
                        Hinzufügen
                    </Button>
                     <Button onClick={fetchData} variant="outline" size="icon" disabled={isLoading}>
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Wert</TableHead>
                            <TableHead>Erstellt am</TableHead>
                            <TableHead className="text-right">Aktion</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5} className="text-center">Lade Daten...</TableCell></TableRow>
                        ) : testData.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-mono text-xs">{item.id}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.value}</TableCell>
                                <TableCell>{new Date(item.createdAt).toLocaleString('de-CH')}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id!)} disabled={isLoading}>
                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
             <CardFooter>
                <p className="text-xs text-muted-foreground">{testData.length} Dokument(e) in `test-collection`.</p>
            </CardFooter>
        </Card>
    );
}
