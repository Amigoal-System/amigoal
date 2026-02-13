
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Edit, Save, PlusCircle, Trash2, Globe, Instagram, Facebook, Wallet, Banknote, CreditCard, Home } from 'lucide-react';
import { useTeam } from '@/hooks/use-team';
import { useFacilities } from '@/hooks/useCamps';
import { EditFacilityModal } from '../../ui/edit-facility-modal';
import type { Provider } from '@/ai/flows/providers.types';
import type { SportsFacility } from '@/ai/flows/trainingCamps.types';
import { useBootcampProviders } from '@/hooks/useBootcampProviders';
import { useTrainingCampProviders } from '@/hooks/useTrainingCampProviders';
import { TwintIcon } from '@/components/icons';

export default function ProviderProfilePage() {
    const { userEmail, currentUserRole } = useTeam();
    
    const providerType = useMemo(() => {
        if (currentUserRole.includes('Bootcamp')) return 'Bootcamp';
        if (currentUserRole.includes('Trainingslager')) return 'Trainingslager';
        if (currentUserRole.includes('Turnier')) return 'Turnier';
        return undefined;
    }, [currentUserRole]) as 'Bootcamp' | 'Trainingslager' | 'Turnier' | undefined;

    const bootcampHook = useBootcampProviders();
    const trainingCampHook = useTrainingCampProviders();

    const { providers, updateProvider, isLoading: isLoadingProviders } = useMemo(() => {
        if (providerType === 'Bootcamp') return bootcampHook;
        if (providerType === 'Trainingslager') return trainingCampHook;
        return { providers: [], updateProvider: async () => {}, isLoading: false };
    }, [providerType, bootcampHook, trainingCampHook]);

    const { facilities, addFacility, updateFacility, deleteFacility, isLoading: isLoadingFacilities } = useFacilities();
    const [providerData, setProviderData] = useState<Provider | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
    const [editingFacility, setEditingFacility] = useState<SportsFacility | null>(null);
    const { toast } = useToast();
    
    useEffect(() => {
        if (userEmail && providers.length > 0) {
            const currentProvider = providers.find(p => p.email === userEmail);
            setProviderData(currentProvider || null);
        }
    }, [userEmail, providers]);
    
    const handleSave = async () => {
        if (providerData) {
            await updateProvider(providerData);
            setIsEditing(false);
            toast({ title: "Profil gespeichert!" });
        }
    };
    
    const handleFacilitySave = (facilityData: SportsFacility) => {
        if (facilityData.id) {
            updateFacility(facilityData);
        } else {
            addFacility(facilityData);
        }
        setIsFacilityModalOpen(false);
    }
    
    if (isLoadingProviders) {
        return <div>Lade Profil...</div>
    }

    if (!providerData) {
        return <div>Anbieterprofil nicht gefunden.</div>;
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProviderData(prev => ({...prev!, [e.target.id]: e.target.value}));
    }

    const handleAddressChange = (addressType: 'address' | 'billingAddress', e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setProviderData(prev => ({
            ...prev!,
            [addressType]: {
                ...(prev![addressType] || {}),
                [id]: value
            }
        }));
    };

    const handlePaymentConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setProviderData(prev => ({
            ...prev!,
            paymentConfig: {
                ...(prev!.paymentConfig || {}),
                [id]: value,
            }
        }));
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Anbieter-Profil</h1>
                        <p className="text-muted-foreground">Verwalten Sie Ihre öffentlichen Informationen und Anlagen.</p>
                    </div>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4"/> Profil bearbeiten</Button>
                    ) : (
                        <div className="flex gap-2">
                             <Button variant="outline" onClick={() => setIsEditing(false)}>Abbrechen</Button>
                             <Button onClick={handleSave}><Save className="mr-2 h-4 w-4"/> Speichern</Button>
                        </div>
                    )}
                </div>

                 <Card>
                    <CardHeader>
                        <CardTitle>Stammdaten</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label htmlFor="name">Name der Organisation</Label>
                                <Input id="name" value={providerData.name} onChange={handleInputChange} readOnly={!isEditing} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact">Ansprechperson</Label>
                                <Input id="contact" value={providerData.contact} onChange={handleInputChange} readOnly={!isEditing} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">E-Mail</Label>
                                <Input id="email" type="email" value={providerData.email} onChange={handleInputChange} readOnly={!isEditing} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input id="phone" type="tel" value={providerData.phone || ''} onChange={handleInputChange} readOnly={!isEditing} />
                            </div>
                        </div>
                         <div className="space-y-2 pt-4 border-t">
                            <Label>Hauptadresse</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <Input id="street" placeholder="Strasse & Nr." value={providerData.address?.street || ''} onChange={(e) => handleAddressChange('address', e)} readOnly={!isEditing} />
                                <Input id="zip" placeholder="PLZ" value={providerData.address?.zip || ''} onChange={(e) => handleAddressChange('address', e)} readOnly={!isEditing} />
                                <Input id="city" placeholder="Ort" value={providerData.address?.city || ''} onChange={(e) => handleAddressChange('address', e)} readOnly={!isEditing} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Online-Präsenz</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="website">Webseite</Label>
                             <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <Input id="website" value={providerData.website || ''} onChange={handleInputChange} readOnly={!isEditing} className="pl-9"/>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="instagram">Instagram</Label>
                                 <div className="relative">
                                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                    <Input id="instagram" value={providerData.instagram || ''} onChange={handleInputChange} readOnly={!isEditing} className="pl-9"/>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="facebook">Facebook</Label>
                                <div className="relative">
                                    <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                    <Input id="facebook" value={providerData.facebook || ''} onChange={handleInputChange} readOnly={!isEditing} className="pl-9"/>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Zahlungs- & Rechnungsinformationen</CardTitle>
                        <CardDescription>Diese Informationen werden für die Rechnungsstellung an Ihre Kunden verwendet.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label>Rechnungsadresse</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <Input id="street" placeholder="Strasse & Nr." value={providerData.billingAddress?.street || ''} onChange={(e) => handleAddressChange('billingAddress', e)} readOnly={!isEditing} />
                                <Input id="zip" placeholder="PLZ" value={providerData.billingAddress?.zip || ''} onChange={(e) => handleAddressChange('billingAddress', e)} readOnly={!isEditing} />
                                <Input id="city" placeholder="Ort" value={providerData.billingAddress?.city || ''} onChange={(e) => handleAddressChange('billingAddress', e)} readOnly={!isEditing} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="iban">IBAN</Label>
                            <div className="relative">
                                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="iban" value={providerData.paymentConfig?.iban || ''} onChange={handlePaymentConfigChange} readOnly={!isEditing} className="pl-9" placeholder="CH..."/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="paypalEmail">PayPal E-Mail</Label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="paypalEmail" type="email" value={providerData.paymentConfig?.paypalEmail || ''} onChange={handlePaymentConfigChange} readOnly={!isEditing} className="pl-9" placeholder="paypal@example.com"/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="twintLink">TWINT QR-Code Link</Label>
                            <div className="relative">
                                <TwintIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="twintLink" type="url" value={providerData.paymentConfig?.twintLink || ''} onChange={handlePaymentConfigChange} readOnly={!isEditing} className="pl-9" placeholder="https://..."/>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
            
            <EditFacilityModal
                isOpen={isFacilityModalOpen}
                onOpenChange={setIsFacilityModalOpen}
                facility={editingFacility}
                onSave={handleFacilitySave}
                onDelete={() => {}}
            />
        </>
    );
}
