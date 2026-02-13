
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Loader2 } from 'lucide-react';

const MarkdownContent = ({ content }: { content: string }) => {
    if (!content) return null;
    const htmlContent = content
        .split('\n')
        .map(line => {
            if (line.startsWith('### ')) {
                return `<h3 class="text-lg font-semibold mt-4 mb-1">${line.substring(4)}</h3>`;
            }
            if (line.startsWith('## ')) {
                return `<h2 class="text-xl font-bold mt-5 mb-2">${line.substring(3)}</h2>`;
            }
             if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
                return `<p class="text-sm leading-relaxed">${line}</p>`;
            }
            if (line.trim() === '') {
                return '<br />';
            }
            return `<p class="text-sm leading-relaxed text-muted-foreground">${line}</p>`;
        })
        .join('');
    return <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};


export const GameAnalysisModal = ({ isOpen, onOpenChange, match, analysis, isLoading }) => {
    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Spielanalyse: vs. {match?.opponent}</DialogTitle>
                    <DialogDescription>
                        KI-generierte Analyse des Spiels vom {new Date(match?.date).toLocaleDateString('de-CH')}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[60vh] overflow-y-auto pr-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">Analyse</h3>
                                 <MarkdownContent content={analysis?.analysis} />
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2 mt-4">Trainings-Vorschlag</h3>
                               <MarkdownContent content={analysis?.suggestion} />
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="secondary">Auf Webseite publizieren</Button>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Schliessen
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
