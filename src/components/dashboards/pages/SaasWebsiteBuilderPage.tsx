
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, ArrowRight, Edit, Loader2, ArrowLeft, Cookie, Handshake, Video, Trophy, Mountain, Ticket, UserPlus, Info, UserSquare } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { FaqEditor } from '@/components/FaqEditor';
import { AboutPageEditor } from '@/components/AboutPageEditor';
import { ImpressumPageEditor } from '@/components/ImpressumPageEditor';
import { DatenschutzPageEditor } from '@/components/DatenschutzPageEditor';
import { CookieBannerEditor } from '@/components/CookieBannerEditor';
import { AgbPageEditor } from '@/components/AgbPageEditor';
import { getConfiguration, updateConfiguration } from '@/ai/flows/configurations';
import type { PublicPage } from '@/ai/flows/configurations.types';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const publicPagesConfig = [
    { id: 'about', title: 'Über Uns', description: 'Die "Über Uns"-Seite des Unternehmens.', href: '/about', supported: true, icon: <UserSquare className="mr-2 h-4 w-4"/> },
    { id: 'faq', title: 'FAQ', description: 'Die Seite mit häufig gestellten Fragen.', href: '/faq', supported: true, icon: <Info className="mr-2 h-4 w-4"/> },
    { id: 'impressum', title: 'Impressum', description: 'Rechtliche Informationen und Kontaktdaten.', href: '/impressum', supported: true, icon: <Info className="mr-2 h-4 w-4"/> },
    { id: 'datenschutz', title: 'Datenschutz', description: 'Datenschutzerklärung für die Webseite.', href: '/datenschutz', supported: true, icon: <Info className="mr-2 h-4 w-4"/> },
    { id: 'agb', title: 'AGB', description: 'Allgemeine Geschäftsbedingungen.', href: '/agb', supported: true, icon: <Info className="mr-2 h-4 w-4"/> },
    { id: 'cookies', title: 'Cookie Banner', description: 'Text und Einstellungen des Cookie-Banners.', href: '#', icon: <Cookie className="mr-2 h-4 w-4" />, supported: true },
];

const dynamicPagesConfig = [
    { id: 'sponsoring', title: "Sponsoring", icon: <Handshake className="mr-2 h-4 w-4" />, description: 'Landingpage für potenzielle Sponsoren.', href: "/sponsoring", managementHref: "/dashboard/sponsoring/settings" },
    { id: 'highlights', title: "Highlights", icon: <Video className="mr-2 h-4 w-4" />, description: 'Öffentliche Seite zur Anzeige von Video-Highlights.', href: "/highlights", managementHref: "/dashboard/highlights" },
    { id: 'tournaments', title: "Turniere", icon: <Trophy className="mr-2 h-4 w-4" />, description: 'Landingpage für die Turnier-Organisation.', href: "/tournaments", managementHref: "/dashboard/tournaments" },
    { id: 'camps', title: "Trainingslager", icon: <Mountain className="mr-2 h-4 w-4" />, description: 'Informationsseite über Trainingslager.', href: "/camps", managementHref: "/dashboard/training-camp" },
    { id: 'bootcamps', title: "Bootcamps", icon: <Mountain className="mr-2 h-4 w-4" />, description: 'Marktplatz für Fussball-Bootcamps.', href: "/bootcamp", managementHref: "/dashboard/bootcamp" },
    { id: 'tickets', title: "Tickets", icon: <Ticket className="mr-2 h-4 w-4" />, description: 'Öffentlicher Ticket-Shop für Spiele.', href: "/tickets", managementHref: "/dashboard/ticketing" },
    { id: 'waitlist', title: "Warteliste", icon: <UserPlus className="mr-2 h-4 w-4" />, description: 'Formularseite für die Spieler-Warteliste.', href: "/waitlist", managementHref: "/dashboard/player-placement" },
];

