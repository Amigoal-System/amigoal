
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTranslation, updateTranslation } from '@/ai/flows/translations';

export const AboutPageEditor = () => {
    const [content, setContent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchContent = useCallback(async () => {
        setIsLoading(true);
        const data = await getTranslation('de');
        setContent(data.about_page);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const handleInputChange = (e, sectionIndex?: number) => {
        const { id, value } = e.target;
        if (sectionIndex !== undefined) {
            const newServices = [...content.services];
            newServices[sectionIndex] = { ...newServices[sectionIndex], [id]: value };
            setContent(prev => ({...prev, services: newServices}));
        } else {
            setContent(prev => ({...prev, [id]: value}));
        }
    };
    
    const handleSave = async () => {
        setIsLoading(true);
        try {
            const fullConfig = await getTranslation('de');
            fullConfig.about_page = content;
            await updateTranslation({ lang: 'de', data: fullConfig });
            toast({ title: 'Seite "Über Uns" gespeichert!' });
        } catch(e) {
            toast({ title: "Fehler", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) return <p>Lade Inhalte...</p>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Seite "Über Uns" bearbeiten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="subtitle">Untertitel</Label>
                    <Input id="subtitle" value={content.subtitle} onChange={handleInputChange} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="title">Titel</Label>
                    <Input id="title" value={content.title} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="paragraph">Einleitungstext</Label>
                    <Textarea id="paragraph" value={content.paragraph} onChange={handleInputChange} rows={4}/>
                </div>
                 <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold">Dienstleistungen</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {content.services.map((service, index) => (
                             <div key={index} className="p-4 border rounded-lg space-y-2">
                                <Label htmlFor="title">Titel</Label>
                                <Input id="title" value={service.title} onChange={e => handleInputChange(e, index)} />
                                <Label htmlFor="description">Beschreibung</Label>
                                <Textarea id="description" value={service.description} onChange={e => handleInputChange(e, index)} rows={3}/>
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
