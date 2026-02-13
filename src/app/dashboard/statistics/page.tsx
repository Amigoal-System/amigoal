
'use client';

import React from 'react';
import { CoachStatistics } from '@/components/CoachStatistics';
import { PlayerStatistics } from '@/components/PlayerStatistics';

export default function StatisticsPage() {
    // In a real app, role would be determined from user session
    const currentUserRole = 'Club-Admin'; 

    if (currentUserRole === 'Coach') {
        return <CoachStatistics />;
    }
    if (currentUserRole === 'Player' || currentUserRole === 'Parent') {
        return <PlayerStatistics />;
    }
    return (
        <div>
            <h1>Statistiken</h1>
            <p>Hier werden allgemeine Vereinsstatistiken angezeigt.</p>
        </div>
    );
}
