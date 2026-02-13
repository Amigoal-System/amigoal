'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { HallOfFameCard } from '@/components/ui/hall-of-fame-card';
import { WallOfFameModal } from '@/components/WallOfFameModal';
import { getAllHonoraryMembers, addHonoraryMember, updateHonoraryMember, deleteHonoraryMember } from '@/ai/flows/wallOfFame';
import type { HonoraryMember } from '@/ai/flows/wallOfFame.types';
import { useToast } from '@/hooks/use-toast';
import { useTeam } from '@/hooks/use-team';

export default function WallOfFamePage() {
    const { club } = useTeam();
    const [members, setMembers] = useState<HonoraryMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<HonoraryMember | null>(null);
    const { toast } = useToast();

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const data = await getAllHonoraryMembers(club?.id);
            setMembers(data);
        } catch (error) {
            console.error("Failed to fetch honorary members:", error);
            toast({ title: "Fehler beim Laden", description: "Daten für die Wall of Fame konnten nicht geladen werden.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [club?.id]);

    const handleSave = async (memberData: HonoraryMember) => {
        try {
            if (memberData.id) {
                await updateHonoraryMember(memberData);
                toast({ title: "Mitglied aktualisiert" });
            } else {
                await addHonoraryMember(memberData);
                toast({ title: "Mitglied hinzugefügt" });
            }
            fetchMembers();
        } catch (error) {
            toast({ title: "Fehler beim Speichern", variant: "destructive" });
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleDelete = async (memberId: string) => {
        try {
            await deleteHonoraryMember(memberId);
            toast({ title: "Mitglied entfernt" });
            fetchMembers();
        } catch (error) {
            toast({ title: "Fehler beim Löschen", variant: "destructive" });
        } finally {
            setIsModalOpen(false);
        }
    };
    
    const handleOpenModal = (member: HonoraryMember | null = null) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Wall of Fame</h1>
                        <p className="text-muted-foreground">Ehrenmitglieder und Legenden des Vereins.</p>
                    </div>
                    <Button onClick={() => handleOpenModal(null)}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Neues Mitglied hinzufügen
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading ? (
                        <p>Lade Mitglieder...</p>
                    ) : (
                        members.map(member => (
                             <div key={member.id} onClick={() => handleOpenModal(member)}>
                                <HallOfFameCard
                                    name={member.name}
                                    title={member.title}
                                    image={member.image || 'https://placehold.co/400x500.png'}
                                    dataAiHint={member.dataAiHint}
                                    achievements={member.achievements}
                                />
                             </div>
                        ))
                    )}
                </div>
            </div>
            {isModalOpen && (
                 <WallOfFameModal 
                    member={selectedMember}
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    onSave={handleSave}
                    onDelete={handleDelete}
                />
            )}
        </>
    );
}
