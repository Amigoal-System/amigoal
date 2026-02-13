

'use client';
import React from 'react';
import ClubAdminProfilePage from '@/components/dashboards/pages/ClubProfilePage';
import SaasProfilePage from '@/components/dashboards/pages/SaasProfilePage';
import { useTeam } from '@/hooks/use-team';
import ProviderProfilePage from '@/components/dashboards/pages/ProviderProfilePage';

export default function ProfilePage() {
    const { currentUserRole } = useTeam();
    
    // This page acts as a router based on the user's role.
    if (currentUserRole === 'Super-Admin') {
        return <SaasProfilePage />;
    }

    if (currentUserRole?.includes('Anbieter')) {
        return <ProviderProfilePage />;
    }

    // Default to the club user profile page
    return <ClubAdminProfilePage />;
}
