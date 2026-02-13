
'use client';

import SuperAdminWebsitePage from '@/components/ui/website/page';

export default function SaasWebsitePage() {
    // This page now directly renders the specific dashboard for the Super-Admin.
    // The previous router logic in here is now handled by the main website page.
    return <SuperAdminWebsitePage />;
}
