'use client';
import React from 'react';
import SaasInvoicesPage from '@/app/dashboard/saas-invoices/page';
import InvoicesPage from '@/app/dashboard/invoices/page';
import { useTeam } from '@/hooks/use-team';
import ChartOfAccountsPage from '../chart-of-accounts/page';

export default function DunningPage() {
    const { currentUserRole } = useTeam();
    
    if (currentUserRole === 'Super-Admin') {
        return <ChartOfAccountsPage />;
    }

    return <InvoicesPage />;
}
