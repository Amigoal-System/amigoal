'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { PlusCircle, Users, Calendar, ClipboardList, Check, X, Mail, ArrowRight, Edit, Trash2, List, LayoutGrid } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useTeam } from '@/hooks/use-team';
import { useBootcamps } from '@/hooks/useBootcamps';
import { BootcampModal } from '@/components/ui/bootcamp-modal';
import type { Bootcamp, Registration } from '@/ai/flows/bootcamps.types';
import { updateBootcamp } from '@/ai/flows/bootcamps';
import { useToast } from '@/hooks/use-toast';
import { ViewTaskModal, CreateTaskModal } from '@/components/ViewTaskModal';
import { StaffDetailModal } from '@/components/StaffDetailModal';
import { useStaff } from '@/hooks/useStaff';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useTasks } from '@/hooks/useTasks';
import { ArchivedTasksModal } from '@/components/ArchivedTasksModal';
import { useFacilities } from '@/hooks/useCamps';
import { cn } from '@/lib/utils';


const StatCard = ({ title, value, icon: Icon, description, href, lang }) => (
    <Link href={`/${lang}${href}`} className="block">
        <Card className="hover:bg-muted/50 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    </Link>
);


export default function ProviderDashboard() {
    const { userName, isLoading: isTeamLoading, lang } = useTeam();
    const providerName = userName;

    const { camps, addCamp, updateCamp, isLoading: isCampsLoading, refetchBootcamps } = useBootcamps('bootcamp', providerName);
    const { staff, addStaff, updateStaff, deleteStaff, isLoading: isLoadingStaff, fetchStaff } = useStaff(userName);
    const { tasks, archivedTasks, addTask, archiveTask, unarchiveTask } = useTasks(userName);
    
    const { toast } = useToast();

    const [isBootcampModalOpen, setIsBootcampModalOpen] = useState(false);
    const [selectedBootcamp, setSelectedBootcamp] = useState<Bootcamp | null>(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
    const [isArchivedTasksModalOpen, setIsArchivedTasksModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const router = useRouter();


    const stats = useMemo(() => {
        if (!camps) return { running: 0, newRegistrations: 0, openTasks: 0 };
        const running = camps.filter(c => c.status === 'In Durchführung' || c.status === 'Online').length;
        const newRegistrations = camps.reduce((acc, camp) => {
            return acc + (camp.registrations?.filter(r => r.status === 'pending').length || 0);
        }, 0);
        return {
            running,
            newRegistrations,
            openTasks: tasks.length,
        };
    }, [camps, tasks]);

    const handleOpenBootcampModal = (bootcamp: Bootcamp | null = null, defaultTab: string = 'details') => {
        setSelectedBootcamp({...bootcamp, defaultTab });
        setIsBootcampModalOpen(true);
    };

    const handleSaveBootcamp = async (bootcampData: any) => {
        if (bootcampData.id) {
            await updateCamp(bootcampData);
        } else {
            await addCamp({ ...bootcampData, source: userName });
        }
        setIsBootcampModalOpen(false);
    };
    
    const handleTaskCompleted = (taskId) => {
        archiveTask(taskId);
        toast({ title: 'Aufgabe erledigt!' });
    };
    
    if (isTeamLoading || (userName && isCampsLoading) || isLoadingStaff) {
        return <div>Lade Dashboard...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Bootcamp-Dashboard</h1>
                    <p className="text-muted-foreground">Willkommen zurück, {userName}!</p>
                </div>
                <Button onClick={() => handleOpenBootcampModal()}>
                    <PlusCircle className="mr-2 h-4 w-4"/> Neues Bootcamp
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Laufende Bootcamps" value={stats.running} icon={Calendar} description="Aktive & geplante Camps" href="/dashboard/bootcamp" lang={lang}/>
                <StatCard title="Neue Anmeldungen" value={stats.newRegistrations} icon={Users} description="Warten auf Bestätigung" href="/dashboard/provider/requests" lang={lang}/>
                <StatCard title="Offene Aufgaben" value={stats.openTasks} icon={ClipboardList} description="Planung & Ausführung" href="/dashboard/tasks" lang={lang}/>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Meine Bootcamps</CardTitle>
                         <div className="flex items-center gap-2">
                            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}><List className="h-4 w-4"/></Button>
                            <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}><LayoutGrid className="h-4 w-4"/></Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {camps.map(camp => (
                                <Card key={camp.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpenBootcampModal(camp)}>
                                    <CardHeader>
                                        <CardTitle className="text-base">{camp.name}</CardTitle>
                                        <CardDescription>{camp.location}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Badge>{camp.status}</Badge>
                                        <p className="text-sm mt-2">{camp.registrations?.length || 0} / {camp.maxParticipants} Teilnehmer</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                         <Table>
                            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>Teilnehmer</TableHead><TableHead>Datum</TableHead><TableHead className="text-right">Aktionen</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {camps.map(camp => (
                                    <TableRow key={camp.id} className="cursor-pointer" onClick={() => handleOpenBootcampModal(camp)}>
                                        <TableCell>{camp.name}</TableCell>
                                        <TableCell><Badge>{camp.status}</Badge></TableCell>
                                        <TableCell>{camp.registrations?.length || 0} / {camp.maxParticipants}</TableCell>
                                        <TableCell>{camp.dateRange?.from ? new Date(camp.dateRange.from).toLocaleDateString('de-CH') : 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" className="mr-2" onClick={(e) => {e.stopPropagation(); handleOpenBootcampModal(camp)}}>Details</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            
            <BootcampModal 
                isOpen={isBootcampModalOpen}
                onOpenChange={setIsBootcampModalOpen}
                bootcamp={selectedBootcamp}
                onSave={handleSaveBootcamp}
                sourceName={userName}
                allStaff={staff}
            />
            <ViewTaskModal task={selectedTask} isOpen={isTaskModalOpen} onOpenChange={setIsTaskModalOpen} onUpdate={()=>{}} />
            <CreateTaskModal isOpen={isCreateTaskModalOpen} onOpenChange={setIsCreateTaskModalOpen} onSave={addTask}/>
            <ArchivedTasksModal isOpen={isArchivedTasksModalOpen} onOpenChange={setIsArchivedTasksModalOpen} archivedTasks={archivedTasks} onUnarchive={unarchiveTask} />
            <StaffDetailModal 
                staffMember={selectedStaff} 
                isOpen={isStaffModalOpen} 
                onOpenChange={setIsStaffModalOpen}
            />
        </div>
    );
}
