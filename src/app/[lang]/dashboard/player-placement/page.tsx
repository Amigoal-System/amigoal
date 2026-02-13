
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PlayerPlacementModal } from '@/components/PlayerPlacementModal';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, UserPlus, Users, PersonStanding, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ImgStack from '@/components/ui/image-stack';
import { AddPlayerToWaitlistModal } from '@/components/AddPlayerToWaitlistModal';
import { ReviewStars } from '@/components/blocks/animated-cards-stack';
import { useWaitlist } from '@/hooks/useWaitlist';
import type { WaitlistPlayer } from '@/ai/flows/waitlist.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClubPlayerSearches } from '@/hooks/useClubPlayerSearches';

export default function PlayerPlacementPage() {
    const { waitlist, adultWaitlist, isLoading, refetchWaitlist, refetchAdultWaitlist, removePlayerFromWaitlist } = useWaitlist();
    const { searches, isLoading: isLoadingSearches } = useClubPlayerSearches();
    const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
    const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'

    const formattedJuniorPlayers = React.useMemo(() => {
        return waitlist.map((player) => ({
            ...player,
            type: 'junior',
            name: `${'\'\'\''}{player.firstName} ${'\'\'\''}{player.lastName}`,
            profession: `${'\'\'\''}{player.position} - Jg. ${'\'\'\''}{player.birthYear}`,
            rating: 0,
            avatarUrl: `https://placehold.co/420x588.png?text=${'\'\'\''}{player.firstName.charAt(0)}${'\'\'\''}{player.lastName.charAt(0)}`
        }));
    }, [waitlist]);
    
    const formattedAdultPlayers = React.useMemo(() => {
        return adultWaitlist.map((player) => ({
            ...player,
            type: 'adult',
            name: `${'\'\'\''}{player.firstName} ${'\'\'\''}{player.lastName}`,
            profession: `${'\'\'\''}{player.position} - Jg. ${'\'\'\''}{player.birthYear}`,
            rating: 0,
            avatarUrl: `https://placehold.co/420x588.png?text=${'\'\'\''}{player.firstName.charAt(0)}${'\'\'\''}{player.lastName.charAt(0)}`
        }));
    }, [adultWaitlist]);

    const handleCardClick = (player: any) => {
        setSelectedPlayer(player);
        setIsPlacementModalOpen(true);
    };

    const handlePlayerAdded = () => {
        refetchWaitlist();
        refetchAdultWaitlist();
    }
    
    const handleSuggestClick = (search: any) => {
        // Here you would open a modal to select a player from the waitlist
        // For simplicity, we just log it for now
        console.log("Suggesting player for:", search);
    }
    
    const handleDeleteFromModal = (playerId: string, playerType: 'junior' | 'adult') => {
        removePlayerFromWaitlist(playerId, playerType);
        setIsPlacementModalOpen(false);
    }


    if (isLoading || isLoadingSearches) {
        return <p>Lade Wartelisten...</p>;
    }

    const renderPlayerList = (players: any[], type: 'junior' | 'adult') => {
        if (players.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-muted-foreground">Die {type === 'junior' ? 'Junioren' : 'Erwachsenen'}-Warteliste ist leer.</p>
                </div>
            );
        }

        if (viewMode === 'cards') {
            return (
                 <div className="flex items-center justify-center py-8">
                    <ImgStack players={players} onCardClick={handleCardClick} />
                </div>
            );
        }

        return (
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Spieler</TableHead>
                                <TableHead>Jahrgang</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead className="text-right">Aktion</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {players.map((player: any) => (
                                <TableRow key={player.id} className="cursor-pointer" onClick={() => handleCardClick(player)}>
                                    <TableCell className="font-medium flex items-center gap-3">
                                        {player.firstName} {player.lastName}
                                    </TableCell>
                                    <TableCell>{player.birthYear}</TableCell>
                                    <TableCell>{player.position}</TableCell>
                                    <TableCell className="text-right">
                                         <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleCardClick(player);}}>
                                            Details anzeigen
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Spieler-Vermittlung</h1>
                     <p className="text-muted-foreground">
                        Verwalten Sie Spieler auf der Warteliste und offene Gesuche von Vereinen.
                    </p>
                </div>
                 <div className="flex items-center gap-2">
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <UserPlus className="mr-2 h-4 w-4"/>Beobachteten Spieler erfassen
                    </Button>
                    <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
                        <List className="h-4 w-4" />
                    </Button>
                    <Button variant={viewMode === 'cards' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('cards')}>
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            
            <Tabs defaultValue="waitlists">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="waitlists" className="gap-2">
                        <Users className="h-4 w-4" /> Spieler auf Vereinssuche
                    </TabsTrigger>
                     <TabsTrigger value="club-searches" className="gap-2">
                        <Search className="h-4 w-4" /> Vereine auf Spielersuche
                    </TabsTrigger>
                </TabsList>
                 <TabsContent value="waitlists" className="mt-4">
                     <Tabs defaultValue="juniors">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="juniors" className="gap-2">
                                <Users className="h-4 w-4" /> Junioren ({waitlist.length})
                            </TabsTrigger>
                            <TabsTrigger value="adults" className="gap-2">
                                <PersonStanding className="h-4 w-4" /> Erwachsene ({adultWaitlist.length})
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="juniors" className="mt-4">
                            {renderPlayerList(formattedJuniorPlayers, 'junior')}
                        </TabsContent>
                        <TabsContent value="adults" className="mt-4">
                            {renderPlayerList(formattedAdultPlayers, 'adult')}
                        </TabsContent>
                    </Tabs>
                </TabsContent>
                <TabsContent value="club-searches" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Offene Gesuche von Vereinen</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Verein</TableHead>
                                        <TableHead>Gesuchte Position</TableHead>
                                        <TableHead>Altersgruppe</TableHead>
                                        <TableHead className="text-right">Aktion</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {searches.map(search => (
                                        <TableRow key={search.id}>
                                            <TableCell className="font-medium">{search.clubName}</TableCell>
                                            <TableCell>{search.position}</TableCell>
                                            <TableCell>{search.ageGroup}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => handleSuggestClick(search)}>
                                                    Spieler vorschlagen
                                                </Button>
                                                </TableCell>
                                             </TableRow>
                                     ))}
                                     {searches.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">Aktuell keine offenen Gesuche.</TableCell>
                                        </TableRow>
                                     )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>


            <PlayerPlacementModal
                player={selectedPlayer}
                isOpen={isPlacementModalOpen}
                onOpenChange={setIsPlacementModalOpen}
                onDelete={handleDeleteFromModal}
            />

            <AddPlayerToWaitlistModal
                isOpen={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onPlayerAdded={handlePlayerAdded}
            />
        </div>
    );
}
