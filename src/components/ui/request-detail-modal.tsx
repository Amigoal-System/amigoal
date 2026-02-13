
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from './button';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Send, Check, X } from 'lucide-react';
import type { TrainingCamp, CampRequest } from '@/ai/flows/trainingCamps.types';
import type { Provider } from '@/ai/flows/providers.types';
import type { Bootcamp } from '@/ai/flows/bootcamps.types';


interface RequestDetailModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    request: (TrainingCamp | Bootcamp) & { bootcamp?: Bootcamp };
    providers: Provider[];
    onForward?: (requestId: string, providerId: string) => void;
    onConfirm?: (registration: any) => void;
    onCancel?: (registration: any) => void;
}

export const RequestDetailModal = ({ isOpen, onOpenChange, request, providers, onForward, onConfirm, onCancel }: RequestDetailModalProps) => {
    const [selectedProvider, setSelectedProvider] = useState('');

    if (!isOpen || !request) return null;

    const handleForwardClick = () => {
        if (selectedProvider && request.id && onForward) {
            onForward(request.id, selectedProvider);
        }
    };
    
    // Determine if it's a bootcamp registration or a camp request
    const isBootcampRegistration = 'contactName' in request;
    const details = isBootcampRegistration ? request : request.requestDetails;
    
    const requestTitle = isBootcampRegistration ? `Anmeldung: ${request.name}` : `Anfrage: ${details?.clubName}`;
    const requestDescription = isBootcampRegistration ? `Neue Anmeldung zum Bootcamp "${request.name}".` : `Anfrage für ein Trainingslager von ${details?.clubName}.`;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{requestTitle}</DialogTitle>
                    <DialogDescription>{requestDescription}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            {isBootcampRegistration ? (
                                <>
                                    <div><Label className="text-muted-foreground">Teilnehmer</Label><p>{request.name}</p></div>
                                    <div><Label className="text-muted-foreground">Kontaktperson</Label><p>{request.contactName}</p></div>
                                    <div><Label className="text-muted-foreground">E-Mail</Label><p>{request.email}</p></div>
                                    <div><Label className="text-muted-foreground">Bootcamp</Label><p>{request.campName}</p></div>
                                </>
                            ) : (
                                <>
                                    <div><Label className="text-muted-foreground">Club</Label><p>{details?.clubName}</p></div>
                                    <div><Label className="text-muted-foreground">Kontaktperson</Label><p>{details?.contactPerson}</p></div>
                                    <div><Label className="text-muted-foreground">Reisezeitraum</Label><p>{details?.dates ? `${new Date(details.dates.from).toLocaleDateString()} - ${new Date(details.dates.to).toLocaleDateString()}` : 'Unbekannt'}</p></div>
                                    <div><Label className="text-muted-foreground">Teilnehmer (ca.)</Label><p>{details?.participants}</p></div>
                                    <div className="col-span-2"><Label className="text-muted-foreground">Bevorzugte Region</Label><p>{details?.destination || '-'}</p></div>
                                    <div className="col-span-2"><Label className="text-muted-foreground">Gewünschte Anlage</Label><p>{details?.facility || '-'}</p></div>
                                    <div className="col-span-2"><Label className="text-muted-foreground">Anforderungen</Label><p className="p-2 bg-muted/50 rounded-md whitespace-pre-wrap">{details?.wishes || 'Keine spezifischen Anforderungen.'}</p></div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                    
                    {onForward && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">An Anbieter weiterleiten</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                 <Label>Anbieter auswählen</Label>
                                 <Select onValueChange={setSelectedProvider} value={selectedProvider}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Passenden Anbieter auswählen..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {providers.length > 0 ? (
                                            providers.map(p => <SelectItem key={p.id} value={p.id!}>{p.name}</SelectItem>)
                                        ) : (
                                            <SelectItem value="none" disabled>Keine passenden Anbieter gefunden</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" disabled={!selectedProvider} onClick={handleForwardClick}>
                                    <Send className="mr-2 h-4 w-4"/> Anfrage weiterleiten
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>
                 <DialogFooter>
                    {onConfirm && onCancel && (
                        <div className="flex w-full justify-end gap-2">
                             <Button variant="destructive" onClick={() => onCancel(request)}>
                                <X className="mr-2 h-4 w-4"/> Stornieren
                            </Button>
                            <Button onClick={() => onConfirm(request)}>
                                <Check className="mr-2 h-4 w-4"/> Bestätigen & Rechnung
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
