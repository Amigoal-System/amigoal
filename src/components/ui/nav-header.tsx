

'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type Locale } from '@/i18n.config';
import { GlassEffect, GlassFilter } from './liquid-glass';
import { Lightbulb, Trophy, Menu, LogIn, Mail, FileText as BlogIcon, Info, UserSquare, Gift, Handshake, Video, Mountain, Ticket, UserPlus, FileText } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from './button';
import { getConfiguration } from '@/ai/flows/configurations';
import type { PublicPage } from '@/ai/flows/configurations.types';
import { AmigoalLogo } from '../icons';
import { useIsMobile } from '@/hooks/use-mobile';
import AiAgentInput from './ai-agent-input';
import { ContactModal } from './contact-modal';
import { FeatureRequestModal } from './feature-request-modal';
import { ReferralModal } from './referral-modal';

const Tab = ({
  children,
  setPosition,
  isLink = false,
  href = '#',
  onClick,
}: {
  children: React.ReactNode;
  setPosition: any;
  isLink?: boolean;
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
}) => {
  const ref = useRef<HTMLLIElement>(null);

  const content = isLink ? (
    <Link href={href} className="w-full h-full flex items-center justify-center">
      {children}
    </Link>
  ) : (
    <div onClick={onClick} className="w-full h-full flex items-center justify-center">
        {children}
    </div>
  );

  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({
          width,
          opacity: 1,
          left: ref.current.offsetLeft,
        });
      }}
      className="relative z-10 block cursor-pointer px-4 py-1.5 text-xs uppercase text-primary transition-colors duration-300 hover:text-white md:px-6 md:py-3 md:text-base"
    >
       {content}
    </li>
  );
};

const Cursor = ({ position }: { position: any }) => {
  return (
    <motion.li
      animate={position}
      className="absolute z-0 h-7 rounded-full bg-primary md:h-12"
    />
  );
};

const iconMap = {
    Handshake,
    Video,
    Trophy,
    Mountain,
    Ticket,
    UserPlus,
    UserSquare,
    Info,
    BlogIcon,
    Mail,
    Lightbulb,
    LogIn,
    Gift
};

