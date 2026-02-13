
'use client';

import React from 'react';
import { useTeam } from '@/hooks/use-team';
import MedicalCenterPage from '@/components/dashboards/pages/MedicalCenterPage';

export default function Page() {
    const { currentUserRole } = useTeam();
    return <MedicalCenterPage currentUserRole={currentUserRole} />;
}
