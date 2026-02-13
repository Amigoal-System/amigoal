
'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const rewardItems = [
    {
        id: 1,
        name: 'Signiertes Trikot',
        description: 'Ein von der 1. Mannschaft signiertes Heimtrikot der aktuellen Saison.',
        cost: 5000,
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'signed soccer jersey',
        stock: 5,
    },
    {
        id: 2,
        name: '2x VIP-Tickets',
        description: 'Erleben Sie ein Heimspiel Ihrer Wahl von den besten Plätzen aus, inklusive Catering.',
        cost: 10000,
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'vip soccer tickets',
        stock: 10,
    },
    {
        id: 3,
        name: 'Meet & Greet',
        description: 'Treffen Sie Ihren Lieblingsspieler nach einem Training für ein persönliches Gespräch und Foto.',
        cost: 7500,
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'player meeting fan',
        stock: 3,
    },
    {
        id: 4,
        name: 'Fanschal "Amigoal FC"',
        description: 'Der klassische Fanschal für jeden Supporter des Vereins.',
        cost: 1500,
        image: 'https://placehold.co/600x400.png',
        dataAiHint: 'soccer club scarf',
        stock: 100,
    }
];


export default function TokenCatalogPage() {
    const { toast } = useToast();

    const handleRedeem = (itemName: string, cost: number) => {
        toast({
            title: "Prämie eingelöst!",
            description: `Sie haben "${itemName}" für ${cost.toLocaleString('de-CH')} AMIGO eingelöst.`,
        });
    }

    return (
         <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Token Prämien-Katalog</h1>
                    <p className="text-muted-foreground">Verwalten Sie die Prämien, die Mitglieder mit AMIGO-Tokens einlösen können.</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4"/> Neue Prämie hinzufügen
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {rewardItems.map(item => (
                    <Card key={item.id} className="flex flex-col">
                        <CardHeader className="p-0">
                            <div className="aspect-video relative">
                                <Image src={item.image} alt={item.name} layout="fill" objectFit="cover" className="rounded-t-lg" data-ai-hint={item.dataAiHint}/>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 flex-1">
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">Verfügbar: {item.stock}</CardDescription>
                            <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                        </CardContent>
                        <CardFooter className="flex-col gap-2 border-t p-4">
                             <div className="flex items-center justify-center gap-2 font-bold text-lg text-primary w-full mb-2">
                                <Coins className="h-5 w-5"/>
                                <span>{item.cost.toLocaleString('de-CH')} AMIGO</span>
                            </div>
                            <Button className="w-full" onClick={() => handleRedeem(item.name, item.cost)}>Einlösen</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
