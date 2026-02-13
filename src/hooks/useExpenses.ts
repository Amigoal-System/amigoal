
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { getAllExpenses, addExpense, updateExpense } from '@/ai/flows/expenses';
import type { Expense } from '@/ai/flows/expenses.types';

export const useExpenses = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchExpenses = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedData = await getAllExpenses();
            setExpenses(fetchedData);
        } catch (error) {
            console.error("Failed to fetch expenses:", error);
            toast({ title: "Fehler", description: "Spesen konnten nicht geladen werden.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const handleAddExpense = async (newExpenseData: Omit<Expense, 'id'>) => {
        try {
            await addExpense(newExpenseData);
            toast({ title: "Spesen eingereicht", description: "Ihre Ausgabe wurde zur Genehmigung übermittelt." });
            fetchExpenses();
        } catch (error) {
            console.error("Failed to add expense:", error);
            toast({ title: "Fehler", description: "Spesen konnten nicht eingereicht werden.", variant: "destructive" });
        }
    };

    const handleUpdateExpense = async (updatedData: Partial<Expense> & { id: string }) => {
        try {
            await updateExpense(updatedData);
            toast({ title: "Spesen aktualisiert" });
            fetchExpenses();
        } catch (error) {
            console.error("Failed to update expense:", error);
            toast({ title: "Fehler", description: "Spesen konnten nicht aktualisiert werden.", variant: "destructive" });
        }
    };

    return {
        expenses,
        isLoading,
        addExpense: handleAddExpense,
        updateExpense: handleUpdateExpense,
        refetchExpenses: fetchExpenses,
    };
};
