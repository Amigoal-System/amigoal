
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, ThumbsUp, ThumbsDown, Check, X, Eye, List, LayoutGrid, Coins, UserCog, Send, Search, UserPlus, Trash2 } from 'lucide-react';
import { SocialCard } from '@/components/ui/social-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReviewStars } from '@/components/blocks/animated-cards-stack';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useHighlights } from '@/hooks/useHighlights'; // Import the new hook
import type { Highlight, TaggedPlayer } from '@/ai/flows/highlights.types';
import { useTeam } from '@/hooks/use-team';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useMembers } from '@/hooks/useMembers';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HighlightUploadModal } from '@/components/ui/highlight-upload-modal';

const TokenomicsCard = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Coins className="h-5 w-5 text-primary"/> Tokenomics</CardTitle>
                <CardDescription>Definieren Sie, wie Interaktionen in AMIGO-Tokens umgewandelt werden.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <Label>Belohnung für Uploader & markierte Spieler werden aufgeteilt.</Label>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <Label htmlFor="like-value">1 Like</Label>
                    <div className="flex items-center gap-2">
                        <span>=</span>
                        <Input id="like-value" type="number" defaultValue="1" className="w-20" />
                        <span>AMIGO</span>
                    </div>
                </div>
                 <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <Label htmlFor="share-value">1 Share</Label>
                    <div className="flex items-center gap-2">
                        <span>=</span>
                        <Input id="share-value" type="number" defaultValue="5" className="w-20" />
                         <span>AMIGO</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full">Regeln speichern</Button>
            </CardFooter>
        </Card>
    )
}

