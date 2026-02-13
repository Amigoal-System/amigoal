'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from './button';
import { FileSignature } from 'lucide-react';
import { Textarea } from './textarea';
import { Label } from './label';
import { Checkbox } from './checkbox';
import { useToast } from '@/hooks/use-toast';

const EventCard = ({ title, events }) => (
    <div className="space-y-2">
        <h3 className="font-semibold text-center">{title}</h3>
        <div className="border rounded-lg p-3 space-y-2 h-64 overflow-y-auto bg-muted/50">
            {events.map((event, index) => (
                <div key={index} className="text-xs p-1.5 rounded-md bg-background">
                    <span className="font-bold">{event.time}</span> {event.content}
                </div>
            ))}
        </div>
    </div>
);

const homeEvents = [
    { time: "23'", content: "Tor durch Messi (Freistoss)" },
    { time: "62'", content: "Gelbe Karte für Meier (Foul)" },
];

const awayEvents = [
    { time: "75'", content: "Tor durch Stürmer (Kopfball)" },
];

export const MatchClosingModal = ({ isOpen, onOpenChange, match }) => {
    const [refereeComment, setRefereeComment] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const { toast } = useToast();

    if (!match) return null;

    const handleConfirmAndReport = () => {
        if (!isConfirmed) {
            toast({
                title: 'Bestätigung fehlt',
                description: 'Bitte bestätigen Sie die Korrektheit der Daten, um das Spiel abzuschliessen.',
                variant: 'destructive',
            });
            return;
        }
        
        console.log("Match finalized and reported with comment:", refereeComment);
        
        toast({
            title: 'Spiel abgeschlossen und gemeldet',
            description: `Das Spiel ${match.homeTeam} vs. ${match.awayTeam} wurde offiziell beendet.`,
        });

        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Spiel abschliessen & an Verband melden</DialogTitle>
                    <DialogDescription>
                        Vergleichen Sie die Ereignisprotokolle, bestätigen Sie das Resultat und schliessen Sie das Spiel ab.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EventCard title="Protokoll Heimteam (FC Amigoal)" events={homeEvents} />
                    <EventCard title="Protokoll Gastteam (FC Rivalen)" events={awayEvents} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="referee-comment">Bemerkungen des Schiedsrichters (optional)</Label>
                    <Textarea 
                        id="referee-comment"
                        value={refereeComment}
                        onChange={(e) => setRefereeComment(e.target.value)}
                        placeholder="Besondere Vorkommnisse, Fairplay-Bemerkungen etc."
                    />
                </div>
                <div className="flex items-center space-x-2 mt-4">
                    <Checkbox id="confirmation" checked={isConfirmed} onCheckedChange={(checked) => setIsConfirmed(checked as boolean)} />
                    <Label htmlFor="confirmation" className="text-sm font-medium leading-none">
                        Hiermit bestätige ich die Korrektheit des Resultats und der erfassten Ereignisse.
                    </Label>
                </div>
                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={handleConfirmAndReport} disabled={!isConfirmed}>
                        <FileSignature className="mr-2 h-4 w-4"/> Abschliessen & an Verband melden
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
