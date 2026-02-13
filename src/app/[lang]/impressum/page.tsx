
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

const InfoRow = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 py-3 border-b">
        <dt className="font-semibold text-muted-foreground">{label}</dt>
        <dd className="md:col-span-2">{value}</dd>
    </div>
);

export default function ImpressumPage() {
    const [showLogin, setShowLogin] = useState(false);
    const params = useParams();
    const lang = params.lang;
    const [content, setContent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            if (!lang) return;
            setIsLoading(true);
            try {
                const translations = await getTranslation(lang as string);
                setContent(translations.impressum_page);
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
                        <CardTitle className="text-3xl font-bold font-headline">Impressum</CardTitle>
                        <CardDescription>Angaben gemäss gesetzlicher Verpflichtung.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <dl className="text-sm">
                            <InfoRow label="Name der Firma" value={pageContent.companyName} />
                            <InfoRow label="Zusätzlicher Name" value={pageContent.additionalName} />
                            <InfoRow label="Adresse" value={
                                <div dangerouslySetInnerHTML={{ __html: pageContent.address?.replace(/\n/g, '<br />') || ''}} />
                            } />
                            <InfoRow label="UID" value={pageContent.uid} />
                            <InfoRow label="UID-Status" value={pageContent.uidStatus} />
                            <InfoRow label="Ergänzung" value={pageContent.addition} />
                            <InfoRow label="Vertretungsberechtigte Person" value={pageContent.representative} />
                            <InfoRow label="Kontakt E-Mail" value={<a href={`mailto:${pageContent.contactEmail}`} className="text-primary hover:underline">{pageContent.contactEmail}</a>} />
                        </dl>
                        <div className="mt-6 text-sm text-muted-foreground">
                            <h4 className="font-semibold text-foreground mb-2">Haftungsausschluss</h4>
                            <p>{pageContent.disclaimer}</p>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <SiteFooter onLoginClick={() => setShowLogin(true)} />
        </div>
    );
}