const HighlightDetailModal = ({ highlight, isOpen, onOpenChange, onStatusChange, onDelegate, onUpdateTags }) => {
    const { members } = useMembers(); // Fetch all members for tagging
    const [searchTerm, setSearchTerm] = useState('');
    
    if (!highlight) return null;

    const videoPlayer = (
        <video src={highlight.videoUrl} controls className="w-full h-full object-cover rounded-t-lg" poster={highlight.videoUrl.includes('placehold.co') ? highlight.videoUrl : undefined}></video>
    );

    const availablePlayers = members.filter(member => 
        !highlight.taggedPlayers?.some(tagged => tagged.id === member.id) &&
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const handleTagPlayer = (player: any) => {
        const newTaggedPlayers = [...(highlight.taggedPlayers || []), { id: player.id, name: `${player.firstName} ${player.lastName}` }];
        onUpdateTags(highlight, newTaggedPlayers);
        setSearchTerm('');
    };

    const handleUntagPlayer = (playerId: string) => {
        const newTaggedPlayers = highlight.taggedPlayers.filter(p => p.id !== playerId);
        onUpdateTags(highlight, newTaggedPlayers);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="aspect-video bg-black rounded-tl-lg md:rounded-bl-lg md:rounded-tr-none">
                         {videoPlayer}
                    </div>
                    <div className="p-6 flex flex-col justify-between">
                         <div>
                            <DialogHeader className="mb-4">
                                <DialogTitle>Highlight von {highlight.user}</DialogTitle>
                                <DialogDescription>{highlight.team} - {highlight.type}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader className="p-3">
                                        <CardTitle className="text-base">Aktionen</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0 flex gap-2">
                                        <Button size="sm" variant="outline" className="w-full text-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => onStatusChange(highlight, 'approved')}>
                                            <Check className="mr-2 h-4 w-4"/> Freigeben
                                        </Button>
                                        <Button size="sm" variant="outline" className="w-full text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => onStatusChange(highlight, 'rejected')}>
                                            <X className="mr-2 h-4 w-4"/> Ablehnen
                                        </Button>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader className="p-3">
                                        <CardTitle className="text-base flex items-center gap-2"><UserCog className="h-4 w-4"/> An Verein delegieren</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0">
                                        <p className="text-xs text-muted-foreground mb-2">Der Club-Admin erhält eine Aufgabe, das Highlight für die Vereins-Webseite zu prüfen.</p>
                                        <Button size="sm" className="w-full" onClick={() => onDelegate(highlight)}>
                                            <Send className="mr-2 h-4 w-4"/> Aufgabe an Club-Admin senden
                                        </Button>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="p-3"><CardTitle className="text-base">Markierte Spieler</CardTitle></CardHeader>
                                    <CardContent className="p-3 pt-0">
                                        <div className="relative mb-2">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                placeholder="Spieler suchen..." 
                                                className="pl-8"
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                         {searchTerm && (
                                            <ScrollArea className="h-32 border rounded-md mb-2">
                                                {availablePlayers.map(player => (
                                                    <div key={player.id} className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer" onClick={() => handleTagPlayer(player)}>
                                                        <span className="text-sm">{player.firstName} ${player.lastName}</span>
                                                        <UserPlus className="h-4 w-4 text-primary" />
                                                    </div>
                                                ))}
                                            </ScrollArea>
                                        )}
                                        <div className="space-y-1">
                                            {highlight.taggedPlayers?.map(player => (
                                                <div key={player.id} className="flex items-center justify-between text-sm bg-muted/50 p-1.5 rounded-md">
                                                    <span>{player.name}</span>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUntagPlayer(player.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                         </div>
                        <DialogFooter className="pt-4">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Schliessen</Button>
                        </DialogFooter>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default function HighlightsManagementPage() {
    const { highlights, isLoading, updateHighlight, addHighlight } = useHighlights();
    const { currentUserRole, userName, activeTeam, club } = useTeam();
    const { members } = useMembers(club?.id);
    const [viewMode, setViewMode] = useState('grid');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
    const { toast } = useToast();
    
    const handleStatusChange = (highlight: Highlight, newStatus: 'approved' | 'rejected') => {
        updateHighlight({ ...highlight, status: newStatus });
        toast({
            title: `Highlight ${newStatus === 'approved' ? 'freigegeben' : 'abgelehnt'}!`,
            variant: newStatus === 'rejected' ? 'destructive' : 'default',
        });
        if(isDetailModalOpen) setIsDetailModalOpen(false);
    }
    
    const handleDelegate = (highlight: Highlight) => {
        toast({
            title: "Aufgabe erstellt!",
            description: `Der Admin von ${highlight.team} wurde benachrichtigt.`
        });
        setIsDetailModalOpen(false);
    }
    
    const handleUpdateTags = (highlight: Highlight, taggedPlayers: TaggedPlayer[]) => {
        updateHighlight({ ...highlight, taggedPlayers });
    };

    const handleOpenDetailModal = (highlight: Highlight) => {
        if (currentUserRole !== 'Super-Admin') return;
        setSelectedHighlight(highlight);
        setIsDetailModalOpen(true);
    }

    const handleSaveHighlight = async (newHighlightData) => {
        const dataToSave = {
            ...newHighlightData,
            user: userName,
            team: currentUserRole === 'Bootcamp-Anbieter' ? `Bootcamp: ${userName}` : activeTeam,
            submittedAt: new Date().toISOString(),
            status: 'pending' as const,
        }
        await addHighlight(dataToSave);
        toast({ title: "Highlight hochgeladen", description: "Dein Highlight wird vom Admin geprüft."})
    }

    const filteredHighlightsByRole = useMemo(() => {
        if (currentUserRole === 'Bootcamp-Anbieter') {
            return highlights.filter(h => h.user === userName);
        }
        if (currentUserRole !== 'Super-Admin' && club) {
            // Very simplified logic: Show highlights from the same team or uploaded by current user
            return highlights.filter(h => h.team === activeTeam || h.user === userName);
        }
        return highlights;
    }, [highlights, currentUserRole, userName, club, activeTeam]);

    const filteredHighlights = (status) => filteredHighlightsByRole.filter(h => h.status === status);

    const getStatusBadge = (status) => {
        switch(status) {
            case 'approved': return <Badge className="bg-green-100 text-green-800">Freigegeben</Badge>;
            case 'pending': return <Badge variant="secondary">Ausstehend</Badge>;
            case 'rejected': return <Badge variant="destructive">Abgelehnt</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    }
    
    const HighlightsTable = ({ status }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Spieler</TableHead>
                    <TableHead>Eingereicht am</TableHead>
                    <TableHead>Scout-Bewertung</TableHead>
                    <TableHead>Aktionen</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredHighlights(status).map(highlight => (
                    <TableRow key={highlight.id} onClick={() => handleOpenDetailModal(highlight)} className={currentUserRole === 'Super-Admin' ? 'cursor-pointer' : ''}>
                        <TableCell>
                             <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={`https://placehold.co/40x40.png?text=${highlight.user.split(' ').map(n=>n[0]).join('')}`} />
                                    <AvatarFallback>{highlight.user.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{highlight.user}</p>
                                    <p className="text-xs text-muted-foreground">{highlight.team}</p>
                                </div>
                            </div>
                        </TableCell>
                         <TableCell>{new Date(highlight.submittedAt).toLocaleDateString('de-CH')}</TableCell>
                         <TableCell>
                            {highlight.scoutRating ? (
                                <div className="flex items-center gap-1">
                                    <ReviewStars rating={highlight.scoutRating} />
                                    <span className="text-xs text-muted-foreground">({highlight.scoutRating})</span>
                                </div>
                            ) : <span className="text-xs text-muted-foreground">N/A</span>}
                        </TableCell>
                        <TableCell>
                           <div className="flex gap-2">
                                {status === 'pending' && currentUserRole === 'Super-Admin' && (
                                    <>
                                        <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50 hover:text-green-700" onClick={(e) => { e.stopPropagation(); handleStatusChange(highlight, 'approved')}}>
                                            <Check className="mr-2 h-4 w-4"/> Freigeben
                                        </Button>
                                         <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={(e) => { e.stopPropagation(); handleStatusChange(highlight, 'rejected')}}>
                                            <X className="mr-2 h-4 w-4"/> Ablehnen
                                        </Button>
                                    </>
                                )}
                                <Button size="sm" variant="ghost"><Eye className="mr-2 h-4 w-4"/> Ansehen</Button>
                           </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

     const HighlightsGrid = ({ status }) => (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredHighlights(status).map(highlight => {
                const videoPlayer = (
                    <video src={highlight.videoUrl} poster={highlight.videoUrl.includes('placehold.co') ? highlight.videoUrl : undefined} controls className="w-full h-full object-cover"></video>
                );
                return (
                    <div key={highlight.id} className="space-y-2" onClick={() => handleOpenDetailModal(highlight)}>
                        <SocialCard
                            author={{
                                name: highlight.user,
                                username: highlight.team,
                                avatar: `https://placehold.co/40x40.png?text=${highlight.user.split(' ').map(n=>n[0]).join('')}`,
                                timeAgo: highlight.type
                            }}
                            content={{ media: videoPlayer }}
                            engagement={highlight}
                            showRating={true}
                        />
                        {status === 'pending' && currentUserRole === 'Super-Admin' && (
                            <div className="flex gap-2">
                                <Button className="w-full text-green-600 hover:bg-green-50 hover:text-green-700" variant="outline" onClick={(e) => { e.stopPropagation(); handleStatusChange(highlight, 'approved')}}>
                                    <ThumbsUp className="mr-2 h-4 w-4"/> Freigeben
                                </Button>
                                <Button className="w-full text-red-600 hover:bg-red-50 hover:text-red-700" variant="outline" onClick={(e) => { e.stopPropagation(); handleStatusChange(highlight, 'rejected')}}>
                                    <ThumbsDown className="mr-2 h-4 w-4"/> Ablehnen
                                </Button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
     );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Highlights Management</h1>
                    <p className="text-muted-foreground">Verwalten und prüfen Sie die von Spielern hochgeladenen Highlights.</p>
                </div>
                 <div className="flex items-center gap-2">
                    <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}><List className="h-4 w-4"/></Button>
                    <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}><LayoutGrid className="h-4 w-4"/></Button>
                    <Button onClick={() => setIsUploadModalOpen(true)}><Upload className="mr-2 h-4 w-4"/> Eigenes Highlight hochladen</Button>
                </div>
            </div>
            
            {isLoading ? (
                <p>Lade Highlights...</p>
            ) : (
                <Tabs defaultValue="pending">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pending">Ausstehend ({filteredHighlights('pending').length})</TabsTrigger>
                        <TabsTrigger value="approved">Freigegeben ({filteredHighlights('approved').length})</TabsTrigger>
                        <TabsTrigger value="rejected">Abgelehnt ({filteredHighlights('rejected').length})</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pending" className="mt-4">
                         <Card>
                            <CardHeader><CardTitle>Zur Freigabe ausstehende Highlights</CardTitle></CardHeader>
                            <CardContent>
                                {filteredHighlights('pending').length > 0 ? (viewMode === 'grid' ? <HighlightsGrid status="pending" /> : <HighlightsTable status="pending" />) : <p className="text-muted-foreground text-center p-4">Keine ausstehenden Highlights.</p>}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="approved" className="mt-4">
                         <Card>
                            <CardHeader><CardTitle>Freigegebene Highlights</CardTitle></CardHeader>
                            <CardContent>
                                 {filteredHighlights('approved').length > 0 ? (viewMode === 'grid' ? <HighlightsGrid status="approved" /> : <HighlightsTable status="approved" />) : <p className="text-muted-foreground text-center p-4">Keine freigegebenen Highlights.</p>}
                            </CardContent>
                        </Card>
                    </TabsContent>
                     <TabsContent value="rejected" className="mt-4">
                         <Card>
                            <CardHeader><CardTitle>Abgelehnte Highlights</CardTitle></CardHeader>
                            <CardContent>
                                {filteredHighlights('rejected').length > 0 ? (viewMode === 'grid' ? <HighlightsGrid status="rejected" /> : <HighlightsTable status="rejected" />) : <p className="text-muted-foreground text-center p-4">Keine abgelehnten Highlights.</p>}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            )}
            
            {currentUserRole === 'Super-Admin' && (
                <div className="mt-8">
                    <TokenomicsCard />
                </div>
            )}
            <HighlightDetailModal 
                highlight={selectedHighlight}
                isOpen={isDetailModalOpen}
                onOpenChange={setIsDetailModalOpen}
                onStatusChange={handleStatusChange}
                onDelegate={handleDelegate}
                onUpdateTags={handleUpdateTags}
            />
            <HighlightUploadModal 
                isOpen={isUploadModalOpen}
                onOpenChange={setIsUploadModalOpen}
                onSave={handleSaveHighlight}
                members={members}
            />
        </div>
    );
}
