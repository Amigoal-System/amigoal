
'use client';
import React from 'react';
import { SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { useTeam } from '@/hooks/use-team';
import { allNavItems, sectionOrder } from '@/lib/roles';
import { getFilteredNavItems } from '@/hooks/useRbac';

const SponsorNav = ({ open }: { open: boolean }) => {
    const { lang, currentUserRole } = useTeam();

    const visibleSections = sectionOrder['Sponsor'] || [
        'Allgemein',
        'Sponsoring',
        'Kommunikation'
    ];

    const filteredNavItems = getFilteredNavItems(currentUserRole, allNavItems);

    const sections = visibleSections.map(sectionName => ({
        name: sectionName,
        items: filteredNavItems.filter(item => item.section === sectionName)
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

export default SponsorNav;
