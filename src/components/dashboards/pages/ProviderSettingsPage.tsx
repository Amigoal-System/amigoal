'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import type { Provider, EvaluationAttribute } from '@/ai/flows/providers.types';
import { useBootcampProviders } from '@/hooks/useBootcampProviders';
import { useTrainingCampProviders } from '@/hooks/useTrainingCampProviders';
import { useTeam } from '@/hooks/use-team';
import { nanoid } from 'nanoid';
import { Label } from '@/components/ui/label';


const defaultEvaluationAttributes = [
    { id: 'speed', name: 'Schnelligkeit' },
    { id: 'maturity', name: 'Reife' },
    { id: 'shootingPower', name: 'Schusskraft' },
    { id: 'passingAccuracy', name: 'Passgenauigkeit' },
    { id: 'understanding', name: 'Verständnis' },
];

export default function ProviderSettingsPage() {
    const { userEmail, currentUserRole } = useTeam();
    const { toast } = useToast();

    const providerType = React.useMemo(() => {
        if (currentUserRole?.includes('Bootcamp')) return 'Bootcamp';
        if (currentUserRole?.includes('Trainingslager')) return 'Trainingslager';
        if (currentUserRole?.includes('Turnier')) return 'Turnier';
        return undefined;
    }, [currentUserRole]) as 'Bootcamp' | 'Trainingslager' | 'Turnier' | undefined;

    const bootcampHook = useBootcampProviders();
    const trainingCampHook = useTrainingCampProviders();

    const { providers, updateProvider, isLoading: isLoadingProviders } = React.useMemo(() => {
        if (providerType === 'Bootcamp') return bootcampHook;
        if (providerType === 'Trainingslager') return trainingCampHook;
        return { providers: [], updateProvider: async () => {}, isLoading: false };
    }, [providerType, bootcampHook, trainingCampHook]);

    const [providerData, setProviderData] = useState<Provider | null>(null);
    const [attributes, setAttributes] = useState<EvaluationAttribute[]>([]);

    useEffect(() => {
        if (userEmail && providers.length > 0) {
            const currentProvider = providers.find(p => p.email === userEmail);
            if (currentProvider) {
                setProviderData(currentProvider);
                setAttributes(currentProvider.evaluationAttributes || defaultEvaluationAttributes);
            }
        }
    }, [userEmail, providers]);

    const handleAttributeChange = (id: string, value: string) => {
        setAttributes(prev => prev.map(attr => attr.id === id ? { ...attr, name: value } : attr));
    };

    const addAttribute = () => {
        setAttributes(prev => [...prev, { id: nanoid(), name: '' }]);
    };

    const removeAttribute = (id: string) => {
        setAttributes(prev => prev.filter(attr => attr.id !== id));
    };

    const handleSave = async () => {
        if (!providerData) return;
        const updatedProvider = { ...providerData, evaluationAttributes: attributes.filter(a => a.name.trim() !== '') };
        await updateProvider(updatedProvider);
        toast({ title: 'Einstellungen gespeichert!' });
    };

    if (isLoadingProviders || !providerData) {
        return <p>Lade Einstellungen...</p>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Bewertungs-Attribute</CardTitle>
                <CardDescription>
                    Legen Sie hier Ihre eigenen Kriterien für die Spielerbewertung in Ihren Bootcamps fest.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {attributes.map((attr) => (
                    <div key={attr.id} className="flex items-center gap-2">
                        <Input
                            value={attr.name}
                            onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                            placeholder="z.B. Spielübersicht"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeAttribute(attr.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))}
                <Button variant="outline" className="w-full" onClick={addAttribute}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Neues Attribut
                </Button>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4"/> Speichern
                </Button>
            </CardFooter>
        </Card>
    );
}
