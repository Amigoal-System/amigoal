
/**
 * RBAC (Role-Based Access Control) utilities
 * This file contains helper functions for checking user permissions based on roles
 */

import { getAuth } from '@/lib/firebase/server';
import { cookies } from 'next/headers';

export type UserRole = 'Super-Admin' | 'Club-Admin' | 'Manager' | 'Coach' | 'Player' | 'Parent' | 'Sponsor' | 'Referee' | 'Federation' | 'Scouting' | 'Fan' | 'Board' | 'Facility Manager' | 'Bootcamp-Anbieter' | 'Trainingslager-Anbieter' | 'Turnieranbieter' | 'Gast';

export interface RbacContext {
    role: UserRole;
    clubId: string | null;
    userId: string | null;
    email: string | null;
}

export async function getRbacContext(): Promise<RbacContext> {
    try {
        const auth = await getAuth();
        const cookieStore = await cookies();
        
        if (!auth) {
            return { role: 'Gast', clubId: null, userId: null, email: null };
        }

        const sessionCookie = cookieStore.get('auth_token')?.value;
        
        if (sessionCookie) {
            try {
                const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
                const email = decodedClaims.email || null;
                
                let role: UserRole = 'Gast';
                
                if (email === 'super.admin@amigoal.ch') {
                    role = 'Super-Admin';
                } else {
                    role = (decodedClaims.role as UserRole) || 'Gast';
                }

                return {
                    role,
                    clubId: decodedClaims.clubId || null,
                    userId: decodedClaims.uid || null,
                    email
                };
            } catch (e) {
                console.error('Error verifying session:', e);
            }
        }

        return { role: 'Gast', clubId: null, userId: null, email: null };
    } catch (error) {
        console.error('Error getting RBAC context:', error);
        return { role: 'Gast', clubId: null, userId: null, email: null };
    }
}

export function hasModuleAccess(role: UserRole, moduleName: string): boolean {
    const rolesConfig: Record<string, string[]> = {
        'Super-Admin': Array(82).fill('Voll'),
        'Club-Admin': [
            'Voll', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein', 'Kein',
            'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll',
            'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll',
            'Kein', 'Kein', 'Kein',
            'Voll', 'Kein', 'Kein', 'Voll', 'Kein', 'Kein', 'Kein', 'Kein',
            'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll',
            'Voll', 'Voll',
            'Voll', 'Voll', 'Voll', 'Voll', 'Voll', 'Voll',
            'Kein', 'Kein', 'Voll',
            'Voll', 'Voll', 'Kein'
        ],
    };

    const roleConfig = rolesConfig[role];
    if (!roleConfig) return false;
    
    const moduleOrder = [
        'Dashboard', 'Vereine', 'Benutzer', 'Staff', 'Leads', 'Investor Leads', 'Referrals', 'Spieler-Vermittlung',
        'SaaS Contracts', 'SaaS Invoices', 'Sponsoring Marketplace', 'Investors', 'Coupons',
        'SaaS Website', 'SaaS Website Builder', 'Blog Management', 'Highlights', 'FAQ Management', 'Flyer Generator',
        'Tokenization', 'Token Catalog',
        'Komponenten', 'System Status', 'Roadmap', 'All Pages', 'DB Test',
        'Members', 'Teams', 'Wall of Fame', 'Documents', 'Facility', 'Shop', 'Inventory', 'Website', 'Club Strategy',
        'Training', 'Training Prep', 'Match', 'Tournaments', 'Live Ticker', 'Match Prep.', 'Scouting', 'Statistics', 'Rules', 'Medical Center',
        'Watchlist', 'Leaderboard', 'Reports',
        'Travel & Events', 'Bootcamps', 'SaaS Bootcamps', 'Training Camp',
        'Provider Requests', 'Provider Facilities', 'Provider Billing', 'Bewertungs-Attribute',
        'Invoices', 'Expenses', 'Sponsoring', 'Team Cash', 'Contract', 'Ticketing',
        'Chart of Accounts', 'Season Transition',
        'Events', 'Tasks', 'Chat', 'Newsletter', 'Polls',
        'Settings', 'Profile', 'J&S / Verband', 'Checkout'
    ];

    const moduleIndex = moduleOrder.indexOf(moduleName);
    if (moduleIndex === -1) return true;
    
    return roleConfig[moduleIndex] === 'Voll' || roleConfig[moduleIndex] === 'Limit';
}
