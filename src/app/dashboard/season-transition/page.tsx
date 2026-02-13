
'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Stepper, StepperItem, StepperTrigger, StepperIndicator, StepperTitle, StepperSeparator } from '@/components/ui/stepper';
import { Check, DollarSign, Users, ArrowLeft, Loader2, Save } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMembers } from '@/hooks/useMembers';
import { getConfiguration } from '@/ai/flows/configurations';
import type { TeamCategory } from '@/ai/flows/configurations.types';
import { performSeasonTransition } from '@/ai/flows/seasonTransition';
import { useTeams } from '@/hooks/useTeams';

// Helper to determine the next logical category
const getNextCategory = (currentCategoryName: string, allCategories: TeamCategory[]): string => {
    const sortedCategories = [...allCategories].sort((a, b) => a.order - b.order);
    const currentIndex = sortedCategories.findIndex(c => c.name === currentCategoryName);
    if (currentIndex > -1 && currentIndex < sortedCategories.length - 1) {
        // Return the next category in order if it exists
        if(sortedCategories[currentIndex - 1]) {
             return sortedCategories[currentIndex - 1].name;
        }
    }
    // Fallback for highest category or if not found
    return 'Aktive';
};

const Step1 = ({ onComplete }) => (
    <Card>
        <CardHeader>
            <CardTitle>Schritt 1: Finanzabschluss 23/24</CardTitle>
            <CardDescription>Bestätigen Sie, dass alle finanziellen Transaktionen für die ablaufende Saison abgeschlossen sind.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p>Bevor Sie fortfahren, stellen Sie bitte sicher, dass:</p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                <li>Alle Mitgliederbeiträge für die Saison 23/24 verbucht sind.</li>
                <li>Alle Spesen für die Saison 23/24 abgerechnet wurden.</li>
                <li>Der Jahresabschluss vorbereitet oder abgeschlossen ist.</li>
            </ul>
        </CardContent>
        <CardFooter>
            <Button onClick={onComplete}>Finanzabschluss bestätigen & Weiter</Button>
        </CardFooter>
    </Card>
);

const Step2 = ({ onComplete, onBack, teams, setTeams, teamCategories }) => {
    const handlePromotionChange = (teamId, newCategory) => {
        setTeams(currentTeams => currentTeams.map(t => t.id === teamId ? {...t, newCategory} : t));
    };

    const handleActionChange = (teamId, action) => {
        setTeams(currentTeams => currentTeams.map(t => t.id === teamId ? {...t, action} : t));
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Schritt 2: Sportlicher Übergang</CardTitle>
                <CardDescription>Überprüfen und bestätigen Sie die automatische Hochstufung der Mannschaften für die neue Saison 24/25.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mannschaft (23/24)</TableHead>
                            <TableHead>Spieler</TableHead>
                            <TableHead>Alte Kategorie</TableHead>
                            <TableHead>Neue Kategorie (24/25)</TableHead>
                            <TableHead>Aktion</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teams.map(team => (
                            <TableRow key={team.id}>
                                <TableCell className="font-medium">{team.name}</TableCell>
                                <TableCell>{team.playerCount}</TableCell>
                                <TableCell>{team.category}</TableCell>
                                <TableCell>
                                    <Select value={team.newCategory} onValueChange={(val) => handlePromotionChange(team.id, val)}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teamCategories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                            ))}
                                            <SelectItem value="Aktive">Aktive</SelectItem>
                                            <SelectItem value="Aufgelöst">Aufgelöst</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                     <Select value={team.action} onValueChange={(val) => handleActionChange(team.id, val)}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="promote">Übernehmen</SelectItem>
                                            <SelectItem value="archive">Archivieren</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter className="justify-between">
                <Button variant="outline" onClick={onBack}>Zurück</Button>
                <Button onClick={onComplete}>Sportlichen Übergang bestätigen</Button>
            </CardFooter>
        </Card>
    );
};

