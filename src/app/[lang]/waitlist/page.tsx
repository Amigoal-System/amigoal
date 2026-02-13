
'use client';

import React, { useState, useCallback } from 'react';
import { NavHeader } from '@/components/ui/nav-header';
import { SiteFooter } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, CheckCircle, PersonStanding, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { addPlayerToWaitlist } from '@/ai/flows/waitlist';
import type { WaitlistPlayer } from '@/ai/flows/waitlist.types';
import { addAdultToWaitlist } from '@/ai/flows/adultWaitlist';
import type { AdultWaitlistPlayer } from '@/ai/flows/adultWaitlist.types';
import { Separator } from '@/components/ui/separator';
import { countries } from '@/lib/countries';
import { cantons } from '@/lib/cantons';

const benefits = {
    players: [
        "Passenden Verein finden, der zu dir passt.",
        "Einfacher und zentraler Anmeldeprozess.",
        "Einladung zu Probetrainings erhalten.",
        "Keine Verpflichtung, 100% kostenlos.",
    ],
    clubs: [
        "Gezielt nach neuen Talenten suchen.",
        "Wartelisten effizient verwalten.",
        "Direkter Kontakt zu interessierten Spielern.",
        "Einfache Integration in den Vereinsprozess.",
    ],
}

const steps = [
    { number: '01', title: 'Kind eintragen', description: 'Füllen Sie das untenstehende Formular mit den Daten Ihres Kindes aus.' },
    { number: '02', title: 'Wir suchen', description: 'Unser Netzwerk-Manager prüft passende Vereine in Ihrer Nähe.' },
    { number: '03', title: 'Verein meldet sich', description: 'Ein passender Verein kontaktiert Sie für ein unverbindliches Probetraining.' },
]

