
'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SiteFooter } from '@/components/ui/footer';
import { useState, useEffect } from 'react';
import { getPostBySlug } from '@/ai/flows/blog';
import type { Post } from '@/ai/flows/blog.types';

// A simple markdown-to-html converter
const MarkdownContent = ({ content }: { content: string }) => {
    const htmlContent = content
        .split('\n')
        .map(line => {
            if (line.startsWith('### ')) {
                return `<h3 class="text-xl font-bold mt-6 mb-2">${'\'\'\''}{line.substring(4)}</h3>`;
            }
            if (line.startsWith('## ')) {
                return `<h2 class="text-2xl font-bold mt-8 mb-3">${'\'\'\''}{line.substring(3)}</h2>`;
            }
            if (line.startsWith('# ')) {
                return `<h1 class="text-3xl font-bold mt-10 mb-4">${'\'\'\''}{line.substring(2)}</h1>`;
            }
            if (line.trim() === '') {
                return '<br />';
            }
            if (line.startsWith('- ')) {
                return `<li>${'\'\'\''}{line.substring(2)}</li>`;
            }
             if (line.match(/^\d+\.\s/)) {
                return `<li>${'\'\'\''}{line.substring(line.indexOf(' ') + 1)}</li>`;
            }
            return `<p class="text-muted-foreground leading-relaxed">${'\'\'\''}{line}</p>`;
        })
        .join('');
        
    // Wrap list items in <ul> or <ol>
    const finalHtml = htmlContent.replace(/<li>.*?<\/li>/gs, (match) => {
        if(match.includes("1. ")){
            return `<ol class="list-decimal list-inside">${'\'\'\''}{match}</ol>`;
        }
        return `<ul class="list-disc list-inside">${'\'\'\''}{match}</ul>`
    }).replace(/<\/ul>\s*<ul>/g, '').replace(/<\/ol>\s*<ol>/g, '');

    return <div className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: finalHtml }} />;
};


export default function BlogPostPage() {
    const params = useParams();
    const router = useRouter();
    const { slug, lang } = params;
    const [showLogin, setShowLogin] = useState(false);
    const [post, setPost] = useState<Post | null | undefined>(undefined);

    useEffect(() => {
      const fetchPost = async () => {
        if (typeof slug === 'string') {
          const fetchedPost = await getPostBySlug(slug);
          setPost(fetchedPost);
        }
      }
      fetchPost();
    }, [slug]);

    if (post === undefined) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <p>Lade Beitrag...</p>
        </div>
      );
    }

    if (!post) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center">
                <h1 className="text-4xl font-bold mb-4">404 - Beitrag nicht gefunden</h1>
                <p className="text-muted-foreground mb-8">Der von Ihnen gesuchte Blogbeitrag existiert nicht.</p>
                <Button asChild>
                    <Link href={`/${lang}/blog`}>Zurück zum Blog</Link>
                </Button>
            </div>
        );
    }
    
    const publishDate = new Date(post.publishDate).toLocaleDateString('de-CH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="min-h-screen bg-background">
            <header className="py-4 px-4 md:px-8">
                 <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground">
                    <ArrowLeft className="h-4 w-4" />
                    Zurück zum Blog
                </Button>
            </header>
            <main className="container mx-auto max-w-3xl px-4 py-8 md:py-16">
                <article>
                    <header className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">{post.title}</h1>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Image 
                                    src={post.author.avatar}
                                    alt={post.author.name}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                    data-ai-hint="person portrait"
                                />
                               <span>{post.author.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{publishDate}</span>
                            </div>
                        </div>
                    </header>
                    <div className="space-y-6">
                        <MarkdownContent content={post.content} />
                    </div>
                </article>
            </main>
             <SiteFooter onLoginClick={() => setShowLogin(true)} />
        </div>
    )
}
