
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, Save, LayoutGrid, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Switch } from '@/components/ui/switch';
import { getAllCoupons, addCoupon, updateCoupon, deleteCoupon, validateCoupon } from '@/ai/flows/coupons';
import type { Coupon } from '@/ai/flows/coupons.types';
import { getAllClubs } from '@/ai/flows/clubs';
import type { Club } from '@/ai/flows/clubs.types';
import { useClub } from '@/hooks/useClub'; 
import { Progress } from '@/components/ui/progress';

const CouponModal = ({ isOpen, onOpenChange, coupon, onSave, allClubs }) => {
    const [formData, setFormData] = useState<Partial<Coupon> | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData(coupon || { 
                code: '', 
                discountType: 'percentage', 
                discountValue: 10, 
                validUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), 
                isActive: true,
                maxUsage: 1,
                usageCount: 0,
                usedBy: [],
            });
        }
    }, [coupon, isOpen]);
    
    if (!formData) return null;

    const handleChange = (field, value) => {
        setFormData(p => ({...p!, [field]: value}));
    };
    
    const usedByClubs = formData.usedBy?.map(clubId => allClubs.find(c => c.id === clubId)?.name).filter(Boolean);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{formData.id ? `Coupon bearbeiten: ${formData.code}` : 'Neuer Coupon'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="space-y-2">
                        <Label htmlFor="code">Coupon Code</Label>
                        <Input id="code" value={formData.code || ''} onChange={e => handleChange('code', e.target.value.toUpperCase())} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="discountType">Rabatt-Typ</Label>
                            <Select value={formData.discountType} onValueChange={val => handleChange('discountType', val)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Prozentual</SelectItem>
                                    <SelectItem value="fixed">Fester Betrag</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="discountValue">Wert ({formData.discountType === 'percentage' ? '%' : 'CHF'})</Label>
                            <Input id="discountValue" type="number" value={formData.discountValue || 0} onChange={e => handleChange('discountValue', parseFloat(e.target.value) || 0)} />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label>Gültig bis</Label>
                            <DatePicker date={formData.validUntil ? new Date(formData.validUntil) : new Date()} onDateChange={date => handleChange('validUntil', date?.toISOString())} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="maxUsage">Maximale Nutzung</Label>
                            <Input id="maxUsage" type="number" value={formData.maxUsage || 1} onChange={e => handleChange('maxUsage', parseInt(e.target.value) || 1)} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch id="isActive" checked={formData.isActive} onCheckedChange={checked => handleChange('isActive', checked)} />
                        <Label htmlFor="isActive">Aktiv</Label>
                    </div>
                    {formData.id && usedByClubs && usedByClubs.length > 0 && (
                        <div className="space-y-2 border-t pt-4">
                            <Label>Eingelöst von:</Label>
                            <div className="flex flex-wrap gap-2">
                                {usedByClubs.map((clubName, index) => (
                                    <Badge key={index} variant="secondary">{clubName}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                     <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                     <Button onClick={() => onSave(formData)}><Save className="mr-2 h-4 w-4"/> Speichern</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const CouponCard = ({ coupon, onEdit, onDelete }) => {
    const usagePercentage = coupon.maxUsage > 0 ? (coupon.usageCount / coupon.maxUsage) * 100 : 0;
    return (
        <Card className="flex flex-col cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onEdit(coupon)}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="font-mono text-lg">{coupon.code}</CardTitle>
                     <Badge variant={coupon.isActive ? 'default' : 'secondary'} className={coupon.isActive ? 'bg-green-500' : ''}>
                        {coupon.isActive ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                </div>
                <CardDescription>{coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : ' CHF'} Rabatt</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
                 <p className="text-sm text-muted-foreground">Gültig bis: {new Date(coupon.validUntil).toLocaleDateString('de-CH')}</p>
                 <div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Nutzung</span>
                        <span>{coupon.usageCount} / {coupon.maxUsage}</span>
                    </div>
                    <Progress value={usagePercentage} className="h-2 mt-1" />
                 </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(coupon) }}><Edit className="h-4 w-4"/></Button>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(coupon.id!) }}><Trash2 className="h-4 w-4 text-destructive"/></Button>
            </CardFooter>
        </Card>
    )
}


export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [allClubs, setAllClubs] = useState<Club[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [viewMode, setViewMode] = useState('list');
    const { toast } = useToast();

    const fetchCouponsAndClubs = useCallback(async () => {
        setIsLoading(true);
        try {
            const [couponsData, clubsData] = await Promise.all([
                getAllCoupons(),
                getAllClubs({ includeArchived: true })
            ]);
            setCoupons(couponsData);
            setAllClubs(clubsData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast({ title: "Fehler", description: "Daten konnten nicht geladen werden.", variant: "destructive"});
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        fetchCouponsAndClubs();
    }, [fetchCouponsAndClubs]);

    const handleSave = async (couponData: Partial<Coupon>) => {
        try {
            if (couponData.id) {
                await updateCoupon(couponData as Coupon);
                toast({ title: "Coupon aktualisiert." });
            } else {
                const newCouponData = {
                  ...couponData,
                  usedBy: couponData.usedBy || [],
                };
                await addCoupon(newCouponData as Omit<Coupon, 'id'>);
                toast({ title: "Coupon erstellt." });
            }
            fetchCouponsAndClubs();
            setIsModalOpen(false);
        } catch(e) {
             toast({ title: "Fehler beim Speichern", description: (e as Error).message, variant: "destructive" });
        }
    };
    
    const handleDelete = async (couponId: string) => {
        try {
            await deleteCoupon(couponId);
            toast({ title: "Coupon gelöscht." });
            fetchCouponsAndClubs();
        } catch (e) {
            toast({ title: "Fehler beim Löschen", variant: "destructive" });
        }
    }
    
    const handleOpenModal = (coupon: Coupon | null) => {
        setEditingCoupon(coupon);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Coupon-Verwaltung</CardTitle>
                        <CardDescription>Erstellen und verwalten Sie Rabatt-Codes für Ihre Plattform.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('list')}><List className="h-4 w-4"/></Button>
                        <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" onClick={() => setViewMode('grid')}><LayoutGrid className="h-4 w-4"/></Button>
                        <Button onClick={() => handleOpenModal(null)}>
                            <PlusCircle className="mr-2 h-4 w-4"/>Neuer Coupon
                        </Button>
                    </div>
                </div>
                 
                {isLoading ? <p className="p-4 text-center">Lade Coupons...</p> : 
                    viewMode === 'list' ? (
                         <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Code</TableHead>
                                            <TableHead>Rabatt</TableHead>
                                            <TableHead>Gültig bis</TableHead>
                                            <TableHead>Nutzung</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Aktionen</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {coupons.map(c => (
                                            <TableRow key={c.id} onClick={() => handleOpenModal(c)} className="cursor-pointer">
                                                <TableCell className="font-mono">{c.code}</TableCell>
                                                <TableCell>{c.discountValue}{c.discountType === 'percentage' ? '%' : ' CHF'}</TableCell>
                                                <TableCell>{new Date(c.validUntil).toLocaleDateString('de-CH')}</TableCell>
                                                <TableCell>{c.usageCount} / {c.maxUsage}</TableCell>
                                                <TableCell>
                                                    <Badge variant={c.isActive ? 'default' : 'secondary'} className={c.isActive ? 'bg-green-500' : ''}>
                                                        {c.isActive ? 'Aktiv' : 'Inaktiv'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenModal(c); }}>
                                                        <Edit className="h-4 w-4"/>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDelete(c.id!); }}>
                                                        <Trash2 className="h-4 w-4 text-destructive"/>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {coupons.map(c => (
                                <CouponCard key={c.id} coupon={c} onEdit={handleOpenModal} onDelete={handleDelete} />
                            ))}
                        </div>
                    )
                }
            </div>
            <CouponModal 
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                coupon={editingCoupon}
                onSave={handleSave}
                allClubs={allClubs}
            />
        </>
    );
}
