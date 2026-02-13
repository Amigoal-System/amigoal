'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Edit, User, Shield, Bell } from 'lucide-react';
import { useTeam } from '@/hooks/use-team';
import { ClubDetailModal } from '@/components/ClubDetailModal';
import { getAllClubs, updateClubStatus, updateClub } from '@/ai/flows/clubs';
import type { Club } from '@/ai/flows/clubs.types';

const ClubAdminProfilePage = () => {
    const { currentUserRole } = useTeam();
    const { toast } = useToast();
    const [club, setClub] = useState<Club | null>(null);
    const [isClubModalOpen, setIsClubModalOpen] = useState(false);

    useEffect(() => {
        // In a real app, you'd fetch the club data associated with the current user.
        // For this demo, we'll fetch all clubs and pick one.
        const fetchClub = async () => {
            const allClubs = await getAllClubs({ includeArchived: false });
            const adminClub = allClubs.find(c => c.name === "FC Awesome"); // Example club for demo
            setClub(adminClub || allClubs[0]);
        };
        fetchClub();
    }, []);

    const handleSaveChanges = () => {
        toast({
            title: "Gespeichert!",
            description: "Ihre Profileinstellungen wurden aktualisiert.",
        });
    };
    
    const handleSaveClub = async (updatedClub: Club) => {
        await updateClub(updatedClub);
        setClub(updatedClub);
        setIsClubModalOpen(false);
        toast({ title: "Vereinsdaten aktualisiert."});
    };

    const handleClubStatusChange = async (clubId: string, status: 'active' | 'suspended' | 'archived') => {
        await updateClubStatus({ clubId, status });
        setIsClubModalOpen(false);
        setClub(null); // Or update the state to reflect the change
         toast({ title: "Vereinsstatus aktualisiert."});
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Profil & Einstellungen</h1>
                        <p className="text-muted-foreground">Verwalten Sie Ihre persönlichen und die Vereins-Daten.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Club Card */}
                    <Card className="lg:col-span-1">
                        <CardHeader className="items-center text-center">
                            {club?.logo ? (
                                <Avatar className="w-24 h-24">
                                    <AvatarImage src={club.logo} alt={club.name} />
                                    <AvatarFallback>{club.name.slice(0,2)}</AvatarFallback>
                                </Avatar>
                            ) : null}
                            <CardTitle>{club?.name || 'Lade Verein...'}</CardTitle>
                            <CardDescription>Club-Profil</CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button variant="outline" className="w-full" onClick={() => setIsClubModalOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" /> Vereinsdaten bearbeiten
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Settings Cards */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><User />Persönliche Informationen</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label>Name</Label>
                                        <Input defaultValue="Club Admin" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>E-Mail</Label>
                                        <Input type="email" defaultValue="club.admin@fc-awesome.com" readOnly />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label>Rolle</Label>
                                    <Input value={currentUserRole} readOnly className="bg-muted"/>
                                </div>
                                <Button onClick={handleSaveChanges}>Änderungen speichern</Button>
                            </CardContent>
                        </Card>
                        
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Shield />Sicherheit</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="current-password">Aktuelles Passwort</Label>
                                    <Input id="current-password" type="password" />
                                </div>
                                 <div className="space-y-1">
                                    <Label htmlFor="new-password">Neues Passwort</Label>
                                    <Input id="new-password" type="password" />
                                </div>
                                <Button onClick={() => toast({title: "Passwort geändert!"})}>Passwort ändern</Button>
                            </CardContent>
                        </Card>

                        <Card>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Bell />Benachrichtigungen</CardTitle>
                            </CardHeader>
                             <CardContent className="space-y-4">
                                 <div className="flex items-center justify-between p-3 rounded-lg border">
                                    <Label htmlFor="email-notifications">E-Mail Benachrichtigungen</Label>
                                    <Switch id="email-notifications" defaultChecked/>
                                </div>
                                 <div className="flex items-center justify-between p-3 rounded-lg border">
                                    <Label htmlFor="push-notifications">Push-Nachrichten in der App</Label>
                                    <Switch id="push-notifications" defaultChecked/>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            {club && (
                <ClubDetailModal
                    club={club}
                    isOpen={isClubModalOpen}
                    onOpenChange={setIsClubModalOpen}
                    onSave={handleSaveClub}
                    onStatusChange={handleClubStatusChange}
                    isEditingDefault={false}
                />
            )}
        </>
    );
};

export default ClubAdminProfilePage;
