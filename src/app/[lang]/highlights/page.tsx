
'use client';

import React, { useState } from 'react';
import { NavHeader } from '@/components/ui/nav-header';
import { SocialCard } from '@/components/ui/social-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type Locale } from '@/../i18n.config';
import { Sparkles, Video, Loader2 } from 'lucide-react';
import { SiteFooter } from '@/components/ui/footer';
import { useHighlights } from '@/hooks/useHighlights';

export default function HighlightsLandingPage() {
    const params = useParams();
    const lang = params.lang as Locale;
    const [showLogin, setShowLogin] = useState(false);
    const { highlights, isLoading } = useHighlights();
    const approvedHighlights = highlights.filter(h => h.status === 'approved');

    return (
        <div className="min-h-screen bg-muted/20">
            <NavHeader onLoginClick={() => setShowLogin(true)} />

            <header className="relative pt-40 pb-20 bg-gradient-to-b from-primary/10 to-muted/20 text-center">
                <div className="container mx-auto max-w-5xl px-4">
                     <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                        <Video className="h-8 w-8" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold font-headline mb-4">Amigoal Highlights</h1>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        Die besten Momente, Tore und Skills aus der Amigoal-Community. Erlebe die Leidenschaft des Fussballs.
                    </p>
                </div>
            </header>

            <main className="py-24">
                <div className="container mx-auto max-w-3xl px-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                            <p className="ml-4 text-muted-foreground">Lade Highlights...</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                             {approvedHighlights.map(highlight => {
                                 const videoPlayer = (
                                    <video src={highlight.videoUrl} controls className="w-full h-full object-cover" poster={highlight.videoUrl.includes('placehold.co') ? highlight.videoUrl : undefined}></video>
                                );
                                return (
                                    <SocialCard
                                        key={highlight.id}
                                        author={{
                                            name: highlight.user,
                                            username: highlight.team,
                                            avatar: `https://placehold.co/40x40.png?text=${highlight.user.split(' ').map(n=>n[0]).join('')}`,
                                            timeAgo: highlight.type
                                        }}
                                        content={{ media: videoPlayer }}
                                        engagement={highlight}
                                    />
                                )
                            })}
                        </div>
                    )}
                </div>
            </main>
            
            <div className="py-16 text-center">
                 <div className="container mx-auto max-w-xl px-4">
                     <h2 className="text-3xl font-bold mb-4">Dein Moment. Dein Highlight.</h2>
                     <p className="text-muted-foreground mb-8">
                         Bist du bereit, deine besten Szenen zu teilen? Registriere dich bei Amigoal, lade deine Videos hoch und werde Teil der Community.
                     </p>
                      <Button asChild size="lg">
                        <Link href={`/${lang}/`}>Jetzt kostenlos registrieren</Link>
                    </Button>
                 </div>
            </div>
            <SiteFooter onLoginClick={() => setShowLogin(true)} />
        </div>
    );
}