const AdultWaitlistForm = () => {
    const [formData, setFormData] = useState({
        salutation: 'Unbekannt',
        firstName: '',
        lastName: '',
        birthYear: '',
        email: '',
        phone: '',
        country: 'Schweiz',
        canton: '',
        region: '',
        position: '',
        hasPreviousClub: 'no',
        previousClubName: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.firstName || !formData.lastName || !formData.birthYear || !formData.email) {
            toast({
                title: "Fehlende Informationen",
                description: "Bitte füllen Sie alle erforderlichen Felder aus.",
                variant: "destructive"
            });
            return;
        }

        const currentYear = new Date().getFullYear();
        const age = currentYear - parseInt(formData.birthYear, 10);
        if (age < 18) {
            toast({
                title: "Anmeldung nicht möglich",
                description: "Diese Warteliste ist für Erwachsene ab 18 Jahren. Bitte benutzen Sie das Formular für Junioren.",
                variant: "destructive",
                duration: 7000,
            });
            return;
        }

        setIsSubmitting(true);
        const regionString = formData.country === 'Schweiz' && formData.canton ? formData.canton : formData.region;
        const playerData: Omit<AdultWaitlistPlayer, 'id' | 'status' | 'addedAt'> = {
            salutation: formData.salutation,
            firstName: formData.firstName,
            lastName: formData.lastName,
            birthYear: formData.birthYear,
            position: formData.position || 'Unbekannt',
            previousClub: formData.hasPreviousClub === 'yes' ? formData.previousClubName : undefined,
            region: regionString,
            email: formData.email,
            phone: formData.phone
        };
        
        try {
            await addAdultToWaitlist(playerData);
            setFormData({ salutation: 'Unbekannt', firstName: '', lastName: '', birthYear: '', email: '', phone: '', country: 'Schweiz', canton: '', region: '', position: '', hasPreviousClub: 'no', previousClubName: '' });
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
            toast({
                title: "Erfolgreich eingetragen!",
                description: `Sie wurden auf die Warteliste für Erwachsene gesetzt. Wir melden uns.`,
                duration: 7000,
            });
        } catch (error) {
            console.error("Failed to add to adult waitlist:", error);
            toast({ title: "Fehler", description: "Eintrag auf Warteliste fehlgeschlagen.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.id]: e.target.value}));
    };
    
    const handleSelectChange = (field: string, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    }
    
    const handleRadioChange = (value: string) => {
        setFormData(prev => ({...prev, hasPreviousClub: value, previousClubName: value === 'no' ? '' : prev.previousClubName}));
    }

    return (
         <Card className="max-w-3xl mx-auto shadow-2xl" id="form-adult">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl md:text-4xl font-bold font-headline flex items-center justify-center gap-2">
                    <PersonStanding /> Warteliste für Erwachsene
                </CardTitle>
                <CardDescription>Sie suchen als Erwachsener einen neuen Verein? Tragen Sie sich hier ein!</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2 md:col-span-1">
                            <Label htmlFor="salutation-adult">Anrede</Label>
                            <Select value={formData.salutation} onValueChange={(v) => handleSelectChange('salutation', v)} disabled={isSubmitting}>
                                <SelectTrigger id="salutation-adult"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Herr">Herr</SelectItem>
                                    <SelectItem value="Frau">Frau</SelectItem>
                                    <SelectItem value="Unbekannt">Keine Angabe</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="firstName-adult">Vorname</Label>
                            <Input id="firstName" placeholder="Max" required value={formData.firstName} onChange={handleInputChange} disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName-adult">Nachname</Label>
                            <Input id="lastName" placeholder="Mustermann" required value={formData.lastName} onChange={handleInputChange} disabled={isSubmitting} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="birthYear-adult">Geburtsjahr</Label>
                            <Input id="birthYear" type="number" placeholder="z.B. 1995" required value={formData.birthYear} onChange={handleInputChange} disabled={isSubmitting} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="position-adult">Wunschposition</Label>
                                <Select value={formData.position} onValueChange={(v) => handleSelectChange('position', v)} disabled={isSubmitting}>
                                <SelectTrigger id="position-adult">
                                    <SelectValue placeholder="Position wählen..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Torwart">Torwart</SelectItem>
                                    <SelectItem value="Verteidigung">Verteidigung</SelectItem>
                                    <SelectItem value="Mittelfeld">Mittelfeld</SelectItem>
                                    <SelectItem value="Sturm">Sturm</SelectItem>
                                    <SelectItem value="Egal">Egal / Weiss nicht</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label>Schon in einem Verein gespielt?</Label>
                            <RadioGroup value={formData.hasPreviousClub} onValueChange={handleRadioChange} className="flex gap-4 pt-1" disabled={isSubmitting}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="yes" id="adult-prev-yes" />
                                <Label htmlFor="adult-prev-yes">Ja</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="adult-prev-no" />
                                <Label htmlFor="adult-prev-no">Nein</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {formData.hasPreviousClub === 'yes' && (
                            <div className="space-y-2">
                            <Label htmlFor="previousClubName-adult">Name des letzten Vereins</Label>
                            <Input id="previousClubName" placeholder="z.B. FC Musterstadt" value={formData.previousClubName} onChange={handleInputChange} disabled={isSubmitting} />
                        </div>
                    )}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Land</Label>
                             <Select value={formData.country} onValueChange={(v) => handleSelectChange('country', v)} disabled={isSubmitting}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Schweiz">Schweiz</SelectItem>
                                    <SelectItem value="Deutschland">Deutschland</SelectItem>
                                    <SelectItem value="Österreich">Österreich</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                             <Label>Kanton / Region</Label>
                             {formData.country === 'Schweiz' ? (
                                <Select value={formData.canton} onValueChange={(v) => handleSelectChange('canton', v)} disabled={isSubmitting}>
                                    <SelectTrigger><SelectValue placeholder="Kanton wählen..."/></SelectTrigger>
                                    <SelectContent>
                                        {cantons.map(c => <SelectItem key={c.value} value={c.label}>{c.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                             ) : (
                                <Input id="region" placeholder="z.B. Baden-Württemberg" value={formData.region} onChange={handleInputChange} disabled={isSubmitting}/>
                             )}
                        </div>
                    </div>
                    <Separator />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email-adult">Ihre E-Mail</Label>
                            <Input id="email" type="email" placeholder="max@muster.com" required value={formData.email} onChange={handleInputChange} disabled={isSubmitting} />
                        </div>
                            <div className="space-y-2">
                            <Label htmlFor="phone-adult">Ihre Telefonnummer</Label>
                            <Input id="phone" type="tel" placeholder="079 123 45 67" value={formData.phone} onChange={handleInputChange} disabled={isSubmitting} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                        {isSubmitting ? 'Wird verarbeitet...' : 'Auf die Warteliste setzen'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}

export default function WaitlistPage() {
    const [showLogin, setShowLogin] = useState(false);
    const [formData, setFormData] = useState({
        salutation: 'Unbekannt',
        firstName: '',
        lastName: '',
        birthYear: '',
        parentName: '',
        parentEmail: '',
        phone: '',
        country: 'Schweiz',
        canton: '',
        region: '',
        position: '',
        hasPreviousClub: 'no',
        previousClubName: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.firstName || !formData.lastName || !formData.birthYear || !formData.parentName || !formData.parentEmail) {
            toast({
                title: "Fehlende Informationen",
                description: "Bitte füllen Sie alle erforderlichen Felder aus.",
                variant: "destructive"
            });
            return;
        }

        const currentYear = new Date().getFullYear();
        const age = currentYear - parseInt(formData.birthYear, 10);
        if (age >= 18) {
            toast({
                title: "Anmeldung nicht möglich",
                description: "Diese Warteliste ist für Kinder und Jugendliche unter 18 Jahren. Bitte benutzen Sie das Formular für Erwachsene.",
                variant: "destructive",
                duration: 7000,
            });
            return;
        }

        setIsSubmitting(true);
        const regionString = formData.country === 'Schweiz' && formData.canton ? formData.canton : formData.region;
        const playerData: Omit<WaitlistPlayer, 'id' | 'status' | 'addedAt'> = {
            salutation: formData.salutation,
            firstName: formData.firstName,
            lastName: formData.lastName,
            birthYear: formData.birthYear,
            position: formData.position || 'Unbekannt',
            previousClub: formData.hasPreviousClub === 'yes' ? formData.previousClubName : undefined,
            region: regionString,
            contactName: formData.parentName,
            email: formData.parentEmail,
            phone: formData.phone
        };
        
        try {
            await addPlayerToWaitlist(playerData);

            setFormData({ 
                salutation: 'Unbekannt',
                firstName: '', 
                lastName: '',
                birthYear: '', 
                parentName: '', 
                parentEmail: '', 
                phone: '',
                country: 'Schweiz',
                canton: '',
                region: '',
                position: '',
                hasPreviousClub: 'no',
                previousClubName: '',
            });
            
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 }
            });
            
            toast({
                title: "Erfolgreich eingetragen!",
                description: `${formData.firstName} wurde auf die Warteliste gesetzt. Wir melden uns, sobald wir einen passenden Verein gefunden haben.`,
                duration: 7000,
            });
        } catch (error) {
            console.error("Failed to add to waitlist:", error);
            toast({
                title: "Fehler",
                description: "Eintrag auf Warteliste fehlgeschlagen.",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, toast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.id]: e.target.value}));
    };
    
    const handleSelectChange = (field: string, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    }
    
    const handleRadioChange = (value: string) => {
        setFormData(prev => ({...prev, hasPreviousClub: value, previousClubName: value === 'no' ? '' : prev.previousClubName}));
    }

    return (
        <div className="min-h-screen bg-muted/20">
            <NavHeader onLoginClick={() => setShowLogin(true)} />
            
            <header className="relative pt-40 pb-20 bg-gradient-to-b from-primary/10 to-muted/20 text-center">
                <div className="container mx-auto max-w-5xl px-4">
                    <UserPlus className="mx-auto h-16 w-16 text-primary mb-4" />
                    <h1 className="text-5xl md:text-6xl font-bold font-headline mb-4">Finde den perfekten Verein</h1>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        Ist Ihr Kind auf der Suche nach einem Fussballverein? Tragen Sie es unverbindlich auf unsere Warteliste ein und wir helfen, den passenden Club in Ihrer Nähe zu finden.
                    </p>
                </div>
            </header>
            
            <main className="py-24">
                <div className="container mx-auto max-w-6xl px-4 space-y-24">

                    <section>
                         <h2 className="text-3xl font-bold text-center mb-12">So einfach funktioniert's</h2>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {steps.map(step => (
                                <div key={step.number} className="text-center">
                                    <div className="text-5xl font-bold text-primary/20 mb-2">{step.number}</div>
                                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                                    <p className="text-muted-foreground text-sm">{step.description}</p>
                                </div>
                            ))}
                         </div>
                    </section>

                    <Card className="max-w-3xl mx-auto shadow-2xl" id="form">
                        <CardHeader className="text-center">
                            <CardTitle className="text-3xl md:text-4xl font-bold font-headline">Jetzt unverbindlich eintragen (Junioren)</CardTitle>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                     <h4 className="text-sm font-medium text-muted-foreground">Angaben zum Kind</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2 md:col-span-1">
                                            <Label htmlFor="salutation">Anrede</Label>
                                            <Select value={formData.salutation} onValueChange={(v) => handleSelectChange('salutation', v)} disabled={isSubmitting}>
                                                <SelectTrigger id="salutation"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Herr">Junge</SelectItem>
                                                    <SelectItem value="Frau">Mädchen</SelectItem>
                                                    <SelectItem value="Unbekannt">Keine Angabe</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">Vorname</Label>
                                            <Input id="firstName" placeholder="Maxine" required value={formData.firstName} onChange={handleInputChange} disabled={isSubmitting} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Nachname</Label>
                                            <Input id="lastName" placeholder="Muster" required value={formData.lastName} onChange={handleInputChange} disabled={isSubmitting} />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="birthYear">Geburtsjahr</Label>
                                        <Input id="birthYear" type="number" placeholder="z.B. 2015" required value={formData.birthYear} onChange={handleInputChange} disabled={isSubmitting} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="position">Wunschposition</Label>
                                         <Select value={formData.position} onValueChange={(v) => handleSelectChange('position', v)} disabled={isSubmitting}>
                                            <SelectTrigger id="position">
                                                <SelectValue placeholder="Position wählen..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Torwart">Torwart</SelectItem>
                                                <SelectItem value="Verteidigung">Verteidigung</SelectItem>
                                                <SelectItem value="Mittelfeld">Mittelfeld</SelectItem>
                                                <SelectItem value="Sturm">Sturm</SelectItem>
                                                <SelectItem value="Egal">Egal / Weiss nicht</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                 <div className="space-y-2">
                                    <Label>War Ihr Kind schon in einem Verein?</Label>
                                     <RadioGroup value={formData.hasPreviousClub} onValueChange={handleRadioChange} className="flex gap-4 pt-1" disabled={isSubmitting}>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="yes" id="prev-yes" />
                                            <Label htmlFor="prev-yes">Ja</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="no" id="prev-no" />
                                            <Label htmlFor="prev-no">Nein</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {formData.hasPreviousClub === 'yes' && (
                                     <div className="space-y-2">
                                        <Label htmlFor="previousClubName">Name des letzten Vereins</Label>
                                        <Input id="previousClubName" placeholder="z.B. FC Musterstadt" value={formData.previousClubName} onChange={handleInputChange} disabled={isSubmitting}/>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Land</Label>
                                         <Select value={formData.country} onValueChange={(v) => handleSelectChange('country', v)} disabled={isSubmitting}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Schweiz">Schweiz</SelectItem>
                                                <SelectItem value="Deutschland">Deutschland</SelectItem>
                                                <SelectItem value="Österreich">Österreich</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                         <Label>Kanton / Region</Label>
                                         {formData.country === 'Schweiz' ? (
                                            <Select value={formData.canton} onValueChange={(v) => handleSelectChange('canton', v)} disabled={isSubmitting}>
                                                <SelectTrigger><SelectValue placeholder="Kanton wählen..."/></SelectTrigger>
                                                <SelectContent>
                                                    {cantons.map(c => <SelectItem key={c.value} value={c.label}>{c.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                         ) : (
                                            <Input id="region" placeholder="z.B. Baden-Württemberg" value={formData.region} onChange={handleInputChange} disabled={isSubmitting}/>
                                         )}
                                    </div>
                                </div>
                                <div className="border-t pt-6 space-y-4">
                                     <h4 className="text-sm font-medium text-muted-foreground">Angaben eines Elternteils</h4>
                                     <div className="space-y-2">
                                        <Label htmlFor="parentName">Ihr Name</Label>
                                        <Input id="parentName" placeholder="Erika Musterfrau" required value={formData.parentName} onChange={handleInputChange} disabled={isSubmitting} />
                                    </div>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="parentEmail">Ihre E-Mail Adresse</Label>
                                            <Input id="parentEmail" type="email" placeholder="erika@musterfrau.ch" required value={formData.parentEmail} onChange={handleInputChange} disabled={isSubmitting} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="phone">Ihre Telefonnummer</Label>
                                            <Input id="phone" type="tel" placeholder="079 123 45 67" value={formData.phone} onChange={handleInputChange} disabled={isSubmitting} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                    {isSubmitting ? 'Wird verarbeitet...' : 'Auf die Warteliste setzen'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    <AdultWaitlistForm />

                    <section>
                         <h2 className="text-3xl font-bold text-center mb-12">Win-Win für Alle</h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Vorteile für Spieler & Eltern</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {benefits.players.map((item, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                            <span className="text-sm">{item}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle>Vorteile für Vereine</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                     {benefits.clubs.map((item, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-blue-500" />
                                            <span className="text-sm">{item}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                         </div>
                    </section>
                </div>
            </main>

            <SiteFooter onLoginClick={() => setShowLogin(true)} />
        </div>
    );
}
