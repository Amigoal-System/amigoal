
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Save } from 'lucide-react';
import { Label } from './label';
import { Input } from './input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select';

const agreementFields = [
    { key: 'capitalIncrease', label: 'Zustimmung Kapitalerhöhung' },
    { key: 'preemptiveRight', label: 'Vorkaufsrecht' },
    { key: 'tagAlongRight', label: 'Mitverkaufsrecht' },
    { key: 'antiDilution', label: 'Verwässerungsschutz' },
    { key: 'term', label: 'Laufzeit' },
    { key: 'noticePeriod', label: 'Kündigungsfrist' },
];

const emptyInvestor = {
    id: null,
    name: '',
    contact: '',
    email: '',
    type: 'Privatperson',
    investment: 0,
    equity: 0,
    status: 'Prospect',
    roles: ['Investor'],
    agreement: {},
};


export const InvestorDetailModal = ({ investor, isOpen, onOpenChange, onSave }) => {
  const [isEditing, setIsEditing] = useState(!investor?.id);
  const [formData, setFormData] = useState(investor || emptyInvestor);

  useEffect(() => {
    if (isOpen) {
        if (investor) {
            setFormData(investor);
            setIsEditing(false);
        } else {
            setFormData(emptyInvestor);
            setIsEditing(true);
        }
    }
  }, [investor, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({...prev, [id]: value}));
  };
  
  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData(prev => ({...prev, [id]: parseFloat(value) || 0}));
  }

  const handleAgreementChange = (key: string, value: string) => {
    setFormData(prev => ({
        ...prev,
        agreement: {
            ...(prev.agreement || {}),
            [key]: value,
        }
    }));
  };

  const handleSave = () => {
      onSave(formData);
      setIsEditing(false);
  }

  const handleCancel = () => {
      if(investor) {
        setFormData(investor); // Revert changes if editing
        setIsEditing(false);
      } else {
        onOpenChange(false); // Close if it was a new entry
      }
  }
  
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              {isEditing ? (
                  <Input id="name" value={formData.name} onChange={handleInputChange} className="text-2xl font-bold p-0 border-0 h-auto shadow-none" placeholder="Name des Investors"/>
              ) : (
                  <DialogTitle className="text-2xl font-bold">{formData.name}</DialogTitle>
              )}
              {isEditing ? (
                  <Input id="type" value={formData.type} onChange={handleInputChange} className="text-base p-0 border-0 h-auto shadow-none text-muted-foreground" placeholder="Typ..."/>
              ) : (
                  <DialogDescription>{formData.type}</DialogDescription>
              )}
            </div>
             {isEditing ? (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>Abbrechen</Button>
                    <Button size="sm" onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Speichern</Button>
                </div>
            ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4"/> Bearbeiten
                </Button>
            )}
          </div>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-4 -mr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <Card>
                    <CardHeader><CardTitle>Kontakt & Status</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-4">
                        <div className="space-y-2">
                            <Label>Kontaktperson</Label>
                            {isEditing ? <Input id="contact" value={formData.contact} onChange={handleInputChange}/> : <p>{formData.contact}</p>}
                        </div>
                        <div className="space-y-2">
                             <Label>E-Mail</Label>
                             {isEditing ? <Input id="email" value={formData.email} onChange={handleInputChange}/> : <p><a href={`mailto:${'\'\'\''}{formData.email}`} className="text-primary underline">{formData.email}</a></p>}
                        </div>
                        <div className="space-y-2">
                             <Label>Status</Label>
                             {isEditing ? (
                                 <Select value={formData.status} onValueChange={(val) => setFormData(p => ({...p, status: val}))}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Active">Active</SelectItem>
                                        <SelectItem value="Inactive">Inactive</SelectItem>
                                        <SelectItem value="Prospect">Prospect</SelectItem>
                                    </SelectContent>
                                </Select>
                             ) : (
                                <Badge variant={formData.status === 'Active' ? 'default' : 'secondary'} className={formData.status === 'Active' ? 'bg-green-500' : ''}>{formData.status}</Badge>
                             )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Investment Details</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-4">
                        <div className="space-y-2">
                            <Label>Investment (CHF)</Label>
                            {isEditing ? <Input id="investment" type="number" value={formData.investment || ''} onChange={handleNumericInputChange}/> : <p>{formData.investment?.toLocaleString()}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Anteil (%)</Label>
                            {isEditing ? <Input id="equity" type="number" value={formData.equity || ''} onChange={handleNumericInputChange}/> : <p>{formData.equity}%</p>}
                        </div>
                    </CardContent>
                </Card>
                <div className="md:col-span-2">
                     <Card>
                        <CardHeader><CardTitle>Investment Agreement</CardTitle></CardHeader>
                        <CardContent>
                             <Table>
                                <TableBody>
                                    {agreementFields.map(({ key, label }) => (
                                        <TableRow key={key}>
                                            <TableCell className="font-medium">{label}</TableCell>
                                            <TableCell>
                                                {isEditing ? (
                                                    <Input value={formData.agreement?.[key] || ''} onChange={e => handleAgreementChange(key, e.target.value)} />
                                                ) : (
                                                    formData.agreement?.[key] || '-'
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
