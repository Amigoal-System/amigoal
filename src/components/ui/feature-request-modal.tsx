'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Send, Sparkles, Loader2, FileQuestion, Lightbulb, CheckCircle } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import type { ValidateIdeaOutput } from '@/ai/flows/validateFeatureIdea.types';
import { addFeature } from '@/ai/flows/features';
import type { Feature } from '@/ai/flows/features.types';
import { sendMail } from '@/services/email';
import { validateIdeaAction } from '@/app/actions/validate-idea';


export const FeatureRequestModal = ({ isOpen, onOpenChange, source }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<'New Feature' | 'Improvement' | 'Bug Report' | 'Other' | 'ai'>('New Feature');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    
    // --- Validation State ---
    const [debouncedDescription] = useDebounce(description, 1000);
    const [isChecking, setIsChecking] = useState(false);
    const [validationResult, setValidationResult] = useState<ValidateIdeaOutput | null>(null);
    const [userWantsToSubmitAnyway, setUserWantsToSubmitAnyway] = useState(false);

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
        setValidationResult(null); // Reset validation when user types
        setUserWantsToSubmitAnyway(false);
    };

    const runValidation = useCallback(async (desc: string) => {
        if (desc.trim().length < 20) { // Only validate if description is long enough
            setValidationResult(null);
            return;
        }
        setIsChecking(true);
        try {
            const result = await validateIdeaAction({ ideaDescription: desc });
            setValidationResult(result);
        } catch (error) {
            console.error("Validation failed", error);
            setValidationResult(null); // Ignore validation errors and allow submission
        } finally {
            setIsChecking(false);
        }
    }, []);

    useEffect(() => {
        runValidation(debouncedDescription);
    }, [debouncedDescription, runValidation]);


    const handleSubmit = async () => {
        if (!title || !description) {
            toast({
                title: "Fehlende Informationen",
                description: "Bitte füllen Sie Titel und Beschreibung aus.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        
        const newFeature: Omit<Feature, 'id'> = {
            name: title,
            description: description,
            category: category,
            status: 'review',
            timeline: 'TBD', // To be determined
            assignedTo: 'Unassigned',
            tasks: []
        };
        
        try {
            await addFeature(newFeature);
            
            // Send notification email to admin
            const adminEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@amigoal.ch';
            await sendMail({
                to: adminEmail,
                subject: `Neue Idee eingereicht: ${title}`,
                html: `
                    <h1>Neue Idee/Wunsch erhalten</h1>
                    <p>Ein neuer Vorschlag wurde über das Formular auf der Webseite (${source}) eingereicht.</p>
                    <h3>Details:</h3>
                    <ul>
                        <li><strong>Titel:</strong> ${title}</li>
                        <li><strong>Kategorie:</strong> ${category}</li>
                        <li><strong>E-Mail (optional):</strong> ${email || 'Nicht angegeben'}</li>
                    </ul>
                    <h3>Beschreibung:</h3>
                    <p style="white-space: pre-wrap; background-color: #f5f5f5; padding: 10px; border-radius: 5px;">${description}</p>
                    <p>Sie können diesen Vorschlag nun auf der <a href="/dashboard/roadmap">Roadmap-Seite</a> einsehen und bearbeiten.</p>
                `
            });
            
            // Send confirmation email to the user if email is provided
            if (email) {
                 if (category === 'Bug Report') {
                    await sendMail({
                        to: email,
                        subject: `Ihre Fehlermeldung wurde empfangen: "${title}"`,
                        html: `
                            <h1>Vielen Dank für Ihre Mithilfe!</h1>
                            <p>Hallo,</p>
                            <p>wir haben Ihre Fehlermeldung "${title}" erhalten und unser Team wird sich das so schnell wie möglich ansehen.</p>
                            <p>Wir schätzen Ihre Hilfe bei der Verbesserung von Amigoal sehr.</p>
                            <br/>
                            <p>Sportliche Grüsse,</p>
                            <p>Ihr Amigoal Team</p>
                        `
                    });
                } else {
                    await sendMail({
                        to: email,
                        subject: `Ihre Idee wurde bei Amigoal eingereicht: "${title}"`,
                        html: `
                            <h1>Vielen Dank für Ihren Vorschlag!</h1>
                            <p>Hallo,</p>
                            <p>wir haben Ihre Idee "${title}" erhalten und werden sie sorgfältig prüfen.</p>
                            <p>Sie können den Fortschritt auf unserer öffentlichen <a href="/de/dashboard/roadmap">Roadmap-Seite</a> verfolgen.</p>
                            <br/>
                            <p>Sportliche Grüsse,</p>
                            <p>Ihr Amigoal Team</p>
                        `
                    });
                }
            }
            
            toast({
                title: "Vielen Dank für Ihre Eingabe!",
                description: "Wir haben Ihren Vorschlag erhalten und werden ihn prüfen.",
            });
            onOpenChange(false);
        } catch (error) {
             console.error("Feature request submission failed:", error);
             toast({
                title: "Fehler",
                description: "Ihr Vorschlag konnte nicht übermittelt werden.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    useEffect(() => {
        if (!isOpen) {
            setTitle('');
            setDescription('');
            setCategory('New Feature');
            setEmail('');
            setValidationResult(null);
            setUserWantsToSubmitAnyway(false);
        }
    }, [isOpen]);

    const renderValidationSection = () => {
        if (isChecking) {
            return (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                    <Loader2 className="h-4 w-4 animate-spin"/>
                    <p>Prüfe, ob diese Funktion bereits existiert...</p>
                </div>
            )
        }
        if (validationResult?.exists) {
            return (
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-800 dark:text-blue-200">
                    <div className="flex items-start gap-3">
                        <FileQuestion className="h-5 w-5 mt-1"/>
                        <div>
                            <h4 className="font-semibold">Funktion bereits vorhanden?</h4>
                            <p className="text-sm mt-1">
                                Meinen Sie die Funktion "{validationResult.featureName}"? Sie finden diese {validationResult.locationHint}.
                            </p>
                             <Button variant="link" className="p-0 h-auto text-blue-800 dark:text-blue-200 mt-2" onClick={() => setUserWantsToSubmitAnyway(true)}>
                                Trotzdem einreichen
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }
         if (validationResult && !validationResult.exists && description.length > 20) {
            return (
                 <div className="flex items-center gap-2 text-sm p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-800 dark:text-green-200">
                    <Lightbulb className="h-4 w-4"/>
                    <p>Danke, das scheint eine neue Idee zu sein!</p>
                </div>
            )
        }
        return null;
    }
    
    const canSubmit = !isChecking && (!validationResult?.exists || userWantsToSubmitAnyway);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Idee oder Wunsch einreichen</DialogTitle>
                    <DialogDescription>
                        Helfen Sie uns, Amigoal zu verbessern. Was fehlt Ihnen oder was könnten wir besser machen?
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Titel</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z.B. Integration von Video-Analyse" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Beschreibung</Label>
                        <Textarea id="description" value={description} onChange={handleDescriptionChange} placeholder="Beschreiben Sie Ihre Idee so detailliert wie möglich." />
                    </div>
                    
                    {renderValidationSection()}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Kategorie</Label>
                            <Select value={category} onValueChange={(val) => setCategory(val as any)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="New Feature">Neues Feature</SelectItem>
                                    <SelectItem value="Improvement">Verbesserung</SelectItem>
                                    <SelectItem value="ai">KI-Funktion</SelectItem>
                                    <SelectItem value="Bug Report">Fehler melden</SelectItem>
                                    <SelectItem value="Other">Anderes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Ihre E-Mail (optional)</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Für Rückfragen" />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Abbrechen</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
                         {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                         Idee einreichen
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
    