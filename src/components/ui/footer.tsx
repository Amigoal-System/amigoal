
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, Lightbulb, FileText as BlogIcon, LogIn, Info, UserSquare, Gift } from 'lucide-react';
import { useParams } from 'next/navigation';
import { type Locale } from '@/../i18n.config';
import { ContactModal } from './contact-modal';
import { FeatureRequestModal } from './feature-request-modal';
import ShareButton from './share-button';
import { ExpandableTabs } from './expandable-tabs';
import { ThemeToggle } from './theme-toggle';
import { ReferralModal } from './referral-modal';

export function SiteFooter({ onLoginClick }: { onLoginClick: () => void }) {
    const params = useParams();
    const lang = params.lang as Locale;
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
    const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

    const footerTabs = [
        { title: "Kontakt", icon: Mail, onClick: () => setIsContactModalOpen(true) },
        { title: "Idee", icon: Lightbulb, onClick: () => setIsIdeaModalOpen(true) },
        { title: "Blog", icon: BlogIcon, href: `/${lang}/blog` },
        { title: "Login", icon: LogIn, onClick: onLoginClick },
    ];

    return (
        <>
            <footer className="bg-background border-t">
                <div className="container mx-auto py-8 flex flex-col items-center justify-center gap-6">
                    <ExpandableTabs 
                        tabs={footerTabs}
                    />
                    <div className="flex items-center gap-4 mt-4">
                        <ShareButton />
                        <ThemeToggle />
                    </div>
                     <div className="mt-4 flex items-center gap-4">
                        <Button asChild variant="ghost">
                            <Link href={`/${lang}/investors`} className="flex items-center gap-2">
                               <UserSquare className="h-4 w-4" />
                                Für Investoren
                            </Link>
                        </Button>
                         <Button variant="ghost" className="flex items-center gap-2" onClick={() => setIsReferralModalOpen(true)}>
                               <Gift className="h-4 w-4" />
                                Empfehlungsprogramm
                         </Button>
                    </div>
                    <div className="text-center text-sm text-muted-foreground mt-4">
                        <p>&copy; {new Date().getFullYear()} Amigoal by Trifti GmbH - <a href="https://www.trifti.ch" target="_blank" rel="noopener noreferrer" className="underline">www.trifti.ch</a>. All rights reserved.</p>
                         <div className="flex justify-center gap-4 mt-2">
                            <Link href={`/${lang}/impressum`} className="hover:underline">Impressum</Link>
                            <Link href={`/${lang}/datenschutz`} className="hover:underline">Datenschutz</Link>
                        </div>
                    </div>
                </div>
            </footer>
            <ContactModal isOpen={isContactModalOpen} onOpenChange={setIsContactModalOpen} />
            <FeatureRequestModal isOpen={isIdeaModalOpen} onOpenChange={setIsIdeaModalOpen} source="Footer" />
            <ReferralModal isOpen={isReferralModalOpen} onOpenChange={setIsReferralModalOpen} />
        </>
    );
}
