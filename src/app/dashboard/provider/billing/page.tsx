
'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, TrendingUp, TrendingDown, BookOpen } from 'lucide-react';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer, Bar, BarChart as RechartsBarChart } from "recharts";
import { useCamps } from '@/hooks/useCamps';
import { useTeam } from '@/hooks/use-team';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const chartConfig = {
  revenue: {
    label: "Umsatz",
    color: "hsl(var(--chart-1))",
  },
  commission: {
    label: "Kommission",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;


const StatCard = ({ title, value, description, icon: Icon }) => (
    <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

export default function ProviderBillingPage() {
    const { userName } = useTeam();
    const { camps, isLoading } = useCamps('bootcamp', 'provider');
    
    const financialData = useMemo(() => {
        if (isLoading || !camps || camps.length === 0) {
            return {
                totalRevenue: 0,
                amigoalCommission: 0,
                netBalance: 0,
                totalParticipants: 0,
                topBootcamps: [],
                transactions: [],
                monthlyData: [],
            };
        }

        let totalRevenue = 0;
        let totalParticipants = 0;
        const transactions: any[] = [];
        const monthlyDataMap = new Map();

        camps.forEach(camp => {
            const priceString = camp.offer?.price || '0';
            const pricePerPerson = parseFloat(priceString.replace(/[^0-9.-]+/g,"").replace(",","."));
            const participantsCount = camp.registrations?.length || 0;
            const campRevenue = pricePerPerson * participantsCount;
            
            if (campRevenue > 0) {
                totalRevenue += campRevenue;
                totalParticipants += participantsCount;

                const transactionDate = camp.dateRange?.from ? new Date(camp.dateRange.from) : new Date();
                const monthKey = format(transactionDate, 'yyyy-MM');

                const incomeTx = {
                    id: `inc-${camp.id}`,
                    date: transactionDate,
                    description: `Einnahmen: ${camp.name}`,
                    amount: campRevenue,
                    type: 'Einnahme'
                };
                transactions.push(incomeTx);
                
                const currentMonthData = monthlyDataMap.get(monthKey) || { month: format(transactionDate, 'MMM'), revenue: 0, commission: 0 };
                currentMonthData.revenue += campRevenue;
                
                // Assuming a 5% commission for Amigoal
                const commission = campRevenue * 0.05;
                const commissionTx = {
                    id: `com-${camp.id}`,
                    date: transactionDate,
                    description: `Amigoal Kommission (5%)`,
                    amount: -commission,
                    type: 'Ausgabe'
                };
                transactions.push(commissionTx);
                currentMonthData.commission += commission;

                monthlyDataMap.set(monthKey, currentMonthData);
            }
        });
        
        const amigoalCommission = transactions.filter(t => t.type === 'Ausgabe').reduce((sum, t) => sum + t.amount, 0);

        return {
            totalRevenue,
            amigoalCommission: Math.abs(amigoalCommission),
            netBalance: totalRevenue + amigoalCommission,
            totalParticipants,
            topBootcamps: [...camps].sort((a,b) => (b.registrations?.length || 0) - (a.registrations?.length || 0)).slice(0, 3),
            transactions: transactions.sort((a,b) => b.date.getTime() - a.date.getTime()),
            monthlyData: Array.from(monthlyDataMap.values()),
        };

    }, [camps, isLoading]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-4">Lade Finanzdaten...</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline">Finanz-Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Gesamtumsatz" value={`CHF ${financialData.totalRevenue.toFixed(2)}`} description="Brutto-Einnahmen" icon={DollarSign} />
                <StatCard title="Amigoal Kommission" value={`CHF ${financialData.amigoalCommission.toFixed(2)}`} description="5% Plattformgebühr" icon={TrendingDown} />
                <StatCard title="Netto-Saldo" value={`CHF ${financialData.netBalance.toFixed(2)}`} description="Ihr aktuelles Guthaben" icon={TrendingUp} />
                <StatCard title="Teilnehmer Total" value={financialData.totalParticipants.toString()} description="In allen Ihren Camps" icon={Users} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Umsatzentwicklung</CardTitle>
                        <CardDescription>Monatliche Einnahmen und abgeführte Kommissionen.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={chartConfig} className="h-[250px] w-full">
                            <RechartsBarChart data={financialData.monthlyData}>
                               <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => value}
                                />
                               <ChartTooltip content={<ChartTooltipContent />} />
                               <ChartLegend content={<ChartLegendContent />} />
                               <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                               <Bar dataKey="commission" fill="var(--color-commission)" radius={4} />
                            </RechartsBarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Top Bootcamps</CardTitle>
                        <CardDescription>Ihre beliebtesten Camps nach Teilnehmerzahl.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {financialData.topBootcamps.map(camp => (
                            <div key={camp.id} className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{camp.name}</p>
                                    <p className="text-sm text-muted-foreground">{camp.location}</p>
                                </div>
                                <div className="flex items-center gap-2 text-lg font-bold">
                                    <Users className="h-5 w-5"/>
                                    {camp.registrations?.length || 0}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Transaktionsprotokoll</CardTitle>
                    <CardDescription>Detaillierte Liste aller Ein- und Ausgänge.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Datum</TableHead>
                                <TableHead>Beschreibung</TableHead>
                                <TableHead className="text-right">Betrag</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {financialData.transactions.map(tx => (
                                <TableRow key={tx.id}>
                                    <TableCell>{tx.date.toLocaleDateString('de-CH')}</TableCell>
                                    <TableCell>{tx.description}</TableCell>
                                    <TableCell className={`text-right font-medium ${tx.type === 'Einnahme' ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.type === 'Einnahme' ? '+' : ''} CHF {tx.amount.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

