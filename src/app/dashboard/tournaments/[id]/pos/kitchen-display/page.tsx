
'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function KitchenDisplayPage() {
    const params = useParams();
    const tournamentId = params.id;
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === `amigoal-pos-kitchen-display-${tournamentId}`) {
                try {
                    const newOrders = JSON.parse(event.newValue || '[]');
                    setOrders(newOrders);
                } catch(e) {
                     console.error("Could not parse kitchen orders from localStorage", e);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Initial load
        try {
            const initialOrders = JSON.parse(localStorage.getItem(`amigoal-pos-kitchen-display-${tournamentId}`) || '[]');
            setOrders(initialOrders);
        } catch {}

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [tournamentId]);

    const handleCompleteOrder = (orderId: number) => {
        const updatedOrders = orders.filter(order => order.id !== orderId);
        setOrders(updatedOrders);
        try {
            localStorage.setItem(`amigoal-pos-kitchen-display-${tournamentId}`, JSON.stringify(updatedOrders));
        } catch (error) {
            console.error("Could not write to localStorage", error);
        }
    };
    
    const newOrders = orders.filter(o => o.status === 'new');

    return (
        <div className="h-screen bg-gray-100 p-4">
            <header className="text-center mb-4">
                <h1 className="text-4xl font-bold font-headline">Küchen-Display</h1>
            </header>
            <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-4 pb-4">
                    {newOrders.length > 0 ? (
                        newOrders.map(order => (
                            <Card key={order.id} className="min-w-[300px] max-w-[300px] flex-shrink-0 flex flex-col">
                                <CardHeader className="bg-yellow-300">
                                    <CardTitle className="flex justify-between items-center text-2xl">
                                        <span>Bestellung #{order.id}</span>
                                        <span className="text-sm">{new Date(order.timestamp).toLocaleTimeString('de-CH')}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-2 flex-1">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center text-lg">
                                            <span className="font-bold">{item.quantity}x</span>
                                            <span>{item.name}</span>
                                        </div>
                                    ))}
                                </CardContent>
                                <Button className="m-4 mt-0 bg-green-600 hover:bg-green-700" onClick={() => handleCompleteOrder(order.id)}>
                                    <CheckCircle2 className="mr-2 h-5 w-5"/> Erledigt
                                </Button>
                            </Card>
                        ))
                    ) : (
                        <div className="w-full text-center py-20 text-muted-foreground">
                            <p>Keine offenen Bestellungen.</p>
                        </div>
                    )}
                </div>
                 <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
