'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { rolesConfig as defaultRolesConfig } from '@/lib/roles';
import { getRolesConfig } from '@/ai/flows/rolesConfig';

interface RolesContextType {
    rolesConfig: Record<string, string[]>;
    isLoading: boolean;
    refreshConfig: () => Promise<void>;
}

const RolesContext = createContext<RolesContextType>({
    rolesConfig: defaultRolesConfig,
    isLoading: true,
    refreshConfig: async () => {}
});

export function RolesProvider({ children }: { children: React.ReactNode }) {
    const [rolesConfig, setRolesConfig] = useState(defaultRolesConfig);
    const [isLoading, setIsLoading] = useState(true);

    const loadConfig = async () => {
        try {
            const savedConfig = await getRolesConfig();
            // Merge saved config with default
            const mergedConfig = { ...defaultRolesConfig };
            Object.keys(savedConfig).forEach(role => {
                if (mergedConfig[role]) {
                    mergedConfig[role] = savedConfig[role];
                }
            });
            setRolesConfig(mergedConfig);
        } catch (error) {
            console.error('Error loading roles config:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadConfig();
    }, []);

    return (
        <RolesContext.Provider value={{ rolesConfig, isLoading, refreshConfig: loadConfig }}>
            {children}
        </RolesContext.Provider>
    );
}

export function useRolesConfig() {
    return useContext(RolesContext);
}
