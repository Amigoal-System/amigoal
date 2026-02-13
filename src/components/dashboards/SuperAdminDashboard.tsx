
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Building, UserPlus, Inbox, ArrowRight, CheckCircle, BarChart, Users, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { type Locale } from '@/../i18n.config';
import { getAllClubs } from '@/ai/flows/clubs';
import type { Club } from '@/ai/flows/clubs.types';
import { useLeads } from '@/hooks/useLeads';
import type { Lead } from '@/ai/flows/leads.types';
import { useWaitlist } from '@/hooks/useWaitlist';
import type { WaitlistPlayer } from '@/ai/flows/waitlist.types';
import { LeadDetailModal } from '@/components/LeadDetailModal';
import { PlayerPlacementModal } from '../PlayerPlacementModal';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartXAxis,
  ChartYAxis
} from "@/components/ui/chart"
import { Bar, BarChart as RechartsBarChart, PieChart, Pie, Sector, Cell } from "recharts"
import { startOfMonth, subMonths, isWithinInterval, endOfMonth, format } from 'date-fns';
import { ChartPieInteractive } from '../ui/chart-pie-interactive';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { getConfiguration } from '@/ai/flows/configurations';
import type { SaasPackage } from '@/ai/flows/configurations.types';
import { getAllMembers } from '@/ai/flows/members';
import type { Member } from '@/ai/flows/members.types';
import { getAllProspects, deleteProspect } from '@/ai/flows/prospects';
import type { Prospect } from '@/ai/flows/prospects.types';

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

