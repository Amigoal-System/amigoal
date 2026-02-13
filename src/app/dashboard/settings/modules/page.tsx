
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, ShieldCheck, XCircle, ShoppingCart, BarChart, Handshake, PlusCircle, Edit, Save, Trash2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { moduleDescriptions, moduleOrder, rolesConfig } from '@/lib/roles';
import { useTeam } from '@/hooks/use-team';
import { getConfiguration, updateConfiguration } from '@/ai/flows/configurations';
import type { SaasPackage } from '@/ai/flows/configurations.types';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const SaasPackageModal = ({ pkg, isOpen, onOpenChange, onSave }: { pkg: Partial<SaasPackage> | null, isOpen: boolean, onOpenChange: (open: boolean) => void, onSave: (pkg: Partial<SaasPackage>) => void }) => {
    const [formData, setFormData] = useState<Partial<SaasPackage> | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(pkg || { id: `pkg-${Date.now()}`, name: '', price: '', description: '', maxUsers: 0, isPopular: false });
        }
    }, [pkg, isOpen]);

    if (!formData) return null;
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{formData.id ? 'Paket bearbeiten' : 'Neues Paket erstellen'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={formData.name || ''} onChange={(e) => setFormData(p => p ? {...p, name: e.target.value} : null)}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Preis</Label>
                            <Input id="price" value={formData.price || ''} onChange={(e) => setFormData(p => p ? {...p, price: e.target.value} : null)}/>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="description">Beschreibung</Label>
                        <Input id="description" value={formData.description || ''} onChange={(e) => setFormData(p => p ? {...p, description: e.target.value} : null)}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="maxUsers">Max. Nutzer</Label>
                        <Input id="maxUsers" type="number" value={formData.maxUsers || 0} onChange={(e) => setFormData(p => p ? {...p, maxUsers: parseInt(e.target.value, 10) || 0} : null)}/>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={() => onSave(formData)}>Speichern</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function ModulesSettingsPage() {
    const { toast } = useToast();
    const { currentUserRole } = useTeam();
    const [saasPackages, setSaaSPackages] = useState<SaasPackage[]>([]);
    const [config, setConfig] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editingPackage, setEditingPackage] = useState<Partial<SaasPackage> | null>(null);

    const fetchConfig = async () => {
        setIsLoading(true);
        const fetchedConfig = await getConfiguration();
        setConfig(fetchedConfig);
        setSaaSPackages(fetchedConfig?.saasPackages || []);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleSavePackages = async (updatedPackages: SaasPackage[]) => {
        if (!config) return;
        const newConfig = { ...config, saasPackages: updatedPackages };
        
        setIsLoading(true);
        try {
          await updateConfiguration(newConfig);
          setConfig(newConfig); // Update local state
          setSaaSPackages(updatedPackages);
          toast({ title: "Pakete gespeichert!" });
        } catch (error) {
          toast({ title: "Fehler beim Speichern", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
    };
    
    const handleSavePackage = (pkgData: Partial<SaasPackage>) => {
        let updatedPackages;
        const existing = saasPackages.find(p => p.id === pkgData.id);
        if (existing) {
            updatedPackages = saasPackages.map(p => p.id === pkgData.id ? pkgData as SaasPackage : p);
        } else {
            updatedPackages = [...saasPackages, { ...pkgData, id: pkgData.id || `pkg-${Date.now()}` } as SaasPackage];
        }
        handleSavePackages(updatedPackages);
        setEditingPackage(null);
    };
    
    const isSuperAdmin = currentUserRole === 'Super-Admin';

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Amigoal-Abonnement-Pakete</CardTitle>
                        {isSuperAdmin && (
                             <Button size="sm" onClick={() => setEditingPackage({})}>
                                <PlusCircle className="mr-2 h-4 w-4"/> Neues Paket
                            </Button>
                        )}
                    </div>
                    <CardDescription>
                        Übersicht der verfügbaren SaaS-Pakete. Als Super-Admin können Sie diese hier bearbeiten.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {isLoading ? <p>Lade Pakete...</p> : saasPackages.map(pkg => (
                        <Card key={pkg.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold">{pkg.name}</h3>
                                    {pkg.isPopular && <Badge>Beliebt</Badge>}
                                </div>
                                <p className="text-2xl font-bold">{pkg.price}</p>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-primary" />
                                        <span>Bis zu <strong>{pkg.maxUsers}</strong> Nutzer</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>Alle Kernfunktionen</span>
                                    </div>
                                    {pkg.description && <p className="pt-2 text-xs">{pkg.description}</p>}
                                </div>
                            </CardContent>
                             {isSuperAdmin && (
                                <CardFooter>
                                    <Button variant="outline" size="sm" className="w-full" onClick={() => setEditingPackage(pkg)}>
                                        <Edit className="mr-2 h-4 w-4"/> Bearbeiten
                                    </Button>
                                </CardFooter>
                             )}
                        </Card>
                    ))}
                </CardContent>
            </Card>

             {editingPackage && (
                <SaasPackageModal 
                    isOpen={!!editingPackage}
                    onOpenChange={() => setEditingPackage(null)}
                    pkg={editingPackage}
                    onSave={handleSavePackage}
                />
            )}
        </>
    );
}
