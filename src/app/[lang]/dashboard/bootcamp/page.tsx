'use client';

import React from 'react';
import { useTeam } from '@/hooks/use-team';
import ProviderDashboard from '@/components/dashboards/pages/ProviderDashboard';


export default function BootcampPageRouter() {
    const { currentUserRole } = useTeam();
    
    // For all provider types, show the ProviderDashboard
    if (currentUserRole?.includes('Anbieter')) {
        return <ProviderDashboard />;
    }

    // Fallback or view for other roles like Player, Coach etc.
    return (
        <div>
            <h1 className="text-2xl font-bold">Bootcamps</h1>
            <p>Hier sehen Sie bald verfügbare Bootcamps.</p>
        </div>
    );
}
