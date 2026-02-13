
'use client';
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Locale } from "../../../i18n.config";
import { AmigoalLogo } from "../icons";
import Image from "next/image";
import {
    LayoutDashboard,
    Weight,
    Trophy,
    FileText,
    UserCircle,
    Settings,
    CreditCard,
    ShieldCheck,
    Building,
    HeartHandshake,
    UserSearch,
    Briefcase,
    FlaskConical,
    Coins,
    Globe,
    BarChart,
    Building2,
    CalendarDays,
    UserCog,
    LayoutList,
    Box,
    MapPin,
    Key,
    Component,
    Activity,
    Gavel,
    RefreshCw,
    Map,
    Target,
    Archive,
    Gift,
    Gamepad2,
    Palette,
    Mail,
    Backpack,
    Video,
    FileEdit,
    CircleHelp,
    Image as ImageIcon,
    MessageSquare,
    Languages,
    ClipboardList,
    Car,
    Mountain,
    ShoppingCart,
    Wallet,
    UserSquare,
    Library,
    Search,
    Ticket,
    Award,
    Database,
    Users as UsersIcon,
    Percent,
    User
} from "lucide-react";


const iconMap: { [key: string]: React.ElementType } = {
    IconLayoutDashboard: LayoutDashboard, 
    IconWeight: Weight, 
    IconTrophy: Trophy, 
    IconListDetails: ClipboardList, 
    IconFileText: FileText,
    IconUserCircle: UserCircle, 
    IconSettings: Settings, 
    IconCreditCard: CreditCard, 
    IconShieldCheck: ShieldCheck, 
    IconBuilding: Building,
    IconHeartHandshake: HeartHandshake, 
    IconUserSearch: UserSearch, 
    IconBriefcase: Briefcase, 
    IconFlask: FlaskConical, 
    IconCoins: Coins,
    IconWorld: Globe, 
    IconChartBar: BarChart, 
    IconBuildingArch: Building2, 
    IconCalendarEvent: CalendarDays, 
    IconUserBolt: UserCog, 
    IconLayoutList: LayoutList, 
    IconBox: Box, 
    IconMapPin: MapPin, 
    IconKey: Key, 
    IconComponents: Component, 
    IconActivity: Activity,
    IconGavel: Gavel, 
    IconRefresh: RefreshCw, 
    IconRoad: Map, 
    IconTargetArrow: Target, 
    IconArchive: Archive, 
    IconGift: Gift,
    IconDeviceGamepad2: Gamepad2, 
    IconPalette: Palette, 
    IconMail: Mail, 
    IconBackpack: Backpack,
    IconVideo: Video, 
    IconFilePencil: FileEdit,
    IconCash: Wallet, 
    IconFirstAidKit: Briefcase, 
    IconHelpCircle: CircleHelp,
    IconPhoto: ImageIcon, 
    MessageSquare, 
    Languages, 
    ClipboardList, 
    Car, 
    Mountain, 
    ShoppingCart,
    Tournament: Trophy, 
    Wallet, 
    UserSquare, 
    Library, 
    Search, 
    Ticket, 
    Award, 
    Database, 
    UsersIcon, 
    Percent,
    'SaaS Invoices': CreditCard,
    Coupons: Percent,
    'SaaS Website Builder': Palette,
    'Blog Management': FileEdit,
    'FAQ Management': CircleHelp,
    'Flyer Generator': ImageIcon,
    'System Status': Activity,
    'All Pages': Library,
    'DB Test': Database,
    'Members': User,
    'Staff': UserCog,
    'Facility': Building2,
    'Inventory': Box,
    'Website': Globe,
    'Club Strategy': Target,
    'Documents': FileText,
    'Training Prep': ClipboardList,
    'Match Prep.': LayoutList, 
    'Live Ticker': Gamepad2,
    'Rules': Gavel,
    'Medical Center': Briefcase,
    'SaaS Bootcamps': Mountain,
    'Provider Requests': Briefcase,
    'Provider Facilities': Building2,
    'Provider Billing': Wallet,
    'Team Cash': Wallet,
    'Contract': FileText,
    'Chart of Accounts': Library,
    'Season Transition': RefreshCw,
    'Tasks': ClipboardList,
    'Chat': MessageSquare,
    'Polls': ClipboardList,
    'J&S / Verband': ShieldCheck,
    'Checkout': ShoppingCart,
};

interface SidebarLinkProps {
  link: {
    label: string;
    href: string;
    icon: string; // Changed to string
    section: string;
  };
  open: boolean;
}

export const SidebarLink = ({ link, open }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === link.href;

  const IconComponent = iconMap[link.icon] || LayoutDashboard;
  const iconClass = "h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200";

  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-2 p-2 rounded-lg text-sm",
        isActive ? "bg-primary text-primary-foreground" : "text-neutral-700 dark:text-neutral-200 hover:bg-muted"
      )}
    >
      <IconComponent className={iconClass} />
      <motion.span
        animate={{
          display: open ? "inline-block" : "none",
          opacity: open ? 1 : 0,
        }}
        className="overflow-hidden whitespace-pre"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};


export const Logo = ({ open, lang, userName, clubLogo, clubName }: { open: boolean, lang: Locale, userName?: string, clubLogo?: string | null, clubName?: string | null }) => {
  const isClubContext = clubName && clubName !== 'Amigoal';

  return (
    <Link
      href={`/${lang}/dashboard`}
      className="flex items-center gap-2 py-1"
    >
      {isClubContext && clubLogo ? (
         <Image src={clubLogo} alt={`${''}{clubName} Logo`} width={32} height={32} className="shrink-0 rounded-full"/>
      ) : (
        <AmigoalLogo className="h-8 w-8 shrink-0" />
      )}
      <motion.div
        animate={{
          display: open ? "block" : "none",
          opacity: open ? 1 : 0,
        }}
        className="overflow-hidden whitespace-pre"
      >
        <p className="font-headline text-lg font-medium text-foreground">{isClubContext ? clubName : 'Amigoal'}</p>
        <p className="text-xs text-muted-foreground -mt-1">{userName}</p>
      </motion.div>
    </Link>
  );
};


interface SidebarProps {
  children: React.ReactNode;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Sidebar = ({ children, open, setOpen }: SidebarProps) => {
  return (
    <motion.div
      animate={{
        width: open ? "240px" : "60px",
      }}
      className="relative flex-col border-r border-neutral-200 dark:border-neutral-700 bg-card p-2 h-full z-20 hidden md:flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
    </motion.div>
  );
};

export const SidebarBody = ({ children, className }: { children: React.ReactNode, className?: string}) => {
    return (
        <div className={cn("flex flex-col h-full", className)}>
            {children}
        </div>
    )
}
