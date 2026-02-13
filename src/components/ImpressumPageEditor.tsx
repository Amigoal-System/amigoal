
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
import { Loader2 } from 'lucide-react';

const emptyContent = {
    companyName: "",
    additionalName: "",
    address: "",
    uid: "",
    uidStatus: "",
    addition: "",
    representative: "",
    contactEmail: "",
    disclaimer: ""
};

export const ImpressumPageEditor = () => {
    const [content, setContent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchContent = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getTranslation('de');
            setContent(data.impressum_page || emptyContent);
        } catch (error) {
            console.error("Failed to fetch impressum content:", error);
            setContent(emptyContent); // Set a default structure on error
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setContent((prev: any) => ({...prev, [id]: value}));
    };
    
    const handleSave = async () => {
        setIsLoading(true);
        try {
            const fullConfig = await getTranslation('de');
            fullConfig.impressum_page = content;
            await updateTranslation({ lang: 'de', data: fullConfig });
            toast({ title: 'Impressum gespeichert!' });
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
                <CardTitle>Impressum bearbeiten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {Object.keys(content).map(key => (
                    <div key={key} className="space-y-2">
                        <Label htmlFor={key} className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                        {key === 'address' || key === 'disclaimer' ? (
                             <Textarea id={key} value={content[key]} onChange={handleInputChange} rows={key === 'address' ? 4 : 6}/>
                        ) : (
                            <Input id={key} value={content[key]} onChange={handleInputChange} />
                        )}
                    </div>
                ))}
            </CardContent>
             <CardFooter>
                 <Button onClick={handleSave} disabled={isLoading}><Save className="mr-2 h-4 w-4"/> Änderungen speichern</Button>
            </CardFooter>
        </Card>
    )
}
