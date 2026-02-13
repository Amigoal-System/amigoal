
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Building, List, LayoutGrid } from 'lucide-react';
import { useFacilities } from '@/hooks/useCamps';
import { EditFacilityModal } from '@/components/ui/edit-facility-modal';
import type { SportsFacility } from '@/ai/flows/providers.types';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export default function ProviderFacilitiesPage() {
    const { facilities, addFacility, updateFacility, deleteFacility, isLoading: isLoadingFacilities } = useFacilities();
    const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
    const [editingFacility, setEditingFacility] = useState<SportsFacility | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const handleOpenFacilityModal = (facility: SportsFacility | null = null) => {
        setEditingFacility(facility);
        setIsFacilityModalOpen(true);
    };

    const handleSaveFacility = (facilityData: SportsFacility) => {
        if (facilityData.id) {
            updateFacility(facilityData);
        } else {
            addFacility(facilityData);
        }
        setIsFacilityModalOpen(false);
    };

    const handleDeleteFacility = (facilityId: string) => {
        deleteFacility(facilityId);
        setIsFacilityModalOpen(false);
    };

    if (isLoadingFacilities) {
        return <div>Lade Anlagen...</div>;
    }
    
    const FacilityGridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities.map(facility => (
                <Card key={facility.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpenFacilityModal(facility)}>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Building className="h-5 w-5 text-primary"/>
                            {facility.name}
                        </CardTitle>
                        <CardDescription>{facility.location}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Badge variant={facility.owner === 'Eigenbesitz' ? 'default' : 'secondary'}>
                            {facility.owner}
                        </Badge>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
    
    const FacilityListView = () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Ort</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Plätze</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {facilities.map(facility => (
                    <TableRow key={facility.id} className="cursor-pointer" onClick={() => handleOpenFacilityModal(facility)}>
                        <TableCell className="font-medium">{facility.name}</TableCell>
                        <TableCell>{facility.location}</TableCell>
                        <TableCell>
                            <Badge variant={facility.owner === 'Eigenbesitz' ? 'default' : 'secondary'}>
                                {facility.owner}
                            </Badge>
                        </TableCell>
                         <TableCell>
                            {facility.pitchDetails ? 
                                `${facility.pitchDetails.naturalGrass || 0} Natur, ${facility.pitchDetails.artificialGrass || 0} Kunst, ${facility.pitchDetails.smallPitches || 0} Klein` 
                                : 'N/A'
                            }
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Anlagen & Ressourcen</h1>
                        <p className="text-muted-foreground">Verwalten Sie hier Ihre Sportanlagen, die Sie für Camps anbieten.</p>
                    </div>
                     <div className="flex items-center gap-2">
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={viewMode === 'grid' ? 'default': 'ghost'} size="icon" onClick={() => setViewMode('grid')}>
                                        <LayoutGrid className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Gitteransicht</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={viewMode === 'list' ? 'default': 'ghost'} size="icon" onClick={() => setViewMode('list')}>
                                        <List className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Listenansicht</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Button onClick={() => handleOpenFacilityModal()}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Anlage hinzufügen
                        </Button>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Meine Sportanlagen</CardTitle>
                        <CardDescription>Klicken Sie auf eine Anlage, um die Details zu sehen und zu bearbeiten.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingFacilities ? <p>Lade Anlagen...</p> : (
                            viewMode === 'grid' ? <FacilityGridView /> : <FacilityListView />
                        )}
                    </CardContent>
                </Card>
            </div>

            <EditFacilityModal
                isOpen={isFacilityModalOpen}
                onOpenChange={setIsFacilityModalOpen}
                facility={editingFacility}
                onSave={handleSaveFacility}
                onDelete={handleDeleteFacility}
            />
        </>
    );
}
