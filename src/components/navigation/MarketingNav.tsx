
'use client';
import React from 'react';
import { SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { useTeam } from '@/hooks/use-team';
import { allNavItems } from '@/lib/roles';

const visibleSections = [
    'Allgemein',
    'Plattform-Management',
    'Plattform-Inhalte',
    'Kommunikation',
];

const MarketingNav = ({ open }: { open: boolean }) => {
    const { lang } = useTeam();

    const sections = visibleSections.map(sectionName => ({
        name: sectionName,
        items: allNavItems.filter(item => {
            if (item.section !== sectionName) return false;
            // Specific modules for Marketing
            const allowedModules = ['Dashboard', 'Leads', 'Referrals', 'Sponsoring Marketplace', 'Newsletter', 'SaaS Website', 'Blog', 'FAQ', 'Flyer Generator', 'Highlights', 'Chat', 'Events'];
            return allowedModules.includes(item.module);
        })
    })).filter(section => section.items.length > 0);

    return (
        <>
            {sections.map((section) => (
                <div key={section.name}>
                    <h2 className="text-xs text-muted-foreground uppercase font-semibold p-2 mt-4">{section.name}</h2>
                    <div className="space-y-1">
                        {section.items.map((link) => (
                            <SidebarLink key={link.href} link={{ ...link, href: `/${lang}${link.href}` }} open={open} />
                        ))}
                    </div>
                </div>
            ))}
        </>
    );
};

export default MarketingNav;
