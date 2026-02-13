
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { type Locale } from '@/../i18n.config';
import { cn } from '@/lib/utils';
import { Textarea } from './textarea';
import { Label } from './label';
import { useToast } from '@/hooks/use-toast';
import { DatePicker } from './date-picker';
import { Input } from './input';

const reasons = ["Krank", "Verletzt", "Schule", "Arbeit", "Sonstiges"];

export const DeclineEventModal = ({ isOpen, onOpenChange, onConfirm, onReportInjury }) => {
    const [step, setStep] = useState(1);
    const [selectedReason, setSelectedReason] = useState('Krank');
    const [otherReason, setOtherReason] = useState('');
    const [injuryDetails, setInjuryDetails] = useState({
        injury: '',
        date: new Date(),
        description: '',
        expectedReturn: new Date(new Date().setDate(new Date().getDate() + 14)),
    });
    
    const router = useRouter();
    const params = useParams();
    const lang = params.lang as Locale;
    const { toast } = useToast();

    const handleNext = () => {
        if (selectedReason === 'Verletzt') {
            setStep(2);
        } else if (selectedReason === 'Sonstiges' && !otherReason.trim()) {
            toast({
                title: 'Kommentar erforderlich',
                description: 'Bitte geben Sie einen Grund an, wenn Sie "Sonstiges" auswählen.',
                variant: 'destructive',
            });
        } else {
            const finalReason = selectedReason === 'Sonstiges' ? otherReason : selectedReason;
            onConfirm(finalReason);
            handleClose();
        }
    };
    
    const handleInjurySubmit = () => {
        if (!injuryDetails.injury || !injuryDetails.date || !injuryDetails.expectedReturn) {
             toast({
                title: 'Fehlende Informationen',
                description: 'Bitte füllen Sie alle Verletzungsdetails aus.',
                variant: 'destructive',
            });
            return;
        }
        onReportInjury(injuryDetails);
        onConfirm(`Verletzt: ${injuryDetails.injury}`);
        handleClose();
    }
    
    const handleClose = () => {
        onOpenChange(false);
        setTimeout(() => {
            setStep(1);
            setSelectedReason('Krank');
            setOtherReason('');
            setInjuryDetails({
                injury: '',
                date: new Date(),
                description: '',
                expectedReturn: new Date(new Date().setDate(new Date().getDate() + 14)),
            })
        }, 300);
    }

    const renderStep1 = () => (
        <>
             <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">Grund der Absage</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {reasons.map(reason => (
                        <Button
                            key={reason}
                            variant={selectedReason === reason ? 'default' : 'outline'}
                            className={cn('h-16 text-base', selectedReason === reason ? 'bg-green-500 hover:bg-green-600' : '')}
                            onClick={() => setSelectedReason(reason)}
                        >
                            {reason}
                        </Button>
                    ))}
                </div>
                {selectedReason === 'Sonstiges' && (
                    <div className="space-y-2 pt-2">
                        <Label htmlFor="otherReason">Bitte Grund angeben:</Label>
                        <Textarea
                            id="otherReason"
                            value={otherReason}
                            onChange={(e) => setOtherReason(e.target.value)}
                            placeholder="z.B. Familienfest..."
                        />
                    </div>
                )}
            </div>
            <DialogFooter>
                <Button className="w-full bg-green-500 hover:bg-green-600" onClick={handleNext}>Weiter</Button>
            </DialogFooter>
        </>
    );

    const renderStep2 = () => (
        <>
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">Verletzung melden</DialogTitle>
                 <DialogDescription className="text-center">
                    Bitte gib Details zu deiner Verletzung an. Diese werden direkt ans Medical Center übermittelt.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="injury">Art der Verletzung</Label>
                    <Input id="injury" value={injuryDetails.injury} onChange={(e) => setInjuryDetails(p => ({...p, injury: e.target.value}))} placeholder="z.B. Zerrung Oberschenkel"/>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label htmlFor="date">Datum der Verletzung</Label>
                        <DatePicker date={injuryDetails.date} onDateChange={(d) => setInjuryDetails(p => ({...p, date: d}))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="expectedReturn">Voraussichtliche Rückkehr</Label>
                        <DatePicker date={injuryDetails.expectedReturn} onDateChange={(d) => setInjuryDetails(p => ({...p, expectedReturn: d}))} />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="description">Beschreibung</Label>
                    <Textarea id="description" value={injuryDetails.description} onChange={(e) => setInjuryDetails(p => ({...p, description: e.target.value}))} placeholder="Wie ist die Verletzung passiert?"/>
                </div>
            </div>
             <DialogFooter>
                <Button variant="outline" onClick={() => setStep(1)}>Zurück</Button>
                <Button onClick={handleInjurySubmit}>Verletzung melden & Absagen</Button>
            </DialogFooter>
        </>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                {step === 1 ? renderStep1() : renderStep2()}
            </DialogContent>
        </Dialog>
    );
};
