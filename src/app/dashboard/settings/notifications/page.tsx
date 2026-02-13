

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { getConfiguration, updateConfiguration } from '@/ai/flows/configurations';
import type { NotificationSetting } from '@/ai/flows/configurations.types';

export default function NotificationsSettingsPage() {
    const [settings, setSettings] = useState<NotificationSetting[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        try {
            const config = await getConfiguration();
            if (config && config.notificationSettings) {
                setSettings(config.notificationSettings);
            }
        } catch (error) {
            toast({ title: "Fehler beim Laden der Einstellungen", variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);


    const handleToggle = (id: string, type: 'inApp' | 'email') => {
        setSettings(prev => 
            prev.map(setting => 
                setting.id === id ? { ...setting, [type]: !setting[type] } : setting
            )
        );
    };
    
    const handleSave = async () => {
        setIsLoading(true);
        try {
            const currentConfig = await getConfiguration();
            await updateConfiguration({ ...currentConfig, notificationSettings: settings });
            toast({
                title: "Einstellungen gespeichert",
                description: "Ihre Benachrichtigungseinstellungen wurden aktualisiert."
            });
        } catch (error) {
             toast({
                title: "Fehler beim Speichern",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Benachrichtigungen</CardTitle>
                <CardDescription>Verwalten Sie hier Ihre globalen Benachrichtigungseinstellungen für die Plattform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-3 gap-4 font-semibold px-4">
                    <div className="col-span-1">Ereignis</div>
                    <div className="text-center">In-App</div>
                    <div className="text-center">E-Mail</div>
                </div>
                <Separator />
                {isLoading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin"/></div> : settings.map(setting => (
                    <div key={setting.id} className="grid grid-cols-3 gap-4 items-center p-4 border rounded-lg">
                        <Label htmlFor={`inApp-${setting.id}`} className="col-span-1 cursor-pointer">{setting.label}</Label>
                        <div className="flex justify-center">
                            <Switch 
                                id={`inApp-${setting.id}`} 
                                checked={setting.inApp}
                                onCheckedChange={() => handleToggle(setting.id, 'inApp')}
                            />
                        </div>
                        <div className="flex justify-center">
                             <Switch 
                                id={`email-${setting.id}`} 
                                checked={setting.email}
                                onCheckedChange={() => handleToggle(setting.id, 'email')}
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    Einstellungen speichern
                </Button>
            </CardFooter>
        </Card>
    );
}

    