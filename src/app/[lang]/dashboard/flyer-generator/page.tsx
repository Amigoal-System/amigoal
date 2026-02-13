
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AmigoalLogo } from '@/components/icons';
import { MatchFlyer } from '@/components/ui/match-flyer';
import { Download, Share2, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useMatches } from '@/hooks/useMatches';
import { useSponsors } from '@/hooks/useSponsors';

const GenericAwayLogo = () => <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-gray-500 font-bold text-4xl">?</div>;

export default function FlyerGeneratorPage() {
    const { matches, isLoading: isLoadingMatches } = useMatches();
    const { sponsors, isLoading: isLoadingSponsors } = useSponsors();

    const [selectedMatchData, setSelectedMatchData] = useState(null);
    const [template, setTemplate] = useState('pulse');
    const [primaryColor, setPrimaryColor] = useState('#4285F4');
    const [secondaryColor, setSecondaryColor] = useState('#34A853');
    const [sponsorLogo, setSponsorLogo] = useState<string | null>(null);
    const [customText, setCustomText] = useState('Hopp Amigoal!');
    const flyerRef = useRef(null);

    useEffect(() => {
        if (!isLoadingMatches && matches.length > 0) {
            const upcomingMatches = matches.filter(m => new Date(m.date) >= new Date());
            if (upcomingMatches.length > 0) {
                 handleMatchChange(upcomingMatches[0].id);
            }
        }
        if (!isLoadingSponsors && sponsors.length > 0) {
            setSponsorLogo(sponsors[0].logo);
        }
    }, [matches, sponsors, isLoadingMatches, isLoadingSponsors]);


    const handleMatchChange = (matchId: string) => {
        const match = matches.find(m => m.id === matchId);
        if (match) {
            setSelectedMatchData({
                id: match.id,
                home: 'FC Amigoal', // Assuming home team is always the user's club
                away: match.opponent,
                league: match.type,
                date: match.date,
                time: "15:00", // This should be part of the match data in a real app
                location: match.location === 'Heim' ? 'Home Stadium' : 'Auswärts',
                homeLogo: AmigoalLogo,
                awayLogo: GenericAwayLogo
            });
        }
    };
    
    const handleDownload = () => {
        if (flyerRef.current) {
            html2canvas(flyerRef.current, { scale: 2, useCORS: true }).then((canvas) => {
                const image = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = image;
                link.download = 'match-flyer.png';
                link.click();
            });
        }
    };

    const isLoading = isLoadingMatches || isLoadingSponsors;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-2">Lade Spieldaten und Sponsoren...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Flyer-Einstellungen</CardTitle>
                        <CardDescription>Passen Sie hier Ihren Match-Flyer an.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Spiel auswählen</Label>
                            <Select onValueChange={handleMatchChange} defaultValue={selectedMatchData?.id}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Ein Spiel auswählen..."/>
                                </SelectTrigger>
                                <SelectContent>
                                    {matches.filter(m => new Date(m.date) >= new Date()).map(match => (
                                        <SelectItem key={match.id} value={match.id}>FC Amigoal vs. {match.opponent} ({new Date(match.date).toLocaleDateString('de-CH')})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Vorlage</Label>
                            <Select onValueChange={setTemplate} defaultValue={template}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pulse">Pulse</SelectItem>
                                    <SelectItem value="clash">Clash</SelectItem>
                                    <SelectItem value="classic">Classic</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="primaryColor">Primärfarbe</Label>
                                <Input id="primaryColor" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="p-1 h-10"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="secondaryColor">Akzentfarbe</Label>
                                <Input id="secondaryColor" type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="p-1 h-10"/>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Sponsor</Label>
                             <Select onValueChange={(val) => setSponsorLogo(val === 'null' ? null : val)} defaultValue={sponsorLogo || 'null'}>
                                <SelectTrigger><SelectValue placeholder="Sponsor auswählen..."/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="null">Kein Sponsor</SelectItem>
                                    {sponsors.map(sponsor => (
                                        <SelectItem key={sponsor.id} value={sponsor.logo}>{sponsor.company}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="customText">Zusätzlicher Text</Label>
                            <Input id="customText" value={customText} onChange={(e) => setCustomText(e.target.value)} />
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-2">
                        <Button className="w-full" onClick={handleDownload} disabled={!selectedMatchData}>
                            <Download className="mr-2 h-4 w-4" /> Herunterladen
                        </Button>
                        <Button variant="outline" className="w-full" disabled={!selectedMatchData}>
                            <Share2 className="mr-2 h-4 w-4" /> Teilen
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card className="aspect-[3/4] max-w-lg mx-auto">
                    {selectedMatchData ? (
                        <div ref={flyerRef} className="w-full h-full">
                            <MatchFlyer 
                                match={selectedMatchData}
                                template={template}
                                primaryColor={primaryColor}
                                secondaryColor={secondaryColor}
                                sponsorLogo={sponsorLogo}
                                customText={customText}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <p>Bitte wählen Sie ein Spiel aus, um den Flyer zu generieren.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
