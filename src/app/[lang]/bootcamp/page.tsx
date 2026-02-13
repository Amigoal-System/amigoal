

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { NavHeader } from '@/components/ui/nav-header';
import { SiteFooter } from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Star, MapPin, Calendar, DollarSign, Users, Check, ArrowRight, Lightbulb, X, Loader2 } from 'lucide-react';
import { useCamps } from '@/hooks/useCamps';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type Locale } from '@/../i18n.config';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Countdown } from '@/components/ui/countdown';
import { BootcampDetailModal } from '@/components/ui/bootcamp-detail-modal';
import { InteractiveSwitzerlandMap } from '@/components/ui/interactive-switzerland-map';
import placeholderImages from '@/app/lib/placeholder-images.json';


export default function BootcampMarketplacePage() {
    const params = useParams();
    const lang = params.lang as Locale;
    const [showLogin, setShowLogin] = useState(false);
    const { camps: bootcamps, isLoading } = useCamps('bootcamp', 'all');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterFocus, setFilterFocus] = useState('Alle');
    const [filterSpots, setFilterSpots] = useState(false);
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
    const [selectedBootcamp, setSelectedBootcamp] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = (bootcamp) => {
        setSelectedBootcamp(bootcamp);
        setIsModalOpen(true);
    };

    const handleRegionChange = useCallback((newRegions: string[]) => {
        setSelectedRegions(newRegions);
    }, []);

    const allFocusAreas = useMemo(() => {
        if (!bootcamps || bootcamps.length === 0) return ['Alle'];
        const focuses = new Set(bootcamps.flatMap(camp => Array.isArray(camp.focus) ? camp.focus : [camp.focus]).filter(Boolean));
        return ['Alle', ...Array.from(focuses)];
    }, [bootcamps]);
    
    const nextBootcamp = useMemo(() => {
        if (!bootcamps || bootcamps.length === 0) return null;
        const upcoming = bootcamps
            .filter(camp => camp.dateRange?.from && new Date(camp.dateRange.from) > new Date())
            .sort((a,b) => new Date(a.dateRange!.from).getTime() - new Date(b.dateRange!.from).getTime());
        return upcoming[0];
    }, [bootcamps]);

    const filteredBootcamps = useMemo(() => {
        if (!bootcamps) return [];
        return bootcamps.filter(camp => {
            const searchMatch = searchTerm === '' ||
                camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                camp.location.toLowerCase().includes(searchTerm.toLowerCase());
            
            const focusMatch = filterFocus === 'Alle' || (Array.isArray(camp.focus) ? camp.focus.includes(filterFocus) : camp.focus === filterFocus);
            
            const spotsLeft = (camp.maxParticipants || 0) - (camp.registrations?.length || 0);
            const spotsMatch = !filterSpots || spotsLeft > 0;
            
            const regionMatch = selectedRegions.length === 0 || selectedRegions.some(region => camp.location.toLowerCase().includes(region.toLowerCase()));

            return searchMatch && focusMatch && spotsMatch && regionMatch;
        }).sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); // Sort featured to top
    }, [bootcamps, searchTerm, filterFocus, filterSpots, selectedRegions]);

    return (
        <>
            <div className="min-h-screen bg-muted/20">
                <NavHeader onLoginClick={() => setShowLogin(true)} />
                
                <header className="relative pt-40 pb-20 bg-gradient-to-b from-primary/10 to-muted/20 text-center">
                    <div className="container mx-auto max-w-5xl px-4">
                        <Star className="mx-auto h-16 w-16 text-primary mb-4" />
                        <h1 className="text-5xl md:text-6xl font-bold font-headline mb-4">Finde dein perfektes Fussball-Bootcamp</h1>
                        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                            Durchsuche die besten Bootcamps, die von Top-Trainern und Fussballschulen angeboten werden, und bringe dein Spiel auf das nächste Level.
                        </p>
                    </div>
                </header>

                <main className="py-24">
                    <div className="container mx-auto max-w-7xl px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                             {/* Left Column: Filters & Map */}
                             <div className="lg:col-span-1 space-y-8">
                                {nextBootcamp && (
                                    <Card className="shadow-lg bg-gradient-to-r from-primary/80 to-accent/80 text-primary-foreground">
                                        <CardHeader>
                                            <CardTitle>Nächstes Highlight: {nextBootcamp.name}</CardTitle>
                                            <CardDescription className="text-primary-foreground/80">Verpasse nicht das nächste grosse Camp! Der Countdown läuft.</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                        <Countdown targetDate={new Date(nextBootcamp.dateRange.from)} />
                                        </CardContent>
                                    </Card>
                                )}
                                <Card>
                                    <CardHeader><CardTitle>Filter</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="relative w-full">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <Input 
                                                placeholder="Suche nach Name, Ort..." 
                                                className="pl-10 h-12 text-base"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <Select value={filterFocus} onValueChange={setFilterFocus}>
                                            <SelectTrigger className="w-full h-12">
                                                <SelectValue placeholder="Fokus..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {allFocusAreas.map(focus => (
                                                    <SelectItem key={focus} value={focus}>{focus}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant={filterSpots ? 'default' : 'outline'}
                                                onClick={() => setFilterSpots(!filterSpots)}
                                                className="h-12 w-full"
                                            >
                                                <Check className="mr-2 h-4 w-4" /> Nur mit freien Plätzen
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader><CardTitle>Nach Region filtern</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="w-full h-96">
                                            <InteractiveSwitzerlandMap onSelectionChange={handleRegionChange} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column: Bootcamp Grid */}
                            <div className="lg:col-span-2">
                                {selectedRegions.length > 0 && (
                                    <div className="mb-4 flex flex-wrap gap-2 items-center">
                                        <h4 className="text-sm font-semibold">Aktive Filter:</h4>
                                        {selectedRegions.map(region => (
                                            <Badge key={region} variant="secondary" className="text-base">
                                                {region}
                                                 <button onClick={() => handleRegionChange(selectedRegions.filter(r => r !== region))} className="ml-1.5 -mr-1 rounded-full p-0.5 hover:bg-muted-foreground/20">
                                                    <X className="h-3 w-3"/>
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                                {isLoading ? (
                                    <div className="text-center flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin"/></div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {filteredBootcamps.map((camp) => {
                                            const spotsTaken = camp.registrations?.length || 0;
                                            const spotsTotal = camp.maxParticipants || 0;
                                            const progress = spotsTotal > 0 ? (spotsTaken / spotsTotal) * 100 : 0;
                                            const spotsLeft = spotsTotal - spotsTaken;
                                            const imageSrc = camp.featuredImage || camp.galleryImages?.[0] || placeholderImages.default_600x400;
                                            
                                            return (
                                            <Card key={camp.id} className="flex flex-col overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                                                <div className="relative">
                                                    <Image 
                                                        src={imageSrc}
                                                        alt={camp.name}
                                                        width={600}
                                                        height={400}
                                                        className="object-cover"
                                                        data-ai-hint="soccer training kids"
                                                    />
                                                    {camp.featured && (
                                                        <Badge className="absolute top-3 right-3 text-sm bg-yellow-400 text-black hover:bg-yellow-500">
                                                            <Star className="mr-1.5 h-4 w-4 fill-current"/> Featured
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardHeader>
                                                    <CardTitle>{camp.name}</CardTitle>
                                                    <CardDescription>{Array.isArray(camp.focus) ? camp.focus.join(', ') : camp.focus}</CardDescription>
                                                </CardHeader>
                                                <CardContent className="flex-1 space-y-3 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <span>{camp.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            {camp.dateRange?.from ? format(new Date(camp.dateRange.from), "dd.MM.yy") : ''} - {camp.dateRange?.to ? format(new Date(camp.dateRange.to), "dd.MM.yy") : ''}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-semibold">{camp.offer?.price ? `CHF ${Number(camp.offer.price).toFixed(2)}` : 'Auf Anfrage'}</span>
                                                    </div>
                                                </CardContent>
                                                <CardFooter className="flex-col items-start gap-3 border-t pt-4">
                                                    <div className="w-full">
                                                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                            <span className="flex items-center gap-1"><Users className="h-3 w-3"/>Plätze</span>
                                                            <span>{spotsTaken} / {spotsTotal}</span>
                                                        </div>
                                                        <Progress value={progress} />
                                                    </div>
                                                    <Button className="w-full" onClick={() => handleOpenModal(camp)}>
                                                        {spotsLeft > 0 ? `Details & Anmeldung (${spotsLeft} Plätze frei)` : "Auf die Warteliste"}
                                                        <ArrowRight className="ml-2 h-4 w-4"/>
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        )})}
                                    </div>
                                )}
                                {filteredBootcamps.length === 0 && !isLoading && (
                                    <div className="text-center py-16 text-muted-foreground">
                                        <p>Keine Bootcamps gefunden, die Ihren Kriterien entsprechen.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
                 <section className="bg-background py-20">
                    <div className="container mx-auto max-w-4xl px-4 text-center">
                        <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                            <Lightbulb className="h-8 w-8 text-primary"/>
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Bieten Sie ein eigenes Bootcamp an?</h2>
                        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                            Nutzen Sie die Amigoal-Plattform, um Ihre Bootcamps einem breiten Publikum von fussballbegeisterten Spielern, Eltern und Vereinen zu präsentieren.
                        </p>
                        <Button asChild size="lg">
                            <Link href={`/${lang}/register/bootcamp-provider?type=bootcamp`}>Jetzt als Anbieter registrieren <ArrowRight className="ml-2 h-4 w-4"/></Link>
                        </Button>
                    </div>
                </section>

                <SiteFooter onLoginClick={() => setShowLogin(true)} />
            </div>

            <BootcampDetailModal
                bootcamp={selectedBootcamp}
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                currentUser={null} 
            />
        </>
    );
}
