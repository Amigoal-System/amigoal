'use client';

import React, { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';

export const Countdown = ({ targetDate }: { targetDate: Date }) => {
    const calculateTimeLeft = () => {
        const difference = differenceInSeconds(targetDate, new Date());
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                Tage: Math.floor(difference / (60 * 60 * 24)),
                Stunden: Math.floor((difference / (60 * 60)) % 24),
                Minuten: Math.floor((difference / 60) % 60),
                Sekunden: Math.floor(difference % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearTimeout(timer);
    });

    return (
        <div className="grid grid-cols-4 gap-2 text-center">
            {Object.entries(timeLeft).length > 0 ? (
                Object.entries(timeLeft).map(([unit, value]) => (
                    <div key={unit} className="p-2 bg-background rounded-lg">
                        <div className="text-xl font-bold font-mono">{String(value as number).padStart(2, '0')}</div>
                        <div className="text-xs text-muted-foreground">{unit}</div>
                    </div>
                ))
            ) : (
                <div className="col-span-4 p-2 bg-background rounded-lg">
                    <p className="text-lg font-bold">Event hat begonnen!</p>
                </div>
            )}
        </div>
    );
};
