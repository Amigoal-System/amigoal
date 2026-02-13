
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Mail, Phone, Building, Briefcase, Plus, Send, Archive, CheckCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import type { InvestorLead, HistoryItem } from '@/ai/flows/investorLeads.types';
import { Label } from '@/components/ui/label';
import { Timeline, TimelineItem, TimelineConnector, TimelineIcon, TimelineBody, TimelineHeader, TimelineTitle } from './timeline';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Textarea } from './textarea';
import { useToast } from '@/hooks/use-toast';
import { updateInvestorLead } from '@/ai/flows/investorLeads';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const leadStatuses: InvestorLead['status'][] = ['Interessent', 'Kontaktiert', 'Präsentiert', 'Verhandlung', 'Abgeschlossen', 'Abgelehnt', 'Archiviert'];

const StatusUpdateModal = ({ isOpen, onOpenChange, currentStatus, onConfirm }) => {
    const [newStatus, setNewStatus] = useState<InvestorLead['status']>(currentStatus);
    const [note, setNote] = useState('');

    const handleConfirm = () => {
        onConfirm(newStatus, note);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Status aktualisieren</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label>Neuer Status</Label>
                        <Select value={newStatus} onValueChange={(val) => setNewStatus(val as InvestorLead['status'])}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {leadStatuses.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Notiz (optional)</Label>
                        <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="z.B. Erstes Gespräch geführt, Pitch Deck gesendet."/>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={handleConfirm}>Status aktualisieren</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const InvestorLeadDetailModal = ({ lead, isOpen, onOpenChange, onStatusChange, onConvertToInvestor }) => {
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    
    if (!lead) return null;

    const handleArchive = () => {
        onStatusChange(lead.id, 'Archiviert', 'Lead manuell archiviert');
        onOpenChange(false);
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">{lead.name}</DialogTitle>
                        <DialogDescription>{lead.company || 'Privatinvestor'}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Kontaktinformationen</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground"/> {lead.email}</p>
                                {lead.message && (
                                    <>
                                        <p className="font-semibold pt-2">Nachricht:</p>
                                        <blockquote className="border-l-2 pl-4 italic text-muted-foreground">{lead.message}</blockquote>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Verlauf</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Timeline>
                                    {(lead.history || []).slice().reverse().map((item: HistoryItem, index: number) => (
                                        <TimelineItem key={index}>
                                            <TimelineConnector />
                                            <TimelineHeader>
                                                <TimelineIcon>
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                </TimelineIcon>
                                                <TimelineTitle className="text-sm">{item.text}</TimelineTitle>
                                            </TimelineHeader>
                                            <TimelineBody>
                                                <p className="text-xs text-muted-foreground">{format(new Date(item.date), "dd. MMMM yyyy, HH:mm", { locale: de })}</p>
                                            </TimelineBody>
                                        </TimelineItem>
                                    ))}
                                </Timeline>
                            </CardContent>
                        </Card>
                    </div>
                    <DialogFooter className="justify-between">
                         <div className="flex gap-2">
                            <Button variant="ghost" onClick={handleArchive}>
                                <Archive className="mr-2 h-4 w-4"/> Archivieren
                            </Button>
                            {lead.status !== 'Abgeschlossen' && (
                                <Button variant="secondary" onClick={() => onConvertToInvestor(lead)}>
                                    <CheckCircle className="mr-2 h-4 w-4" /> In Investor umwandeln
                                </Button>
                            )}
                         </div>
                         <div>
                            <Button variant="outline" className="mr-2" onClick={() => onOpenChange(false)}>Schliessen</Button>
                            <Button onClick={() => setIsStatusModalOpen(true)}>Status ändern</Button>
                         </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <StatusUpdateModal 
                isOpen={isStatusModalOpen}
                onOpenChange={setIsStatusModalOpen}
                currentStatus={lead.status}
                onConfirm={(newStatus, note) => {
                    onStatusChange(lead.id, newStatus, note);
                    setIsStatusModalOpen(false);
                }}
            />
        </>
    )
}
