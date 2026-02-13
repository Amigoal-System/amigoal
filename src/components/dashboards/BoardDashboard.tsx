

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BarChart, Users, DollarSign, Target, FileText, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type Locale } from '@/../i18n.config';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis } from "recharts"
import { CalendarWithEvents } from '../ui/calendar-with-events';

const financialData = [
  { month: "Jan", revenue: 4000, expenses: 2400 },
  { month: "Feb", revenue: 3000, expenses: 1398 },
  { month: "Mar", revenue: 2000, expenses: 9800 },
  { month: "Apr", revenue: 2780, expenses: 3908 },
  { month: "May", revenue: 1890, expenses: 4800 },
  { month: "Jun", revenue: 2390, expenses: 3800 },
];

const financialConfig = {
  revenue: { label: "Einnahmen", color: "hsl(var(--chart-1))" },
  expenses: { label: "Ausgaben", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

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

const upcomingMeetings = [
    { title: 'Vorstandssitzung Q3', date: '15.08.2024' },
    { title: 'Finanzkommission', date: '22.08.2024' },
    { title: 'Strategie-Workshop 2025', date: '05.09.2024' },
];

export function BoardDashboard() {
    const params = useParams();
    const lang = params.lang as Locale;
    
    const totalRevenue = financialData.reduce((acc, item) => acc + item.revenue, 0);
    const totalExpenses = financialData.reduce((acc, item) => acc + item.expenses, 0);
    const profit = totalRevenue - totalExpenses;

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold font-headline">Vorstands-Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Gesamteinnahmen" value={`CHF ${totalRevenue.toLocaleString('de-CH')}`} icon={DollarSign} description="Saison 24/25" href="/dashboard/invoices" lang={lang} />
                <StatCard title="Gesamtausgaben" value={`CHF ${totalExpenses.toLocaleString('de-CH')}`} icon={DollarSign} description="Saison 24/25" href="/dashboard/expenses" lang={lang} />
                <StatCard title="Ergebnis" value={`CHF ${profit.toLocaleString('de-CH')}`} icon={BarChart} description="Aktuelles Saisonergebnis" href="/dashboard/chart-of-accounts" lang={lang}/>
                <StatCard title="Mitglieder" value="645" icon={Users} description="+15 zum Vorjahr" href="/dashboard/members" lang={lang} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Finanzielle Entwicklung</CardTitle>
                        <CardDescription>Monatliche Einnahmen vs. Ausgaben</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={financialConfig} className="h-[250px] w-full">
                            <RechartsBarChart data={financialData}>
                                <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="#888888" fontSize={12} />
                                <YAxis stroke="#888888" fontSize={12} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                                <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                            </RechartsBarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                <CalendarWithEvents />
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Berichte & Schnellzugriffe</CardTitle>
                    <CardDescription>Schnellzugriff auf wichtige Vereinsbereiche.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button asChild variant="secondary" className="justify-start gap-2 h-12 text-base">
                        <Link href={`/${lang}/dashboard/rules`}><FileText className="h-5 w-5"/>Verhaltenskodex</Link>
                    </Button>
                    <Button asChild variant="secondary" className="justify-start gap-2 h-12 text-base">
                        <Link href={`/${lang}/dashboard/tasks`}><FileText className="h-5 w-5"/>Aufgaben</Link>
                    </Button>
                    <Button asChild variant="secondary" className="justify-start gap-2 h-12 text-base">
                         <Link href={`/${lang}/dashboard/sponsoring`}><FileText className="h-5 w-5"/>Sponsoren</Link>
                    </Button>
                    <Button asChild variant="secondary" className="justify-start gap-2 h-12 text-base">
                         <Link href={`/${lang}/dashboard/club-strategy`}><FileText className="h-5 w-5"/>Vereinsstrategie</Link>
                    </Button>
                     <Button asChild variant="secondary" className="justify-start gap-2 h-12 text-base">
                         <Link href={`/${lang}/dashboard/highlights`}><FileText className="h-5 w-5"/>Highlights</Link>
                    </Button>
                     <Button asChild variant="secondary" className="justify-start gap-2 h-12 text-base">
                         <Link href={`/${lang}/dashboard/scouting`}><FileText className="h-5 w-5"/>Scouting</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default BoardDashboard;
