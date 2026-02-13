
'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Save, PlusCircle, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { i18n } from '@/i18n.config';
import { getTranslation, updateTranslation } from '@/ai/flows/translations';

const flattenObject = (obj, prefix = '') => {
    return Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? prefix + '.' : '';
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            Object.assign(acc, flattenObject(obj[k], pre + k));
        } else {
            acc[pre + k] = obj[k];
        }
        return acc;
    }, {});
};

const unflattenObject = (obj) => {
    const result = {};
    for (const key in obj) {
        const keys = key.split('.');
        keys.reduce((acc, currentKey, index) => {
            if (index === keys.length - 1) {
                acc[currentKey] = obj[key];
            } else {
                acc[currentKey] = acc[currentKey] || {};
            }
            return acc[currentKey];
        }, result);
    }
    return result;
};


export default function LanguageSettingsPage() {
    const [translations, setTranslations] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const fetchTranslations = async () => {
        setIsLoading(true);
        try {
            const fetchedTranslations = {};
            for (const locale of i18n.locales) {
                fetchedTranslations[locale] = await getTranslation(locale);
            }
            setTranslations(fetchedTranslations);
        } catch (error) {
            console.error("Failed to fetch translations:", error);
            toast({ title: "Fehler beim Laden", description: "Die Übersetzungen konnten nicht geladen werden.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchTranslations();
    }, []);

    const handleTranslationChange = (lang, key, value) => {
        setTranslations(prev => {
            const newLangTranslations = { ...prev[lang] };
            const flatTranslations = flattenObject(newLangTranslations);
            flatTranslations[key] = value;
            return { ...prev, [lang]: unflattenObject(flatTranslations) };
        });
    };

    const handleSaveChanges = async (lang: string) => {
        setIsLoading(true);
        try {
            await updateTranslation({ lang, data: translations[lang] });
            toast({
                title: "Änderungen gespeichert!",
                description: `Ihre Übersetzungen für ${lang.toUpperCase()} wurden erfolgreich aktualisiert.`,
            });
        } catch (error) {
             console.error("Failed to save translations:", error);
            toast({ title: "Fehler beim Speichern", variant: "destructive" });
        } finally {
             setIsLoading(false);
        }
    };

    const filteredKeys = translations.de ? Object.keys(flattenObject(translations.de)).filter(key =>
        key.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    if (isLoading && Object.keys(translations).length === 0) {
        return <div className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Lade Übersetzungen...</div>
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Inhalte der Webseite bearbeiten</CardTitle>
                        <CardDescription>Verwalten Sie hier die Texte Ihrer öffentlichen Seiten in verschiedenen Sprachen.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={i18n.defaultLocale}>
                    <TabsList>
                        {i18n.locales.map(locale => (
                            <TabsTrigger key={locale} value={locale}>{locale.toUpperCase()}</TabsTrigger>
                        ))}
                    </TabsList>

                    <div className="relative my-4">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Schlüssel suchen..." 
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {i18n.locales.map(locale => (
                        <TabsContent key={locale} value={locale}>
                             <div className="border rounded-lg max-h-[50vh] overflow-y-auto">
                                <Table>
                                    <TableHeader className="sticky top-0 bg-card">
                                        <TableRow>
                                            <TableHead className="w-1/3">Text-Schlüssel</TableHead>
                                            <TableHead className="w-2/3">Übersetzung ({locale.toUpperCase()})</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredKeys.map(key => {
                                            const flatTranslations = flattenObject(translations[locale] || {});
                                            const value = flatTranslations[key] || '';
                                            return (
                                                <TableRow key={key}>
                                                    <TableCell className="font-mono text-xs">{key}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={value}
                                                            onChange={(e) => handleTranslationChange(locale, key, e.target.value)}
                                                            className="h-8"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                             <div className="flex justify-end mt-4">
                                <Button onClick={() => handleSaveChanges(locale)} disabled={isLoading}>
                                    <Save className="mr-2 h-4 w-4"/> Änderungen für {locale.toUpperCase()} speichern
                                </Button>
                            </div>
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
}
