
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from './ui/progress';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Legend, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Users, Trophy, Target, ClipboardList, PlusCircle, Edit, Save, Loader2, Upload } from 'lucide-react';
import { Separator } from './ui/separator';
import { useMembers } from '@/hooks/useMembers';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useTeams } from '@/hooks/useTeams';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CreateMemberWizard } from './CreateMemberWizard';
import { useTeam } from '@/hooks/use-team';
import { AddPlayerToTeamModal } from './AddPlayerToTeamModal';
import { updateTeam } from '@/ai/flows/teams';
import { updateMember } from '@/ai/flows/members';
import { useToast } from '@/hooks/use-toast';
import type { Team } from '@/ai/flows/teams.types';
import type { Member } from '@/ai/flows/members.types';
import { sendMail } from '@/services/email';
import Image from 'next/image';

const StatCard = ({ title, value, icon: Icon, progress }) => (
    <Card>
        <CardHeader className="pb-2">
            <CardDescription className="flex items-center justify-between">
                <span>{title}</span>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardDescription>
            <CardTitle className="text-3xl">{value}</CardTitle>
        </CardHeader>
        <CardContent>
            <Progress value={progress} indicatorClassName={progress > 80 ? 'bg-green-500' : progress > 60 ? 'bg-yellow-500' : 'bg-red-500'} />
        </CardContent>
    </Card>
);

