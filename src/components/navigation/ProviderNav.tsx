
'use client';
import React from 'react';
import { SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { useTeam } from '@/hooks/use-team';
import { allNavItems, sectionOrder } from '@/lib/roles';
import { getFilteredNavItems } from '@/hooks/useRbac';

const ProviderNav = ({ open }: { open: boolean }) => {
    const { lang, currentUserRole } = useTeam();

    let visibleSections: string[] = [];
    
    if (currentUserRole === 'Trainingslager-Anbieter') {
        visibleSections = sectionOrder['Trainingslager-Anbieter'] || ['Allgemein', 'Anbieter-Cockpit', 'Zusätzliches'];
    } else if (currentUserRole === 'Bootcamp-Anbieter') {
        visibleSections = sectionOrder['Bootcamp-Anbieter'] || ['Allgemein', 'Anbieter-Cockpit', 'Zusätzliches'];
    } else if (currentUserRole === 'Turnieranbieter') {
        visibleSections = sectionOrder['Turnieranbieter'] || ['Allgemein', 'Anbieter-Cockpit', 'Zusätzliches'];
    } else {
        visibleSections = ['Allgemein', 'Anbieter-Cockpit', 'Kommunikation', 'Zusätzliches'];
    }

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
                        {section.items.map((link) => {
                            // Specifically remap the settings link for providers
                            let href = `/${lang}${link.href}`;
                            if (link.module === 'Settings') {
                                href = `/${lang}/dashboard/settings/evaluation-attributes`;
                            }
                            if (link.module === 'Profile') {
                                href = `/${lang}/dashboard/profile`;
                            }
                            return (
                                <SidebarLink key={link.href} link={{ ...link, href }} open={open} />
                            );
                        })}
                    </div>
                </div>
            ))}
        </>
    );
};

export default ProviderNav;
