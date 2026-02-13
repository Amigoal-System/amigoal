
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import { addTransaction } from '@/ai/flows/teamCash';
import type { Transaction } from '@/ai/flows/teamCash.types';
import type { Member } from '@/ai/flows/members.types';

export const AddTransactionModal = ({ isOpen, onOpenChange, teamId, onTransactionAdded, members }) => {
    const { toast } = useToast();
    const [type, setType] = useState<'Einzahlung' | 'Auszahlung' | 'Busse'>('Einzahlung');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState<number | ''>('');
    const [date, setDate] = useState<Date>(new Date());
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const resetForm = () => {
        setType('Einzahlung');
        setDescription('');
        setAmount('');
        setDate(new Date());
        setSelectedMemberId(null);
    };

    const handleSave = async () => {
        if (!description || amount === '') {
            toast({
                title: "Fehlende Eingaben",
                description: "Bitte füllen Sie alle Felder aus.",
                variant: "destructive"
            });
            return;
        }

        setIsSaving(true);
        const transactionAmount = type === 'Auszahlung' || type === 'Busse' ? -Math.abs(Number(amount)) : Number(amount);

        const newTransaction: Omit<Transaction, 'id'> = {
            type,
            description,
            amount: transactionAmount,
            date: date.toISOString().split('T')[0],
            memberId: type === 'Busse' ? parseInt(selectedMemberId!, 10) : undefined,
        };
        
        try {
            await addTransaction({ teamId, transaction: { ...newTransaction, id: Date.now() } });
            toast({
                title: "Transaktion hinzugefügt!",
                description: "Die neue Transaktion wurde erfolgreich gespeichert."
            });
            onTransactionAdded(); // Refetch data on the parent page
            onOpenChange(false);
            resetForm();
        } catch (error) {
            console.error("Failed to add transaction:", error);
            toast({
                title: "Fehler",
                description: "Die Transaktion konnte nicht gespeichert werden.",
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            onOpenChange(open);
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Neue Transaktion</DialogTitle>
                    <DialogDescription>
                        Fügen Sie eine neue Einnahme oder Ausgabe zur Mannschaftskasse hinzu.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="type">Typ</Label>
                        <Select value={type} onValueChange={(value: 'Einzahlung' | 'Auszahlung' | 'Busse') => setType(value)}>
                            <SelectTrigger id="type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Einzahlung">Einzahlung</SelectItem>
                                <SelectItem value="Auszahlung">Auszahlung</SelectItem>
                                <SelectItem value="Busse">Busse (Strafe)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Beschreibung</Label>
                        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="amount">Betrag (CHF)</Label>
                        <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))} />
                    </div>
                     {type === 'Busse' && (
                        <div className="space-y-2">
                            <Label htmlFor="member">Spieler</Label>
                            <Select value={selectedMemberId || ''} onValueChange={setSelectedMemberId}>
                                <SelectTrigger id="member">
                                    <SelectValue placeholder="Spieler auswählen..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {members.map((member: Member) => (
                                        <SelectItem key={member.id} value={member.id!}>
                                            {member.firstName} {member.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                     <div className="space-y-2">
                        <Label>Datum</Label>
                        <DatePicker date={date} onDateChange={(d) => d && setDate(d)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Speichern...' : 'Speichern'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
