'use client';
import SponsoringSettings from '@/components/dashboards/pages/SponsoringSettingsPage';

// This is a wrapper component to reuse the existing SponsoringSettingsPage
// under a new route for the Super-Admin.
export default function Page() {
    return <SponsoringSettings />;
}
