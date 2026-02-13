
'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { suggestPlayerToClub } from '@/ai/flows/playerPlacement';
import { getAllClubs } from '@/ai/flows/clubs';
import type { Club } from '@/ai/flows/clubs.types';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Textarea } from './ui/textarea';
import { Star, Eye, UserPlus, Trash2, Send } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';


const scoutingAttributes = [
    { key: 'technik', label: 'Technik' },
    { key: 'spielintelligenz', label: 'Spielintelligenz' },
    { key: 'athletik', label: 'Athletik' },
    { key: 'mentalitaet', label: 'Mentalität' },
];

export const PlayerPlacementModal = ({ player, isOpen, onOpenChange, onDelete }) => {
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [scoutingData, setScoutingData] = useState({
        potential: player?.rating || 0,
        scoutNotes: player?.scoutNotes || '',
        attributes: {
            technik: 6,
            spielintelligenz: 7,
            athletik: 5,
            mentalitaet: 8,
        }
    });

    const { addPlayerToWatchlist, isLoading: isWatchlistLoading } = useWatchlist();
    
    useEffect(() => {
        if (isOpen) {
            setStep(1); // Reset to first step when modal opens
            const fetchClubs = async () => {
                const allClubs = await getAllClubs({ includeArchived: false });
                // Mocking open spots for demo
                const clubsWithSpots = allClubs.map(c => ({
                    ...c,
                    openSpots: { 'Junioren C1': 2, 'Junioren B2': 1 }
                }));
                setClubs(clubsWithSpots);
            };
            fetchClubs();
        }
    }, [isOpen]);
    
     useEffect(() => {
        if (player) {
            setScoutingData(prev => ({
                ...prev,
                potential: player.rating || 0,
                scoutNotes: player.scoutNotes || ''
            }));
        }
    }, [player]);

    const handleSuggestClick = async (club, teamName) => {
        try {
            await suggestPlayerToClub({
                playerIdentifier: player.email,
                playerName: player.name,
                clubId: club.id,
                clubName: club.name,
                teamName: teamName,
            });

            toast({
                title: "Vorschlag gesendet",
                description: `Die Anfrage für ${player.name} wurde als Aufgabe an ${club.name} (${teamName}) weitergeleitet.`,
            });
        } catch (error) {
            console.error("Failed to send suggestion:", error);
            toast({
                title: "Fehler",
                description: "Der Vorschlag konnte nicht gesendet werden.",
                variant: "destructive",
            });
        }
    };
    
    const handleAddToWatchlist = async () => {
        const newWatchlistPlayer = {
            id: player.id,
            name: player.name,
            birthYear: player.birthYear,
            position: player.position,
            teamName: player.previousClub || 'Vereinslos',
            avatarUrl: player.avatarUrl,
            potential: scoutingData.potential,
            scoutRating: Math.round(Object.values(scoutingData.attributes).reduce((a, b) => a + b, 0) / 4),
            scoutNotes: scoutingData.scoutNotes,
        };
        await addPlayerToWatchlist(newWatchlistPlayer);
        toast({
            title: `${player.name} zur Watchlist hinzugefügt!`,
        });
    };
    
    const handleDeleteClick = () => {
        if (player && player.id && player.type) {
            onDelete(player.id, player.type);
        }
    };

    if (!isOpen || !player) return null;
    
    const renderStep1 = () => (
        <>
            <DialogHeader>
                <DialogTitle className="text-2xl">{player.name}</DialogTitle>
                <DialogDescription>{player.profession}</DialogDescription>
            </DialogHeader>
            <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Player Info */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Stammdaten</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-2">
                             <p><strong>Geburtsjahr:</strong> {player.birthYear}</p>
                             <p><strong>Position:</strong> {player.position}</p>
                             <p><strong>Letzter Verein:</strong> {player.previousClub || 'Keiner'}</p>
                             <p><strong>Region:</strong> {player.region || 'Unbekannt'}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Kontakt</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-2">
                            <p><strong>Name:</strong> {player.contactName || player.name}</p>
                            <p><strong>E-Mail:</strong> {player.email}</p>
                            <p><strong>Telefon:</strong> {player.phone || 'Nicht angegeben'}</p>
                        </CardContent>
                    </Card>
                </div>
                {/* Right: Scouting */}
                <div className="space-y-4">
                     <Card>
                        <CardHeader><CardTitle className="text-base">Scouting-Bewertung</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2">
                                <Label>Potenzial-Score: {scoutingData.potential.toFixed(1)} / 5</Label>
                                <div className="flex items-center gap-2">
                                     <Slider
                                        id="potential"
                                        min={0}
                                        max={5}
                                        step={0.1}
                                        value={[scoutingData.potential]}
                                        onValueChange={(value) => setScoutingData(p => ({ ...p, potential: value[0] }))}
                                    />
                                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                </div>
                            </div>
                            <div className="space-y-3 pt-2">
                                {scoutingAttributes.map(({key, label}) => (
                                    <div key={key} className="space-y-1">
                                        <Label className="text-xs">{label}: {scoutingData.attributes[key]} / 10</Label>
                                        <Slider
                                            min={0}
                                            max={10}
                                            step={1}
                                            value={[scoutingData.attributes[key]]}
                                            onValueChange={(value) => setScoutingData(p => ({ ...p, attributes: {...p.attributes, [key]: value[0]} }))}
                                        />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                     <div className="space-y-2">
                        <Label>Scouting Notizen</Label>
                        <Textarea 
                            value={scoutingData.scoutNotes} 
                            onChange={(e) => setScoutingData(p => ({...p, scoutNotes: e.target.value}))} 
                            rows={4}
                            placeholder="Stärken, Schwächen, nächster Schritt..."
                        />
                    </div>
                </div>
            </div>
             <DialogFooter className="justify-between">
                <div>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                             <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4"/> Von Warteliste entfernen</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Wirklich entfernen?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogDescription>Möchten Sie {player.name} wirklich von der Warteliste entfernen?</AlertDialogDescription>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteClick}>Entfernen</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Schliessen</Button>
                    <Button variant="secondary" onClick={handleAddToWatchlist} disabled={isWatchlistLoading}><Eye className="mr-2 h-4 w-4"/> Auf Watchlist</Button>
                    <Button onClick={() => setStep(2)}><Send className="mr-2 h-4 w-4"/> Verein vorschlagen</Button>
                </div>
            </DialogFooter>
        </>
    );

    const renderStep2 = () => (
         <>
            <DialogHeader>
                <DialogTitle>Passende Vereine für {player.name}</DialogTitle>
                <DialogDescription>
                    Schlagen Sie den Spieler einem Verein mit freien Plätzen vor.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3 max-h-96 overflow-y-auto">
                {clubs.map(club => (
                     <Card key={club.id}>
                        <CardHeader className="p-4">
                            <CardTitle className="text-base">{club.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            {club.openSpots && Object.keys(club.openSpots).length > 0 ? (
                                <div className="space-y-2">
                                    {Object.entries(club.openSpots).map(([team, spots]) => (
                                        <div key={team} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                            <div>
                                                <p className="font-medium text-sm">{team}</p>
                                                <p className="text-xs text-green-600">{spots} freie Plätze</p>
                                            </div>
                                            <Button size="sm" onClick={() => handleSuggestClick(club, team)}>Vorschlagen</Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Aktuell keine freien Plätze gemeldet.</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
                 {clubs.length === 0 && (
                    <p className="text-sm text-center text-muted-foreground py-8">Keine Vereine gefunden, die als aktiv markiert sind.</p>
                 )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setStep(1)}>Zurück</Button>
            </DialogFooter>
        </>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                {step === 1 ? renderStep1() : renderStep2()}
            </DialogContent>
        </Dialog>
    );
};
