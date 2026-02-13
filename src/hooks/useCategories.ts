
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { 
    getAllCategories,
    addCategory,
    updateCategory,
    deleteCategory
} from '@/ai/flows/categories'; 
import type { TeamCategory } from '@/ai/flows/categories.types';

export const useCategories = (countryCode: string = 'CH') => {
    const [categories, setCategories] = useState<TeamCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedData = await getAllCategories(countryCode);
            setCategories(fetchedData);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            toast({ title: "Fehler", description: "Kategorien konnten nicht geladen werden.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [countryCode, toast]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAddCategory = async (newCategoryData: Omit<TeamCategory, 'id'>) => {
        try {
            await addCategory(newCategoryData);
            await fetchCategories();
        } catch (error) {
            console.error("Failed to add category:", error);
            toast({ title: "Fehler beim Hinzufügen", variant: "destructive" });
        }
    };

    const handleUpdateCategory = async (updatedCategory: TeamCategory) => {
        try {
            await updateCategory(updatedCategory);
            await fetchCategories();
        } catch (error) {
            console.error("Failed to update category:", error);
            toast({ title: "Fehler beim Speichern", variant: "destructive" });
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        try {
            await deleteCategory(categoryId);
            await fetchCategories();
        } catch (error) {
            console.error("Failed to delete category:", error);
            toast({ title: "Fehler beim Löschen", variant: "destructive" });
        }
    };

    return {
        categories,
        isLoading,
        refetchCategories: fetchCategories,
        addCategory: handleAddCategory,
        updateCategory: handleUpdateCategory,
        deleteCategory: handleDeleteCategory
    };
};
