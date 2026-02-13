

'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Edit, Save, Trash2, PlusCircle, Globe, Send } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { DatePicker } from './ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Checkbox } from './ui/checkbox';

export const SponsorDetailModal = ({ sponsor, isOpen, onOpenChange, onSave, onDelete, sponsorTypes }) => {
  const [isEditing, setIsEditing] = useState(!sponsor?.id); // Edit mode if new sponsor
  const [formData, setFormData] = useState(null);
  const [sendLogin, setSendLogin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
        if (sponsor) {
            setFormData(sponsor);
            setIsEditing(false);
        } else {
            // Default structure for a new sponsor
            setFormData({
                company: '',
                contact: '',
                email: '', 
                types: [],
                status: 'Active',
                amount: 0,
                contractEnd: new Date().toISOString().split('T')[0],
                paymentStatus: 'Open',
                logo: `https://placehold.co/80x80.png?text=?`,
                billingCycle: 'Saisonstart',
            });
            setIsEditing(true);
        }
    }
  }, [sponsor, isOpen]);

  if (!isOpen || !formData) return null;

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleAmountChange = (e) => {
    setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }));
  }

  const handleTypeToggle = (typeName: string) => {
      setFormData(prev => {
          const newTypes = prev.types.includes(typeName)
            ? prev.types.filter(t => t !== typeName)
            : [...prev.types, typeName];
          return {...prev, types: newTypes};
      })
  }

  const handleSaveClick = () => {
    onSave(formData);
    if (!sponsor?.id && sendLogin) {
        // Here you would trigger an email sending flow
        console.log(`Sending login credentials to ${formData.email}`);
         toast({ title: "Login gesendet", description: `Die Zugangsdaten wurden an ${formData.email} gesendet.` });
    }
    setIsEditing(false);
    onOpenChange(false);
  };
  
  const handleCancelClick = () => {
      if (sponsor?.id) {
          setFormData(sponsor); // Reset changes if editing
          setIsEditing(false);
      } else {
          onOpenChange(false); // Close if it was a new entry
      }
  }

  const selectedBenefits = formData.types.flatMap(typeName => {
    const typeDetails = sponsorTypes.find(t => t.name === typeName);
    return typeDetails ? typeDetails.benefits : [];
  });
  
  const handleConfirmPayment = () => {
      onSave({ ...formData, paymentStatus: 'Paid' });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEditing ? (sponsor?.id ? 'Sponsor bearbeiten' : 'Neuer Sponsor') : formData.company}
          </DialogTitle>
          <DialogDescription>
            Details zum Sponsoring-Vertrag verwalten.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="space-y-2">
                <Label htmlFor="company">Firma / Name des Sponsors</Label>
                <Input id="company" value={formData.company} onChange={handleInputChange} readOnly={!isEditing} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="contact">Kontaktperson</Label>
                    <Input id="contact" value={formData.contact} onChange={handleInputChange} readOnly={!isEditing} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">E-Mail</Label>
                    <Input id="email" type="email" value={formData.email} onChange={handleInputChange} readOnly={!isEditing} placeholder="für Login-Zustellung"/>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="amount">Betrag (CHF)</Label>
                    <Input id="amount" type="number" value={formData.amount} onChange={handleAmountChange} readOnly={!isEditing} />
                </div>
                <div className="space-y-2">
                    <Label>Vertragsende</Label>
                    <DatePicker 
                        date={new Date(formData.contractEnd)}
                        onDateChange={(date) => setFormData(prev => ({ ...prev, contractEnd: date.toISOString().split('T')[0] }))}
                        disabled={!isEditing}
                    />
                </div>
            </div>

             <div className="space-y-2">
                <Label>Sponsoring-Pakete</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                    {sponsorTypes.map(type => (
                        <Button
                            key={type.name}
                            variant={formData.types.includes(type.name) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => isEditing && handleTypeToggle(type.name)}
                            style={formData.types.includes(type.name) ? { backgroundColor: type.color, color: 'white', borderColor: type.color } : {}}
                            className={!isEditing ? 'cursor-not-allowed' : ''}
                        >
                            {type.name}
                        </Button>
                    ))}
                </div>
             </div>

             {selectedBenefits.length > 0 && (
                <div className="space-y-2">
                    <Label>Enthaltene Leistungen</Label>
                    <div className="p-3 border rounded-md bg-muted/50">
                        <ul className="text-sm list-disc list-inside">
                            {selectedBenefits.map((benefit, i) => <li key={i}>{benefit}</li>)}
                        </ul>
                    </div>
                </div>
             )}
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(val) => setFormData(p => ({...p, status: val}))} disabled={!isEditing}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Inactive">Inactive</SelectItem>
                            <SelectItem value="Expired">Expired</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label>Zahlungsstatus</Label>
                    <Select value={formData.paymentStatus} onValueChange={(val) => setFormData(p => ({...p, paymentStatus: val}))} disabled={!isEditing}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Paid">Paid</SelectItem>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="Overdue">Overdue</SelectItem>
                            <SelectItem value="Pending Confirmation">Pending Confirmation</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <div className="space-y-2 pt-4 border-t">
                <Label>Abrechnungszyklus</Label>
                 <Select value={formData.billingCycle} onValueChange={(val) => setFormData(p => ({...p, billingCycle: val}))} disabled={!isEditing}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Saisonstart">Pro Saison</SelectItem>
                        <SelectItem value="Kalenderjahr">Pro Kalenderjahr</SelectItem>
                        <SelectItem value="Manuell">Manuell</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {!sponsor?.id && isEditing && (
                <div className="flex items-center space-x-2 pt-4 border-t">
                    <Checkbox id="send-login" checked={sendLogin} onCheckedChange={setSendLogin} />
                    <Label htmlFor="send-login">Login an den Sponsor senden</Label>
                </div>
            )}
        </div>
        <DialogFooter>
            {isEditing ? (
                 <>
                    <Button variant="outline" onClick={handleCancelClick}>Abbrechen</Button>
                    <Button onClick={handleSaveClick}>
                        <Save className="mr-2 h-4 w-4" /> Speichern
                    </Button>
                </>
            ) : (
                <>
                    <Button variant="destructive" onClick={() => onDelete(formData.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Löschen
                    </Button>
                     <div className="flex-grow"></div>
                     {formData.paymentStatus !== 'Paid' && (
                        <Button onClick={handleConfirmPayment}>
                           Zahlung bestätigen
                        </Button>
                     )}
                     <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" /> Bearbeiten
                    </Button>
                    <DialogClose asChild>
                        <Button>Schliessen</Button>
                    </DialogClose>
                </>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
