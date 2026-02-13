
'use client';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from './button';
import { Mail, Share2, Edit, Save, X, Sparkles, Loader2 } from 'lucide-react';
import { AmigoalLogo } from '../icons';
import { FireworksBackground } from './fireworks-show';
import { Input } from './input';
import { Textarea } from './textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { EmailComposerModal } from './email-composer-modal';
import { generateQuote } from '@/ai/flows/generateQuote';

export const BirthdayCard = ({ member, isOpen, onOpenChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [cardContent, setCardContent] = useState({
        title: '',
        message: '',
        quote: '',
        quoteAuthor: '',
    });
    const [isGeneratingQuote, setIsGeneratingQuote] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (member) {
            setCardContent({
                title: `Happy Birthday ${member.name}!`,
                message: `Der gesamte Verein wünscht dir alles Gute zum ${member.age}. Geburtstag!\n\nViel Glück, Gesundheit und weiterhin viel Erfolg auf und neben dem Platz.`,
                quote: '',
                quoteAuthor: ''
            });
        }
        setIsEditing(false); // Reset editing mode when modal opens or member changes
    }, [member, isOpen]);
    
    if (!isOpen || !member) return null;

    const handleGenerateQuote = async () => {
        setIsGeneratingQuote(true);
        try {
            const result = await generateQuote({ theme: 'Success' });
            setCardContent(c => ({ ...c, quote: result.quote, quoteAuthor: result.author }));
        } catch (error) {
            console.error("Failed to generate quote", error);
            toast({ title: "Fehler", description: "Zitat konnte nicht generiert werden.", variant: "destructive" });
        } finally {
            setIsGeneratingQuote(false);
        }
    };

    const handleSave = () => {
        setIsEditing(false);
        // In a real app, you might save this custom message somewhere.
    };

    const handleCancel = () => {
        // Reset to default
        setCardContent({
            title: `Happy Birthday ${member.name}!`,
            message: `Der gesamte Verein wünscht dir alles Gute zum ${member.age}. Geburtstag!\n\nViel Glück, Gesundheit und weiterhin viel Erfolg auf und neben dem Platz.`,
            quote: '',
            quoteAuthor: ''
        });
        setIsEditing(false);
    };
    
    const handleSend = () => {
        // Simulate sending the email and notification directly
        console.log("Sending birthday wishes to:", member.email, "Message:", cardContent.message);
        toast({
            title: "Glückwünsche gesendet!",
            description: `Die Geburtstagskarte wurde an ${member.name} gesendet.`,
        });
        onOpenChange(false);
    };

    const handleShare = async () => {
        const shareText = `${cardContent.title}\n\n${cardContent.message}${cardContent.quote ? `\n\n"${cardContent.quote}" - ${cardContent.quoteAuthor}` : ''}`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: cardContent.title,
                    text: shareText,
                    url: window.location.href,
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error sharing:', error);
                     toast({
                        title: "Teilen fehlgeschlagen",
                        description: "Die Karte konnte nicht geteilt werden.",
                        variant: "destructive",
                    });
                }
            }
        } else {
            toast({
                title: "Teilen nicht unterstützt",
                description: "Ihr Browser unterstützt diese Funktion leider nicht.",
            });
        }
    };


    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-lg p-0 overflow-hidden">
                     <DialogHeader className="sr-only">
                        <DialogTitle>Geburtstagskarte für {member.name}</DialogTitle>
                        <DialogDescription>Eine animierte und bearbeitbare Geburtstagskarte, um dem Mitglied zum Geburtstag zu gratulieren.</DialogDescription>
                    </DialogHeader>
                    <div className="aspect-[3/4] w-full relative">
                        <FireworksBackground>
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white p-8 bg-black/60">
                                <AmigoalLogo className="w-16 h-16 mb-4" />
                                
                                {isEditing ? (
                                    <Input 
                                        className="bg-transparent text-white border-white/50 text-center text-4xl font-bold font-headline mb-4 h-auto"
                                        value={cardContent.title}
                                        onChange={(e) => setCardContent(c => ({...c, title: e.target.value}))}
                                    />
                                ) : (
                                    <h2 className="text-4xl font-bold font-headline mb-4">{cardContent.title}</h2>
                                )}
                                
                                {isEditing ? (
                                    <Textarea 
                                        className="bg-transparent text-white border-white/50 text-center text-base"
                                        value={cardContent.message}
                                        onChange={(e) => setCardContent(c => ({...c, message: e.target.value}))}
                                        rows={5}
                                    />
                                ) : (
                                    <p className="font-semibold whitespace-pre-wrap">{cardContent.message}</p>
                                )}
                                
                                {(cardContent.quote || isEditing) && (
                                    <div className="mt-6 border-t border-white/50 pt-4 w-full">
                                    {isEditing ? (
                                        <Textarea
                                            className="bg-transparent text-white border-white/50 text-center text-sm italic"
                                            placeholder="Zitat hier einfügen oder generieren..."
                                            value={cardContent.quote ? `"${cardContent.quote}" - ${cardContent.quoteAuthor}` : ''}
                                            onChange={(e) => {
                                                const parts = e.target.value.split('" - ');
                                                const quote = parts[0]?.replace('"', '');
                                                const author = parts[1] || '';
                                                setCardContent(c => ({ ...c, quote, quoteAuthor: author }));
                                            }}
                                            rows={3}
                                        />

                                    ) : (
                                        <blockquote className="text-sm italic">
                                            <p>&ldquo;{cardContent.quote}&rdquo;</p>
                                            <footer className="mt-2">- {cardContent.quoteAuthor}</footer>
                                        </blockquote>
                                    )}
                                     {isEditing && (
                                        <Button size="sm" variant="secondary" className="mt-2" onClick={handleGenerateQuote} disabled={isGeneratingQuote}>
                                            {isGeneratingQuote ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                                            Zitat generieren
                                        </Button>
                                    )}
                                    </div>
                                )}

                            </div>
                        </FireworksBackground>
                    </div>
                    <div className="p-6 flex justify-between items-center bg-background">
                        {isEditing ? (
                            <div className="flex gap-2">
                                <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Speichern</Button>
                                <Button variant="outline" onClick={handleCancel}>Abbrechen</Button>
                            </div>
                        ) : (
                            <Button variant="outline" onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4"/> Bearbeiten</Button>
                        )}
                        <div className="flex gap-2">
                            <Button className="w-full" onClick={handleSend}><Mail className="mr-2 h-4 w-4"/> Senden</Button>
                            <Button className="w-full" onClick={handleShare}><Share2 className="mr-2 h-4 w-4"/> Teilen</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};
