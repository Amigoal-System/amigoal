

'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils"
import Link from "next/link";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { type Locale } from "@/i18n.config";
import { Circle, Download, Gift, HelpCircle, LogOut, MoonStar, Settings, Smile, SquareArrowOutUpRight, Star, User, Users, Sun, PenSquare, Info, Palette, UserCog, Building, UserCheck } from 'lucide-react';
import { Button } from "./button";
import { allPossibleRoles } from "@/lib/roles";
import { useTeam } from "@/hooks/use-team";
import { ThemeToggle } from "./theme-toggle";

const MENU_ITEMS = {
  status: [
    { value: "focus", icon: <MoonStar className="size-5 text-gray-500 dark:text-gray-400" />, label: "Focus" },
    { value: "offline", icon: <Smile className="size-5 text-gray-500 dark:text-gray-400" />, label: "Appear Offline" }
  ],
  profile: [
    { id: 'profile', icon: <User className="size-5 text-gray-500 dark:text-gray-400" />, label: "Your profile", href: "/dashboard/profile" },
    { id: 'appearance', icon: <Palette className="size-5 text-gray-500 dark:text-gray-400" />, label: "Appearance", href: "/dashboard/settings/branding" },
    { id: 'settings', icon: <Settings className="size-5 text-gray-500 dark:text-gray-400" />, label: "Settings", href: "/dashboard/settings" },
  ],
  premium: [
    { icon: <Gift className="size-5 text-gray-500 dark:text-gray-400" />, label: "Referrals", href: "/dashboard/referrals" }
  ],
  support: [
    { icon: <Download className="size-5 text-gray-500 dark:text-gray-400" />, label: "Download app", href: "/dashboard/download-app" },
    { 
      icon: <Info className="size-5 text-gray-500 dark:text-gray-400" />, 
      label: "What's new?", 
      href: "/dashboard/whats-new",
      rightIcon: <SquareArrowOutUpRight className="size-4 text-gray-500 dark:text-gray-400" />
    },
    { 
      icon: <HelpCircle className="size-5 text-gray-500 dark:text-gray-400" />, 
      label: "Get help?", 
      href: "/dashboard/get-help",
      rightIcon: <SquareArrowOutUpRight className="size-4 text-gray-500 dark:text-gray-400" />
    }
  ],
  account: [
    { id: 'logout', icon: <LogOut className="size-5 text-gray-500 dark:text-gray-400" />, label: "Log out" }
  ]
};


export const UserDropdown = ({ 
  user,
  onStatusChange,
  onRoleChange
}) => {
  const params = useParams();
  const lang = params.lang as Locale;
  const { signOut } = useTeam();
  const [originalAdminEmail, setOriginalAdminEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginalAdminEmail(localStorage.getItem('original_super_admin_email'));
    }
  }, [user]);

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

  const renderMenuItem = (item, index) => {
    const content = (
        <>
            <span className="flex items-center gap-1.5 font-medium">
                {item.icon}
                {item.label}
            </span>
            {item.badge && <Badge className={item.badge.className}>{item.badge.text}</Badge>}
            {item.rightIcon && item.rightIcon}
        </>
    );

    if (item.id === 'logout') {
        return (
            <DropdownMenuItem
                key={index}
                className={cn("justify-between p-2 rounded-lg cursor-pointer")}
                onClick={signOut}
            >
                {content}
            </DropdownMenuItem>
        );
    }
    
    return (
        <DropdownMenuItem 
        key={index}
        className={cn(item.badge || item.showAvatar || item.rightIcon ? "justify-between" : "", "p-2 rounded-lg cursor-pointer")}
        asChild
        >
        <Link href={item.href.startsWith('/') ? `/${lang}${item.href}`: item.href}>
            {content}
        </Link>
        </DropdownMenuItem>
    );
  };


  const getStatusColor = (status) => {
    const colors = {
      online: "text-green-600 bg-green-100 border-green-300 dark:text-green-400 dark:bg-green-900/30 dark:border-green-500/50",
      offline: "text-gray-600 bg-gray-100 border-gray-300 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-600",
      focus: "text-purple-600 bg-purple-100 border-purple-300 dark:text-purple-400 dark:bg-purple-900/30 dark:border-purple-500/50",
      busy: "text-red-600 bg-red-100 border-red-300 dark:text-red-400 dark:bg-red-900/30 dark:border-red-500/50"
    };
    return colors[status?.toLowerCase()] || colors.online;
  };
  
  if (!user) return null;

  const visibleProfileItems = MENU_ITEMS.profile.filter(item => {
      if (item.id === 'appearance' && user.activeRole === 'Player') {
          return false;
      }
      return true;
  });

  const showRoleSwitch = user.roles && user.roles.length > 1;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer size-10 border border-white dark:border-gray-700">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="no-scrollbar w-[310px] rounded-2xl bg-gray-50 dark:bg-black/90 p-0" align="end">
        <section className="bg-white dark:bg-gray-100/10 backdrop-blur-lg rounded-2xl p-1 shadow border border-gray-200 dark:border-gray-700/20">
          <div className="flex items-center p-2">
            <div className="flex-1 flex items-center gap-2">
              <Avatar className="cursor-pointer size-10 border border-white dark:border-gray-700">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{user.name}</h3>
                <p className="text-muted-foreground text-xs">{user.email}</p>
                 {user.activeRole && <p className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1"><UserCheck className="h-3 w-3"/>{user.activeRole}</p>}
                 {user.clubName && <p className="text-xs font-medium text-primary flex items-center gap-1"><Building className="h-3 w-3"/>{user.clubName}</p>}
              </div>
            </div>
            <Badge className={`${getStatusColor(user.status)} border-[0.5px] text-[11px] rounded-sm capitalize`}>
              {user.status}
            </Badge>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {visibleProfileItems.map(renderMenuItem)}
          </DropdownMenuGroup>
          
           <DropdownMenuItem className="p-2 rounded-lg focus:bg-transparent focus:text-accent-foreground">
             <ThemeToggle />
           </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {MENU_ITEMS.premium.map(renderMenuItem)}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {MENU_ITEMS.support.map(renderMenuItem)}
          </DropdownMenuGroup>
        </section>

        <section className="mt-1 p-1 rounded-2xl">
          <DropdownMenuGroup>
             {showRoleSwitch && (
              <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer p-2 rounded-lg">
                      <span className="flex items-center gap-1.5 font-medium text-gray-500 dark:text-gray-400">
                          <Users className="size-5" />
                          Rolle wechseln
                      </span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                      <DropdownMenuSubContent className="bg-white dark:bg-white/10 backdrop-blur-lg">
                          <DropdownMenuRadioGroup value={user.activeRole} onValueChange={onRoleChange}>
                              {user.roles.map((role) => (
                                  <DropdownMenuRadioItem key={role} value={role}>{role}</DropdownMenuRadioItem>
                              ))}
                          </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                  </DropdownMenuPortal>
              </DropdownMenuSub>
            )}
            {originalAdminEmail && (
              <DropdownMenuItem
                onClick={exitImpersonate}
                className="p-2 rounded-lg cursor-pointer text-yellow-600 dark:text-yellow-400 focus:bg-yellow-100 dark:focus:bg-yellow-900/50"
              >
                 <span className="flex items-center gap-1.5 font-medium">
                  <UserCog className="size-5" />
                  Impersonate-Modus beenden
                </span>
              </DropdownMenuItem>
            )}
            {MENU_ITEMS.account.map(renderMenuItem)}
          </DropdownMenuGroup>
        </section>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

    