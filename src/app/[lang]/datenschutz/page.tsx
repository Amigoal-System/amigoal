
'use client';

import React, { useState, useEffect } from 'react';
import { NavHeader } from '@/components/ui/nav-header';
import { SiteFooter } from '@/components/ui/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { getTranslation } from '@/ai/flows/translations';

const PrivacySection = ({ title, children }: { title: string, children: React.ReactNode}) => (
    <div className="space-y-2 mb-6">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="text-muted-foreground space-y-4 text-sm whitespace-pre-wrap">
            {children}
        </div>
    </div>
);

export default function DatenschutzPage() {
    const [showLogin, setShowLogin] = useState(false);
    const params = useParams();
    const lang = params.lang as string;
    const [content, setContent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
        const fetchContent = async () => {
            if (!lang) return;
            setIsLoading(true);
            try {
                const translations = await getTranslation(lang);
                setContent(translations.datenschutz_page);
            } catch (error) {
                console.error("Could not load page content", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchContent();
    }, [lang]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    const pageContent = content || {};

    return (
        <div className="bg-muted/20 text-foreground min-h-screen flex flex-col">
            <NavHeader onLoginClick={() => setShowLogin(true)} />
            <main className="flex-grow container mx-auto max-w-4xl px-4 py-16 md:py-24">
                 <Button asChild variant="ghost" className="mb-4">
                    <Link href={`/${lang}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Zurück zur Hauptseite
                    </Link>
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold font-headline">{pageContent.title || 'Datenschutzerklärung'}</CardTitle>
                        <CardDescription>{pageContent.last_updated?.replace('{DATE}', new Date().toLocaleDateString('de-CH')) || `Stand: ${new Date().toLocaleDateString('de-CH')}`}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {(pageContent.sections || []).map((section, index) => (
                             <PrivacySection key={index} title={section.title}>
                                {section.content}
                            </PrivacySection>
                        ))}
                    </CardContent>
                </Card>
            </main>
            <SiteFooter onLoginClick={() => setShowLogin(true)} />
        </div>
    );
}
