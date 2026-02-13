'use client';

import React from 'react';
import ChartOfAccountsPage from '@/app/dashboard/chart-of-accounts/page';
import InvoicesPage from '@/app/dashboard/invoices/page';
import { useTeam } from '@/hooks/use-team';

export default function DunningPage() {
    const { currentUserRole } = useTeam();
    
    // This page now acts as a router.
    // Super-Admin is redirected to the main accounting page.
    // Club-Admin sees their internal member dunning (part of invoices).
    if (currentUserRole === 'Super-Admin') {
        return <ChartOfAccountsPage />;
    }

    return <InvoicesPage />;
}
