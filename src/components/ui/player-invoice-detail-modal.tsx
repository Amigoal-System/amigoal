
'use client';

import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from './button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineIcon, TimelineTitle, TimelineBody } from '@/components/ui/timeline';
import { Check, FileDown, Info } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { PlayerInvoicePDF } from './player-invoice-pdf';
import { Badge } from './badge';
import Link from 'next/link';

export const PlayerInvoiceDetailModal = ({ isOpen, onOpenChange, invoice }) => {
    const pdfComponentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        content: () => pdfComponentRef.current,
    });

    if (!invoice) return null;

    const invoiceItems = [{
        description: invoice.description,
        amount: invoice.amount
    }];
    
    const totalAmount = invoice.amount;

    const history = [
        { date: invoice.dueDate, status: 'Rechnung erstellt', description: 'Rechnung wurde erstellt und ist zur Zahlung fällig.' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Rechnungsdetails</DialogTitle>
                     <DialogDescription>
                        Übersicht für: {invoice.description}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-6 py-4 max-h-[70vh] overflow-y-auto">
                    {/* Left Side */}
                    <div className="space-y-4">
                        <div className="p-4 border rounded-lg bg-muted/50">
                            <h3 className="font-semibold mb-2">Zahlungsinformationen</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Beschreibung</TableHead>
                                        <TableHead className="text-right">Betrag</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoiceItems.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="flex items-center gap-2">
                                                {item.description}
                                                {invoice.link && (
                                                    <Link href={invoice.link} passHref>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                            <Info className="h-4 w-4"/>
                                                        </Button>
                                                    </Link>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">CHF {item.amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow className="font-bold text-base">
                                        <TableCell>Total</TableCell>
                                        <TableCell className="text-right">CHF {totalAmount.toFixed(2)}</TableCell>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                            <div className="mt-4 flex gap-2">
                                <Button className="w-full">Jetzt bezahlen</Button>
                                <Button variant="outline" className="w-full" onClick={handlePrint}>
                                    <FileDown className="mr-2 h-4 w-4"/>
                                    Als PDF exportieren
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="space-y-4">
                         <div className="p-4 border rounded-lg bg-muted/50">
                             <h3 className="font-semibold mb-2">Verlauf</h3>
                             <Timeline>
                                {history.map((item, index) => (
                                    <TimelineItem key={index}>
                                        <TimelineConnector />
                                        <TimelineHeader>
                                            <TimelineIcon>
                                                <Check className="h-4 w-4" />
                                            </TimelineIcon>
                                            <TimelineTitle>{item.status}</TimelineTitle>
                                        </TimelineHeader>
                                        <TimelineBody>
                                            <p className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString('de-CH')}</p>
                                            <p className="text-sm">{item.description}</p>
                                        </TimelineBody>
                                    </TimelineItem>
                                ))}
                            </Timeline>
                        </div>
                    </div>
                </div>
                {/* Hidden printable component */}
                <div className="hidden">
                    <PlayerInvoicePDF ref={pdfComponentRef} invoice={{ ...invoice, totalAmount, items: invoiceItems }} />
                </div>
            </DialogContent>
        </Dialog>
    )
}
