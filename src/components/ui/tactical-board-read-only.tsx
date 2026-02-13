
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './avatar';
import { Badge } from './badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';

const FootballFieldSVG = () => (
    <svg width="100%" height="100%" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
        <rect width="800" height="500" fill="#166534" />
        {/* Outer lines */}
        <rect x="5" y="5" width="790" height="490" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
        {/* Center line */}
        <line x1="400" y1="5" x2="400" y2="495" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
        {/* Center circle */}
        <circle cx="400" cy="250" r="70" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
        <circle cx="400" cy="250" r="3" fill="white" strokeOpacity="0.3" />
        {/* Left Goal Area */}
        <rect x="5" y="100" width="120" height="300" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
        <rect x="5" y="175" width="60" height="150" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
        {/* Right Goal Area */}
        <rect x="675" y="100" width="120" height="300" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
        <rect x="735" y="175" width="60" height="150" fill="none" stroke="white" strokeOpacity="0.3" />
    </svg>
);


const PlayerToken = ({ player, style }) => {
     const isCurrentPlayer = player.name === "Lionel Messi";
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <motion.div
                        className="absolute flex flex-col items-center"
                        style={style}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className={cn("relative z-10", isCurrentPlayer && "z-20")}>
                             <motion.div
                                className="relative"
                                animate={{ scale: isCurrentPlayer ? [1, 1.2, 1] : 1 }}
                                transition={{ duration: 1.5, repeat: isCurrentPlayer ? Infinity : 0, ease: 'easeInOut' }}
                             >
                                <div className={cn(
                                    "w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-800 text-lg border-2",
                                    isCurrentPlayer ? 'border-primary ring-2 ring-primary' : 'border-white'
                                )}>
                                    {player.number || <User/>}
                                </div>
                            </motion.div>
                            <div className="absolute -bottom-3 w-full flex justify-center">
                                <Badge variant="secondary">{player.name.split(' ')[0]}</Badge>
                            </div>
                        </div>
                    </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{player.name} (#{player.number}) - {player.position}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export const TacticalBoardReadOnly = () => {
    const formation = {
        '4-4-2': [
            // Goalie (ganz links)
            { top: '50%', left: '12%' },
            // Defenders (erste Reihe)
            { top: '20%', left: '30%' },
            { top: '40%', left: '30%' },
            { top: '60%', left: '30%' },
            { top: '80%', left: '30%' },
            // Midfielders (zweite Reihe)
            { top: '20%', left: '50%' },
            { top: '40%', left: '50%' },
            { top: '60%', left: '50%' },
            { top: '80%', left: '50%' },
            // Forwards (ganz rechts)
            { top: '40%', left: '75%' },
            { top: '60%', left: '75%' },
        ],
    };

    const starters = [
        { id: 1, number: 1, name: 'Beat Meier', position: 'Goal' },
        { id: 2, number: 2, name: 'Leo Dietrich', position: 'Verteidiger' },
        { id: 3, number: 3, name: 'Luc Sutter', position: 'Verteidiger' },
        { id: 4, number: 4, name: 'Müller', position: 'Verteidiger' },
        { id: 5, number: 8, name: 'Peter', position: 'Verteidiger' },
        { id: 6, number: 6, name: 'Tim Arnold', position: 'Mittelfeld' },
        { id: 7, number: 7, name: 'Jan-Luc Bernhard', position: 'Mittelfeld' },
        { id: 8, number: 10, name: 'Lionel Messi', position: 'Mittelfeld' },
        { id: 9, number: 16, name: 'Müller Jr', position: 'Mittelfeld' },
        { id: 10, number: 11, name: 'Ueli Sutter', position: 'Sturm' },
        { id: 11, number: 12, name: 'Franz Müller', position: 'Sturm' },
    ];

    const currentFormation = formation['4-4-2'];

    return (
        <div className="relative w-full aspect-video md:aspect-[4/3] rounded-lg bg-green-800 overflow-hidden">
            <div className="absolute inset-0">
                <FootballFieldSVG />
            </div>
            <div className="w-full h-full relative">
                {starters.map((player, index) => (
                    <PlayerToken
                        key={player.id}
                        player={player}
                        style={{
                            ...currentFormation[index],
                            transform: 'translate(-50%, -50%)'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};