export const TeamDetailModal = ({ team, isOpen, onOpenChange }) => {
    const { club, isLoading: isLoadingClub } = useTeam();
    const { members, isLoading: isLoadingMembers, refetchMembers } = useMembers(club?.id);
    const { refetchTeams } = useTeams(club?.id);
    const { toast } = useToast();
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Team | null>(null);
    const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
    const [isMemberWizardOpen, setIsMemberWizardOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && team) {
            const teamMembers = members.filter(m => m.teams?.includes(team.name));
            setFormData({
                ...team,
                players: teamMembers.filter(m => m.roles.includes('Spieler')),
                staff: teamMembers.filter(m => m.roles.some(r => ['Trainer', 'Staff', 'Board', 'Manager'].includes(r))),
            });
            setIsEditing(false);
        }
    }, [team, isOpen, members]);

    const {
        trainingAttendance,
        membershipRate,
        teamPerformance,
        teamEvaluationData
    } = useMemo(() => {
        if (!formData || !formData.players || formData.players.length === 0) {
            return { trainingAttendance: 0, membershipRate: 0, teamPerformance: 0, teamEvaluationData: [] };
        }
        const players = formData.players as Member[];
        const totalPlayers = players.length;
        const totalAttendance = players.reduce((sum, p) => sum + (p.attendance || 85), 0);
        const avgAttendance = totalPlayers > 0 ? totalAttendance / totalPlayers : 0;
        const paidMembers = players.filter(p => p.fee?.paid).length;
        const paidRate = totalPlayers > 0 ? (paidMembers / totalPlayers) * 100 : 0;
        const avgTeamPerformance = players.reduce((sum, p) => {
            const performanceMapping = { 'Top': 90, 'Gut': 75, 'Mittel': 60 };
            return sum + (performanceMapping[p.performance] || 70);
        }, 0) / (totalPlayers || 1);
        const radarData = [
            { subject: 'Fitness', A: Math.min(100, (avgAttendance * 0.9) || 0) },
            { subject: 'Technik', A: Math.min(100, (avgTeamPerformance * 1.1) || 0) },
            { subject: 'Taktik', A: Math.min(100, (avgTeamPerformance * 0.95) || 0) },
            { subject: 'Teamgeist', A: 95 },
            { subject: 'Disziplin', A: 88 },
        ];
        return { trainingAttendance: avgAttendance, membershipRate: paidRate, teamPerformance: avgTeamPerformance, teamEvaluationData: radarData };
    }, [formData]);

    const handleOpenAddPlayerModal = () => setIsAddPlayerModalOpen(true);
    const handleOpenMemberWizard = () => {
        setIsAddPlayerModalOpen(false);
        setIsMemberWizardOpen(true);
    }
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => prev ? ({...prev, teamPhotoUrl: event.target?.result as string}) : null);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSaveNewPlayers = async (newPlayerIds: string[]) => {
        const newPlayers = members.filter(m => newPlayerIds.includes(m.id!));
        if (!formData || newPlayers.length === 0) return;
    
        try {
             const updatedTeamData: Partial<Team> = {
                id: formData.id,
                players: [
                    ...(formData.players || []).map(p => ({
                        id: p.id!,
                        firstName: p.firstName,
                        lastName: p.lastName,
                        position: p.position || 'N/A',
                        trikot: p.trikot || 0,
                        fee: p.fee,
                    })),
                    ...newPlayers.map(p => ({
                        id: p.id!,
                        firstName: p.firstName,
                        lastName: p.lastName,
                        position: p.position || 'N/A',
                        trikot: p.trikot || 0,
                        fee: p.fee,
                    })),
                ],
                members: (formData.members || 0) + newPlayers.length,
            };

            await updateTeam(updatedTeamData as Team);
    
            const memberUpdatePromises = newPlayers.map(async (player) => {
                const updatedTeams = [...(player.teams || []), formData.name];
                await updateMember({ ...player, teams: updatedTeams });
    
                if (player.email) {
                    await sendMail({
                        to: player.email,
                        subject: `Du wurdest zur Mannschaft "${formData.name}" hinzugefügt`,
                        html: `Hallo ${player.firstName},<br><br>du wurdest soeben zur Mannschaft <strong>${formData.name}</strong> im Verein ${club?.name} hinzugefügt.<br><br>Sportliche Grüsse,<br>Dein Amigoal Team`
                    });
                }
            });
    
            await Promise.all(memberUpdatePromises);
    
            toast({ title: 'Spieler hinzugefügt', description: `${newPlayers.length} Spieler wurden der Mannschaft hinzugefügt und benachrichtigt.` });
            refetchTeams();
            refetchMembers();
        } catch(e) {
            console.error("Error adding/notifying players:", e);
            toast({ title: "Fehler", description: "Spieler konnte nicht hinzugefügt oder benachrichtigt werden.", variant: "destructive" });
        }
    };
    
    
    const handleSave = async () => {
        if (!formData) return;
        try {
            await updateTeam(formData);
            toast({ title: 'Mannschaft gespeichert' });
            setIsEditing(false);
            refetchTeams();
        } catch(e) {
            toast({ title: 'Fehler beim Speichern', variant: 'destructive'});
        }
    };
    
    if (!isOpen || isLoadingClub || isLoadingMembers || !formData) return null;

    return (
      <>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl">
                <DialogHeader>
                    {isEditing ? (
                         <div className="flex gap-4 items-center">
                            <Input id="name" value={formData.name} onChange={(e) => setFormData(p => p ? ({ ...p, name: e.target.value }) : null)} className="text-3xl font-bold font-headline h-auto border-0 shadow-none -ml-3" />
                         </div>
                    ) : (
                        <>
                            <DialogTitle className="text-3xl font-bold font-headline">{formData.name}</DialogTitle>
                            <DialogDescription>
                                Detaillierte Übersicht der Mannschaft für die Saison 24/25. Trainer: {formData.trainer}
                            </DialogDescription>
                        </>
                    )}
                </DialogHeader>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4 max-h-[80vh] overflow-y-auto pr-4 -mr-2">
                    <div className="lg:col-span-2 space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatCard title="Anwesenheit Training" value={`${trainingAttendance.toFixed(0)}%`} icon={ClipboardList} progress={trainingAttendance} />
                            <StatCard title="Mitgliederbeiträge" value={`${membershipRate.toFixed(0)}%`} icon={Users} progress={membershipRate} />
                            <StatCard title="Team-Leistung" value={`${teamPerformance.toFixed(0)}%`} icon={Trophy} progress={teamPerformance} />
                        </div>
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>Spielerliste ({formData.players?.length || 0})</CardTitle>
                                    <Button size="sm" variant="outline" onClick={handleOpenAddPlayerModal}><PlusCircle className="mr-2 h-4 w-4"/>Spieler hinzufügen</Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Spieler</TableHead>
                                            <TableHead>Position</TableHead>
                                            <TableHead>Trikot</TableHead>
                                            <TableHead>Geburtstag</TableHead>
                                            <TableHead>Beitrag</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {formData.players?.map(player => (
                                            <TableRow key={player.id}>
                                                <TableCell className="font-medium">{`${player.firstName} ${player.lastName}`}</TableCell>
                                                <TableCell>{player.position}</TableCell>
                                                <TableCell>{player.trikot}</TableCell>
                                                <TableCell>{player.geb}</TableCell>
                                                <TableCell>
                                                    <Badge variant={player.fee?.paid ? 'default' : 'destructive'} className={player.fee?.paid ? 'bg-green-500' : ''}>
                                                        {player.fee?.paid ? 'Bezahlt' : 'Offen'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Mannschaftsfoto</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                                {formData.teamPhotoUrl ? (
                                    <Image src={formData.teamPhotoUrl} alt="Mannschaftsfoto" width={400} height={225} className="w-full h-full object-cover"/>
                                ) : (
                                    <span className="text-sm text-muted-foreground">Kein Foto</span>
                                )}
                                </div>
                                {isEditing && (
                                    <Button variant="outline" className="w-full mt-4" onClick={() => fileInputRef.current?.click()}>
                                        <Upload className="mr-2 h-4 w-4" /> Foto ändern
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Trainer & Staff ({formData.staff?.length || 0})</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {formData.staff?.map(staffMember => (
                                    <div key={staffMember.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/50">
                                        <Avatar><AvatarFallback>{staffMember.firstName?.[0] || ''}{staffMember.lastName?.[0] || ''}</AvatarFallback></Avatar>
                                        <div><p className="font-semibold">{staffMember.firstName} {staffMember.lastName}</p><p className="text-xs text-muted-foreground">{staffMember.role}</p></div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <CardTitle>Team-Leistung</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <RadarChart data={teamEvaluationData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" fontSize={10} />
                                        <Radar name="Team" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                        <RechartsTooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <DialogFooter>
                    {isEditing ? (
                         <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Abbrechen</Button>
                            <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Speichern</Button>
                         </>
                    ) : (
                        <Button variant="outline" onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4"/> Bearbeiten</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
         <AddPlayerToTeamModal
            isOpen={isAddPlayerModalOpen}
            onOpenChange={setIsAddPlayerModalOpen}
            allClubMembers={members}
            currentTeamMembers={formData?.players || []}
            onAddPlayers={handleSaveNewPlayers}
            onAddNewMember={handleOpenMemberWizard}
        />
        <CreateMemberWizard 
            isOpen={isMemberWizardOpen}
            onOpenChange={setIsMemberWizardOpen}
            onMemberCreated={() => {
                refetchMembers();
                setIsAddPlayerModalOpen(true); // Re-open the add player modal
            }}
            defaultTeam={formData?.name}
            defaultRoles={['Spieler']}
        />
    </>
    );
};
