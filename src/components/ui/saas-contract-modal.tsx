
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import type { AmigoalContract } from '@/ai/flows/amigoalContracts.types';
import { DatePicker } from './date-picker';
import { Save } from 'lucide-react';

export const ContractModal = ({ isOpen, onOpenChange, contract, onSave }) => {
    const [formData, setFormData] = useState<Partial<AmigoalContract> | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(contract || {
                partnerId: '',
                partnerName: '',
                partnerType: 'Club',
                contractType: 'SaaS Subscription',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
                status: 'Draft',
                monthlyFee: 0,
                commissionRate: 0,
                documentUrl: '',
                notes: ''
            });
        }
    }, [contract, isOpen]);

    if (!formData) return null;
    
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(p => ({...p!, [id]: value}));
    }
    
    const handleSelectChange = (id: string, value: string) => {
        setFormData(p => ({...p!, [id]: value}));
    }

    const handleNumberChange = (id: string, value: string) => {
        setFormData(p => ({ ...p, [id]: parseFloat(value) || 0 }));
    }

    const handleDateChange = (id: string, date: Date | undefined) => {
        if(date) {
            setFormData(p => ({...p!, [id]: date.toISOString().split('T')[0]}));
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{formData.id ? 'Vertrag bearbeiten' : 'Neuen Vertrag erstellen'}</DialogTitle>
                </DialogHeader>
                 <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="partnerName">Vertragspartner</Label>
                            <Input id="partnerName" value={formData.partnerName || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="partnerType">Partner-Typ</Label>
                            <Select value={formData.partnerType} onValueChange={(v) => handleSelectChange('partnerType', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Club">Club</SelectItem>
                                    <SelectItem value="Provider">Provider</SelectItem>
                                    <SelectItem value="Scout">Scout</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="contractType">Vertragsart</Label>
                        <Input id="contractType" value={formData.contractType || ''} onChange={handleInputChange} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label>Startdatum</Label>
                            <DatePicker date={new Date(formData.startDate!)} onDateChange={(d) => handleDateChange('startDate', d)} />
                        </div>
                         <div className="space-y-2">
                            <Label>Enddatum</Label>
                            <DatePicker date={new Date(formData.endDate!)} onDateChange={(d) => handleDateChange('endDate', d)} />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="monthlyFee">Monatsgebühr (CHF)</Label>
                            <Input id="monthlyFee" type="number" value={formData.monthlyFee || ''} onChange={(e) => handleNumberChange('monthlyFee', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="commissionRate">Kommission (%)</Label>
                            <Input id="commissionRate" type="number" value={formData.commissionRate || ''} onChange={(e) => handleNumberChange('commissionRate', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="status">Status</Label>
                             <Select value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Expired">Expired</SelectItem>
                                    <SelectItem value="Terminated">Terminated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notizen</Label>
                        <Textarea id="notes" value={formData.notes || ''} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="documentUrl">Dokumenten-URL (Digital signiert)</Label>
                        <Input id="documentUrl" value={formData.documentUrl || ''} onChange={handleInputChange} placeholder="https://"/>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={() => onSave(formData)}><Save className="mr-2 h-4 w-4"/> Speichern</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
