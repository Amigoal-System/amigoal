'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Globe, List, LayoutGrid } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AmigoalLogo } from '@/components/icons';
import { getAllClubs } from '@/ai/flows/clubs';
import type { Club } from '@/ai/flows/clubs.types';

const saasWebsite = { id: 0, name: 'Amigoal SaaS', hasWebsite: true, url: 'amigoal.app', template: 'Modern', logo: null };

export default function SuperAdminWebsitePage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('grid');

  useEffect(() => {
    const fetchClubs = async () => {
        setIsLoading(true);
        try {
            const fetchedClubs = await getAllClubs({ includeArchived: true });
            setClubs(fetchedClubs.filter(club => club.hasWebsite));
        } catch (error) {
            console.error("Failed to fetch clubs:", error);
            // In a real app, you'd probably want to show a toast message here
        } finally {
            setIsLoading(false);
        }
    };

    fetchClubs();
  }, []);

  const ClubGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {clubs.map((club) => (
            <Card key={club.id}>
                <CardContent className="flex flex-col items-center text-center p-6">
                    {club.logo ? (
                        <Image src={club.logo} alt={`${club.name} Logo`} width={64} height={64} className="rounded-full mb-4" />
                    ) : (
                        <AmigoalLogo className="w-16 h-16 text-primary mb-4" />
                    )}
                    <h3 className="font-semibold">{club.name}</h3>
                    {club.hasWebsite ? (
                        <>
                            <p className="text-xs text-green-600 mt-1">Webseite Aktiv</p>
                             <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Badge variant={club.websiteManagedBy === 'Amigoal' ? 'default' : 'secondary'} className="text-xs">
                                    Verwaltet von: {club.websiteManagedBy}
                                </Badge>
                             </div>
                            <a href={`https://${club.url}`} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:underline">{club.url}</a>
                        </>
                    ) : (
                        <p className="text-xs text-red-600 mt-1">Keine Webseite</p>
                    )}
                </CardContent>
                <CardFooter>
                    {club.hasWebsite ? (
                        <Button variant="outline" className="w-full gap-2" asChild>
                             <Link href={`/de/dashboard/website/builder?club=${club.subdomain}`}>
                                <Edit className="h-4 w-4" /> Bearbeiten
                            </Link>
                        </Button>
                    ) : (
                         <Button className="w-full gap-2" asChild>
                            <Link href={`/de/dashboard/website/builder?club=${club.subdomain}`}>
                                <PlusCircle className="h-4 w-4" /> Erstellen
                            </Link>
                        </Button>
                    )}
                </CardFooter>
            </Card>
        ))}
    </div>
  );

  const ClubListView = () => (
    <Card>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Club</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Verwaltet von</TableHead>
                    <TableHead className="text-right">Aktion</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {clubs.map((club) => (
                    <TableRow key={club.id}>
                        <TableCell className="font-medium flex items-center gap-3">
                            {club.logo ? (
                                <Image src={club.logo} alt={`${club.name} Logo`} width={32} height={32} className="rounded-full" />
                            ) : (
                                <AmigoalLogo className="w-8 h-8" />
                            )}
                            {club.name}
                        </TableCell>
                        <TableCell>
                            {club.hasWebsite ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Aktiv</Badge>
                            ) : (
                                <Badge variant="destructive">Inaktiv</Badge>
                            )}
                        </TableCell>
                        <TableCell>
                            {club.url ? (
                                <a href={`https://${club.url}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                    <Globe className="h-3 w-3" />
                                    {club.url}
                                </a>
                            ) : '-'}
                        </TableCell>
                        <TableCell>
                            <Badge variant={club.websiteManagedBy === 'Amigoal' ? 'default' : 'secondary'}>
                                {club.websiteManagedBy}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                             {club.hasWebsite ? (
                                <Button variant="outline" size="sm" className="gap-2" asChild>
                                    <Link href={`/de/dashboard/website/builder?club=${club.subdomain}`}>
                                        <Edit className="h-4 w-4" /> Bearbeiten
                                    </Link>
                                </Button>
                            ) : (
                                <Button size="sm" className="gap-2" asChild>
                                    <Link href={`/de/dashboard/website/builder?club=${club.subdomain}`}>
                                        <PlusCircle className="h-4 w-4" /> Erstellen
                                    </Link>
                                </Button>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </Card>
  );

    return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">Webseiten Management</h1>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>SaaS-Webseite</CardTitle>
                <CardDescription>Verwalten Sie die Haupt-Webseite der Amigoal-Plattform.</CardDescription>
            </CardHeader>
            <CardContent>
                <Card>
                    <CardContent className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-4">
                            <AmigoalLogo className="w-16 h-16" />
                            <div>
                                <h3 className="text-xl font-bold">{saasWebsite.name}</h3>
                                <a href={`https://${saasWebsite.url}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                    <Globe className="h-4 w-4" />
                                    {saasWebsite.url}
                                </a>
                            </div>
                        </div>
                        <Button variant="outline" className="gap-2" asChild>
                            <Link href="/de/dashboard/saas-website-builder">
                                <Edit className="h-4 w-4" /> Inhalte bearbeiten
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>


        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Vereins-Webseiten</CardTitle>
                        <CardDescription>
                            Verwalten Sie die Webseiten Ihrer Vereine.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={view === 'list' ? 'default': 'ghost'} size="icon" onClick={() => setView('list')}>
                                        <List className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Listenansicht</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant={view === 'grid' ? 'default': 'ghost'} size="icon" onClick={() => setView('grid')}>
                                        <LayoutGrid className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Gitteransicht</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <p>Lade Vereine...</p>
                ) : (
                    view === 'grid' ? <ClubGridView /> : <ClubListView />
                )}
            </CardContent>
        </Card>
    </div>
    )
}
