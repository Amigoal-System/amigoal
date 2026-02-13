'use client';

import React from 'react';
import SphereImageGrid from '@/components/ui/image-sphere';

const teamImages = [
    { id: '1', src: 'https://placehold.co/100x100?text=LM', alt: 'Lionel Messi', title: 'Lionel Messi', description: 'Stürmer' },
    { id: '2', src: 'https://placehold.co/100x100?text=CR', alt: 'Cristiano Ronaldo', title: 'Cristiano Ronaldo', description: 'Stürmer' },
    { id: '3', src: 'https://placehold.co/100x100?text=NJ', alt: 'Neymar Jr', title: 'Neymar Jr', description: 'Stürmer' },
    { id: '4', src: 'https://placehold.co/100x100?text=KM', alt: 'Kylian Mbappé', title: 'Kylian Mbappé', description: 'Stürmer' },
    { id: '5', src: 'https://placehold.co/100x100?text=SZ', alt: 'Zinedine Zidane', title: 'Zinedine Zidane', description: 'Mittelfeld' },
    { id: '6', src: 'https://placehold.co/100x100?text=DP', alt: 'Andrea Pirlo', title: 'Andrea Pirlo', description: 'Mittelfeld' },
    { id: '7', src: 'https://placehold.co/100x100?text=PM', alt: 'Paolo Maldini', title: 'Paolo Maldini', description: 'Verteidiger' },
    { id: '8', src: 'https://placehold.co/100x100?text=RB', alt: 'Roberto Baggio', title: 'Roberto Baggio', description: 'Stürmer' },
    { id: '9', src: 'https://placehold.co/100x100?text=GB', alt: 'Gigi Buffon', title: 'Gigi Buffon', description: 'Torwart' },
    { id: '10', src: 'https://placehold.co/100x100?text=FR', alt: 'Frank Ribery', title: 'Frank Ribery', description: 'Mittelfeld' },
    { id: '11', src: 'https://placehold.co/100x100?text=AR', alt: 'Arjen Robben', title: 'Arjen Robben', description: 'Mittelfeld' },
    { id: '12', src: 'https://placehold.co/100x100?text=R9', alt: 'Ronaldo Nazario', title: 'Ronaldo Nazario', description: 'Stürmer' },
    { id: '13', src: 'https://placehold.co/100x100?text=R10', alt: 'Ronaldinho', title: 'Ronaldinho', description: 'Mittelfeld' },
    { id: '14', src: 'https://placehold.co/100x100?text=XAVI', alt: 'Xavi', title: 'Xavi', description: 'Mittelfeld' },
    { id: '15', src: 'https://placehold.co/100x100?text=INI', alt: 'Iniesta', title: 'Iniesta', description: 'Mittelfeld' },
    { id: '16', src: 'https://placehold.co/100x100?text=PUY', alt: 'Puyol', title: 'Puyol', description: 'Verteidiger' }
];


export default function ImageSphereDemo() {
    return (
        <div className="flex items-center justify-center w-full h-full p-10 bg-card rounded-xl">
            <SphereImageGrid images={teamImages} />
        </div>
    );
}