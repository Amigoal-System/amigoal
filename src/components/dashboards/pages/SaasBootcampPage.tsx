
'use client';

import { useTeam } from '@/hooks/use-team';
import BootcampPage from '@/app/[lang]/dashboard/bootcamp/page';

export default function SaasBootcampPage() {
    const { currentUserRole } = useTeam();
    // This component now acts as a router, passing the role context
    return <BootcampPage passedRole={currentUserRole} />;
}
