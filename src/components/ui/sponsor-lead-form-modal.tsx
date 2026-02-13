'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';

export const SponsorLeadFormModal = ({ isOpen, onOpenChange, onSave }) => {
    const [formData, setFormData] = useState({
        company: '',
        industry: '',
        contact: '',
        email: '',
        interest: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!isOpen) {
            setFormData({ company: '', industry: '', contact: '', email: '', interest: '' });
        }
    }, [isOpen]);

    const handleSave = async () => {
        if (!formData.company || !formData.contact || !formData.email) {
            toast({
                title: "Fehlende Angaben",
                description: "Firma, Kontakt und E-Mail sind Pflichtfelder.",
                variant: "destructive"
            });
            return;
        }
        setIsSubmitting(true);
        try {
            await onSave(formData);
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save sponsor lead:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Neuen potenziellen Sponsor hinzufügen</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="company">Firma</Label>
                        <Input id="company" value={formData.company} onChange={e => setFormData(p => ({...p, company: e.target.value}))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="industry">Branche</Label>
                        <Input id="industry" value={formData.industry} onChange={e => setFormData(p => ({...p, industry: e.target.value}))} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contact">Kontaktperson</Label>
                            <Input id="contact" value={formData.contact} onChange={e => setFormData(p => ({...p, contact: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">E-Mail</Label>
                            <Input id="email" type="email" value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="interest">Interesse / Notizen</Label>
                        <Textarea id="interest" value={formData.interest} onChange={e => setFormData(p => ({...p, interest: e.target.value}))} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2 h-4 w-4"/>}
                         Speichern
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
