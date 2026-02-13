
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { DatePicker } from './ui/date-picker';
import { Checkbox } from './ui/checkbox';
import { X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from './ui/badge';


export const OverdueInvoiceModal = ({ invoice, isOpen, onOpenChange }) => {
    
    const [isSuspended, setIsSuspended] = useState(false);
    const [isSuspendedIndefinitely, setIsSuspendedIndefinitely] = useState(false);
    const [suspensionFrom, setSuspensionFrom] = useState<Date | undefined>();
    const [suspensionTo, setSuspensionTo] = useState<Date | undefined>();

    useEffect(() => {
        if (isSuspendedIndefinitely) {
            setSuspensionTo(undefined);
        }
    }, [isSuspendedIndefinitely]);

    if (!invoice) return null;

    const isPlayer = invoice.roles?.includes('Spieler') || invoice.role === 'Spieler';

    // Make sure teams is an array
    const teams = Array.isArray(invoice.teams) ? invoice.teams : [invoice.team];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0">
                 <DialogHeader className="p-6 pb-4">
                    <div className="flex justify-between items-start">
                         <DialogTitle className="text-2xl font-bold font-headline">Aktion nicht bezahlter Mitgliederbeitrag</DialogTitle>
                         <DialogClose asChild>
                           <Button variant="ghost" size="icon"><X/></Button>
                         </DialogClose>
                    </div>
                </DialogHeader>
                 <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="text-xl font-semibold">Mitgliederbeitrag</h3>
                        <div className="grid grid-cols-3 gap-4">
                             <div className="p-3 rounded-lg bg-muted/50">
                                <Label className="text-xs">Rollen</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {(Array.isArray(invoice.roles) ? invoice.roles : [invoice.role]).map(r => <Badge key={r} variant="secondary">{r}</Badge>)}
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                                <Label className="text-xs">MitgliederNr</Label>
                                <p className="font-semibold">{invoice.memberNr}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                                <Label className="text-xs">Mannschaften</Label>
                                 <div className="flex flex-wrap gap-1 mt-1">
                                    {teams.map(t => <Badge key={t} variant="outline">{t}</Badge>)}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-5 gap-4">
                             <div className="p-3 rounded-lg bg-muted/50 col-span-2">
                                <Label className="text-xs">Typ</Label>
                                <p className="font-semibold">Jährlicher Mitgliederbeitrag</p>
                            </div>
                             <div className="p-3 rounded-lg bg-muted/50">
                                <Label className="text-xs">Saison</Label>
                                <p className="font-semibold">{invoice.saison}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50">
                                <Label className="text-xs">Summe</Label>
                                <p className="font-semibold">{invoice.summe}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-red-100 text-red-800">
                                <Label className="text-xs">Zahlungsfrist</Label>
                                <p className="font-semibold">-3 Tage</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 items-end">
                            <div className="space-y-2">
                                <Label>Zahlungsfrist verlängern</Label>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="30 Tage" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10 Tage</SelectItem>
                                        <SelectItem value="20">20 Tage</SelectItem>
                                        <SelectItem value="30">30 Tage</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                               <Switch id="reminder" />
                               <Label htmlFor="reminder">Erinnerung senden</Label>
                            </div>
                        </div>
                         {isPlayer && (
                            <div className="grid grid-cols-2 gap-4 items-end border-t pt-4">
                                <div className="flex items-center gap-2">
                                   <Switch id="suspend" checked={isSuspended} onCheckedChange={setIsSuspended}/>
                                   <Label htmlFor="suspend">Spieler sperren?</Label>
                                </div>
                                <div className={`grid grid-cols-2 gap-2 transition-opacity ${isSuspended ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                     <div>
                                        <Label className="text-xs">Von</Label>
                                        <DatePicker date={suspensionFrom} onDateChange={setSuspensionFrom} />
                                     </div>
                                      <div>
                                        <Label className="text-xs">Bis</Label>
                                        <DatePicker date={suspensionTo} onDateChange={setSuspensionTo} disabled={isSuspendedIndefinitely} />
                                         <div className="flex items-center gap-2 mt-2">
                                            <Checkbox id="indefinite" checked={isSuspendedIndefinitely} onCheckedChange={(checked) => setIsSuspendedIndefinitely(checked as boolean)} />
                                            <Label htmlFor="indefinite" className="text-xs">bis auf weiteres</Label>
                                        </div>
                                     </div>
                                </div>
                            </div>
                         )}

                         <div className="space-y-2">
                            <Label htmlFor="details">Details</Label>
                            <Textarea id="details" placeholder="Grund für die Aktion, interne Notizen..." />
                         </div>
                    </div>
                    <div className="md:col-span-1 space-y-4">
                        <div className="flex flex-col items-center">
                            <Avatar className="w-32 h-32 mb-2">
                                <AvatarImage src={invoice.avatar} />
                                <AvatarFallback>{invoice.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <p className="font-semibold">{invoice.name}</p>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Benachrichtigungsart</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Checkbox id="email-notify" defaultChecked/>
                                    <Label htmlFor="email-notify">E-Mail</Label>
                                </div>
                                 <div className="flex items-center gap-2">
                                    <Checkbox id="amigoal-notify" defaultChecked/>
                                    <Label htmlFor="amigoal-notify">Amigoal</Label>
                                </div>
                                 <div className="flex items-center gap-2">
                                    <Checkbox id="mail-notify"/>
                                    <Label htmlFor="mail-notify">Brief</Label>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                 </div>
                 <DialogFooter className="px-6 pb-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={() => onOpenChange(false)}>Aktion ausführen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
