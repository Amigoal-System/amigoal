

'use client';

import React, { useEffect, Suspense } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTeam } from '@/hooks/use-team';
import dynamic from 'next/dynamic';

const LoadingComponent = () => <p>Laden...</p>;

// Import all setting pages
const ClubProfilePage = dynamic(() => import('@/components/dashboards/pages/ClubProfilePage'), { loading: LoadingComponent, ssr: false });
const SaasProfilePage = dynamic(() => import('@/app/dashboard/saas-profile/page'), { loading: LoadingComponent, ssr: false });
const ClubBrandingPage = dynamic(() => import('@/app/[lang]/dashboard/branding/page'), { loading: LoadingComponent, ssr: false });
const SaasBrandingPage = dynamic(() => import('@/app/dashboard/settings/saas-branding/page'), { loading: LoadingComponent, ssr: false });
const SaasInvoicesPage = dynamic(() => import('@/app/dashboard/saas-invoices/page'), { loading: LoadingComponent, ssr: false });
const SponsoringSettingsPage = dynamic(() => import('@/components/dashboards/pages/SponsoringSettingsPage'), { loading: LoadingComponent, ssr: false });
const SaasSponsoringPackagesPage = dynamic(() => import('@/app/dashboard/settings/saas-sponsoring-packages/page'), { loading: LoadingComponent, ssr: false });
const LanguageSettingsPage = dynamic(() => import('@/app/[lang]/dashboard/language-settings/page'), { loading: LoadingComponent, ssr: false });
const RolesMatrixPage = dynamic(() => import('@/components/dashboards/pages/RolesMatrixPage'), { loading: LoadingComponent, ssr: false });
const ModulesSettingsPage = dynamic(() => import('@/app/dashboard/settings/modules/page'), { loading: LoadingComponent, ssr: false });
const GlobalCategoriesPage = dynamic(() => import('@/app/dashboard/leaguestructures/page'), { loading: LoadingComponent, ssr: false });
const ClubCategoriesPage = dynamic(() => import('@/components/dashboards/pages/CategoriesPage'), { loading: LoadingComponent, ssr: false });
const NotificationsSettingsPage = dynamic(() => import('@/app/dashboard/settings/notifications/page'), { loading: LoadingComponent, ssr: false });
const ProviderSettingsPage = dynamic(() => import('@/components/dashboards/pages/ProviderSettingsPage'), { loading: LoadingComponent, ssr: false });
const ClubPaymentsPage = dynamic(() => import('@/app/dashboard/settings/club-payments/page'), { loading: LoadingComponent, ssr: false });
const SaasPaymentsPage = dynamic(() => import('@/app/dashboard/settings/saas-payments/page'), { loading: LoadingComponent, ssr: false });


export default function SettingsPage() {
    const pathname = usePathname();
    const router = useRouter();
    const { lang, currentUserRole } = useTeam();
    const isProvider = currentUserRole?.includes('Anbieter');

    const slugParts = pathname.split('/');
    let activeTab = slugParts.length > 4 ? slugParts.slice(4).join('/') : '';
    
    // Define all possible tabs
    const allTabs = [
        { value: 'profile', label: 'Profil', component: currentUserRole === 'Super-Admin' ? <SaasProfilePage /> : <ClubProfilePage />, roles: ['all'] },
        { value: 'branding', label: 'Branding', component: currentUserRole === 'Super-Admin' ? <SaasBrandingPage /> : <ClubBrandingPage />, roles: ['Super-Admin', 'Club-Admin', 'Manager', 'Board'] },
        { value: 'club-payments', label: 'Zahlungen', component: <ClubPaymentsPage />, roles: ['Club-Admin', 'Manager', 'Board'] },
        { value: 'saas-payments', label: 'SaaS Zahlungen', component: <SaasPaymentsPage />, roles: ['Super-Admin'] },
        { value: 'modules', label: 'Module & Pakete', component: <ModulesSettingsPage />, roles: ['Club-Admin', 'Manager', 'Board', 'Super-Admin'] },
        { value: 'dunning', label: 'Mahnwesen', component: currentUserRole === 'Super-Admin' ? <SaasInvoicesPage /> : null, roles: ['Super-Admin'] },
        { value: 'sponsoring/settings', label: 'Sponsoring Pakete', component: currentUserRole === 'Super-Admin' ? <SaasSponsoringPackagesPage /> : <SponsoringSettingsPage />, roles: ['Super-Admin', 'Club-Admin', 'Manager', 'Board'] },
        { value: 'language-settings', label: 'Sprachen', component: <LanguageSettingsPage />, roles: ['Super-Admin'] },
        { value: 'roles-matrix', label: 'Rollen & Rechte', component: <RolesMatrixPage />, roles: ['Super-Admin'] },
        { value: 'categories', label: 'Kategorien & Ligen', component: currentUserRole === 'Super-Admin' ? <GlobalCategoriesPage /> : <ClubCategoriesPage />, roles: ['Super-Admin', 'Club-Admin'] },
        { value: 'notifications', label: 'Benachrichtigungen', component: <NotificationsSettingsPage />, roles: ['all'] },
        { value: 'evaluation-attributes', label: 'Bewertungs-Attribute', component: <ProviderSettingsPage />, roles: ['Bootcamp-Anbieter', 'Trainingslager-Anbieter', 'Turnieranbieter'] },
    ];
    
    const visibleTabs = allTabs.filter(tab => {
        if (!tab.component) return false;
        if (tab.roles.includes('all')) return true;
        return currentUserRole && tab.roles.includes(currentUserRole);
    });

    useEffect(() => {
        const defaultTab = isProvider ? 'evaluation-attributes' : 'profile';
        if (!activeTab || !visibleTabs.some(t => t.value === activeTab)) {
            const firstVisibleTab = visibleTabs.length > 0 ? visibleTabs[0].value : defaultTab;
            router.replace(`/${lang}/dashboard/settings/${firstVisibleTab}`);
        }
    }, [currentUserRole, isProvider, lang, router, activeTab, visibleTabs]);

    // Handle the case where the current slug might not be the default but is still valid
    const currentActiveTab = visibleTabs.some(t => t.value === activeTab) ? activeTab : (isProvider ? 'evaluation-attributes' : 'profile');

    if (!currentUserRole) {
        return <LoadingComponent />;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Einstellungen</h1>
                <p className="text-muted-foreground">Verwalten Sie hier Ihre persönlichen und die Club-Einstellungen.</p>
            </div>
            <Tabs value={currentActiveTab} className="flex flex-col md:flex-row gap-6 items-start">
                <TabsList className="flex flex-col h-auto justify-start p-2 w-full md:w-48">
                    {visibleTabs.map(tab => (
                        <TabsTrigger 
                            key={tab.value} 
                            value={tab.value} 
                            className="w-full justify-start"
                            asChild
                        >
                            <Link href={`/${lang}/dashboard/settings/${tab.value}`}>{tab.label}</Link>
                        </TabsTrigger>
                    ))}
                </TabsList>
                <div className="flex-1 w-full">
                    {visibleTabs.map(tab => (
                        <TabsContent key={tab.value} value={tab.value}>
                            <Suspense fallback={<LoadingComponent />}>
                                {tab.component}
                            </Suspense>
                        </TabsContent>
                    ))}
                </div>
            </Tabs>
        </div>
    );
}

