
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTranslation, updateTranslation } from '@/ai/flows/translations';
import { Switch } from './ui/switch';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

const emptyContent = {
    enabled: true,
    title: "",
    message: "",
    acceptText: "",
    customizeText: "",
    icon: "cookie",
    privacyHref: "/datenschutz",
    termsHref: "/agb"
};

export const CookieBannerEditor = () => {
    const [content, setContent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchContent = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getTranslation('de');
            setContent(data.cookie_banner || emptyContent);
        } catch (error) {
            console.error("Failed to fetch cookie banner content:", error);
            setContent(emptyContent);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    const handleInputChange = (id: string, value: string | boolean) => {
        setContent(prev => ({...prev, [id]: value}));
    };
    
    const handleSave = async () => {
        setIsLoading(true);
        try {
            const fullConfig = await getTranslation('de');
            fullConfig.cookie_banner = content;
            await updateTranslation({ lang: 'de', data: fullConfig });
            // Also save to localStorage for immediate effect on the current page
            localStorage.setItem("amigoal_cookie_settings", JSON.stringify(content));
            toast({ title: 'Cookie-Banner Einstellungen gespeichert!' });
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
                <CardTitle>Cookie-Banner bearbeiten</CardTitle>
                <CardDescription>Passen Sie die Texte und Einstellungen für das Cookie-Banner an.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <Label htmlFor="enabled">Cookie Banner aktiviert</Label>
                    <Switch id="enabled" checked={content.enabled} onCheckedChange={(val) => handleInputChange('enabled', val)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="title">Titel</Label>
                    <Input id="title" value={content.title} onChange={(e) => handleInputChange('title', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message">Nachricht</Label>
                    <Textarea id="message" value={content.message} onChange={(e) => handleInputChange('message', e.target.value)} rows={3}/>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="acceptText">"Akzeptieren"-Button Text</Label>
                        <Input id="acceptText" value={content.acceptText} onChange={(e) => handleInputChange('acceptText', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="customizeText">"Anpassen"-Button Text</Label>
                        <Input id="customizeText" value={content.customizeText} onChange={(e) => handleInputChange('customizeText', e.target.value)} />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="icon">Icon</Label>
                     <Select value={content.icon} onValueChange={(val) => handleInputChange('icon', val)}>
                        <SelectTrigger id="icon"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="cookie">Cookie</SelectItem>
                            <SelectItem value="shield">Schild</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
             <CardFooter>
                 <Button onClick={handleSave} disabled={isLoading}><Save className="mr-2 h-4 w-4"/> Änderungen speichern</Button>
            </CardFooter>
        </Card>
    )
}
