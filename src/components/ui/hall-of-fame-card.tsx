
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Image from 'next/image';

interface HallOfFameCardProps {
    name: string;
    title: string;
    image: string;
    dataAiHint?: string;
    achievements: string[];
}

export const HallOfFameCard = ({ name, title, image, dataAiHint, achievements }: HallOfFameCardProps) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div 
            className="w-full h-[400px] [perspective:1000px] cursor-pointer"
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
        >
            <motion.div
                className="relative w-full h-full [transform-style:preserve-3d] transition-transform duration-700"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
            >
                {/* Front Side */}
                <div className="absolute w-full h-full [backface-visibility:hidden]">
                    <Image 
                        src={image} 
                        alt={name} 
                        width={300} 
                        height={400} 
                        className="w-full h-full object-cover rounded-2xl shadow-lg"
                        data-ai-hint={dataAiHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-2xl" />
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                        <h3 className="text-2xl font-bold font-headline">{name}</h3>
                        <p className="text-base text-white/80">{title}</p>
                    </div>
                </div>

                {/* Back Side */}
                <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-card border rounded-2xl shadow-lg flex flex-col p-6">
                    <h4 className="text-xl font-bold font-headline mb-4">Verdienste</h4>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                        {achievements.map((ach, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0"/>
                                <span>{ach}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.div>
        </div>
    );
};
