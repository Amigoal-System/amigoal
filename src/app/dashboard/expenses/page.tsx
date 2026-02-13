
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';
import { CreateExpenseModal } from '@/components/CreateExpenseModal';
import { ExpenseDetailModal } from '@/components/ExpenseDetailModal';
import { useExpenses } from '@/hooks/useExpenses'; 

export default function ExpensesPage({ currentUserRole }) {
    const { expenses, addExpense, updateExpense, isLoading } = useExpenses();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);

    const getExpenseStatusBadge = (status: string) => {
        switch(status) {
            case 'Genehmigt': return <Badge variant="secondary" className="bg-blue-100 text-blue-800">{status}</Badge>;
            case 'Ausbezahlt': return <Badge className="bg-green-500">{status}</Badge>;
            case 'Abgelehnt': return <Badge variant="destructive">{status}</Badge>;
            case 'Offen':
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };
    
    const handleExpenseClick = (expense) => {
        setSelectedExpense(expense);
        setIsDetailModalOpen(true);
    };

    const handleCreateExpense = async (newExpenseData) => {
        await addExpense(newExpenseData);
        setIsCreateModalOpen(false);
    }
    
    const handleUpdateExpense = async (updatedData) => {
        await updateExpense(updatedData);
        setIsDetailModalOpen(false);
    }

    return (
         <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Spesen & Auslagen</h1>
                        <p className="text-muted-foreground">Übersicht und Verwaltung aller eingereichten Spesen.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Eingereichte Spesen</CardTitle>
                        <CardDescription>
                            Klicken Sie auf eine Zeile, um die Details zu sehen oder den Status zu ändern.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <p>Lade Spesen...</p> : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Typ</TableHead>
                                        <TableHead>Beschreibung</TableHead>
                                        <TableHead>Datum</TableHead>
                                        <TableHead>Betrag</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expenses.map((expense) => (
                                        <TableRow key={expense.id} className="cursor-pointer" onClick={() => handleExpenseClick(expense)}>
                                            <TableCell>{expense.type}</TableCell>
                                            <TableCell>{expense.description}</TableCell>
                                            <TableCell>{new Date(expense.date).toLocaleDateString('de-CH')}</TableCell>
                                            <TableCell>CHF {expense.sum.toFixed(2)}</TableCell>
                                            <TableCell>{getExpenseStatusBadge(expense.status)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button onClick={() => setIsCreateModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Neue Spesen erfassen
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            <CreateExpenseModal isOpen={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} onSave={handleCreateExpense} />
            {selectedExpense && (
                <ExpenseDetailModal 
                    expense={selectedExpense} 
                    isOpen={isDetailModalOpen} 
                    onOpenChange={setIsDetailModalOpen} 
                    onUpdate={handleUpdateExpense} 
                />
            )}
        </>
    );
}
