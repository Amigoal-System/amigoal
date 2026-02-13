
'use client';
import React from 'react';
import { SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { useTeam } from '@/hooks/use-team';
import { allNavItems } from '@/lib/roles';

const visibleSections = [
    'Allgemein',
    'Anbieter-Cockpit',
    'Kommunikation',
    'Zusätzliches'
];

const ProviderNav = ({ open }: { open: boolean }) => {
    const { lang, currentUserRole } = useTeam();

    const allowedModules: Record<string, string[]> = {
        'Trainingslager-Anbieter': ['Training Camp'],
        'Bootcamp-Anbieter': ['Bootcamps'],
        'Turnieranbieter': ['Tournaments'],
    };

    // Base permissions for all providers
    const providerPermissions = ['Dashboard', 'Provider Requests', 'Provider Facilities', 'Provider Billing', 'Profile', 'Chat', 'Settings', 'Bewertungs-Attribute', 'Staff'];
    
    const sections = visibleSections.map(sectionName => {
        let items = allNavItems.filter(item => {
            if (item.section !== sectionName) return false;
            
            // Allow general provider permissions
            if (providerPermissions.includes(item.module)) return true;
            
            // Allow role-specific modules
            if (currentUserRole && allowedModules[currentUserRole] && allowedModules[currentUserRole].includes(item.module)) {
                return true;
            }
            
            return false;
        });
        
        return {
            name: sectionName,
            items: items
        };
    }).filter(section => section.items.length > 0);
    


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
