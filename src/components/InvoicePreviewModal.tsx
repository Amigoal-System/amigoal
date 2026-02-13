
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';

export const InvoicePreviewModal = ({ isOpen, onOpenChange, cardInfo, onSend, onArchiveOnly }) => {
    if (!cardInfo) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Rechnungsvorschau</DialogTitle>
                    <DialogDescription>
                        Bitte überprüfen Sie die Rechnungsdetails, bevor Sie sie senden.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={cardInfo.avatar} />
                                <AvatarFallback>{cardInfo.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">Empfänger: {cardInfo.name}</p>
                                <p className="text-sm text-muted-foreground">Mannschaft: {cardInfo.team}</p>
                            </div>
                        </div>
                        <Separator className="my-3" />
                         <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Grund:</span>
                                <span className="font-medium">{cardInfo.reason}</span>
                            </div>
                             <div className="flex justify-between">
                                <span>Datum:</span>
                                <span className="font-medium">{cardInfo.date}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Karte(n):</span>
                                 <div className="flex gap-1">
                                    {cardInfo.cards.map((card, idx) => (
                                        <div key={idx} className={`w-3 h-5 rounded-sm ${card === 'yellow' ? 'bg-yellow-400' : 'bg-red-500'}`}></div>
                                    ))}
                                </div>
                            </div>
                             <Separator className="my-2" />
                            <div className="flex justify-between font-bold text-base">
                                <span>Total:</span>
                                <span>CHF {cardInfo.cost.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Durch Klicken auf "Senden & Archivieren" wird eine Rechnung an den Spieler generiert und per E-Mail versendet. Die Karte wird anschliessend archiviert.
                    </p>
                </div>
                <DialogFooter className="grid grid-cols-2 gap-2 sm:flex sm:justify-between">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={onArchiveOnly}>Nur Archivieren</Button>
                        <Button onClick={onSend}>Senden & Archivieren</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
