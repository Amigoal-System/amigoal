
'use client';

import React, { useState, useEffect } from 'react';
import { NavHeader } from '@/components/ui/nav-header';
import { SiteFooter } from '@/components/ui/footer';
import AboutUsSection from '@/components/ui/about-us-section';
import { getTranslation } from '@/ai/flows/translations';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';


export default function AboutPage() {
    const [showLogin, setShowLogin] = useState(false);
    const [content, setContent] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();
    const lang = params.lang as string;

    useEffect(() => {
        const fetchContent = async () => {
            if (!lang) return;
            setIsLoading(true);
            try {
                const translations = await getTranslation(lang);
                setContent(translations.about_page);
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
        )
    }

    return (
        <div className="bg-background text-foreground min-h-screen">
            <NavHeader onLoginClick={() => setShowLogin(true)} />
            <main>
                <AboutUsSection content={content} />
            </main>
            <SiteFooter onLoginClick={() => setShowLogin(true)} />
        </div>
    );
}
