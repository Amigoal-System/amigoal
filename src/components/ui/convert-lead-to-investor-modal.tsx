
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import type { InvestorLead } from '@/ai/flows/investorLeads.types';
import type { Investor } from '@/ai/flows/investors.types';
import { Separator } from './separator';

const investorTypes = ["VC", "Angel Investor", "Family Office", "Privatperson"];

export const ConvertToInvestorModal = ({ lead, isOpen, onOpenChange, onConfirm }) => {
    const [investorData, setInvestorData] = useState<Partial<Investor>>({});

    useEffect(() => {
        if (lead) {
            setInvestorData({
                name: lead.name,
                contact: lead.name,
                email: lead.email,
                type: investorTypes.includes(lead.company ? 'VC' : 'Privatperson') ? (lead.company ? 'VC' : 'Privatperson') : 'Angel Investor',
                investment: 0,
                equity: 0,
                status: 'Active',
                roles: ['Investor'],
                agreement: {
                    capitalIncrease: 'Ja',
                    preemptiveRight: 'Ja',
                    tagAlongRight: 'Nein',
                    antiDilution: 'Standard',
                    term: '5 Jahre',
                    noticePeriod: '6 Monate',
                },
            });
        }
    }, [lead]);

    if (!isOpen || !lead) return null;
    
    const handleChange = (field: keyof Investor, value: any) => {
        setInvestorData(prev => ({...prev, [field]: value}));
    };
    
    const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setInvestorData(prev => ({...prev, [id]: parseFloat(value) || 0}));
    };
    
    const handleAgreementChange = (key: string, value: string) => {
        setInvestorData(prev => ({
            ...prev,
            agreement: {
                ...(prev.agreement || {}),
                [key]: value,
            }
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Lead "{lead.name}" zu Investor umwandeln</DialogTitle>
                    <DialogDescription>
                        Überprüfen und ergänzen Sie die Daten, um einen neuen Investor anzulegen.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={investorData.name || ''} onChange={e => handleChange('name', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">E-Mail</Label>
                        <Input id="email" type="email" value={investorData.email || ''} onChange={e => handleChange('email', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="type">Typ</Label>
                        <Select value={investorData.type} onValueChange={(val) => handleChange('type', val)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {investorTypes.map(type => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="investment">Investment (CHF)</Label>
                            <Input id="investment" type="number" value={investorData.investment || 0} onChange={handleNumericChange}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="equity">Anteil (%)</Label>
                            <Input id="equity" type="number" value={investorData.equity || 0} onChange={handleNumericChange}/>
                        </div>
                    </div>
                    <Separator className="my-4"/>
                    <h4 className="font-semibold text-lg">Investment Agreement</h4>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="capitalIncrease">Zustimmung Kapitalerhöhung</Label>
                            <Input id="capitalIncrease" value={investorData.agreement?.capitalIncrease || ''} onChange={(e) => handleAgreementChange('capitalIncrease', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="preemptiveRight">Vorkaufsrecht</Label>
                            <Input id="preemptiveRight" value={investorData.agreement?.preemptiveRight || ''} onChange={(e) => handleAgreementChange('preemptiveRight', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="tagAlongRight">Mitverkaufsrecht</Label>
                            <Input id="tagAlongRight" value={investorData.agreement?.tagAlongRight || ''} onChange={(e) => handleAgreementChange('tagAlongRight', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="antiDilution">Verwässerungsschutz</Label>
                            <Input id="antiDilution" value={investorData.agreement?.antiDilution || ''} onChange={(e) => handleAgreementChange('antiDilution', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="term">Laufzeit</Label>
                            <Input id="term" value={investorData.agreement?.term || ''} onChange={(e) => handleAgreementChange('term', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="noticePeriod">Kündigungsfrist</Label>
                            <Input id="noticePeriod" value={investorData.agreement?.noticePeriod || ''} onChange={(e) => handleAgreementChange('noticePeriod', e.target.value)} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={() => onConfirm(investorData)}>Umwandlung bestätigen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
