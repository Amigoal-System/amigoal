
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getAllFaqs, updateFaq, addFaq, deleteFaq } from '@/ai/flows/faqs';
import type { FAQ } from '@/ai/flows/faqs.types';

export const FaqEditor = () => {
    const [faqs, setFaqs] = useState<Partial<FAQ>[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchFaqs = useCallback(async () => {
        setIsLoading(true);
        const data = await getAllFaqs();
        setFaqs(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchFaqs();
    }, [fetchFaqs]);

    const handleFaqChange = (id, field, value) => {
        setFaqs(prev => prev.map(faq => faq.id === id ? { ...faq, [field]: value } : faq));
    };

    const addFaqItem = () => {
        setFaqs(prev => [...prev, { id: `new-${Date.now()}`, question: '', answer: '', category: 'Allgemein', icon: 'Info' }]);
    };

    const removeFaqItem = (id) => {
        setFaqs(prev => prev.filter(faq => faq.id !== id));
    };
    
    const handleSave = async () => {
        setIsLoading(true);
        try {
            const updatePromises = faqs.map(faq => {
                if (faq.id?.startsWith('new-')) {
                    const { id, ...newFaq } = faq;
                    return addFaq(newFaq as Omit<FAQ, 'id'>);
                } else {
                    return updateFaq(faq as FAQ);
                }
            });
            await Promise.all(updatePromises);
            toast({ title: "FAQs gespeichert!" });
            fetchFaqs();
        } catch (error) {
            toast({ title: "Fehler beim Speichern", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>FAQ-Inhalte bearbeiten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {faqs.map((faq, index) => (
                    <div key={faq.id} className="p-4 border rounded-lg space-y-2">
                         <div className="flex justify-between items-center">
                            <h4 className="font-semibold">Eintrag {index + 1}</h4>
                            <Button variant="ghost" size="icon" onClick={() => removeFaqItem(faq.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                        </div>
                        <Input placeholder="Frage" value={faq.question} onChange={(e) => handleFaqChange(faq.id, 'question', e.target.value)} />
                        <Textarea placeholder="Antwort" value={faq.answer} onChange={(e) => handleFaqChange(faq.id, 'answer', e.target.value)} />
                         <Select value={faq.category} onValueChange={(val) => handleFaqChange(faq.id, 'category', val)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
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
                ))}
                 <Button variant="outline" className="w-full" onClick={addFaqItem}><PlusCircle className="mr-2 h-4 w-4"/> Neuen FAQ-Eintrag hinzufügen</Button>
            </CardContent>
            <CardFooter>
                 <Button onClick={handleSave} disabled={isLoading}><Save className="mr-2 h-4 w-4"/> Änderungen speichern</Button>
            </CardFooter>
        </Card>
    );
};
