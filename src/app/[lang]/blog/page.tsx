
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { type Locale } from '@/i18n.config';
import { ArrowRight, Calendar } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { SiteFooter } from '@/components/ui/footer';
import { useState, useEffect } from 'react';
import { getAllPosts } from '@/ai/flows/blog';
import type { Post } from '@/ai/flows/blog.types';

export default function BlogIndexPage() {
  const params = useParams();
  const lang = params.lang as Locale;
  const [showLogin, setShowLogin] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await getAllPosts();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto max-w-4xl px-4 py-16">
            <header className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl font-bold font-headline mb-4">Amigoal Blog</h1>
                <p className="text-lg text-muted-foreground">Einblicke, Neuigkeiten und Geschichten aus der Welt der Vereinsverwaltung.</p>
                 <Button asChild className="mt-8">
                    <Link href={`/${lang}`}>Zur Hauptseite</Link>
                </Button>
            </header>

            <div className="space-y-12">
                {isLoading ? (
                    <p>Lade Beiträge...</p>
                ) : (
                    posts.map((post) => {
                        const publishDate = new Date(post.publishDate).toLocaleDateString('de-CH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        });

                        return (
                            <article key={post.slug}>
                                <h2 className="text-3xl font-bold font-headline mb-2">
                                    <Link href={`/${lang}/blog/${post.slug}`} className="hover:text-primary transition-colors">
                                        {post.title}
                                    </Link>
                                </h2>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                    <div className="flex items-center gap-2">
                                        <Image 
                                            src={post.author.avatar}
                                            alt={post.author.name}
                                            width={24}
                                            height={24}
                                            className="rounded-full"
                                            data-ai-hint="person portrait"
                                        />
                                    <span>{post.author.name}</span>
                                    </div>
                                    <span className="text-muted-foreground/50">|</span>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <time dateTime={post.publishDate}>{publishDate}</time>
                                    </div>
                                </div>
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                    {post.summary}
                                </p>
                                <Link href={`/${lang}/blog/${post.slug}`} className="text-primary font-semibold hover:underline flex items-center gap-1">
                                    Weiterlesen <ArrowRight className="h-4 w-4" />
                                </Link>
                            </article>
                        )
                    })
                )}
            </div>
        </main>
        <SiteFooter onLoginClick={() => setShowLogin(true)} />
    </div>
  );
}
