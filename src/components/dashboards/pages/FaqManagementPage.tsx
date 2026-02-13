'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAllFaqs, addFaq, updateFaq, deleteFaq } from '@/ai/flows/faqs';
import type { FAQ } from '@/ai/flows/faqs.types';

const FaqModal = ({ faq, isOpen, onOpenChange, onSave }) => {
    const [formData, setFormData] = useState<Partial<FAQ> | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(faq || { question: '', answer: '', category: 'Allgemein', icon: 'Info' });
        }
    }, [faq, isOpen]);

    if (!formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(p => ({ ...p, [id]: value }));
    };
    
    const handleCategoryChange = (value: string) => {
        setFormData(p => ({...p!, category: value}));
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{formData.id ? 'FAQ bearbeiten' : 'Neue FAQ erstellen'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                     <div className="space-y-2">
                        <Label htmlFor="question">Frage</Label>
                        <Input id="question" value={formData.question || ''} onChange={handleChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="answer">Antwort</Label>
                        <Textarea id="answer" value={formData.answer || ''} onChange={handleChange} rows={5}/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="category">Kategorie</Label>
                        <Select value={formData.category} onValueChange={handleCategoryChange}>
                            <SelectTrigger id="category">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Allgemein">Allgemein</SelectItem>
                                <SelectItem value="Mitgliederverwaltung">Mitgliederverwaltung</SelectItem>
                                <SelectItem value="Finanzen">Finanzen</SelectItem>
                                <SelectItem value="Preise">Preise</SelectItem>
                                <SelectItem value="Training & Spiele">Training & Spiele</SelectItem>
                                <SelectItem value="Support">Support</SelectItem>
                                <SelectItem value="Erste Schritte">Erste Schritte</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={() => onSave(formData)}>Speichern</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
};


export default function FaqManagementPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
    const { toast } = useToast();

    const fetchFaqs = async () => {
        setIsLoading(true);
        try {
            const data = await getAllFaqs();
            setFaqs(data);
        } catch (error) {
            console.error("Failed to fetch FAQs:", error);
            toast({ title: "Fehler beim Laden", description: "Die FAQs konnten nicht aus der Datenbank geladen werden.", variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFaqs();
    }, []);

    const handleOpenModal = (faq: FAQ | null) => {
        setSelectedFaq(faq);
        setIsModalOpen(true);
    };

    const handleSave = async (faqData: Partial<FAQ>) => {
        try {
            if (faqData.id) {
                await updateFaq(faqData as FAQ);
                toast({ title: 'FAQ aktualisiert' });
            } else {
                const newFaqData = { ...faqData, icon: 'Info' } as Omit<FAQ, 'id'>;
                await addFaq(newFaqData);
                toast({ title: 'FAQ hinzugefügt' });
            }
            fetchFaqs();
        } catch (error) {
            toast({ title: 'Fehler beim Speichern', description: "Die Daten konnten nicht gespeichert werden.", variant: 'destructive' });
        } finally {
            setIsModalOpen(false);
        }
    };
    
    const handleDelete = async (faqId: string) => {
        try {
            await deleteFaq(faqId);
            toast({ title: 'FAQ gelöscht' });
            fetchFaqs();
        } catch (error) {
             toast({ title: 'Fehler beim Löschen', description: "Der Eintrag konnte nicht gelöscht werden.", variant: 'destructive' });
        }
    }


    if (isLoading) {
        return <p>Lade FAQs...</p>
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                         <div>
                            <CardTitle>FAQ Management</CardTitle>
                            <CardDescription>
                                Erstellen, bearbeiten und verwalten Sie die FAQs für Ihre öffentliche Seite.
                            </CardDescription>
                        </div>
                        <Button onClick={() => handleOpenModal(null)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Neue FAQ
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Frage</TableHead>
                                <TableHead>Kategorie</TableHead>
                                <TableHead className="text-right">Aktionen</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {faqs.map(faq => (
                                <TableRow key={faq.id}>
                                    <TableCell className="font-medium max-w-sm truncate">{faq.question}</TableCell>
                                    <TableCell>{faq.category}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(faq)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Wirklich löschen?</AlertDialogTitle>
                                                    <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(faq.id!)}>Löschen</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <FaqModal 
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                faq={selectedFaq}
                onSave={handleSave}
            />
        </>
    );
}