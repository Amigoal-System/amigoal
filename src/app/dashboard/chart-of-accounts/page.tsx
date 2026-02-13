
'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit, Trash2, Save, X, TrendingUp, TrendingDown, Scale, DollarSign, BarChart, Users as UsersIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogPortal, DialogOverlay, DialogTrigger, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Mail } from 'lucide-react';
import { useClub } from '@/hooks/useClub';
import { useMembers } from '@/hooks/useMembers'; // To get debtors/creditors from members list
import { Loader2 } from 'lucide-react';

// Mock data is removed, will be replaced by data from hooks.

const formatCurrency = (value: number) => `CHF ${value.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const OpenItemModal = ({ item, type, isOpen, onOpenChange }) => {
    if (!item) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{type === 'debtor' ? 'Offener Debitor' : 'Offener Kreditor'}: {item.name}</DialogTitle>
                    <DialogDescription>Details zum offenen Posten.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <p><strong>Name:</strong> {item.name}</p>
                    <p><strong>Betrag:</strong> <span className={type === 'debtor' ? 'text-red-600' : 'text-green-600'}>{formatCurrency(item.amount)}</span></p>
                    <p><strong>Fällig am:</strong> {item.dueDate}</p>
                    <p><strong>Typ:</strong> {item.type}</p>
                </div>
                <DialogFooter>
                    {type === 'debtor' && <Button variant="secondary"><Mail className="mr-2 h-4 w-4"/> Mahnung senden</Button>}
                    <Button>Zahlung verbuchen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


const StatCard = ({ title, value, icon: Icon, description, onClick }: { title: string, value: string, icon: React.ReactNode, description: string, onClick?: () => void }) => {
    return (
        <Card onClick={onClick} className={onClick ? 'cursor-pointer hover:bg-muted/50' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold`}>{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )
};


