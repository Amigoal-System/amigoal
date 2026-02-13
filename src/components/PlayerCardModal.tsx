'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Mic, RectangleVertical } from 'lucide-react';
import { MusicCard } from './ui/music-card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { InvoicePreviewModal } from './InvoicePreviewModal';
import { Separator } from './ui/separator';


const InfoField = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex justify-between items-baseline py-1 border-b border-muted">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-semibold text-sm text-right">{value}</span>
    </div>
);


export const PlayerCardModal = ({ card, isOpen, onOpenChange, onArchive, onPay }) => {
    const { toast } = useToast();
    const [showInvoicePreview, setShowInvoicePreview] = useState(false);
    
    if (!card) return null;

    const cardType = card.cards.includes('red') ? 'Rot' : 'Gelb';
    const cardColorClass = cardType === 'Rot' ? 'bg-red-500' : 'bg-yellow-400';
    
    const handlePayClick = () => {
        onPay(card);
    }
    
    const handleCreateInvoice = () => {
        setShowInvoicePreview(true);
    }
    
    const handleConfirmInvoice = (sendNow: boolean) => {
        toast({
            title: `Rechnung ${sendNow ? 'gesendet' : 'erstellt'}`,
            description: `Die Rechnung für die Busse wurde erfolgreich ${sendNow ? 'an den Spieler gesendet' : 'erstellt und kann manuell versendet werden'}.`,
        });
        onArchive(card, 'Spieler (Rechnung)');
        setShowInvoicePreview(false);
    }
    
    const handleArchiveClub = () => {
        onArchive(card, 'Club');
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl p-0">
                    <div className="p-4">
                        <DialogHeader className="text-left mb-2">
                             <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={card.avatar} alt={card.name} data-ai-hint="person portrait" />
                                    <AvatarFallback>{card.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <DialogTitle className="text-xl font-bold font-headline">{card.name}</DialogTitle>
                                    <DialogDescription>Spielerkarte Details</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="grid grid-cols-10 gap-6 items-start">
                            {/* Left Column for details */}
                            <div className="col-span-5 space-y-1">
                                <h3 className="font-semibold text-lg mb-1">Details</h3>
                                <InfoField label="Typ" value="Karte" />
                                <InfoField label="Mannschaft" value={card.team} />
                                <InfoField label="Kosten" value={`CHF ${card.cost}`} />
                                <InfoField label="Spielnummer" value={card.gameId} />
                                <InfoField label="Gegner Club" value={card.opponentClub} />
                                <InfoField label="Gegner Team" value={card.opponentTeam || '-'} />
                                <InfoField label="Datum" value={card.date} />
                                <InfoField label="Spielminute" value={`${card.gameMinute}'`} />
                                <InfoField label="Begründung" value={card.reason} />
                            </div>

                            {/* Middle and Right Column */}
                             <div className="col-span-5 flex flex-col gap-4">
                               <div className="grid grid-cols-5 gap-4 items-start">
                                 <div className="col-span-2 flex flex-col items-center gap-2">
                                    <div className={`h-32 w-24 rounded-lg ${cardColorClass} mx-auto shadow-lg border-2 border-white/20`}></div>
                                    <Label className="text-sm font-medium text-muted-foreground">Erhaltene Karte</Label>
                                </div>
                                <div className="col-span-3">
                                  <Card>
                                      <CardHeader className="p-4">
                                          <CardTitle className="text-base">Kostenübernahme</CardTitle>
                                      </CardHeader>
                                      <CardContent className="p-4 pt-0 space-y-2">
                                          <Button className="w-full" variant="outline" onClick={handleArchiveClub}>Vom Verein übernommen</Button>
                                          <Button className="w-full" onClick={() => onArchive(card, 'Spieler')}>Vom Spieler bezahlt</Button>
                                          <Button className="w-full" onClick={handleCreateInvoice}>Rechnung an Spieler</Button>
                                      </CardContent>
                                  </Card>
                                </div>
                               </div>
                               <Card>
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-base">Audio-Notiz des Schiedsrichters</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0 flex justify-center">
                                        <MusicCard />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                     <DialogFooter className="p-4 bg-muted/50 mt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Schliessen
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <InvoicePreviewModal
                isOpen={showInvoicePreview}
                onOpenChange={setShowInvoicePreview}
                cardInfo={card}
                onSend={() => handleConfirmInvoice(true)}
                onArchiveOnly={() => handleConfirmInvoice(false)}
            />
        </>
    );
};
