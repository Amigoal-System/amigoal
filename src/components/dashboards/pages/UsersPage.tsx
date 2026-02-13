
'use client';

import React from 'react';
import { useTeam } from '@/hooks/use-team';
import MembersPage from './MembersPage';
import AmigoalStaffPage from './AmigoalStaffpage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function UsersPage() {
    const { currentUserRole } = useTeam();

    // If not a Super-Admin, just show the normal members page
    if (currentUserRole !== 'Super-Admin') {
        return <MembersPage />;
    }

    // For Super-Admin, show only the club members, as staff has its own page now
    return <MembersPage />;
}
