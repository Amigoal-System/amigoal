
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, MoreHorizontal, Edit, UserPlus, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { PlayerScoutingDetailModal } from '@/components/ui/player-scouting-detail-modal';
import type { WatchlistPlayer } from '@/ai/flows/watchlist.types';

export default function WatchlistPage() {
    const { watchlist, isLoading, addPlayerToWatchlist, updateWatchlistPlayer, removePlayerFromWatchlist } = useWatchlist();
    const [selectedPlayer, setSelectedPlayer] = useState<WatchlistPlayer | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const filteredWatchlist = useMemo(() => {
        return watchlist.filter(player =>
            player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            player.teamName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [watchlist, searchTerm]);

    const handleOpenModal = (player: WatchlistPlayer | null) => {
        setSelectedPlayer(player);
        setIsModalOpen(true);
    };

    const handleSave = async (playerData: WatchlistPlayer) => {
        try {
            if (playerData.id) {
                await updateWatchlistPlayer(playerData);
                toast({ title: 'Spieler aktualisiert.' });
            } else {
                await addPlayerToWatchlist(playerData);
                toast({ title: 'Spieler zur Watchlist hinzugefügt.' });
            }
        } catch (error) {
            toast({ title: 'Fehler beim Speichern.', variant: 'destructive' });
        }
    };
    
    const handleRemove = async (playerId: string) => {
        try {
            await removePlayerFromWatchlist(playerId);
            toast({title: 'Spieler entfernt'});
        } catch (error) {
            toast({ title: "Fehler beim Entfernen.", variant: 'destructive'})
        }
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Scout Watchlist</h1>
                        <p className="text-muted-foreground">Beobachten und bewerten Sie vielversprechende Talente.</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Meine beobachteten Spieler</CardTitle>
                             <div className="relative w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Spieler suchen..." 
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <p>Lade Watchlist...</p> : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Spieler</TableHead>
                                        <TableHead>Team</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead>Potenzial</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredWatchlist.map(player => (
                                        <TableRow key={player.id} className="cursor-pointer" onClick={() => handleOpenModal(player)}>
                                            <TableCell className="font-medium flex items-center gap-3">
                                                 <Avatar className="h-8 w-8">
                                                    <AvatarImage src={player.avatarUrl} />
                                                    <AvatarFallback>{player.name.slice(0,2)}</AvatarFallback>
                                                </Avatar>
                                                {player.name}
                                            </TableCell>
                                            <TableCell>{player.teamName}</TableCell>
                                            <TableCell>{player.position}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`h-4 w-4 ${i < (player.potential || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                                    ))}
                                                     <span className="text-xs text-muted-foreground">({player.potential?.toFixed(1) || 'N/A'})</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            <PlayerScoutingDetailModal 
                player={selectedPlayer}
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSave={handleSave}
                onRemove={handleRemove}
            />
        </>
    );
}
