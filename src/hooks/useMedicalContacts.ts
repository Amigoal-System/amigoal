
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { 
    getAllMedicalContacts,
    addMedicalContact,
    updateMedicalContact,
    deleteMedicalContact
} from '@/ai/flows/medicalContacts'; 
import type { MedicalContact } from '@/ai/flows/medicalContacts.types';

export const useMedicalContacts = () => {
    const [contacts, setContacts] = useState<MedicalContact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchContacts = useCallback(async () => {
        setIsLoading(true);
        try {
            const fetchedContacts = await getAllMedicalContacts();
            setContacts(fetchedContacts);
        } catch (error) {
            console.error('Failed to fetch medical contacts:', error);
            toast({
                title: "Fehler beim Laden",
                description: "Die medizinischen Kontakte konnten nicht geladen werden.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const handleAddContact = async (newContactData: Omit<MedicalContact, 'id'>) => {
        try {
            await addMedicalContact(newContactData);
            toast({ title: "Kontakt hinzugefügt" });
            await fetchContacts();
        } catch (error) {
            console.error('Failed to add contact:', error);
            toast({ title: "Fehler beim Hinzufügen", variant: "destructive" });
        }
    };

    const handleUpdateContact = async (updatedContact: MedicalContact) => {
        try {
            await updateMedicalContact(updatedContact);
            toast({ title: "Kontakt aktualisiert" });
            await fetchContacts();
        } catch (error) {
            console.error('Failed to update contact:', error);
            toast({ title: "Fehler beim Speichern", variant: "destructive" });
        }
    };

    const handleDeleteContact = async (contactId: string) => {
        try {
            await deleteMedicalContact(contactId);
            toast({ title: "Kontakt gelöscht" });
            await fetchContacts();
        } catch (error) {
            console.error('Failed to delete contact:', error);
            toast({ title: "Fehler beim Löschen", variant: "destructive" });
        }
    };

    return {
        contacts,
        isLoading,
        addContact: handleAddContact,
        updateContact: handleUpdateContact,
        deleteContact: handleDeleteContact,
        refetchContacts: fetchContacts,
    };
};
