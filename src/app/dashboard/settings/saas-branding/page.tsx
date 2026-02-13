
'use client';
import BrandingPage from '@/app/[lang]/dashboard/branding/page';

// This is a wrapper component to reuse the existing BrandingPage logic
// under a new route for the Super-Admin.
export default function Page() {
    return <BrandingPage />;
}

    