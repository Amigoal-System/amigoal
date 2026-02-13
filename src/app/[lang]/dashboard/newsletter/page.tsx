
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, Send, Users, Loader2 } from 'lucide-react';
import { EmailComposerModal } from '@/components/ui/email-composer-modal';
import { GroupDetailModal } from '@/components/ui/group-detail-modal';
import { useMembers } from '@/hooks/useMembers';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { useNewsletter } from '@/hooks/useNewsletter';
import { useTeam } from '@/hooks/use-team';

export default function NewsletterPage() {
    const { members, isLoading: isLoadingMembers } = useMembers();
    const { 
        groups, 
        campaigns, 
        addGroup, 
        updateGroup, 
        deleteGroup, 
        addCampaign,
        isLoading: isLoadingNewsletter 
    } = useNewsletter();
    const { currentUserRole } = useTeam();
    const { toast } = useToast();
    
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<any>(null);
    const [newGroupName, setNewGroupName] = useState('');

    const handleOpenGroupModal = (group) => {
        setSelectedGroup(group);
        setIsGroupModalOpen(true);
    };

    const handleUpdateGroup = async (groupName: string, memberIds: string[]) => {
        const groupToUpdate = groups.find(g => g.name === groupName);
        if (groupToUpdate) {
            const memberIdStrings = memberIds.map(id => String(id));
            await updateGroup(groupToUpdate.id!, { ...groupToUpdate, memberIds: memberIdStrings });
        }
        setIsGroupModalOpen(false);
    };

    const handleDeleteGroup = async (groupName: string) => {
        const groupToDelete = groups.find(g => g.name === groupName);
        if (groupToDelete) {
           await deleteGroup(groupToDelete.id!);
        }
        setIsGroupModalOpen(false);
    }
    
    const handleAddGroup = () => {
        if (newGroupName.trim() && !groups.some(g => g.name === newGroupName)) {
            addGroup(newGroupName.trim());
            setNewGroupName('');
        }
    }
    
    const handleSendSuccess = async (data: {recipients: {email: string}[], subject: string}) => {
         await addCampaign({
            subject: data.subject,
            sentAt: new Date().toISOString(),
            recipients: data.recipients.length,
            openRate: 0, // This would be tracked by an email service
        });
    }

    const isLoading = isLoadingMembers || isLoadingNewsletter;

    const pageTitle = currentUserRole === 'Super-Admin' ? 'SaaS Newsletter' : 'Vereins-Newsletter';
    const pageDescription = currentUserRole === 'Super-Admin'
        ? 'Verwalten Sie hier die globale Kommunikation für alle Amigoal-Nutzer.'
        : 'Verwalten Sie hier die Kommunikation mit Ihren Vereinsmitgliedern.';
    
    const recipients = useMemo(() => {
        if (currentUserRole === 'Super-Admin') {
            // In a real app, this would be a list of all platform user admins
            // For now, let's use a subset of members for demonstration
            return members.filter(m => m.role === 'Club-Admin' || m.role === 'Trainer');
        }
        return members;
    }, [members, currentUserRole]);

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">{pageTitle}</h1>
                        <p className="text-muted-foreground">{pageDescription}</p>
                    </div>
                    <Button onClick={() => setIsEmailModalOpen(true)}>
                        <Send className="mr-2 h-4 w-4" /> Neuen Newsletter versenden
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <Card>
                        <CardHeader>
                            <CardTitle>Empfänger-Gruppen</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center gap-2 mb-4">
                                <Input 
                                    placeholder="Neue Gruppe..." 
                                    value={newGroupName} 
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
                                />
                                <Button onClick={handleAddGroup}><PlusCircle className="mr-2 h-4 w-4"/> Hinzufügen</Button>
                            </div>
                            {isLoading ? <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin" /></div> : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Gruppe</TableHead>
                                            <TableHead>Abonnenten</TableHead>
                                            <TableHead className="text-right">Aktionen</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {groups.map(group => (
                                            <TableRow key={group.id}>
                                                <TableCell className="font-semibold">{group.name}</TableCell>
                                                <TableCell>{group.memberIds?.length || 0}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenGroupModal(group)}>
                                                        <Users className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Vergangene Kampagnen</CardTitle>
                        </CardHeader>
                         <CardContent>
                             {isLoading ? <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin" /></div> : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Betreff</TableHead>
                                            <TableHead>Öffnungsrate</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {campaigns.map(campaign => (
                                            <TableRow key={campaign.id}>
                                                <TableCell>
                                                    <p className="font-semibold">{campaign.subject}</p>
                                                    <p className="text-xs text-muted-foreground">Gesendet: {new Date(campaign.sentAt).toLocaleDateString('de-CH')}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={campaign.openRate > 80 ? 'default' : 'secondary'} className={campaign.openRate > 80 ? 'bg-green-500' : ''}>
                                                        {campaign.openRate}%
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            <EmailComposerModal 
                isOpen={isEmailModalOpen} 
                onOpenChange={setIsEmailModalOpen} 
                recipients={recipients}
                onSendSuccess={(data) => addCampaign({subject: data.subject, recipients: data.recipients.length, openRate: 0, sentAt: new Date().toISOString()})}
            />
            {selectedGroup && (
                <GroupDetailModal 
                    group={selectedGroup}
                    allSubscribers={members}
                    isOpen={isGroupModalOpen}
                    onOpenChange={setIsGroupModalOpen}
                    onUpdateGroup={handleUpdateGroup}
                    onDeleteGroup={handleDeleteGroup}
                />
            )}
        </>
    );
}
