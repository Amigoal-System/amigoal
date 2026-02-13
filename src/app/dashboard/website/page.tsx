
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Paintbrush, Rocket, Edit, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTeam } from '@/hooks/use-team';
import SuperAdminWebsitePage from '@/components/ui/website/page';
import { useToast } from '@/hooks/use-toast';
import { updateClub } from '@/ai/flows/clubs';
import type { Club } from '@/ai/flows/clubs.types';

const templates = [
  { id: 1, name: 'Modern', description: 'Ein schlankes und professionelles Design, ideal für ambitionierte Clubs.', image: 'https://placehold.co/600x400.png', dataAiHint: 'website template modern' },
  { id: 2, name: 'Classic', description: 'Ein traditionelles Layout, das die Geschichte und das Erbe des Vereins hervorhebt.', image: 'https://placehold.co/600x400.png', dataAiHint: 'website template classic' },
  { id: 3, name: 'Dynamic', description: 'Ein lebendiges und ansprechendes Design, perfekt um Fans zu begeistern.', image: 'https://placehold.co/600x400.png', dataAiHint: 'website template dynamic' },
];

const ClubAdminWebsitePage = () => {
    const { club, setClub } = useTeam(); // Assuming useTeam provides a way to update the club state
    const [isBuilderEnabled, setIsBuilderEnabled] = useState(true);
    const { toast } = useToast();

    if (!club) {
        return <div>Lade Vereinsdaten...</div>;
    }

    const isManagedByAmigoal = club.websiteManagedBy === 'Amigoal';

    const handleManagementChange = async (managedByAmigoal: boolean) => {
        const newStatus = managedByAmigoal ? 'Amigoal' : 'Club';
        
        try {
            const updatedClubData = { ...club, websiteManagedBy: newStatus };
            await updateClub(updatedClubData as Club);
            
            // This assumes useTeam hook has a way to update the context, which might not be the case.
            // A full refetch might be safer. For now, let's update the local state for immediate UI feedback.
            // In a real app, you would refetch or have a more robust state management.
             if(setClub) {
                setClub(updatedClubData as Club);
            }

            toast({
                title: "Verwaltung aktualisiert",
                description: `Die Webseite wird nun von ${newStatus} verwaltet.`,
            });
        } catch (error) {
            toast({
                title: "Fehler",
                description: "Der Status konnte nicht aktualisiert werden.",
                variant: "destructive"
            })
        }
    };


    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Vereins-Webseite</h1>
                {isBuilderEnabled && !isManagedByAmigoal && (
                <Button size="lg" className="gap-2" asChild>
                    <Link href="/dashboard/website/builder">
                        <Rocket className="h-5 w-5" />
                        <span>Launch Website Builder</span>
                    </Link>
                </Button>
                )}
            </div>

            {isManagedByAmigoal && (
                <Card className="border-blue-500 bg-blue-50/50 dark:bg-blue-900/20">
                    <CardHeader>
                        <CardTitle>Webseite wird von Amigoal verwaltet</CardTitle>
                        <CardDescription>
                            Ihre Webseite wird vom Amigoal-Team gepflegt. Für inhaltliche Änderungen kontaktieren Sie bitte unseren Support.
                        </CardDescription>
                    </CardHeader>
                </Card>
            )}

             <Card>
                <CardHeader>
                    <CardTitle>Verwaltung</CardTitle>
                    <CardDescription>
                        Legen Sie fest, wer die Inhalte Ihrer Webseite pflegt.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="management-switch"
                            checked={isManagedByAmigoal}
                            onCheckedChange={handleManagementChange}
                        />
                        <Label htmlFor="management-switch">
                            {isManagedByAmigoal ? 'Webseite wird von Amigoal verwaltet' : 'Webseite wird vom Club verwaltet'}
                        </Label>
                    </div>
                     <p className="text-xs text-muted-foreground mt-2">
                        Wenn Sie die Verwaltung an Amigoal übergeben, wird unser Team die Webseite gemäss Ihren Wünschen pflegen. Der Website-Builder ist dann für Sie deaktiviert.
                    </p>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Website-Vorlagen</CardTitle>
                    <CardDescription>Wählen Sie eine Vorlage als Ausgangspunkt für Ihre neue Club-Website. Sie können sie später vollständig anpassen.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                    <Card key={template.id} className="overflow-hidden">
                        <CardHeader className="p-0">
                        <Image src={template.image} alt={template.name} width={600} height={400} data-ai-hint={template.dataAiHint} />
                        </CardHeader>
                        <CardContent className="p-4">
                        <CardTitle className="text-xl mb-2">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                        </CardContent>
                        <CardFooter>
                        <Button variant="outline" className="w-full gap-2" asChild disabled={isManagedByAmigoal}>
                            <Link href="/dashboard/website/builder">
                                <Paintbrush className="h-4 w-4" />
                                Vorlage auswählen
                            </Link>
                        </Button>
                        </CardFooter>
                    </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}

export default function WebsitePageRouter() {
    const { currentUserRole } = useTeam();

    if (currentUserRole === 'Super-Admin') {
        return <SuperAdminWebsitePage />;
    }

    return <ClubAdminWebsitePage />;
}
