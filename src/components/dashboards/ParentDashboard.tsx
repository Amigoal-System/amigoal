
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, MessageSquare, ArrowRight, Wallet, Users, BarChart, FileText, Check, X, Car, AlertTriangle, RectangleVertical, Eye, Minus, Plus, Search, ShoppingCart, Video, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type Locale } from '@/../i18n.config';
import { useToast } from '@/hooks/use-toast';
import { PlayerInvoiceDetailModal } from '../ui/player-invoice-detail-modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';
import Image from 'next/image';
import { DeclineEventModal } from '../ui/decline-event-modal';
import { useAbsences } from '@/hooks/useAbsences';
import { useMatches } from '@/hooks/useMatches';
import { useTrainings } from '@/hooks/useTrainings';
import { useCards } from '@/hooks/useCards';
import { useFeedback } from '@/hooks/useFeedback';
import { useCarpool } from '@/hooks/useCarpool';


const childsOpenFees = [
    { name: "Mitgliederbeitrag 24/25", amount: 300.00, dueDate: "31.07.2024" },
    { name: "Beitrag Trainingslager", amount: 150.00, dueDate: "15.08.2024" },
];

const mockShopItems = [
    { name: "Heimtrikot 24/25", image: "https://placehold.co/600x400.png", dataAiHint: "soccer jersey" },
    { name: "Fanschal", image: "https://placehold.co/600x400.png", dataAiHint: "soccer scarf" },
];

const mockHighlights = [
    { title: "Traumtor im Derby", image: "https://placehold.co/600x400.png", dataAiHint: "soccer goal" },
    { title: "Solo-Lauf von Messi", image: "https://placehold.co/600x400.png", dataAiHint: "soccer skill" },
];