const PageEditor = ({ pageName, lang }) => {
    const router = useRouter();

    let content;
    switch(pageName) {
        case 'about':
            content = <AboutPageEditor />;
            break;
        case 'faq':
            content = <FaqEditor />;
            break;
        case 'impressum':
            content = <ImpressumPageEditor />;
            break;
        case 'datenschutz':
            content = <DatenschutzPageEditor />;
            break;
        case 'agb':
            content = <AgbPageEditor />;
            break;
        case 'cookies':
            content = <CookieBannerEditor />;
            break;
        default:
             const dynamicPage = dynamicPagesConfig.find(p => p.id === pageName);
            if (dynamicPage && dynamicPage.managementHref) {
                router.push(`/${lang}${dynamicPage.managementHref}`);
                return (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="ml-4">Leite zur Verwaltungsseite weiter...</p>
                    </div>
                );
            }
            content = (
                <Card>
                    <CardHeader><CardTitle>Bearbeitung für "{pageName}"</CardTitle></CardHeader>
                    <CardContent>
                        <p>Die visuelle Bearbeitung für diese Seite ist noch nicht implementiert.</p>
                    </CardContent>
                </Card>
            );
    }

    return (
        <div className="space-y-4">
             <Button asChild variant="ghost">
                <Link href={`/${lang}/dashboard/saas-website-builder`}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Zurück zur Übersicht
                </Link>
            </Button>
            {content}
        </div>
    );
};

const PublicPageVisibilityManager = () => {
    const [pages, setPages] = useState<PublicPage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchConfig = useCallback(async () => {
        setIsLoading(true);
        const config = await getConfiguration();
        const publicPages = config?.publicPages || dynamicPagesConfig.map(p => ({...p, enabled: true}));
        setPages(publicPages);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const handleToggle = (id: string) => {
        setPages(currentPages => 
            currentPages.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
        );
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const config = await getConfiguration();
            await updateConfiguration({ ...config, publicPages: pages });
            toast({ title: 'Sichtbarkeit gespeichert!' });
        } catch (error) {
            toast({ title: 'Fehler beim Speichern', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sichtbarkeit der öffentlichen Seiten</CardTitle>
                <CardDescription>Aktivieren oder deaktivieren Sie die öffentlichen Angebotsseiten in der Hauptnavigation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {isLoading ? <p>Laden...</p> : pages.map(page => (
                    <div key={page.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <Label htmlFor={`switch-${page.id}`} className="font-medium">{page.title}</Label>
                        <Switch
                            id={`switch-${page.id}`}
                            checked={page.enabled}
                            onCheckedChange={() => handleToggle(page.id)}
                        />
                    </div>
                ))}
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4"/> Sichtbarkeit speichern
                </Button>
            </CardFooter>
        </Card>
    )
}


const PageOverview = () => {
    const params = useParams();
    const lang = params.lang;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Webseiten-Inhalte bearbeiten</h1>
                    <p className="text-muted-foreground">Wählen Sie eine Seite aus, um deren Inhalt zu bearbeiten.</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-6">
                    {publicPagesConfig.map(page => (
                        <Card key={page.id}>
                             <CardHeader>
                                <CardTitle className="flex items-center gap-2">{page.icon}{page.title}</CardTitle>
                                <CardDescription>{page.description}</CardDescription>
                            </CardHeader>
                             <CardFooter className="flex justify-end">
                                <Button asChild disabled={!page.supported}>
                                    <Link href={`/${lang}/dashboard/saas-website-builder?page=${page.id}`}>
                                        <Edit className="mr-2 h-4 w-4" /> Inhalt bearbeiten
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
                <div className="space-y-6">
                    <PublicPageVisibilityManager />
                    <Card>
                        <CardHeader>
                            <CardTitle>Dynamische Angebotsseiten</CardTitle>
                            <CardDescription>Die Inhalte dieser Seiten werden über die jeweiligen Module im Dashboard verwaltet.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             {dynamicPagesConfig.map(page => (
                                <Card key={page.id} className="p-4">
                                     <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-semibold flex items-center gap-2">{page.icon}{page.title}</h3>
                                            <p className="text-xs text-muted-foreground pl-7">{page.description}</p>
                                        </div>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/${lang}${page.managementHref}`}>
                                                <Edit className="mr-2 h-4 w-4"/> Verwalten
                                            </Link>
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function SaasWebsiteBuilderPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const page = searchParams.get('page');
  const lang = params.lang;

  if (page) {
    return <PageEditor pageName={page} lang={lang} />;
  }

  return <PageOverview />;
}
