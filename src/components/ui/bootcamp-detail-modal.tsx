
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Check, User, MapPin, Calendar, DollarSign, Target, Sparkles, Building, Utensils, Home, Loader2, ArrowRight, UserPlus, Trash2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCamps } from '@/hooks/useCamps';
import { Input } from './input';
import { Label } from './label';
import { Separator } from './separator';
import { validateCoupon } from '@/ai/flows/coupons';
import type { Coupon } from '@/ai/flows/coupons.types';
import { BadgeCheck } from 'lucide-react';
import { registerForBootcamp } from '@/ai/flows/bootcamps';
import { useBootcamps } from '@/hooks/useBootcamps';
import { ScrollArea } from './scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';


interface Participant {
    id: number;
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: 'Junge' | 'Mädchen' | '';
}


const RegistrationForm = ({ bootcamp, onRegister, onBack, currentUser }) => {
    const [participants, setParticipants] = useState<Participant[]>([{ id: Date.now(), firstName: '', lastName: '', birthDate: '', gender: '' }]);
    const [contact, setContact] = useState({ 
        name: currentUser?.userName || '', 
        email: currentUser?.userEmail || '',
        address: '',
        zip: '',
        city: '',
        phone: '',
    });
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
    const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
    const { toast } = useToast();

    const addParticipant = () => {
        setParticipants([...participants, { id: Date.now(), firstName: '', lastName: '', birthDate: '', gender: '' }]);
    };
    
    const removeParticipant = (id: number) => {
        setParticipants(participants.filter(p => p.id !== id));
    };

    const handleParticipantChange = (id: number, field: keyof Omit<Participant, 'id'>, value: string) => {
        setParticipants(participants.map(p => p.id === id ? { ...p, [field]: value } : p));
    };
    
    const pricePerPerson = useMemo(() => {
        const priceString = bootcamp.offer?.price || '0';
        const parsedPrice = parseFloat(priceString.toString().replace(/[^0-9.,-]+/g,"").replace(",","."));
        return isNaN(parsedPrice) ? 0 : parsedPrice;
    }, [bootcamp.offer?.price]);

    const hasPrice = pricePerPerson > 0;
    const totalParticipants = participants.length;
    
    const baseTotal = totalParticipants * pricePerPerson;

    const { finalPrice, discount, discountText } = useMemo(() => {
        let totalDiscount = 0;
        let discountReason = '';

        // Geschwisterrabatt
        if (bootcamp.financials?.siblingDiscountPercentage && totalParticipants > 1) {
            const discountableParticipants = totalParticipants - 1;
            const siblingDiscount = discountableParticipants * pricePerPerson * (bootcamp.financials.siblingDiscountPercentage / 100);
            totalDiscount += siblingDiscount;
            discountReason = `Geschwisterrabatt (${bootcamp.financials.siblingDiscountPercentage}%)`;
        }

        // Coupon-Rabatt
        if (appliedCoupon && hasPrice) {
            if (appliedCoupon.discountType === 'percentage') {
                const couponDiscount = baseTotal * (appliedCoupon.discountValue / 100);
                totalDiscount += couponDiscount;
            } else {
                totalDiscount += Math.min(baseTotal, appliedCoupon.discountValue);
            }
            discountReason = `Gutschein (${appliedCoupon.code})`;
        }
        
        return {
            finalPrice: baseTotal - totalDiscount,
            discount: totalDiscount,
            discountText: discountReason
        };

    }, [participants, appliedCoupon, baseTotal, pricePerPerson, totalParticipants, hasPrice, bootcamp.financials]);
    
    const handleApplyCoupon = async () => {
        if (!couponCode.trim() || !bootcamp.financials?.couponConfig?.code) return;

        setIsCheckingCoupon(true);
        if (couponCode.toUpperCase() === bootcamp.financials.couponConfig.code.toUpperCase()) {
            const usage = bootcamp.registrations?.filter(r => (r as any).couponUsed === couponCode).length || 0;
            if (bootcamp.financials.couponConfig.maxUsage && usage >= bootcamp.financials.couponConfig.maxUsage) {
                toast({ title: 'Gutschein-Limit erreicht', variant: 'destructive' });
                setAppliedCoupon(null);
            } else {
                setAppliedCoupon({
                    code: bootcamp.financials.couponConfig.code,
                    discountType: bootcamp.financials.couponConfig.discountType,
                    discountValue: bootcamp.financials.couponConfig.discountValue,
                });
                toast({ title: 'Gutschein angewendet!' });
            }
        } else {
            setAppliedCoupon(null);
            toast({ title: 'Ungültiger Gutschein', variant: 'destructive' });
        }
        setIsCheckingCoupon(false);
    };


    const handleSubmit = () => {
        const fullRegistrationData = {
            userId: currentUser?.userEmail || contact.email, // ID des anmeldenden Users
            role: currentUser?.currentUserRole || 'Extern',
            contactName: contact.name,
            contactEmail: contact.email,
            contactPhone: contact.phone,
            contactAddress: `${contact.address}, ${contact.zip} ${contact.city}`,
            participants: participants.map(p => ({name: `${p.firstName} ${p.lastName}`, birthDate: p.birthDate, gender: p.gender})),
            totalPrice: finalPrice,
            clubId: currentUser?.clubId,
            couponId: appliedCoupon?.id, // Pass couponId if applied
        };

        onRegister(fullRegistrationData);
    };

    return (
        <div className="space-y-6 flex flex-col h-full">
            <ScrollArea className="flex-1 pr-6 -mr-6">
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Teilnehmer</h3>
                        {participants.map((p, index) => (
                            <div key={p.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center mb-2 p-2 border rounded-md">
                                <Input placeholder="Vorname" value={p.firstName} onChange={e => handleParticipantChange(p.id, 'firstName', e.target.value)} />
                                <Input placeholder="Nachname" value={p.lastName} onChange={e => handleParticipantChange(p.id, 'lastName', e.target.value)} />
                                <Input type="date" value={p.birthDate} onChange={e => handleParticipantChange(p.id, 'birthDate', e.target.value)} />
                                <div className="flex items-center gap-2">
                                     <Select value={p.gender} onValueChange={(val) => handleParticipantChange(p.id, 'gender', val)}>
                                        <SelectTrigger><SelectValue placeholder="Geschlecht"/></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Junge">Junge</SelectItem>
                                            <SelectItem value="Mädchen">Mädchen</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {participants.length > 1 && <Button variant="ghost" size="icon" onClick={() => removeParticipant(p.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>}
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={addParticipant} className="mt-2">
                            <UserPlus className="mr-2 h-4 w-4"/> Weiteres Kind hinzufügen
                        </Button>
                    </div>
                    <Separator />
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Kontakt- & Rechnungs-Informationen</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input value={contact.name} onChange={(e) => setContact(p => ({...p, name: e.target.value}))}/>
                            </div>
                            <div className="space-y-2">
                                <Label>E-Mail</Label>
                                <Input type="email" value={contact.email} onChange={(e) => setContact(p => ({...p, email: e.target.value}))}/>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Adresse</Label>
                                <Input value={contact.address} onChange={(e) => setContact(p => ({...p, address: e.target.value}))} placeholder="Strasse & Nr."/>
                            </div>
                            <div className="space-y-2">
                                <Label>PLZ</Label>
                                <Input value={contact.zip} onChange={(e) => setContact(p => ({...p, zip: e.target.value}))} placeholder="PLZ"/>
                            </div>
                            <div className="space-y-2">
                                <Label>Ort</Label>
                                <Input value={contact.city} onChange={(e) => setContact(p => ({...p, city: e.target.value}))} placeholder="Ort"/>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Telefon</Label>
                                <Input type="tel" value={contact.phone} onChange={(e) => setContact(p => ({...p, phone: e.target.value}))} placeholder="Telefonnummer"/>
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Zusammenfassung</h3>
                        <div className="space-y-2">
                            <Label htmlFor="coupon-code">Gutscheincode</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="coupon-code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder={hasPrice ? bootcamp.financials?.couponConfig?.code || "z.B. SOMMER24" : "Nicht verfügbar"}
                                    disabled={isCheckingCoupon || !!appliedCoupon || !hasPrice}
                                />
                                <Button onClick={handleApplyCoupon} disabled={isCheckingCoupon || !!appliedCoupon || !hasPrice}>
                                    {isCheckingCoupon ? <Loader2 className="animate-spin" /> : 'Anwenden'}
                                </Button>
                            </div>
                            {appliedCoupon && (
                                <p className="text-sm font-medium text-green-600 flex items-center gap-1.5"><BadgeCheck className="h-4 w-4"/> Gutschein "{appliedCoupon.code}" angewendet!</p>
                            )}
                        </div>
                        {hasPrice ? (
                            <div className="space-y-2 text-sm mt-4">
                                <div className="flex justify-between"><span>Teilnehmer:</span><span>{totalParticipants}</span></div>
                                <div className="flex justify-between"><span>Preis pro Person:</span><span>CHF {pricePerPerson.toFixed(2)}</span></div>
                                {discount > 0 && <div className="flex justify-between text-green-600"><span>{discountText}:</span><span>- CHF {discount.toFixed(2)}</span></div>}
                                <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Total:</span><span>CHF {finalPrice.toFixed(2)}</span></div>
                            </div>
                        ) : (
                            <p className="text-sm mt-4 text-muted-foreground">Der Preis für dieses Bootcamp ist auf Anfrage.</p>
                        )}
                    </div>
                </div>
            </ScrollArea>
             <DialogFooter className="mt-6 pt-6 border-t">
                <Button variant="outline" onClick={onBack}>Zurück</Button>
                <Button onClick={handleSubmit}>Anmelden {hasPrice && `& Bezahlen`}</Button>
            </DialogFooter>
        </div>
    );
};


export const BootcampDetailModal = ({ bootcamp, isOpen, onOpenChange, currentUser }) => {
    const { refetchBootcamps } = useBootcamps('all');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const [view, setView] = useState<'details' | 'register'>('details');

    useEffect(() => {
        if (!isOpen) {
            // Reset view when modal closes
            setTimeout(() => setView('details'), 300);
        }
    }, [isOpen]);

    if (!bootcamp) return null;

    const handleRegistrationSubmit = async (registrationData) => {
        setIsSubmitting(true);
        try {
            await registerForBootcamp({
                campId: bootcamp.id,
                registration: registrationData,
            });
            
            toast({
                title: "Anmeldung erfolgreich!",
                description: `Ihre Anmeldung für "${bootcamp.name}" wurde bestätigt.`,
            });
            await refetchBootcamps();
            onOpenChange(false);
        } catch (error) {
            console.error("Registration failed:", error);
            toast({
                title: "Fehler",
                description: "Ihre Anmeldung konnte nicht verarbeitet werden.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const includedServices = [
        { icon: <Home className="w-5 h-5 text-primary" />, text: 'Unterkunft in 4-Sterne-Sporthotel' },
        { icon: <Utensils className="w-5 h-5 text-primary" />, text: 'Vollpension mit sportlergerechter Ernährung' },
        { icon: <Target className="w-5 h-5 text-primary" />, text: '2x tägliches Training mit lizenzierten Trainern' },
        { icon: <Sparkles className="w-5 h-5 text-primary" />, text: 'Individuelle Leistungsanalyse' },
    ];
    
    const galleryImages = bootcamp.galleryImages && bootcamp.galleryImages.length > 0 ? bootcamp.galleryImages : [
        "https://placehold.co/800x600/3B82F6/FFFFFF?text=Training",
        "https://placehold.co/800x600/10B981/FFFFFF?text=Team",
        "https://placehold.co/800x600/F59E0B/FFFFFF?text=Anlage",
        "https://placehold.co/800x600/EF4444/FFFFFF?text=Spielszene",
    ]

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 h-[90vh] flex flex-col">
                <div className="grid grid-cols-1 md:grid-cols-2 flex-1 min-h-0">
                    {/* Left: Image Carousel */}
                     <div className="hidden md:block md:rounded-l-lg overflow-hidden relative">
                        <Carousel className="w-full h-full">
                            <CarouselContent>
                                {galleryImages.map((src, index) => (
                                    <CarouselItem key={index}>
                                        <div className="w-full h-full">
                                            <Image 
                                                src={src} 
                                                alt={`Bootcamp-Bild ${index + 1}`} 
                                                layout="fill"
                                                className="w-full h-full object-cover" 
                                                data-ai-hint="soccer training kids"
                                            />
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="absolute left-4" />
                            <CarouselNext className="absolute right-4" />
                        </Carousel>
                        {view === 'register' && (
                             <Button variant="ghost" size="sm" onClick={() => setView('details')} className="absolute top-4 left-4 bg-background/50 hover:bg-background">
                                <ArrowLeft className="mr-2 h-4 w-4"/> Zurück
                            </Button>
                        )}
                    </div>

                    {/* Right: Details */}
                    <div className="p-6 flex flex-col overflow-hidden">
                        <DialogHeader className="mb-4 flex-shrink-0">
                            <DialogTitle className="text-3xl font-bold font-headline">{bootcamp.name}</DialogTitle>
                            <DialogDescription>{Array.isArray(bootcamp.focus) ? bootcamp.focus.join(', ') : bootcamp.focus}</DialogDescription>
                        </DialogHeader>

                       {view === 'details' ? (
                            <div className="flex flex-col flex-1 min-h-0">
                                <ScrollArea className="flex-1 pr-6 -mr-6">
                                    <div className="space-y-4 text-sm">
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-5 h-5 text-muted-foreground" />
                                            <span>{bootcamp.dateRange?.from ? new Date(bootcamp.dateRange.from).toLocaleDateString('de-CH') : ''} - {bootcamp.dateRange?.to ? new Date(bootcamp.dateRange.to).toLocaleDateString('de-CH') : ''}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-muted-foreground" />
                                            <span>{bootcamp.location}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <DollarSign className="w-5 h-5 text-muted-foreground" />
                                            <span className="font-semibold">{bootcamp.offer?.price ? `CHF ${Number(bootcamp.offer.price).toFixed(2)}` : 'Auf Anfrage'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Building className="w-5 h-5 text-muted-foreground" />
                                            <span>Veranstalter: {bootcamp.source}</span>
                                        </div>

                                        <p className="py-4 text-muted-foreground">
                                            {bootcamp.description || "Keine weitere Beschreibung verfügbar."}
                                        </p>

                                        <div>
                                            <h4 className="font-semibold mb-2">Inkludierte Leistungen:</h4>
                                            <ul className="space-y-2">
                                                {includedServices.map((service, index) => (
                                                    <li key={index} className="flex items-center gap-3">
                                                        {service.icon}
                                                        <span>{service.text}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </ScrollArea>

                                <DialogFooter className="mt-6 pt-6 border-t flex-shrink-0">
                                    <Button size="lg" className="w-full" onClick={() => setView('register')}>
                                        Platz sichern & Anmelden
                                    </Button>
                                </DialogFooter>
                            </div>
                       ) : (
                           <RegistrationForm 
                                bootcamp={bootcamp} 
                                onRegister={handleRegistrationSubmit} 
                                onBack={() => setView('details')}
                                currentUser={currentUser}
                           />
                       )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
