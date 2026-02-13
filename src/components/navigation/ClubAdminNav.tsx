
'use client';
import React from 'react';
import { SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { useTeam } from '@/hooks/use-team';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { allNavItems, sectionOrder } from '@/lib/roles';
import { getFilteredNavItems } from '@/hooks/useRbac';

const ClubAdminNav = ({ open }: { open: boolean }) => {
    const { lang, hasTournamentModule, hasNewsletterModule, currentUserRole } = useTeam();

    const visibleSections = sectionOrder['Club-Admin'] || [
        'Allgemein',
        'Vereins-Cockpit',
        'Training & Spielbetrieb',
        'Travel & Events',
        'Finanzen',
        'Buchhaltung',
        'Kommunikation',
        'Zusätzliches'
    ];

    const filteredNavItems = getFilteredNavItems(currentUserRole, allNavItems);

    const sections = visibleSections.map(sectionName => ({
        name: sectionName,
        items: filteredNavItems.filter(item => {
            if (item.section !== sectionName) return false;
            // Special rule for Tournaments
            if (item.module === 'Tournaments' && !hasTournamentModule) return false;
            if (item.module === 'Newsletter' && !hasNewsletterModule) return false;
            if (item.href === '/dashboard/add-club') return false; // Club Admins don't add clubs
            return true;
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
             <div className="p-2 mt-4 border-t space-y-2">
                {!hasTournamentModule && (
                    <Card className="bg-primary/10 border-primary/20">
                        <CardHeader className="p-3">
                            <CardTitle className="text-sm">Turnier-Modul</CardTitle>
                        </CardHeader>
                        <CardFooter className="p-3 pt-0">
                            <Button size="sm" className="w-full" onClick={() => {
                                localStorage.setItem('amigoal_has_tournament_module', 'true');
                                window.location.reload();
                            }}>
                                Jetzt buchen
                            </Button>
                        </CardFooter>
                    </Card>
                )}
                 {!hasNewsletterModule && (
                    <Card className="bg-primary/10 border-primary/20">
                        <CardHeader className="p-3">
                            <CardTitle className="text-sm">Newsletter-Modul</CardTitle>
                        </CardHeader>
                        <CardFooter className="p-3 pt-0">
                            <Button size="sm" className="w-full" onClick={() => {
                                localStorage.setItem('amigoal_has_newsletter_module', 'true');
                                window.location.reload();
                            }}>
                                Jetzt buchen
                            </Button>
                        </CardFooter>
                    </Card>
                )}
            </div>
        </>
    );
};

export default ClubAdminNav;
