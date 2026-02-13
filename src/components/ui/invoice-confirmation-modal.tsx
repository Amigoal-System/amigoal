
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from './button';
import { Label } from './label';
import { DatePicker } from './date-picker';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Separator } from './separator';
import { Card, CardContent, CardHeader, CardTitle } from './card';

export const InvoiceConfirmationModal = ({ isOpen, onOpenChange, registration, bootcamp, onConfirm }) => {
    const [sendOption, setSendOption] = useState('now');
    const [scheduledDate, setScheduledDate] = useState<Date | undefined>(new Date(new Date().setDate(new Date().getDate() + 1)));

    if (!isOpen || !registration || !bootcamp) return null;

    const pricePerPerson = parseFloat((bootcamp.offer?.price || '0').replace(/[^0-9.,-]+/g,"").replace(",","."));
    const numParticipants = registration.participants?.length || 1;
    const totalAmount = pricePerPerson * numParticipants;

    const handleConfirm = () => {
        onConfirm({
            sendNow: sendOption === 'now',
            scheduledDate: sendOption === 'later' ? scheduledDate : undefined,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Bestätigung & Rechnung</DialogTitle>
                    <DialogDescription>Bestätigen Sie die Anmeldung und erstellen Sie die Rechnung für {registration.contactName}.</DialogDescription>
                </DialogHeader>
                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold">Rechnungsdetails</h3>
                        <Card>
                            <CardContent className="p-4 space-y-2 text-sm">
                                <div className="flex justify-between"><span>Empfänger:</span><span className="font-medium">{registration.contactName}</span></div>
                                <div className="flex justify-between"><span>Bootcamp:</span><span className="font-medium">{bootcamp.name}</span></div>
                                <div className="flex justify-between"><span>Teilnehmer:</span><span className="font-medium">{numParticipants}</span></div>
                                <div className="flex justify-between"><span>Preis p.P.:</span><span className="font-medium">CHF {pricePerPerson.toFixed(2)}</span></div>
                                <Separator />
                                <div className="flex justify-between font-bold text-base"><span>Total:</span><span>CHF {totalAmount.toFixed(2)}</span></div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold">Versandoptionen</h3>
                        <RadioGroup value={sendOption} onValueChange={setSendOption}>
                            <div className="flex items-center space-x-2 p-3 border rounded-md">
                                <RadioGroupItem value="now" id="send-now" />
                                <Label htmlFor="send-now">Rechnung sofort per E-Mail senden</Label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 border rounded-md">
                                <RadioGroupItem value="later" id="send-later" />
                                <Label htmlFor="send-later">Rechnungsversand terminieren</Label>
                            </div>
                        </RadioGroup>
                        {sendOption === 'later' && (
                            <div className="pl-6 space-y-2">
                                <Label>Versanddatum</Label>
                                <DatePicker date={scheduledDate} onDateChange={setScheduledDate} />
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={handleConfirm}>Bestätigen & Rechnung erstellen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