export default function ChartOfAccountsPage() {
  const { club, isLoading: isLoadingClub } = useClub();
  const { members, isLoading: isLoadingMembers } = useMembers(club?.id);
  const [accounts, setAccounts] = useState([]); // This would come from a firestore collection
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [newRow, setNewRow] = useState<Partial<any> | null>(null);
  const { toast } = useToast();
  
  const debtorsRef = useRef<HTMLDivElement>(null);
  const creditorsRef = useRef<HTMLDivElement>(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState<'debtor' | 'creditor' | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const handleOpenItemModal = (item, type: 'debtor' | 'creditor') => {
      setSelectedItem(item);
      setItemType(type);
      setIsItemModalOpen(true);
  }

  const { debtors, creditors } = useMemo(() => {
    if (!members) return { debtors: [], creditors: [] };
    const openDebtors = members
        .filter(m => m.fee && !m.fee.paid)
        .map(m => ({ 
            id: m.id, 
            name: `${m.firstName} ${m.lastName}`, 
            amount: m.fee.amount, 
            dueDate: new Date(new Date(m.fee.date).setMonth(new Date(m.fee.date).getMonth() + 1)).toLocaleDateString('de-CH'), 
            type: 'Mitgliederbeitrag' 
        }));

    // Creditors would come from another source, e.g., expenses
    const openCreditors: any[] = []; 
    return { debtors: openDebtors, creditors: openCreditors };
  }, [members]);


  // Placeholder for financial data, should be replaced with database logic
  const financialData = useMemo(() => {
    const revenues = accounts.filter(a => a.type === 'Ertrag');
    const expenses = accounts.filter(a => a.type === 'Aufwand');
    const assets = accounts.filter(a => a.type === 'Aktivkonto');
    const liabilities = accounts.filter(a => a.type === 'Passivkonto');
    
    const totalRevenue = revenues.reduce((sum, acc) => sum + acc.balance, 0);
    const totalExpenses = expenses.reduce((sum, acc) => sum + acc.balance, 0);
    const profit = totalRevenue - totalExpenses;
    
    const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.balance, 0);
    
    const openDebtorsAmount = debtors.reduce((sum, item) => sum + item.amount, 0);
    const openCreditorsAmount = creditors.reduce((sum, item) => sum + item.amount, 0);

    return {
        revenues, totalRevenue,
        expenses, totalExpenses,
        profit,
        assets, totalAssets,
        liabilities, totalLiabilities,
        openDebtors: openDebtorsAmount,
        openCreditors: openCreditorsAmount,
    };
  }, [accounts, debtors, creditors]);


  const chartConfig = {
    balance: {
      label: 'Balance',
    },
    ...financialData.revenues.reduce((acc, cur) => {
        acc[cur.name] = { label: cur.name };
        return acc;
    }, {}),
    ...financialData.expenses.reduce((acc, cur) => {
        acc[cur.name] = { label: cur.name };
        return acc;
    }, {}),
  } satisfies ChartConfig;

  if (isLoadingClub || isLoadingMembers) {
      return (
          <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-4">Lade Finanzdaten...</p>
          </div>
      );
  }

  if (!club) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Kein Verein ausgewählt</CardTitle>
                  <CardDescription>
                      Bitte wählen Sie einen Verein aus, um die Finanzdaten anzuzeigen.
                  </CardDescription>
              </CardHeader>
          </Card>
      );
  }

  return (
    <>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold font-headline">Finanz-Cockpit</h1>
            <p className="text-muted-foreground">Übersicht der Vereinsfinanzen und Buchhaltung.</p>
        </div>
        <Select defaultValue="24/25">
            <SelectTrigger className="w-[180px]">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="24/25">Saison 24/25</SelectItem>
                <SelectItem value="23/24">Saison 23/24</SelectItem>
                <SelectItem value="22/23">Saison 22/23</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="statements">Erfolgsrechnung & Bilanz</TabsTrigger>
          <TabsTrigger value="accounts">Kontenplan</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Gesamteinnahmen" value={formatCurrency(financialData.totalRevenue)} icon={<TrendingUp />} description="In dieser Saison"/>
                <StatCard title="Gesamtausgaben" value={formatCurrency(financialData.totalExpenses)} icon={<TrendingDown />} description="In dieser Saison"/>
                <StatCard title="Offene Debitoren" value={formatCurrency(financialData.openDebtors)} icon={<UsersIcon />} description="Ausstehende Forderungen" onClick={() => debtorsRef.current?.scrollIntoView({ behavior: 'smooth' })} />
                <StatCard title="Offene Kreditoren" value={formatCurrency(financialData.openCreditors)} icon={<UsersIcon />} description="Ausstehende Verbindlichkeiten" onClick={() => creditorsRef.current?.scrollIntoView({ behavior: 'smooth' })} />
            </div>
             <div className="grid gap-6 md:grid-cols-2">
                 <Card ref={debtorsRef}>
                    <CardHeader>
                        <CardTitle>Offene Debitoren</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Fällig am</TableHead>
                                    <TableHead className="text-right">Betrag</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {debtors.map(d => (
                                    <TableRow key={d.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpenItemModal(d, 'debtor')}>
                                        <TableCell>{d.name}</TableCell>
                                        <TableCell>{d.dueDate}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(d.amount)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                 <Card ref={creditorsRef}>
                    <CardHeader>
                        <CardTitle>Offene Kreditoren</CardTitle>
                    </CardHeader>
                     <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Fällig am</TableHead>
                                    <TableHead className="text-right">Betrag</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {creditors.map(c => (
                                    <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleOpenItemModal(c, 'creditor')}>
                                        <TableCell>{c.name}</TableCell>
                                        <TableCell>{c.dueDate}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(c.amount)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
             <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Aufschlüsselung Einnahmen</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
                            <RechartsPieChart>
                                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                                <Pie data={financialData.revenues} dataKey="balance" nameKey="name">
                                     {financialData.revenues.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f97316', '#ef4444', '#8b5cf6'][index % 5]} />
                                    ))}
                                </Pie>
                            </RechartsPieChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Aufschlüsselung Ausgaben</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ChartContainer config={chartConfig} className="w-full h-[250px]">
                             <RechartsBarChart data={financialData.expenses} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide/>
                                <YAxis dataKey="name" type="category" width={120} tickLine={false} axisLine={false} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                                <Bar dataKey="balance" layout="vertical" radius={4}>
                                     {financialData.expenses.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f97316', '#ef4444', '#8b5cf6'][index % 5]} />
                                    ))}
                                </Bar>
                            </RechartsBarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
        <TabsContent value="statements" className="mt-6">
            <p>Bilanz & Erfolgsrechnung wird hier angezeigt.</p>
        </TabsContent>
        <TabsContent value="accounts" className="mt-6">
           <p>Kontenplan wird hier angezeigt.</p>
        </TabsContent>
      </Tabs>
    </div>
    <OpenItemModal 
        item={selectedItem}
        type={itemType}
        isOpen={isItemModalOpen}
        onOpenChange={setIsItemModalOpen}
    />
    </>
  );
}

