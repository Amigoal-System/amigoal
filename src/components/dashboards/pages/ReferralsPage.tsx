
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Crown, Gift, Share2, Zap, PlusCircle } from 'lucide-react';
import { ReferralCard } from '@/components/ui/referral-card';
import { useTeam } from '@/hooks/use-team';
import { getReferrals, updateReferral } from '@/ai/flows/referrals';
import type { Referral } from '@/ai/flows/referrals.types';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ReferralForm } from '@/components/ui/referral-form';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

const referralSteps = [
    {
      icon: <Share2 className="h-4 w-4" />,
      text: "Teilen Sie Ihren Empfehlungslink.",
    },
    {
      icon: <Crown className="h-4 w-4" />,
      text: (
        <>
          Ihr geworbener Verein erhält <span className="font-semibold text-card-foreground">einen Monat gratis</span>,
          wenn er ein Abo abschliesst.
        </>
      ),
    },
    {
      icon: <Gift className="h-4 w-4" />,
      text: (
        <>
          Sie erhalten eine <span className="font-semibold text-card-foreground">Gutschrift von CHF 150</span> für jede erfolgreiche Empfehlung.
        </>
      ),
    },
];

const getStatusBadge = (status: Referral['status']) => {
    switch (status) {
        case 'Onboarded':
        case 'RewardPaid':
            return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>;
        case 'Contacted':
            return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>;
        case 'Pending':
            return <Badge variant="secondary">{status}</Badge>;
        case 'Rejected':
            return <Badge variant="destructive">{status}</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const SuperAdminReferralsPage = () => {
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const fetchReferrals = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getReferrals();
            setReferrals(data);
        } catch (error) {
            console.error("Failed to fetch referrals", error);
            toast({ title: "Fehler beim Laden", variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchReferrals();
    }, [fetchReferrals]);

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await updateReferral({ id, status: status as Referral['status'] });
            toast({ title: "Status aktualisiert!" });
            fetchReferrals();
        } catch(error) {
            toast({ title: "Fehler", description: "Status konnte nicht geändert werden.", variant: "destructive"})
        }
    }

    if (isLoading) {
        return <p>Lade Empfehlungen...</p>;
    }

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                     <div>
                        <h1 className="text-3xl font-bold font-headline">Referral Management</h1>
                        <p className="text-muted-foreground">Verwalten Sie alle eingehenden Empfehlungen und deren Status.</p>
                     </div>
                     <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> Neue Empfehlung</Button>
                     </DialogTrigger>
                </div>
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Empfohlen von</TableHead>
                                    <TableHead>Empfohlener Verein</TableHead>
                                    <TableHead>Datum</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {referrals.map(ref => (
                                    <TableRow key={ref.id}>
                                        <TableCell>{ref.referrerName}<br/><span className="text-xs text-muted-foreground">{ref.referrerEmail}</span></TableCell>
                                        <TableCell>{ref.referredClubName}<br/><span className="text-xs text-muted-foreground">{ref.referredClubContact}</span></TableCell>
                                        <TableCell>{new Date(ref.createdAt).toLocaleDateString('de-CH')}</TableCell>
                                        <TableCell>
                                            <Select value={ref.status} onValueChange={(value) => handleStatusChange(ref.id!, value)}>
                                                <SelectTrigger className="w-40 focus:ring-0">
                                                    <SelectValue>
                                                        {getStatusBadge(ref.status)}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {['Pending', 'Contacted', 'Onboarded', 'Rejected', 'RewardPaid'].map(s => (
                                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
             <DialogContent>
                <ReferralForm onFormSubmit={() => { setIsFormOpen(false); fetchReferrals(); }} />
            </DialogContent>
        </Dialog>
    )
}


const DefaultReferralPage = () => {
    return (
        <div className="flex items-center justify-center h-full">
            <ReferralCard
                badgeText="Bonus erhalten"
                title="Verein empfehlen & profitieren"
                description="für jeden Verein, den Sie einladen"
                imageUrl="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-v0vbLLyS37IDvS2JqhJONhIAEgpeZP.png&w=320&q=75"
                steps={referralSteps}
                referralLink="https://amigoal.app/ref?id=awesome-club"
            />
        </div>
    );
};


export default function ReferralsPage() {
    const { currentUserRole } = useTeam();

    if (currentUserRole === 'Super-Admin') {
        return <SuperAdminReferralsPage />;
    }

    return <DefaultReferralPage />;
}
