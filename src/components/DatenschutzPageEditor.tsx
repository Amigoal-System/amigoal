
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTranslation, updateTranslation } from '@/ai/flows/translations';

const emptyContent = {
    title: "",
    last_updated: "",
    sections: []
};

export const DatenschutzPageEditor = () => {
    const [content, setContent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchContent = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getTranslation('de');
            setContent(data.datenschutz_page || emptyContent);
        } catch (error) {
            console.error("Failed to fetch datenschutz content:", error);
            setContent(emptyContent);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const handleInputChange = (id: string, value: string, index?: number) => {
        if (index !== undefined) {
             const newSections = [...content.sections];
             newSections[index] = { ...newSections[index], [id]: value };
             setContent(prev => ({...prev, sections: newSections}));
        } else {
             setContent(prev => ({...prev, [id]: value}));
        }
    };
    
    const handleSave = async () => {
        setIsLoading(true);
        try {
            const fullConfig = await getTranslation('de');
            fullConfig.datenschutz_page = content;
            await updateTranslation({ lang: 'de', data: fullConfig });
            toast({ title: 'Datenschutzerklärung gespeichert!' });
        } catch(e) {
            toast({ title: "Fehler", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading || !content) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="ml-2">Lade Inhalte...</p>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Datenschutzerklärung bearbeiten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Titel</Label>
                    <Input id="title" value={content.title} onChange={(e) => handleInputChange('title', e.target.value)} />
                </div>
                 <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold">Abschnitte</h3>
                    <div className="space-y-4">
                        {(content.sections || []).map((section, index) => (
                             <div key={index} className="p-4 border rounded-lg space-y-2">
                                <Label htmlFor={`section-title-${index}`}>Titel Abschnitt {index + 1}</Label>
                                <Input id="title" value={section.title} onChange={e => handleInputChange('title', e.target.value, index)} />
                                
                                <Label htmlFor={`section-content-${index}`}>Inhalt</Label>
                                <Textarea id="content" value={section.content} onChange={e => handleInputChange('content', e.target.value, index)} rows={6}/>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
             <CardFooter>
                 <Button onClick={handleSave} disabled={isLoading}><Save className="mr-2 h-4 w-4"/> Änderungen speichern</Button>
            </CardFooter>
        </Card>
    )
}