const Step3 = ({ onBack, teams, onComplete }) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFinish = async () => {
        setIsSubmitting(true);
        try {
            await performSeasonTransition(teams);
            toast({
                title: "Saison 24/25 eröffnet!",
                description: "Die Mannschaften wurden verschoben und die neue Saison ist bereit."
            });
            onComplete();
        } catch (error) {
            console.error("Season transition failed:", error);
            toast({
                title: "Fehler beim Saisonübergang",
                description: "Der Prozess konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Schritt 3: Neue Saison 24/25 eröffnen</CardTitle>
                <CardDescription>Bestätigen Sie die Eröffnung der neuen Saison. Diese Aktion kann nicht rückgängig gemacht werden.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                    <h4 className="font-bold">Letzte Warnung</h4>
                    <p className="text-sm">Mit diesem Schritt werden die Saison-Daten umgestellt. Alle Spieler und Teams werden definitiv der neuen Saison zugewiesen.</p>
                </div>
                <Button className="w-full" size="lg" onClick={handleFinish} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="mr-2 h-4 w-4"/>}
                    Neue Saison eröffnen & Prozess abschliessen
                </Button>
            </CardContent>
             <CardFooter className="justify-start">
                <Button variant="outline" onClick={onBack} disabled={isSubmitting}>Zurück</Button>
            </CardFooter>
        </Card>
    );
};

export default function SeasonTransitionPage() {
    const [step, setStep] = useState(0);
    const { members, isLoading: isLoadingMembers, refetchMembers } = useMembers();
    const { refetchTeams } = useTeams();
    const [teams, setTeams] = useState([]);
    const [teamCategories, setTeamCategories] = useState<TeamCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeData = async () => {
            if (isLoadingMembers) return;
            
            const config = await getConfiguration();
            const categories = config?.teamCategories?.['CH'] || [];
            setTeamCategories(categories);

            const teamsMap = members.reduce((acc, member) => {
                 if (!member.teams || member.teams.length === 0) return acc;
                
                const teamName = member.teams[0]; // Use first team for simplicity
                if (!acc[teamName]) {
                    const categoryName = teamName.startsWith('Junioren') ? `Junioren ${teamName.charAt(9)}` : 'Aktive';
                    acc[teamName] = {
                        id: teamName, // Use name as ID for this purpose
                        name: teamName,
                        playerCount: 0,
                        category: categoryName,
                    };
                }
                acc[teamName].playerCount += 1;
                return acc;
            }, {});

            const aggregatedTeams = Object.values(teamsMap).map(team => ({
                ...team,
                newCategory: getNextCategory(team.category, categories),
                action: 'promote'
            }));
            
            setTeams(aggregatedTeams);
            setIsLoading(false);
        }
        
        initializeData();

    }, [members, isLoadingMembers]);
    
    const handleTransitionComplete = () => {
        // Refetch data for the entire app after transition
        refetchMembers();
        refetchTeams();
        setStep(0); // Reset wizard
    }

    const steps = [
        { label: 'Finanzabschluss', icon: <DollarSign />, content: <Step1 onComplete={() => setStep(1)} /> },
        { label: 'Sportlicher Übergang', icon: <Users />, content: <Step2 onComplete={() => setStep(2)} onBack={() => setStep(0)} teams={teams} setTeams={setTeams} teamCategories={teamCategories} /> },
        { label: 'Saison eröffnen', icon: <Check />, content: <Step3 onBack={() => setStep(1)} teams={teams} onComplete={handleTransitionComplete} /> }
    ];

    if (isLoading) {
        return <div className="flex items-center justify-center gap-2"><Loader2 className="h-6 w-6 animate-spin"/> Lade Mannschaftsdaten...</div>
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Saisonübergang 23/24 → 24/25</CardTitle>
                    <CardDescription>
                       Ein geführter Prozess, um den Übergang von einer Saison zur nächsten zu erleichtern (z.B. Mannschafts-Promotionen).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Stepper value={step} className="mb-8">
                        {steps.map((s, i) => (
                            <React.Fragment key={i}>
                                <StepperItem step={i}>
                                    <StepperTrigger onClick={() => setStep(i)}>
                                        <StepperIndicator>{s.icon}</StepperIndicator>
                                        <div>
                                            <StepperTitle>{s.label}</StepperTitle>
                                        </div>
                                    </StepperTrigger>
                                </StepperItem>
                                {i < steps.length - 1 && <StepperSeparator />}
                            </React.Fragment>
                        ))}
                    </Stepper>
                    <div>
                        {steps[step].content}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