const platformChartConfig = {
    activeClubs: {
        label: "Aktive Vereine",
        color: "hsl(var(--chart-2))",
    },
    newSignups: {
        label: "Neuanmeldungen",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;


export function SuperAdminDashboard() {
    const params = useParams();
    const { toast } = useToast();
    const { leads, addLead, updateLead, deleteLead, isLoading: isLoadingLeads, refetchLeads } = useLeads();
    const { waitlist, isLoading: isLoadingWaitlist } = useWaitlist();
    
    const [clubs, setClubs] = useState<Club[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [saasPackages, setSaaSPackages] = useState<SaasPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
    const [selectedProspect, setSelectedProspect] = useState<Partial<Lead> | null>(null);
    const [isPlacementModalOpen, setIsPlacementModalOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<WaitlistPlayer | null>(null);
    const [websiteProspects, setWebsiteProspects] = useState<Prospect[]>([]);

    const newLeads = useMemo(() => leads.filter(l => l.status === 'Interessent'), [leads]);

    const fetchAllData = async () => {
         setIsLoading(true);
         try {
            const [fetchedClubs, config, allMembers, fetchedProspects] = await Promise.all([
                getAllClubs({ includeArchived: true }),
                getConfiguration(),
                getAllMembers('*'),
                getAllProspects(),
            ]);
            setClubs(fetchedClubs);
            setSaaSPackages(config?.saasPackages || []);
            setMembers(allMembers);
            setWebsiteProspects(fetchedProspects);
         } catch(e) {
             console.error(e);
         } finally {
             setIsLoading(false);
         }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const platformStatsData = useMemo(() => {
        const now = new Date();
        const stats = [];
        for (let i = 5; i >= 0; i--) {
            const date = subMonths(now, i);
            const monthStart = startOfMonth(date);
            const monthEnd = endOfMonth(date);
            
            const newSignups = clubs.filter(c => {
                if (!c.createdAt) return false;
                const createdAtDate = new Date(c.createdAt);
                return isWithinInterval(createdAtDate, { start: monthStart, end: monthEnd });
            }).length;
            
            const activeClubs = clubs.filter(c => c.status === 'active' && c.createdAt && new Date(c.createdAt) <= monthEnd).length;

            stats.push({
                month: format(date, 'MMM'),
                activeClubs,
                newSignups,
            });
        }
        return stats;
    }, [clubs]);

    const clubSizeData = useMemo(() => {
        const clubMemberCounts: { [clubId: string]: number } = {};
        members.forEach(member => {
            if (member.clubId) {
                clubMemberCounts[member.clubId] = (clubMemberCounts[member.clubId] || 0) + 1;
            }
        });

        let smallClubs = 0, mediumClubs = 0, largeClubs = 0;
        clubs.forEach(club => {
            const count = clubMemberCounts[club.id!] || 0;
            if (count < 200) smallClubs++;
            else if (count <= 500) mediumClubs++;
            else largeClubs++;
        });
        
        return [
            { type: "Klein (<200)", value: smallClubs, color: "hsl(48 96% 56%)" },
            { type: "Mittel (200-500)", value: mediumClubs, color: "hsl(217 89% 61%)" },
            { type: "Gross (>500)", value: largeClubs, color: "hsl(0 84% 60%)" },
        ];
    }, [clubs, members]);


    const clubSizeConfig = {
        value: {
            label: "Vereine",
        },
        "Klein (<200)": { label: "Klein (<200)", color: "hsl(48 96% 56%)" },
        "Mittel (200-500)": { label: "Mittel (200-500)", color: "hsl(217 89% 61%)" },
        "Gross (>500)": { label: "Gross (>500)", color: "hsl(0 84% 60%)" },
    } satisfies ChartConfig;
    
    const monthlyRevenue = useMemo(() => {
        if (!clubs.length || !saasPackages.length) return 0;

        return clubs
            .filter(c => c.status === 'active' && c.paymentStatus === 'Paid')
            .reduce((total, club) => {
                const pkgName = club.package || 'Pro'; // Default to Pro if not specified
                const pkg = saasPackages.find(p => p.name === pkgName || p.id === pkgName);
                if (pkg && pkg.price) {
                    const priceMatch = pkg.price.match(/[\\d.]+/);
                    const price = priceMatch ? parseFloat(priceMatch[0]) : 0;
                    return total + price;
                }
                return total;
            }, 0);
    }, [clubs, saasPackages]);
    
    const handleOpenLeadModal = (prospect) => {
        setSelectedProspect(prospect);
        setIsLeadModalOpen(true);
    };

    const handleConfirmLead = async (leadData) => {
        await addLead(leadData);
        // After confirming, delete the prospect
        if(selectedProspect?.id) {
            await deleteProspect(selectedProspect.id);
            setWebsiteProspects(prev => prev.filter(p => p.id !== selectedProspect.id));
        }
        toast({
            title: "Lead erstellt",
            description: `'${leadData.name}' wurde als Lead erfasst.`,
        });
        setIsLeadModalOpen(false);
        refetchLeads();
    };

    const handleOpenPlacementModal = (player) => {
        setSelectedPlayer(player);
        setIsPlacementModalOpen(true);
    };

    const handleRejectProspect = async (prospectId: string, prospectName: string) => {
        await deleteProspect(prospectId);
        setWebsiteProspects(prev => prev.filter(p => p.id !== prospectId));
        toast({
            title: "Interessent abgelehnt",
            description: `${prospectName} wurde aus der Liste entfernt.`,
            variant: "destructive"
        });
    };

    const isLoadingAll = isLoading || isLoadingLeads || isLoadingWaitlist;

    return (
        <div className="space-y-6">
             <h1 className="text-3xl font-bold font-headline">Super-Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard title="Aktive Vereine" value={isLoading ? '...' : clubs.filter(c => c.status === 'active').length} icon={Building} description="Total auf der Plattform" href="/dashboard/clubs" lang={params.lang} />
                <StatCard title="Benutzer" value={isLoading ? '...' : members.length} icon={Users} description="Gesamtzahl der Mitglieder" href="/dashboard/users" lang={params.lang} />
                <StatCard title="Spieler auf Warteliste" value={isLoadingWaitlist ? '...' : waitlist.length} icon={UserPlus} description="Suchen aktiv einen Club" href="/dashboard/player-placement" lang={params.lang} />
                <StatCard title="Neue Leads" value={isLoadingLeads ? '...' : leads.filter(l => l.status === 'Interessent').length} icon={Inbox} description="Anfragen von neuen Vereinen" href="/dashboard/leads" lang={params.lang} />
                <StatCard title="Umsatz (Monat)" value={`CHF ${monthlyRevenue.toLocaleString('de-CH')}`} icon={Inbox} description="Basierend auf aktiven Abos" href="/dashboard/saas-invoices" lang={params.lang} />
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <ChartPieInteractive
                  data={clubSizeData}
                  chartConfig={clubSizeConfig}
                  title="Vereinsgrösse"
                  description="Verteilung nach Mitgliederzahl"
                  dataKey="value"
                  nameKey="type"
                />

                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Plattform-Wachstum</CardTitle>
                        <CardDescription>Aktive Vereine vs. Neuanmeldungen</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={platformChartConfig} className="h-[250px] w-full">
                           <RechartsBarChart data={platformStatsData} margin={{ left: -20}}>
                                <ChartXAxis dataKey="month" tickLine={false} axisLine={false} />
                                <ChartYAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend />
                                <Bar dataKey="activeClubs" fill="var(--color-activeClubs)" radius={4} />
                                <Bar dataKey="newSignups" fill="var(--color-newSignups)" radius={4} />
                           </RechartsBarChart>
                         </ChartContainer>
                    </CardContent>
                </Card>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Club-Interessenten & Leads</CardTitle>
                        <CardDescription>Potenzielle neue Vereine für die Amigoal-Plattform.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div>
                            <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Neue Leads</h4>
                            <div className="space-y-2">
                                {newLeads.map((lead, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-md cursor-pointer hover:bg-muted" onClick={() => handleOpenLeadModal(lead)}>
                                        <div className="flex items-center gap-3">
                                            <Building className="h-5 w-5 text-muted-foreground"/>
                                            <span className="font-medium">{lead.name}</span>
                                        </div>
                                        <Badge variant="secondary">{lead.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                         <div className="border-t pt-4">
                             <h4 className="font-semibold text-sm mb-2 text-muted-foreground">Neue Interessenten (Club-Anfragen)</h4>
                             <div className="space-y-2">
                                {websiteProspects.map((prospect) => (
                                    <div key={prospect.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                        <div>
                                            <p className="font-medium">{prospect.name}</p>
                                            <p className="text-xs text-muted-foreground">{prospect.contact}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="destructive" onClick={() => handleRejectProspect(prospect.id, prospect.name)}>
                                                <X className="mr-2 h-4 w-4"/> Ablehnen
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleOpenLeadModal(prospect)}>
                                                Als Lead erfassen
                                            </Button>
                                        </div>
                                     </div>
                                ))}
                                {websiteProspects.length === 0 && (
                                    <div className="text-center text-muted-foreground py-4 text-sm">
                                        Keine neuen Club-Interessenten.
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Link href={`/${params.lang}/dashboard/leads`} className="w-full">
                            <Button variant="outline" className="w-full">Zum Lead Management <ArrowRight className="ml-2 h-4 w-4"/></Button>
                        </Link>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Spieler auf Vereinssuche</CardTitle>
                        <CardDescription>Netzwerk-Warteliste von Spielern.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {waitlist.filter(p => p.status === 'new').slice(0, 3).map((player) => (
                            <div key={player.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                <div>
                                    <p className="font-medium">{player.firstName} {player.lastName}</p>
                                    <p className="text-xs text-muted-foreground">Jg. {player.birthYear}</p>
                                </div>
                                <Button size="sm" variant="secondary" onClick={() => handleOpenPlacementModal(player)}>
                                    Vermitteln
                                </Button>
                            </div>
                        ))}
                         {(waitlist.filter(p => p.status === 'new').length === 0 && !isLoadingAll) && (
                            <div className="text-center text-muted-foreground py-4">
                                <Inbox className="mx-auto h-8 w-8 mb-2" />
                                Keine neuen Spieler auf der Warteliste.
                            </div>
                        )}
                         {isLoadingAll && <p>Lade Warteliste...</p>}
                    </CardContent>
                     <CardFooter>
                         <Link href={`/${params.lang}/dashboard/player-placement`} className="w-full">
                            <Button variant="outline" className="w-full">Alle Spieler ansehen <ArrowRight className="ml-2 h-4 w-4"/></Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
            <LeadDetailModal
                lead={selectedProspect}
                isOpen={isLeadModalOpen}
                onOpenChange={setIsLeadModalOpen}
                onSave={handleConfirmLead}
                onDelete={deleteLead}
            />
            <PlayerPlacementModal 
                player={selectedPlayer}
                isOpen={isPlacementModalOpen}
                onOpenChange={setIsPlacementModalOpen}
            />
        </div>
    );
}

export default SuperAdminDashboard;
