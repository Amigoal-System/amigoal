
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NavHeader } from '@/components/ui/nav-header';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, Mountain, Send, ShieldCheck, Sun, ArrowRight, Plane, Home, Utensils, Lightbulb, Loader2, MapPin, Calendar, DollarSign } from 'lucide-react';
import Image from 'next/image';
import { SiteFooter } from '@/components/ui/footer';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type Locale } from '@/i18n.config';
import { requestTrainingCamp } from '@/ai/flows/camps';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import type { DateRange } from 'react-day-picker';
import { useCamps } from '@/hooks/useCamps';
import { format } from 'date-fns';


const features = [
    { icon: Sun, title: 'Top-Destinationen', description: 'Wählen Sie aus einer Vielzahl von geprüften Standorten in ganz Europa, von Spanien bis zur Türkei.' },
    { icon: Plane, title: 'Reise & Unterkunft', description: 'Wir organisieren Flüge, Hotels und Transfers, damit Sie sich auf das Training konzentrieren können.' },
    { icon: Home, title: 'Perfekte Infrastruktur', description: 'Gepflegte Rasenplätze, moderne Krafträume und professionelle Ausrüstung warten auf Sie.' },
    { icon: Utensils, title: 'Sportlergerechte Verpflegung', description: 'All-Inclusive-Pakete mit Mahlzeiten, die speziell auf die Bedürfnisse von Athleten abgestimmt sind.' }
];