const WarningDetailModal = ({ warning, isOpen, onOpenChange }) => {
    if (!warning) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{warning.type} von {warning.author}</DialogTitle>
                    <DialogDescription>Datum: {warning.date}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p>{warning.detail}</p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Schliessen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const OfferRideModal = ({ isOpen, onOpenChange, onOffer }) => {
    const [seats, setSeats] = useState(1);

    const handleOffer = () => {
        onOffer(seats);
        onOpenChange(false);
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle>Fahrt anbieten</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Label>Wie viele freie Plätze hast du?</Label>
                     <div className="flex items-center justify-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => setSeats(s => Math.max(1, s - 1))}><Minus /></Button>
                        <span className="text-4xl font-bold w-16 text-center">{seats}</span>
                        <Button variant="outline" size="icon" onClick={() => setSeats(s => s + 1)}><Plus /></Button>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={handleOffer}>Angebot erstellen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const SearchRideModal = ({ isOpen, onOpenChange, carpoolData }) => {
    const { toast } = useToast();
    
    const handleRequestSeat = (driver) => {
        toast({
            title: 'Platz angefragt!',
            description: `Ihre Anfrage wurde an ${driver.name} gesendet.`
        })
    }

    return (
         <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Fahrt suchen</DialogTitle>
                    <DialogDescription>
                        Finden Sie eine Mitfahrgelegenheit für Ihr Kind zum nächsten Auswärtsspiel.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3 max-h-96 overflow-y-auto">
                    {carpoolData.map((ride, index) => (
                        <Card key={index}>
                            <CardContent className="p-4 flex items-center justify-between">
                                 <div>
                                    <p className="font-semibold">{ride.driverName}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Mitfahrer: {ride.passengers?.map(p => p.name).join(', ') || 'Keine'}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{ride.seatsAvailable}</p>
                                    <p className="text-xs text-muted-foreground">freie Plätze</p>
                                </div>
                                 <Button 
                                    size="sm"
                                    onClick={() => handleRequestSeat(ride.driver)}
                                    disabled={ride.seatsAvailable === 0}
                                >
                                    Platz anfragen
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function ParentDashboard() {
    const params = useParams();
    const lang = params.lang as Locale;
    const { toast } = useToast();
    const { addAbsence, getAbsenceStatus, isLoading: isAbsencesLoading } = useAbsences('player-101');
    const { matches } = useMatches();
    const { trainings } = useTrainings();
    const { cards } = useCards('101');
    const { feedback } = useFeedback('player-101');
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const [selectedWarning, setSelectedWarning] = useState(null);
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [isDeclineModalOpen, setIsDeclineModalOpen] = useState<'training' | 'match' | false>(false);
    const [showTransportOptions, setShowTransportOptions] = useState(false);

    const nextTraining = useMemo(() => {
         return trainings
            .filter(e => new Date(e.date) >= new Date())
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    }, [trainings]);

    const nextMatch = useMemo(() => {
        return matches
            .filter(e => new Date(e.date) >= new Date())
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    }, [matches]);

    const { carpools, addCarpool } = useCarpool(nextMatch?.id);

    const trainingAttendance = getAbsenceStatus(nextTraining?.id);
    const matchAttendance = getAbsenceStatus(nextMatch?.id);

    const handleDecline = (type: 'training' | 'match', reason: string) => {
        const eventId = type === 'training' ? nextTraining?.id : nextMatch?.id;
        if (!eventId) return;
        addAbsence({
            eventId: eventId,
            memberId: 'player-101', // This would be dynamic
            reason: reason,
            status: 'declined',
        });
        setIsDeclineModalOpen(false);
    }
    
    const handleTransportChoice = (drivesSelf: boolean) => {
        const newStatus = drivesSelf ? 'confirmed_driving' : 'confirmed_needs_ride';
        if (!nextMatch) return;
        addAbsence({ eventId: nextMatch.id, memberId: 'player-101', status: newStatus });
        setShowTransportOptions(false);
    };

    
    const handleOfferRide = (seats: number) => {
         if (!nextMatch) return;
        addCarpool({
            driverId: 'parent-1', // dynamic
            driverName: 'Familie Messi', // dynamic
            seatsAvailable: seats,
            maxSeats: seats,
            matchId: nextMatch.id,
            passengers: [],
        });
    };

    const handleInvoiceClick = (invoice: any) => {
        setSelectedInvoice(invoice);
        setIsInvoiceModalOpen(true);
    };

    const handleWarningClick = (warning: any) => {
        setSelectedWarning(warning);
        setIsWarningModalOpen(true);
    }
    
    const renderAttendanceFooter = () => {
        if (showTransportOptions) {
            return (
                <div className="flex w-full gap-2">
                    <Button className="w-full" onClick={() => handleTransportChoice(true)}>
                        <Car className="mr-2 h-4 w-4" /> Wir fahren selbst
                    </Button>
                    <Button className="w-full" variant="secondary" onClick={() => handleTransportChoice(false)}>
                        <Users className="mr-2 h-4 w-4" /> Benötigen Fahrdienst
                    </Button>
                </div>
            )
        }
        
        switch (matchAttendance) {
            case 'pending':
                return (
                    <div className="flex w-full gap-2">
                        <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => setShowTransportOptions(true)}>
                            <Check className="mr-2 h-4 w-4" /> Zusagen
                        </Button>
                        <Button className="w-full" variant="destructive" onClick={() => setIsDeclineModalOpen('match')}>
                            <X className="mr-2 h-4 w-4" /> Absagen
                        </Button>
                    </div>
                );
            case 'confirmed_driving':
                 return <p className="text-sm text-center font-semibold text-green-600">Zugesagt (fährt selbst)</p>;
            case 'confirmed_needs_ride':
                return <p className="text-sm text-center font-semibold text-green-600">Zugesagt (benötigt Fahrdienst)</p>;
            case 'declined':
                return <p className="text-sm text-center font-semibold text-red-600">Abgesagt</p>;
            default:
                 return null;
        }
    }

    return (
        <>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold font-headline">Eltern-Cockpit</h1>
                <p className="text-muted-foreground">Willkommen zurück! Hier finden Sie die wichtigsten Informationen zu Ihrem Kind, Lionel Messi.</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary"/> Nächster Termin</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <h3 className="text-lg font-bold">{nextMatch?.type}: {nextMatch?.opponent ? `vs. ${nextMatch.opponent}` : nextMatch?.team}</h3>
                                <p className="text-muted-foreground">{nextMatch?.date ? new Date(nextMatch.date).toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long' }) : 'N/A'}</p>
                                <p className="text-sm text-muted-foreground">{nextMatch?.time} @ {nextMatch?.location}</p>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2">
                                {renderAttendanceFooter()}
                            </CardFooter>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5 text-primary"/> Offene Beiträge</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Beschreibung</TableHead>
                                            <TableHead>Betrag</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {childsOpenFees.map((fee, index) => (
                                            <TableRow key={index} className="cursor-pointer" onClick={() => handleInvoiceClick(fee)}>
                                                <TableCell>{fee.name}</TableCell>
                                                <TableCell>CHF {fee.amount.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                            <CardFooter>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={`/${lang}/dashboard/invoices`}>Alle Rechnungen ansehen</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-primary"/> Disziplin & Verhalten</CardTitle>
                            </CardHeader>
                             <CardContent>
                                <Tabs defaultValue="cards">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="cards">Karten</TabsTrigger>
                                        <TabsTrigger value="warnings">Verwarnungen & Feedback</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="cards" className="pt-4">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Vorkommnis</TableHead>
                                                    <TableHead>Datum</TableHead>
                                                    <TableHead>Status / Kosten</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {cards.map((card, index) => (
                                                    <TableRow key={index} className="cursor-pointer hover:bg-muted/50" onClick={() => handleInvoiceClick(card)}>
                                                        <TableCell className="font-medium flex items-center gap-2">
                                                            <RectangleVertical className="h-4 w-4 text-yellow-500 fill-yellow-400" />
                                                            {card.reason}
                                                        </TableCell>
                                                        <TableCell>{card.date}</TableCell>
                                                        <TableCell>
                                                            <Badge variant="destructive">{card.status} / CHF {card.cost.toFixed(2)}</Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TabsContent>
                                    <TabsContent value="warnings" className="pt-4">
                                         <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Typ</TableHead>
                                                    <TableHead>Beschreibung</TableHead>
                                                    <TableHead>Datum</TableHead>
                                                    <TableHead>Von</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {feedback.map((item, index) => (
                                                    <TableRow key={index} className="cursor-pointer hover:bg-muted/50" onClick={() => handleWarningClick(item)}>
                                                        <TableCell>
                                                            <Badge variant={item.type === 'Verwarnung' ? 'destructive' : 'secondary'}>{item.type}</Badge>
                                                        </TableCell>
                                                        <TableCell className="truncate max-w-xs">{item.description}</TableCell>
                                                        <TableCell>{item.date}</TableCell>
                                                        <TableCell>{item.author}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5 text-primary" /> Vereinsshop
                                </CardTitle>
                                <CardDescription>Die neusten Fanartikel und Ausrüstungen.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                {mockShopItems.map((item) => (
                                    <div key={item.name} className="space-y-2">
                                        <Image src={item.image} alt={item.name} width={200} height={150} className="rounded-lg object-cover aspect-video" data-ai-hint={item.dataAiHint}/>
                                        <p className="text-sm font-medium">{item.name}</p>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={`/${lang}/dashboard/shop`}>Zum Shop</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                        <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Video className="h-5 w-5 text-primary" /> Neuste Highlights
                                </CardTitle>
                                <CardDescription>Die besten Momente von Lionel.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                               {mockHighlights.map((item) => (
                                    <div key={item.title} className="space-y-2">
                                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                            <Image src={item.image} alt={item.title} width={200} height={150} className="rounded-lg object-cover" data-ai-hint={item.dataAiHint}/>
                                        </div>
                                        <p className="text-sm font-medium">{item.title}</p>
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter>
                                 <Button asChild variant="outline" className="w-full">
                                    <Link href={`/${lang}/dashboard/highlights`}>Alle Highlights</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Schnellzugriff</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2">
                                <Button asChild variant="outline" className="justify-start gap-2">
                                    <Link href={`/${lang}/dashboard/teams`}>
                                        <Users className="h-4 w-4"/> Mannschaften des Kindes</Link>
                                </Button>
                                <Button asChild variant="outline" className="justify-start gap-2">
                                    <Link href={`/${lang}/dashboard/statistics`}>
                                        <BarChart className="h-4 w-4"/> Leistungen des Kindes</Link>
                                </Button>
                                <Button asChild variant="outline" className="justify-start gap-2">
                                    <Link href={`/${lang}/dashboard/documents`}>
                                        <FileText className="h-4 w-4"/> Dokumente</Link>
                                </Button>
                                <Button asChild variant="outline" className="justify-start gap-2">
                                    <Link href={`/${lang}/dashboard/chat`}>
                                        <MessageSquare className="h-4 w-4"/> Trainer kontaktieren</Link>
                                </Button>
                            </CardContent>
                        </Card>
                         <CarpoolCard matchId={nextMatch?.id}/>
                    </div>
                </div>
            </div>
             <PlayerInvoiceDetailModal 
                isOpen={isInvoiceModalOpen}
                onOpenChange={setIsInvoiceModalOpen}
                invoice={selectedInvoice}
            />
            <WarningDetailModal
                isOpen={isWarningModalOpen}
                onOpenChange={setIsWarningModalOpen}
                warning={selectedWarning}
            />
            <DeclineEventModal
                isOpen={!!isDeclineModalOpen}
                onOpenChange={() => setIsDeclineModalOpen(false)}
                onConfirm={(reason) => handleDecline(isDeclineModalOpen as 'training' | 'match', reason)} 
                onReportInjury={(details) => console.log('Injury reported:', details)} 
            />
        </>
    );

}
