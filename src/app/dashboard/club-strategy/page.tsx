
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, PlusCircle, Trash2, Target, Eye, Handshake, Shield, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useClub } from '@/hooks/useClub';
import { updateClub } from '@/ai/flows/clubs';
import type { Club } from '@/ai/flows/clubs.types';

const GoalCard = ({ icon, title, description, onEdit }) => (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                {icon}
                <CardTitle>{title}</CardTitle>
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">{description}</p>
        </CardContent>
        <CardFooter>
            <Button variant="outline" size="sm" onClick={onEdit}><Edit className="mr-2 h-4 w-4"/> Bearbeiten</Button>
        </CardFooter>
    </Card>
);

interface Goal {
    id: string;
    title: string;
    description: string;
    kpi: string; // Key Performance Indicator
}

interface Strategy {
    vision: string;
    mission: string;
    values: string[];
    goals: Goal[];
}

const defaultStrategy: Strategy = {
    vision: 'Ein führender Ausbildungsverein in der Region zu sein, der für seine exzellente Jugendarbeit und seine starke Gemeinschaft bekannt ist.',
    mission: 'Wir fördern Talente auf und neben dem Platz, vermitteln Werte wie Fairplay und Respekt, und schaffen ein positives und integratives Umfeld für alle unsere Mitglieder.',
    values: ['Teamgeist', 'Respekt', 'Leidenschaft', 'Entwicklung', 'Integrität'],
    goals: [
        { id: 'goal1', title: "Nachwuchsförderung", description: "Anzahl Junioren um 15% steigern.", kpi: 'Anzahl Junioren' },
        { id: 'goal2', title: "Finanzielle Stabilität", description: "Sponsoring-Einnahmen um 20% erhöhen.", kpi: 'Sponsoring CHF' },
        { id: 'goal3', title: "Sportlicher Erfolg", description: "Aufstieg der 1. Mannschaft in die 2. Liga.", kpi: 'Tabellenplatz 1. Mannschaft' },
        { id: 'goal4', title: "Infrastruktur", description: "Planung für den neuen Kunstrasenplatz abschliessen.", kpi: 'Projektstatus Kunstrasen' },
    ],
};


export default function ClubStrategyPage() {
    const { club, isLoading: isLoadingClub, refetchClub } = useClub();
    const [strategy, setStrategy] = useState<Strategy>(defaultStrategy);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (club) {
            setStrategy(club.strategy || defaultStrategy);
            setIsLoading(false);
        } else if (!isLoadingClub) {
             setIsLoading(false); // Stop loading if club is not found
        }
    }, [club, isLoadingClub]);

    const handleSave = async () => {
        if (!club) return;
        setIsLoading(true);
        try {
            const updatedClub = { ...club, strategy };
            await updateClub(updatedClub as Club);
            await refetchClub();
            toast({ title: 'Strategie gespeichert!' });
            setIsEditing(false);
        } catch (error) {
            toast({ title: 'Fehler beim Speichern', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };
    
    if (isLoadingClub || isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin h-8 w-8"/></div>
    }

    if (!club) {
         return (
             <Card>
                <CardHeader>
                    <CardTitle>Fehler</CardTitle>
                    <CardDescription>
                        Die Vereinsstrategie konnte nicht geladen werden, da kein Verein zugeordnet ist.
                    </CardDescription>
                </CardHeader>
            </Card>
         )
    }

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Vereinsstrategie</h1>
                    <p className="text-muted-foreground">Definieren und verfolgen Sie die langfristigen Ziele Ihres Vereins.</p>
                </div>
                {isEditing ? (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Abbrechen</Button>
                        <Button onClick={handleSave} disabled={isLoading}>
                            <Save className="mr-2 h-4 w-4"/> Änderungen speichern
                        </Button>
                    </div>
                ) : (
                    <Button onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4"/> Strategie bearbeiten
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5 text-primary"/>Unsere Vision</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isEditing ? (
                            <Textarea value={strategy.vision} onChange={(e) => setStrategy(s => ({...s, vision: e.target.value}))} rows={4} />
                        ) : (
                            <p className="text-muted-foreground italic">"{strategy.vision || 'Noch keine Vision definiert.'}"</p>
                        )}
                    </CardContent>
                </Card>
                 <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Handshake className="h-5 w-5 text-primary"/>Unsere Mission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isEditing ? (
                            <Textarea value={strategy.mission} onChange={(e) => setStrategy(s => ({...s, mission: e.target.value}))} rows={4} />
                        ) : (
                            <p className="text-muted-foreground">{strategy.mission || 'Noch keine Mission definiert.'}</p>
                        )}
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary"/>Unsere Werte</CardTitle>
                </CardHeader>
                 <CardContent>
                    {isEditing ? (
                        <Textarea 
                            value={strategy.values?.join('\\n') || ''} 
                            onChange={(e) => setStrategy(s => ({...s, values: e.target.value.split('\\n')}))}
                            placeholder="Ein Wert pro Zeile..."
                            rows={5}
                        />
                    ) : (
                        <ul className="list-disc list-inside space-y-1">
                           {strategy.values?.map((value, i) => <li key={i}>{value}</li>)}
                        </ul>
                    )}
                 </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary"/>Strategische Ziele 2024/2025</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {strategy.goals?.map((goal, i) => {
                       const icons = [<Users/>, <DollarSign/>, <Trophy/>, <Building/>];
                       return <GoalCard key={goal.id} icon={icons[i % icons.length]} title={goal.title} description={goal.description} onEdit={() => {}}/>
                   })}
                </CardContent>
                {isEditing && (
                    <CardFooter>
                        <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4"/> Neues Ziel definieren</Button>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
}
