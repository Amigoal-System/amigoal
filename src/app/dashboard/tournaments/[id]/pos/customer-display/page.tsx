
'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { AmigoalLogo } from '@/components/icons';

const POS_LOGO_KEY = 'amigoal-pos-logo';


export default function CustomerDisplayPage() {
    const params = useParams();
    const tournamentId = params.id;
    const [order, setOrder] = useState({ items: [], total: 0 });
    const [logoUrl, setLogoUrl] = useState('');

    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === `amigoal-pos-customer-display-${tournamentId}`) {
                try {
                    const newOrder = JSON.parse(event.newValue || '{}');
                    setOrder(newOrder);
                } catch(e) {
                    console.error("Could not parse order from localStorage", e);
                }
            }
            if (event.key === `${POS_LOGO_KEY}-${tournamentId}`) {
                setLogoUrl(event.newValue || '');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Initial load
        try {
            const initialOrder = JSON.parse(localStorage.getItem(`amigoal-pos-customer-display-${tournamentId}`) || '{}');
            const initialLogo = localStorage.getItem(`${POS_LOGO_KEY}-${tournamentId}`);
            setOrder(initialOrder);
            setLogoUrl(initialLogo || '');
        } catch {}


        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [tournamentId]);

    return (
        <div className="h-screen bg-blue-900 text-white p-12 flex flex-col justify-between font-mono">
            <header className="flex justify-between items-center">
                <h1 className="text-6xl font-bold tracking-wider">IHRE BESTELLUNG</h1>
                {logoUrl ? <Image src={logoUrl} alt="Turnier Logo" width={150} height={60} className="object-contain"/> : <AmigoalLogo className="h-20 w-20 text-white/80"/>}
            </header>
            <main className="flex-1 my-8 text-5xl grid grid-cols-2 gap-x-12 gap-y-6 content-start">
                {order.items?.map((item, index) => (
                    <React.Fragment key={index}>
                        <div className="flex justify-between items-baseline">
                            <span>{item.quantity}x</span>
                            <span className="ml-4">{item.name}</span>
                        </div>
                        <div className="text-right">
                           CHF {(item.price * item.quantity).toFixed(2)}
                        </div>
                    </React.Fragment>
                ))}
            </main>
            <footer className="border-t-4 border-white pt-8">
                <div className="flex justify-between items-baseline text-8xl font-bold">
                    <span>TOTAL</span>
                    <span>CHF {order.total?.toFixed(2) || '0.00'}</span>
                </div>
            </footer>
        </div>
    );
}