export default function TrainingCampInfoPage() {
    const { toast } = useToast();
    const params = useParams();
    const lang = params.lang as Locale;
    const [showLogin, setShowLogin] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { camps, isLoading } = useCamps('camp', 'all');
    
    const initialRequestData = {
        clubName: '',
        contactPerson: '',
        email: '',
        phone: '',
        wishes: '',
        destination: '',
        dates: undefined as DateRange | undefined,
        participants: '',
        budget: '',
    };
    const [requestData, setRequestData] = useState(initialRequestData);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!requestData.clubName || !requestData.contactPerson || !requestData.email) {
            toast({
                title: "Fehlende Informationen",
                description: "Bitte füllen Sie mindestens die Felder für Verein, Ansprechperson und E-Mail aus.",
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...requestData,
                dates: requestData.dates?.from ? {
                    from: requestData.dates.from.toISOString(),
                    to: requestData.dates.to ? requestData.dates.to.toISOString() : requestData.dates.from.toISOString()
                } : undefined,
            };
            await requestTrainingCamp(payload);
            toast({
                title: 'Anfrage gesendet!',
                description: 'Vielen Dank für Ihr Interesse. Unser Team wird sich in Kürze mit Ihnen in Verbindung setzen.'
            });
            setRequestData(initialRequestData);
        } catch (error) {
             console.error("Failed to send training camp request:", error);
             toast({
                title: 'Fehler',
                description: 'Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-muted/20">
            <NavHeader onLoginClick={() => setShowLogin(true)} />
            <header className="relative pt-40 pb-20 bg-gradient-to-b from-primary/10 to-muted/20">
                <div className="container mx-auto max-w-5xl px-4 text-center">
                    <Mountain className="mx-auto h-16 w-16 text-primary mb-4" />
                    <h1 className="text-5xl md:text-6xl font-bold font-headline">Trainingslager</h1>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        Professionell organisierte Trainingslager, damit Sie sich voll auf den sportlichen Erfolg konzentrieren können.
                    </p>
                </div>
            </header>

            <main className="py-24">
                <div className="container mx-auto max-w-7xl px-4 space-y-24">
                    <section>
                         <h2 className="text-3xl font-bold text-center mb-12">Aktuelle Angebote</h2>
                         {isLoading ? (
                             <p className="text-center">Lade Angebote...</p>
                         ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {camps.map(camp => (
                                    <Card key={camp.id} className="flex flex-col">
                                        <CardHeader>
                                            <CardTitle>{camp.name}</CardTitle>
                                            <CardDescription>{camp.focus}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-1 space-y-3 text-sm">
                                            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> <span>{camp.location}</span></div>
                                            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> <span>{camp.date?.from ? `${format(new Date(camp.date.from), "dd.MM.yy")} - ${format(new Date(camp.date.to), "dd.MM.yy")}` : 'Auf Anfrage'}</span></div>
                                            <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /> <span className="font-semibold">{camp.offer?.price || 'Auf Anfrage'}</span></div>
                                            <p className="pt-2 text-xs text-muted-foreground">{camp.description || camp.offer?.details}</p>
                                        </CardContent>
                                        <CardFooter>
                                            <Button className="w-full" onClick={() => {
                                                document.getElementById('anfrage')?.scrollIntoView({ behavior: 'smooth' });
                                            }}>Jetzt anfragen</Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                         )}
                    </section>


                     <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                                    <feature.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-semibold">{feature.title}</h3>
                                <p className="mt-1 text-muted-foreground text-sm">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    <Card id="anfrage" className="grid md:grid-cols-2 overflow-hidden shadow-xl">
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                            <h2 className="text-3xl font-bold mb-4">Individuelles Trainingslager anfragen</h2>
                            <p className="text-muted-foreground mb-6">Sie haben kein passendes Angebot gefunden? Beschreiben Sie uns Ihre Wünsche und wir kümmern uns um den Rest.</p>
                             <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="clubName">Verein</Label>
                                        <Input id="clubName" placeholder="FC Musterstadt" value={requestData.clubName} onChange={e => setRequestData(p => ({...p, clubName: e.target.value}))}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contactPerson">Ansprechperson</Label>
                                        <Input id="contactPerson" placeholder="Max Mustermann" value={requestData.contactPerson} onChange={e => setRequestData(p => ({...p, contactPerson: e.target.value}))}/>
                                    </div>
                                </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="email">Ihre E-Mail</Label>
                                        <Input id="email" type="email" placeholder="max@example.com" value={requestData.email} onChange={e => setRequestData(p => ({...p, email: e.target.value}))}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Ihre Telefonnummer</Label>
                                        <Input id="phone" type="tel" placeholder="079 123 45 67" value={requestData.phone} onChange={e => setRequestData(p => ({...p, phone: e.target.value}))}/>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="destination">Destination (optional)</Label>
                                        <Input id="destination" placeholder="z.B. Spanien" value={requestData.destination} onChange={e => setRequestData(p => ({...p, destination: e.target.value}))}/>
                                    </div>
                                     <div className="space-y-2">
                                        <Label>Reisezeitraum (optional)</Label>
                                        <DatePickerWithRange date={requestData.dates} onDateChange={(d) => setRequestData(p => ({...p, dates: d}))} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="participants">Teilnehmer (ca.)</Label>
                                        <Input id="participants" placeholder="z.B. 25" value={requestData.participants} onChange={e => setRequestData(p => ({...p, participants: e.target.value}))}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="budget">Budget (ca. in CHF)</Label>
                                        <Input id="budget" placeholder="z.B. 15000" value={requestData.budget} onChange={e => setRequestData(p => ({...p, budget: e.target.value}))}/>
                                    </div>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="wishes">Ihre Wünsche</Label>
                                    <Textarea id="wishes" placeholder="z.B. 2 Testspiele, Fokus auf Taktik..." value={requestData.wishes} onChange={e => setRequestData(p => ({...p, wishes: e.target.value}))}/>
                                </div>
                                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                                    Anfrage senden
                                </Button>
                            </form>
                        </div>
                         <div className="hidden md:block">
                            <Image src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&h=800&fit=crop" alt="Trainingslager" width={600} height={800} className="object-cover h-full w-full" data-ai-hint="soccer training camp"/>
                        </div>
                    </Card>

                    <section className="bg-background py-20 rounded-xl">
                        <div className="container mx-auto max-w-4xl px-4 text-center">
                            <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                                <Lightbulb className="h-8 w-8 text-primary"/>
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Bieten Sie Trainingslager an?</h2>
                            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                                Werden Sie Partner von Amigoal und präsentieren Sie Ihre Angebote unserer wachsenden Community von Fussballvereinen in der ganzen Schweiz.
                            </p>
                            <Button size="lg" asChild>
                                <Link href={`/${lang}/register/bootcamp-provider`}>
                                    Jetzt als Anbieter registrieren <ArrowRight className="ml-2 h-4 w-4"/>
                                </Link>
                            </Button>
                        </div>
                    </section>
                </div>
            </main>
            <SiteFooter onLoginClick={() => setShowLogin(true)} />
        </div>
    );
}
