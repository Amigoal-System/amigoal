

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar, SidebarBody, SidebarLink, Logo } from '@/components/ui/sidebar';
import { allNavItems, rolesConfig, moduleOrder, sectionOrder } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronsUpDown, Search, Bell, MessageSquare, Calendar, Video, BookOpenCheck, UserCog, Building, UserCheck } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AmigoalLogo } from '@/components/icons';
import { UserDropdown } from '@/components/ui/user-dropdown';
import { type Locale } from '@/i18n.config';
import { CartProvider } from '@/hooks/use-cart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { NotificationBell } from '@/components/ui/notification-bell';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SubtleButton } from '@/components/ui/subtle-button';
import { useTeam } from '@/hooks/use-team';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import AiAgentInput from '@/components/ui/ai-agent-input';

export const Header = ({ setOpen, open }) => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const { 
        lang, 
        currentUserRole, 
        userRoles,
        teams, 
        activeTeam, 
        setActiveTeam, 
        isAuthReady, 
        userEmail, 
        userName, 
        userAvatar, 
        userInitials, 
        currentUser, 
        clubName,
        isLoading,
        handleRoleChange // Use the function from the hook
    } = useTeam();
    const isMobile = useIsMobile();
    const [status, setStatus] = useState('online');
    
    const [impersonatedClub, setImpersonatedClub] = useState<string | null>(null);
    const [isImpersonating, setIsImpersonating] = useState(false);


    useEffect(() => {
        setImpersonatedClub(localStorage.getItem('amigoal_impersonated_club'));
        setIsImpersonating(!!localStorage.getItem('original_super_admin_email'));
    }, [userEmail]); // Re-check on email change

    const exitImpersonate = () => {
        const originalEmail = localStorage.getItem('original_super_admin_email');
        if (originalEmail) {
            localStorage.setItem('amigoal_email', originalEmail);
            localStorage.removeItem('original_super_admin_email');
            localStorage.removeItem('amigoal_impersonated_club');
            localStorage.removeItem('amigoal_active_role');
            localStorage.removeItem('amigoal_login_identifier');
            localStorage.removeItem('impersonated_email');
            window.location.reload();
        }
    };
    
    const showTeamSelector = ['Coach', 'Player'].includes(currentUserRole!);

    const user = {
        name: userName,
        email: userEmail,
        avatar: userAvatar,
        initials: userInitials,
        status: status,
        roles: userRoles,
        activeRole: currentUserRole,
        clubName: clubName
    };
    
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            router.push(`/${lang}/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
        }
    }

    return (
        <div className="flex flex-col w-full">
            {isImpersonating && (
                <div className="bg-yellow-400 text-yellow-900 text-sm font-semibold p-2 flex items-center justify-center gap-4">
                    <UserCog className="h-5 w-5" />
                    <span>Sie sind als Admin für den Club "{impersonatedClub}" angemeldet.</span>
                    <Button variant="ghost" size="sm" onClick={exitImpersonate} className="text-yellow-900 hover:bg-yellow-500/50 h-auto p-1">
                        Impersonate-Modus beenden
                    </Button>
                </div>
            )}
            <div className="flex justify-between items-center w-full p-2 bg-card border-b">
                <div className="flex items-center gap-4">
                    {isMobile && (
                        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
                        {open ? <X/> : <Menu/>}
                        </Button>
                    )}
                    {showTeamSelector && (
                        <div className="flex items-center gap-2">
                            {teams.length > 0 ? (
                                teams.map(team => (
                                    <SubtleButton 
                                        key={team}
                                        onClick={() => setActiveTeam(team)}
                                        isActive={activeTeam === team}
                                    >
                                        {team}
                                    </SubtleButton>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">Aktuell keiner Mannschaft zugewiesen</p>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Globale Suche..." 
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                      />
                    </div>
                    <NotificationBell />
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/${lang}/dashboard/highlights`}>
                            <Video className="h-5 w-5"/>
                        </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/${lang}/dashboard/chat`}>
                            <MessageSquare className="h-5 w-5"/>
                        </Link>
                    </Button>
                    {!isAuthReady ? (
                        <Skeleton className="h-10 w-10 rounded-full" />
                    ) : (currentUser || localStorage.getItem('amigoal_email')) ? (
                      <UserDropdown user={user} onStatusChange={setStatus} onRoleChange={handleRoleChange}/>
                    ) : (
                      <Button asChild>
                          <Link href={`/${lang}`}>Login</Link>
                      </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
