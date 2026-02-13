
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle2, XCircle, FileDown, Printer, Share2, CornerDownLeft } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

const mockExpense = {
    type: 'Spiel',
    team: 'Junioren A1',
    total: 'CHF 150',
    date: '21.10.2020',
    trainer: {
        name: 'Name Vorname',
        number: '123456789',
        avatar: 'https://placehold.co/128x128.png'
    },
    items: [
        { type: 'Schiedsrichter', details: 'Junioren A1', amount: 'CHF 90', confirmed: true },
        { type: 'Spesen', details: 'Junioren A1', amount: 'CHF 10', confirmed: false },
        { type: 'Parkplatz', details: 'Junioren A1', amount: 'CHF 10', confirmed: true },
        { type: 'Benzin', details: 'Junioren A1', amount: 'CHF 40', confirmed: true },
    ],
    totalSum: 150,
    attachments: [
        { name: 'Quittung.jpeg', url: '#' },
        { name: 'Quittung2.jpeg', url: '#' }
    ],
    status: 'Genehmigt',
    paymentStatus: 'Ausbezahlt'
};

const InfoItem = ({ label, value, className = '' }: { label: string, value: string, className?: string }) => (
    <div className={`p-3 rounded-lg bg-muted/50 ${className}`}>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
    </div>
);

const AttachmentPill = ({ name, url }) => (
    <a href={url} className="flex flex-col items-center justify-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted text-center w-24">
        <FileDown className="h-8 w-8 text-muted-foreground" />
        <span className="text-xs font-medium truncate w-full">{name}</span>
    </a>
);


export const ExpenseDetailModal = ({ expense, isOpen, onOpenChange }) => {
    if (!expense) return null; // Or use mockExpense for display

    const data = mockExpense; // Using mock data as the passed expense is minimal
    const isCoachView = true; // This would be determined by user role in a real app

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex justify-between items-start">
                        <DialogTitle className="text-2xl font-bold font-headline">Spesenbeleg</DialogTitle>
                         <DialogClose asChild>
                           <Button variant="ghost" size="icon" className="-mt-2 -mr-2"><XCircle /></Button>
                         </DialogClose>
                    </div>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-4">
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-lg bg-muted">
                           <Avatar className="w-24 h-24">
                               <AvatarImage src={data.trainer.avatar} alt={data.trainer.name} />
                               <AvatarFallback>{data.trainer.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2 text-center sm:text-left">
                                <p className="text-sm text-muted-foreground">Eingereicht von</p>
                                <p className="text-xl font-bold">{data.trainer.name}</p>
                                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                    <Badge variant="secondary">Datum: {data.date}</Badge>
                                    <Badge variant="secondary">Team: {data.team}</Badge>
                                </div>
                            </div>
                        </div>

                         <div>
                            <h3 className="font-semibold mb-2">Belegpositionen</h3>
                            <div className="border rounded-lg">
                                {data.items.map((item, index) => (
                                    <div key={index} className={`grid grid-cols-12 gap-2 p-2 items-center text-sm ${index < data.items.length - 1 ? 'border-b' : ''}`}>
                                        <div className="col-span-1 flex justify-center">
                                            {item.confirmed ? <CheckCircle2 className="h-5 w-5 text-green-500"/> : <XCircle className="h-5 w-5 text-red-500"/>}
                                        </div>
                                        <div className="col-span-8 font-medium">{item.type} <span className="text-muted-foreground">({item.details})</span></div>
                                        <div className="col-span-3 text-right">{item.amount}</div>
                                    </div>
                                ))}
                                <div className="grid grid-cols-12 gap-2 p-2 font-bold bg-muted/50 rounded-b-lg">
                                    <div className="col-span-9 text-right">Σ</div>
                                    <div className="col-span-3 text-right">CHF {data.totalSum}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <InfoItem label="Status Genehmigung" value={data.status} />
                           <InfoItem label="Status Auszahlung" value={data.paymentStatus} />
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Anhang</h3>
                            <div className="flex flex-wrap gap-4">
                                {data.attachments.map((att, i) => (
                                    <AttachmentPill key={i} name={att.name} url={att.url} />
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <DialogFooter className="pt-6 border-t">
                    <div className="flex w-full justify-between items-center">
                         {isCoachView ? (
                            <Button variant="outline"><CornerDownLeft className="mr-2 h-4 w-4"/>Zurückziehen</Button>
                         ) : (
                             <Button variant="destructive">Ablehnen</Button>
                         )}
                        <div className="flex gap-2">
                             <div className="flex gap-2">
                                <Button variant="outline" size="icon"><FileDown className="w-4 h-4"/></Button>
                                <Button variant="outline" size="icon"><Printer className="w-4 h-4"/></Button>
                                <Button variant="outline" size="icon"><Share2 className="w-4 h-4"/></Button>
                            </div>
                             {!isCoachView && <Button className="bg-green-600 hover:bg-green-700">Genehmigen & Auszahlen</Button>}
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
