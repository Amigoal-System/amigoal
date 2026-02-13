
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Building, UserPlus, Inbox, ArrowRight } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { getAllClubs } from '@/ai/flows/clubs';
import type { Club } from '@/ai/flows/clubs.types';
import { useToast } from '@/hooks/use-toast';
import { LeadDetailModal } from '@/components/LeadDetailModal';

const newLeadsData = [
    { name: 'FC Unterstrass', status: 'Interessent', contact: 'Peter Keller' },
    { name: 'FC Red Star ZH', status: 'Kontaktiert', contact: 'Erika Schmid' },
    { name: 'FC Blue Stars', status: 'Verhandlung', contact: 'Max Fischer' },
];

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


export function MarketingDashboard() {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    
    useEffect(() => {
        const fetchClubs = async () => {
            setIsLoading(true);
            try {
                const fetchedClubs = await getAllClubs();
                setClubs(fetchedClubs);
            } catch (error) {
                console.error("Failed to fetch clubs:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchClubs();
    }, []);

    return (
        <div className="space-y-6">
             <h1 className="text-3xl font-bold font-headline">Marketing & Sales Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <StatCard title="Aktive Vereine" value={isLoading ? '...' : clubs.length} icon={Building} description="Total auf der Plattform" href="/dashboard/clubs" lang={params.lang} />
                <StatCard title="Neue Leads" value={newLeadsData.length} icon={UserPlus} description="Anfragen von neuen Vereinen" href="/dashboard/leads" lang={params.lang} />
                <StatCard title="Referral-Programm" value="15 Partner" icon={Inbox} description="+2 diese Woche" href="/dashboard/referrals" lang={params.lang} />
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle>Aktuelle Leads</CardTitle>
                    <CardDescription>Die heissesten potenziellen Neukunden.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Verein</TableHead>
                                <TableHead>Kontaktperson</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {newLeadsData.map((lead, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">{lead.name}</TableCell>
                                    <TableCell>{lead.contact}</TableCell>
                                    <TableCell><Badge variant="secondary">{lead.status}</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <Link href={`/${params.lang}/dashboard/leads`} className="w-full">
                        <Button variant="outline" className="w-full">Zum Lead Management <ArrowRight className="ml-2 h-4 w-4"/></Button>
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}

export default MarketingDashboard;

    