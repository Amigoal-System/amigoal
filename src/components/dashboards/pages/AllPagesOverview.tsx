'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { allNavItems } from '@/lib/roles';
import { rolesConfig, moduleOrder } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const allRoles = Object.keys(rolesConfig);

const roleToEmailMap = {
    'Super-Admin': 'super.admin@amigoal.ch',
    'Club-Admin': 'club.admin@fc-awesome.com',
    'Manager': 'marina.g@chelsea.com',
    'Coach': 'pep.guardiola@mancity.com',
    'Player': 'lionel.messi@intermiami.com',
    'Parent': 'jorge.messi@intermiami.com',
    'Sponsor': 'coca.cola@sponsoring.com',
    'Referee': 'pierluigi.c@fifa.com',
    'Federation': 'gianni.i@fifa.com',
    'Scouting': 'serra.juni@barcelona.com',
    'Supplier': 'nike.sports@supplier.com',
    'Fan': 'max.mustermann@fan.com',
    'Marketing': 'seth.godin@marketing.com',
    'Board': 'karl-heinz.r@bayern.com',
    'Facility Manager': 'john.smith@facility.com',
    'Turnieranbieter': 'provider@turnier.com',
    'Bootcamp-Anbieter': 'provider@bootcamp.com',
    'Trainingslager-Anbieter': 'provider@trainingslager.com',
};


export default function AllPagesOverview() {
    const params = useParams();
    const lang = params.lang as string;
    const router = useRouter();

    const getPermissionForRole = (moduleName: string, role: string) => {
        const moduleIndex = moduleOrder.indexOf(moduleName);
        if (moduleIndex === -1) return 'Kein';
        return rolesConfig[role]?.[moduleIndex] || 'Kein';
    };

    const getBadgeVariant = (permission: string) => {
        switch (permission) {
            case 'Voll': return 'default';
            case 'Limit': return 'secondary';
            case 'Kein': return 'destructive';
            default: return 'outline';
        }
    };

    const handleImpersonate = (role: string, href: string) => {
        const originalEmail = localStorage.getItem('amigoal_email');
        if (originalEmail && !localStorage.getItem('original_super_admin_email')) {
             localStorage.setItem('original_super_admin_email', originalEmail);
        }
        
        const impersonatedEmail = roleToEmailMap[role] || `${role.toLowerCase().replace(' ','.')}@amigoal.com`;
        
        localStorage.setItem('amigoal_email', impersonatedEmail);
        localStorage.setItem('impersonated_email', impersonatedEmail);
        localStorage.setItem('amigoal_active_role', role);

        // We need to reload to apply the new role identity, then navigate.
        window.location.href = href;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Übersicht aller Seiten und Berechtigungen</CardTitle>
                <CardDescription>
                    Diese Tabelle zeigt alle definierten Seiten (Navigationspunkte) und welche Rolle welche Zugriffsberechtigung hat. Klicken Sie auf eine Berechtigung, um die Seite aus der Sicht dieser Rolle zu sehen.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="sticky left-0 bg-card z-10">Seite</TableHead>
                                {allRoles.map(role => (
                                    <TableHead key={role} className="text-center">{role}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allNavItems.map(item => (
                                <TableRow key={item.href}>
                                    <TableCell className="font-medium sticky left-0 bg-card z-10">
                                        <Link href={`/${lang}${item.href}`} className="text-primary hover:underline">
                                            {item.label}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">{item.href}</p>
                                    </TableCell>
                                    {allRoles.map(role => {
                                        const permission = getPermissionForRole(item.module, role);
                                        const hasAccess = permission !== 'Kein';

                                        return (
                                            <TableCell key={`${item.href}-${role}`} className="text-center">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="inline-block">
                                                                <Badge 
                                                                    variant={getBadgeVariant(permission)}
                                                                    onClick={hasAccess ? () => handleImpersonate(role, `/${lang}${item.href}`) : undefined}
                                                                    className={hasAccess ? "cursor-pointer" : "cursor-not-allowed"}
                                                                >
                                                                    {permission}
                                                                </Badge>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {hasAccess ? `Als ${role} zu "${item.label}" wechseln` : `Kein Zugriff für ${role}`}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
