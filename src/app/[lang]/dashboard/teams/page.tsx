'use client';
import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, PlusCircle, ChevronsRight, Settings, Upload } from 'lucide-react';
import { TeamDetailModal } from '@/components/TeamDetailModal';
import { useTeams } from '@/hooks/useTeams';
import { Loader2 } from 'lucide-react';
import { useMembers } from '@/hooks/useMembers';
import { CategoryManagerModal } from '@/components/ui/category-manager-modal';
import { CreateTeamWizard } from '@/components/CreateTeamWizard';
import { useTeam } from '@/hooks/use-team';
import { TeamImportModal } from '@/components/TeamImportModal';

const CategoryCard = ({ categoryName, teams, onTeamClick }) => {
    const totalPlayers = teams.reduce((sum, team) => sum + (team.members || 0), 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>{categoryName}</span>
                    <span className="text-sm font-normal text-muted-foreground flex items-center gap-2">
                        <Users className="h-4 w-4"/> {totalPlayers} Spieler
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {teams.map((team) => (
                    <div key={team.id || team.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer" onClick={() => onTeamClick(team)}>
                        <div>
                            <p className="font-semibold">{team.name}</p>
                            <p className="text-xs text-muted-foreground">{team.trainer}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                             <div className="text-center">
                                <p className="font-bold">{team.members}</p>
                                <p className="text-muted-foreground">Spieler</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold">{team.liga}</p>
                                <p className="text-muted-foreground">Liga</p>
                            </div>
                            <ChevronsRight className="h-5 w-5 text-muted-foreground"/>
                        </div>
                    </div>
                ))}
                 {teams.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Keine Mannschaften in dieser Kategorie.</p>}
            </CardContent>
        </Card>
    );
};


export default function TeamsPage() {
    const { club } = useTeam();
    const { categorizedTeams, isLoading, refetchTeams } = useTeams(club?.id);
    const { members } = useMembers(club?.id);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    
    const handleTeamClick = (teamData) => {
        const teamMembers = members.filter(m => m.teams?.includes(teamData.name));
        const detailedTeamData = {
            ...teamData,
             players: teamMembers.filter(m => m.roles.includes('Spieler')),
             staff: teamMembers.filter(m => m.roles.includes('Trainer') || m.roles.includes('Staff') || m.roles.includes('Board')),
             seasonGoals: [],
             teamEvaluation: [],
             cardsToDiscuss: [],
             expenses: [],
             events: []
        }
        setSelectedTeam(detailedTeamData);
        setIsDetailModalOpen(true);
    }
    
    const handleAddNewTeam = () => {
        setIsWizardOpen(true);
    };
    
    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin"/> Lade Mannschaften...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl font-headline">Mannschaften</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setIsCategoryModalOpen(true)}>
                        <Settings className="mr-2 h-4 w-4" /> Kategorien verwalten
                    </Button>
                    <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" /> Importieren
                    </Button>
                    <Button onClick={handleAddNewTeam}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Neue Mannschaft
                    </Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.keys(categorizedTeams).length > 0 ? (
                    Object.entries(categorizedTeams).map(([categoryName, teams]) => (
                        <CategoryCard key={categoryName} categoryName={categoryName} teams={teams as any[]} onTeamClick={handleTeamClick} />
                    ))
                ) : (
                    <div className="lg:col-span-2 text-center text-muted-foreground py-10">
                        <p>Keine Mannschaften gefunden. Fügen Sie eine neue Mannschaft hinzu, um zu beginnen.</p>
                    </div>
                )}
            </div>

            <TeamDetailModal 
                team={selectedTeam}
                isOpen={isDetailModalOpen}
                onOpenChange={setIsDetailModalOpen}
            />
            <CategoryManagerModal 
                isOpen={isCategoryModalOpen}
                onOpenChange={setIsCategoryModalOpen}
                onUpdate={refetchTeams}
            />
            <CreateTeamWizard
                isOpen={isWizardOpen}
                onOpenChange={setIsWizardOpen}
                onTeamCreated={refetchTeams}
            />
            <TeamImportModal
                isOpen={isImportModalOpen}
                onOpenChange={setIsImportModalOpen}
                onImportSuccess={refetchTeams}
            />
        </div>
    );
}
