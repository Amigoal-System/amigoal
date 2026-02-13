
'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar, Logo } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { type Locale } from '@/i18n.config';
import { CartProvider } from '@/hooks/use-cart';
import { Header } from '@/components/Header';
import { useTeam } from '@/hooks/use-team';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useRouter } from 'next/navigation';
import SuperAdminNav from '@/components/navigation/SuperAdminNav';
import DefaultNav from '@/components/navigation/DefaultNav';
import { Loader2 } from 'lucide-react';

// Dynamically import nav components to reduce initial bundle size
const ClubAdminNav = React.lazy(() => import('@/components/navigation/ClubAdminNav'));
const CoachNav = React.lazy(() => import('@/components/navigation/CoachNav'));
const PlayerNav = React.lazy(() => import('@/components/navigation/PlayerNav'));
const ParentNav = React.lazy(() => import('@/components/navigation/ParentNav'));
const SponsorNav = React.lazy(() => import('@/components/navigation/SponsorNav'));
const MarketingNav = React.lazy(() => import('@/components/navigation/MarketingNav'));
const ProviderNav = React.lazy(() => import('@/components/navigation/ProviderNav'));

const roleToNavComponent: Record<string, React.LazyExoticComponent<any>> = {
  'Super-Admin': SuperAdminNav,
  'Club-Admin': ClubAdminNav,
  'Manager': ClubAdminNav,
  'Board': ClubAdminNav,
  'Coach': CoachNav,
  'Player': PlayerNav,
  'Parent': ParentNav,
  'Sponsor': SponsorNav,
  'Scouting': DefaultNav,
  'Marketing': MarketingNav,
  'Referee': DefaultNav,
  'Federation': DefaultNav,
  'Supplier': DefaultNav,
  'Fan': DefaultNav,
  'Facility Manager': DefaultNav,
  'Bootcamp-Anbieter': ProviderNav,
  'Trainingslager-Anbieter': ProviderNav,
  'Turnieranbieter': ProviderNav,
};


const LoadingScreen = () => (
    <div className="flex items-center justify-center h-screen w-full bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
    </div>
);


const NavContent = ({ open }) => {
    const { currentUserRole, userName, clubName, clubLogo, lang, isLoading } = useTeam();
    
    if (isLoading) {
         return null; // The parent will show a loading screen
    }
    const NavComponent = currentUserRole ? roleToNavComponent[currentUserRole!] || DefaultNav : DefaultNav;
    return (
        <React.Suspense fallback={<div>Loading Nav...</div>}>
            <div className="flex-shrink-0 p-2 border-b mb-2">
                <Logo open={open} lang={lang!} userName={userName} clubName={clubName} clubLogo={clubLogo} />
            </div>
            <div className="flex-1 overflow-y-auto">
                {NavComponent && <NavComponent open={open} />}
            </div>
        </React.Suspense>
    );
};
    
export default function DashboardLayoutUI({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const isMobile = useIsMobile();
    const { currentUser, isAuthReady, isLoading, lang } = useTeam();
    const router = useRouter();
    usePushNotifications();


    useEffect(() => {
        // This effect now reliably runs *after* all user data is loaded or confirmed absent.
        // `isLoading` from useTeam now correctly signals completion of `loadUserData`.
        if (isAuthReady && !isLoading && !currentUser) {
            router.replace(`/${lang || 'de'}`);
        }
    }, [isAuthReady, isLoading, currentUser, router, lang]);

    
    // The key change: We wait for both Firebase Auth state (`isAuthReady`)
    // and our custom user profile loading (`isLoading`) to complete.
    if (!isAuthReady || isLoading) {
        return <LoadingScreen />;
    }

    if (!currentUser) {
        // This case is for the flicker between `isAuthReady` and the redirect.
        // It's a defensive measure; the useEffect above should handle the redirect.
        return <LoadingScreen />;
    }

    return (
        <div className="flex h-screen w-full bg-muted/30">
            {!isMobile && (
                <Sidebar open={open} setOpen={setOpen}>
                    <NavContent open={open} />
                </Sidebar>
            )}

            <div className="flex flex-col flex-1 h-full">
                <Header setOpen={setOpen} open={open} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
            
            <AnimatePresence>
                {isMobile && open && (
                <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="fixed top-0 left-0 h-full w-64 bg-card border-r z-50 p-2 flex flex-col"
                >
                    <div className="flex justify-between items-center p-2 border-b mb-2">
                        <Logo open={true} lang={lang!} userName={''} clubName={null} clubLogo={null}/>
                        <Button variant="ghost" size="icon" onClick={() => setOpen(false)}><X/></Button>
                    </div>
                    <NavContent open={true} />
                </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
