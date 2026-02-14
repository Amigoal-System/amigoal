'use client';

import { useTeam } from '@/hooks/use-team';
import { rolesConfig, moduleOrder, type NavItem } from '@/lib/roles';
import { getRolesConfig } from '@/ai/flows/rolesConfig';
import { useState, useEffect } from 'react';

export function useRbac() {
    const { currentUserRole } = useTeam();
    const [dynamicRolesConfig, setDynamicRolesConfig] = useState<Record<string, string[]> | null>(null);

    // Load dynamic roles config on mount
    useEffect(() => {
        const loadConfig = async () => {
            try {
                const savedConfig = await getRolesConfig();
                if (Object.keys(savedConfig).length > 0) {
                    // Merge saved config with default
                    const mergedConfig = { ...rolesConfig };
                    Object.keys(savedConfig).forEach(role => {
                        if (mergedConfig[role]) {
                            mergedConfig[role] = savedConfig[role];
                        }
                    });
                    setDynamicRolesConfig(mergedConfig);
                }
            } catch (error) {
                console.error('Error loading roles config:', error);
            }
        };
        loadConfig();
    }, []);

    // Use dynamic config if available, otherwise fall back to static
    const effectiveRolesConfig = dynamicRolesConfig || rolesConfig;

    const hasAccess = (moduleName: string): boolean => {
        if (!currentUserRole) return false;
        if (currentUserRole === 'Super-Admin') return true;

        const roleConfig = effectiveRolesConfig[currentUserRole];
        if (!roleConfig) return false;

        const moduleIndex = moduleOrder.indexOf(moduleName);
        if (moduleIndex === -1) return true; // Unknown module, allow by default

        const accessLevel = roleConfig[moduleIndex];
        return accessLevel === 'Voll' || accessLevel === 'Limit';
    };

    const canEdit = (moduleName: string): boolean => {
        if (!currentUserRole) return false;
        if (currentUserRole === 'Super-Admin') return true;

        const roleConfig = effectiveRolesConfig[currentUserRole];
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

export function getFilteredNavItems(role: string | null, allNavItems: NavItem[], customConfig?: Record<string, string[]>): NavItem[] {
    if (!role) return [];
    if (role === 'Super-Admin') return allNavItems;

    const roleConfig = customConfig?.[role] || rolesConfig[role];
    if (!roleConfig) return [];

    return allNavItems.filter(item => {
        const moduleIndex = moduleOrder.indexOf(item.module);
        if (moduleIndex === -1) return false;
        
        const accessLevel = roleConfig[moduleIndex];
        return accessLevel === 'Voll' || accessLevel === 'Limit';
    });
}
