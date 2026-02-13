'use client';

import { useTeam } from '@/hooks/use-team';
import { rolesConfig, moduleOrder, type NavItem } from '@/lib/roles';

export function useRbac() {
    const { currentUserRole } = useTeam();

    const hasAccess = (moduleName: string): boolean => {
        if (!currentUserRole) return false;
        if (currentUserRole === 'Super-Admin') return true;

        const roleConfig = rolesConfig[currentUserRole];
        if (!roleConfig) return false;

        const moduleIndex = moduleOrder.indexOf(moduleName);
        if (moduleIndex === -1) return true; // Unknown module, allow by default

        const accessLevel = roleConfig[moduleIndex];
        return accessLevel === 'Voll' || accessLevel === 'Limit';
    };

    const canEdit = (moduleName: string): boolean => {
        if (!currentUserRole) return false;
        if (currentUserRole === 'Super-Admin') return true;

        const roleConfig = rolesConfig[currentUserRole];
        if (!roleConfig) return false;

        const moduleIndex = moduleOrder.indexOf(moduleName);
        if (moduleIndex === -1) return false;

        return roleConfig[moduleIndex] === 'Voll';
    };

    const canView = (moduleName: string): boolean => {
        return hasAccess(moduleName);
    };

    return {
        hasAccess,
        canEdit,
        canView,
        currentUserRole,
    };
}

export function getFilteredNavItems(role: string | null, allNavItems: NavItem[]): NavItem[] {
    if (!role) return [];
    if (role === 'Super-Admin') return allNavItems;

    const roleConfig = rolesConfig[role];
    if (!roleConfig) return [];

    return allNavItems.filter(item => {
        const moduleIndex = moduleOrder.indexOf(item.module);
        if (moduleIndex === -1) return false;
        
        const accessLevel = roleConfig[moduleIndex];
        return accessLevel === 'Voll' || accessLevel === 'Limit';
    });
}
