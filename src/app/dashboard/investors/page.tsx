
'use client';

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Loader2 } from "lucide-react";
import { InvestorDetailModal } from "@/components/ui/investor-detail-modal";
import { useInvestors } from "@/hooks/useInvestors";
import { ChartPieInteractive } from "@/components/ui/chart-pie-interactive";
import type { ChartConfig } from '@/components/ui/chart';

export default function InvestorsPage() {
    const { investors, isLoading, addInvestor, updateInvestor } = useInvestors();
    const [selectedInvestor, setSelectedInvestor] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewDetails = (investor) => {
        setSelectedInvestor(investor);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedInvestor(null);
        setIsModalOpen(true);
    };
    
    const handleSave = (investorData) => {
        if(investorData.id) {
            updateInvestor(investorData);
        } else {
            addInvestor(investorData);
        }
        setIsModalOpen(false);
    }

    const { chartData, chartConfig } = useMemo(() => {
        if (!investors || investors.length === 0) return { chartData: [], chartConfig: {} };
        const totalInvestorEquity = investors.reduce((acc, investor) => acc + (investor.equity || 0), 0);
        const ownerEquity = Math.max(0, 100 - totalInvestorEquity);

        const data = [
            ...investors.map(investor => ({
                name: investor.name,
                equity: investor.equity || 0,
                fill: `var(--color-${investor.name.toLowerCase().replace(/[^a-z0-9]/g, '')})`
            })),
        ];

        if (ownerEquity > 0) {
            data.push({ name: 'Inhaber', equity: ownerEquity, fill: 'var(--color-inhaber)' });
        }


        const config: ChartConfig = data.reduce((acc, item) => {
            acc[item.name] = {
                label: item.name,
                color: item.fill,
            };
            return acc;
        }, {} as ChartConfig);

        return { chartData: data, chartConfig };
    }, [investors]);


    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Investoren</h1>
                    <p className="text-muted-foreground">Verwalten Sie Ihre Investoren und deren Beteiligungen.</p>
                </div>
                <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4"/> Neuen Investor hinzufügen</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                 <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Investoren-Liste</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center items-center h-40">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Investor</TableHead>
                                            <TableHead>Typ</TableHead>
                                            <TableHead>Anteil</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Aktion</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {investors.map(investor => (
                                            <TableRow key={investor.id} className="cursor-pointer" onClick={() => handleViewDetails(investor)}>
                                                <TableCell className="font-semibold">{investor.name}</TableCell>
                                                <TableCell>{investor.type}</TableCell>
                                                <TableCell>{investor.equity?.toFixed(2)}%</TableCell>
                                                <TableCell>
                                                    <Badge variant={investor.status === 'Active' ? 'default' : 'secondary'} className={investor.status === 'Active' ? 'bg-green-500' : ''}>
                                                        {investor.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="ghost" size="sm">Details</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                     {isLoading ? (
                        <div className="flex justify-center items-center h-80 w-full">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                        </div>
                    ) : chartData.length > 0 ? (
                        <ChartPieInteractive 
                            data={chartData}
                            chartConfig={chartConfig}
                            title="Anteilsverteilung"
                            description="Visualisierung der aktuellen Eigentumsverhältnisse."
                            dataKey="equity"
                            nameKey="name"
                            className="w-full"
                        />
                    ) : (
                        <div className="text-center text-muted-foreground h-80 flex items-center justify-center">
                            <p>Keine Investoren vorhanden, um das Diagramm anzuzeigen.</p>
                        </div>
                    )}
                </div>
            </div>

            <InvestorDetailModal 
                investor={selectedInvestor}
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSave={handleSave}
            />
        </>
    )
}