export function NavHeader({ onLoginClick, onSearch, onIdeaClick }: { onLoginClick?: () => void, onSearch?: (query: string) => void, onIdeaClick?: () => void }) {
  const params = useParams();
  const lang = params.lang as Locale;
  const isMobile = useIsMobile();
  
  const [publicPages, setPublicPages] = useState<PublicPage[]>([]);
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isFeatureRequestModalOpen, setIsFeatureRequestModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  useEffect(() => {
    const fetchPublicPages = async () => {
        const config = await getConfiguration();
        setPublicPages(config?.publicPages || []);
    };
    fetchPublicPages();
  }, []);

  const aiMenuOptions = ["Verein", "Trainer", "Spieler", "Fussballschulen", "Sponsor"];
  
  const mobileNavItems = [
    ...publicPages.filter(p => p.enabled).map(p => ({ title: p.title, icon: p.icon, href: `/${lang}${p.href}` })),
    { type: 'separator' },
    { title: "Kontakt", icon: 'Mail', onClick: () => setIsContactModalOpen(true) },
    { title: "Idee einreichen", icon: 'Lightbulb', onClick: () => setIsFeatureRequestModalOpen(true) },
    { title: "Empfehlung", icon: 'Gift', onClick: () => setIsReferralModalOpen(true) },
  ];

  if (isMobile) {
    return (
        <>
            <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center w-full px-4">
                <div className="container mx-auto flex items-center justify-between w-full bg-background/70 backdrop-blur-md p-2 rounded-2xl border border-border/50 shadow-sm">
                    <Link href={`/${lang}`} className="flex items-center gap-2 flex-shrink-0">
                        <AmigoalLogo className="h-8 w-8" />
                        <span className="font-bold font-headline text-lg hidden sm:inline">Amigoal</span>
                    </Link>
                    <div className="flex-1 mx-2">
                         <AiAgentInput 
                            placeholder="frage etwas..."
                            onSubmit={onSearch}
                        />
                    </div>
                    <div className="flex items-center">
                        {onLoginClick && <Button variant="ghost" size="icon" onClick={onLoginClick}><LogIn /></Button>}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="default" size="icon" className="rounded-full w-10 h-10 bg-primary hover:bg-primary/90"><Menu /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {mobileNavItems.map((item, index) => {
                                    if (item.type === 'separator') {
                                        return <hr key={`sep-${index}`} className="my-1" />;
                                    }
                                    const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Info;
                                    const content = <span className="flex items-center gap-2"><IconComponent className="h-4 w-4" /> {item.title}</span>;
                                    
                                    return (
                                        <DropdownMenuItem key={index} asChild>
                                            {item.href ? (
                                                <Link href={item.href}>{content}</Link>
                                            ) : (
                                                <button onClick={item.onClick} className="w-full text-left">{content}</button>
                                            )}
                                        </DropdownMenuItem>
                                    )
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>
            <ContactModal isOpen={isContactModalOpen} onOpenChange={setIsContactModalOpen} />
            <FeatureRequestModal isOpen={isFeatureRequestModalOpen} onOpenChange={setIsFeatureRequestModalOpen} source="Website Header" />
            <ReferralModal isOpen={isReferralModalOpen} onOpenChange={setIsReferralModalOpen} />
        </>
    )
  }

  return (
    <>
      <GlassFilter />
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center w-full px-4">
        <div className="flex items-center gap-4">
            <GlassEffect className="rounded-full">
                <div className="flex items-center">
                    <ul
                        className="relative mx-auto flex w-fit rounded-full p-1"
                        onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
                    >
                        <Tab setPosition={setPosition} isLink={true} href={`/${lang}`}>Home</Tab>
                        <Tab setPosition={setPosition} isLink={true} href={`/${lang}/about`}>Amigoal</Tab>
                        <Tab setPosition={setPosition} isLink={true} href={`/${lang}/faq`}>FAQ</Tab>
                        <Tab setPosition={setPosition} onClick={onIdeaClick}><Lightbulb className="h-5 w-5" /></Tab>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <li className="relative z-10 block cursor-pointer px-4 py-1.5 text-xs uppercase text-primary transition-colors duration-300 hover:text-white md:px-6 md:py-3 md:text-base">
                                    <div className="w-full h-full flex items-center justify-center"><Menu/></div>
                                </li>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                {mobileNavItems.map((item, index) => {
                                    if (item.type === 'separator') {
                                        return <hr key={`sep-${index}`} className="my-1" />;
                                    }
                                    const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Info;
                                    const content = <span className="flex items-center gap-2"><IconComponent className="h-4 w-4" /> {item.title}</span>;
                                    
                                    return (
                                        <DropdownMenuItem key={index} asChild>
                                            {item.href ? (
                                                <Link href={item.href}>{content}</Link>
                                            ) : (
                                                <button onClick={item.onClick} className="w-full text-left">{content}</button>
                                            )}
                                        </DropdownMenuItem>
                                    )
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Cursor position={position} />
                    </ul>
                </div>
            </GlassEffect>
            <AiAgentInput 
                placeholder="Frage etwas..."
                onSubmit={onSearch}
                menuOptions={aiMenuOptions}
            />
        </div>
      </header>
       <ContactModal isOpen={isContactModalOpen} onOpenChange={setIsContactModalOpen} />
       <FeatureRequestModal isOpen={isFeatureRequestModalOpen} onOpenChange={setIsFeatureRequestModalOpen} source="Website Header" />
       <ReferralModal isOpen={isReferralModalOpen} onOpenChange={setIsReferralModalOpen} />
    </>
  );
}

    