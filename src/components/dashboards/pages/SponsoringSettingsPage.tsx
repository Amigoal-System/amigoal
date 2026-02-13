
'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, PlusCircle, Save, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useSponsorTypes } from '@/hooks/useSponsorTypes';
import { useTeam } from '@/hooks/use-team';

const EditTypeModal = ({ type, onSave, onCancel }) => {
    const [formData, setFormData] = useState(type);

    React.useEffect(() => {
        setFormData(type);
    }, [type]);
    
    if (!type) return null;

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value}));
    };
    
    const handleBenefitChange = (index, value) => {
        const newBenefits = [...formData.benefits];
        newBenefits[index] = value;
        setFormData(prev => ({ ...prev, benefits: newBenefits }));
    };
    
    const addBenefit = () => {
        setFormData(prev => ({ ...prev, benefits: [...prev.benefits, ''] }));
    };
    
    const removeBenefit = (index) => {
        setFormData(prev => ({...prev, benefits: prev.benefits.filter((_, i) => i !== index)}));
    };

    return (
        <Dialog open={!!type} onOpenChange={onCancel}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{type.id ? `Paket bearbeiten: ${type.name}`: 'Neues Sponsoring-Paket erstellen'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="flex items-center gap-4">
                        <div className="space-y-2 flex-1">
                            <Label htmlFor="name">Paketname</Label>
                            <Input id="name" value={formData.name} onChange={handleInputChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="color">Farbe</Label>
                            <Input id="color" type="color" value={formData.color} onChange={handleInputChange} className="p-1 h-10"/>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Beschreibung</Label>
                        <Textarea id="description" value={formData.description} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="baseAmount">Basis-Betrag (CHF)</Label>
                        <Input id="baseAmount" type="number" value={formData.baseAmount} onChange={e => setFormData(p=>({...p, baseAmount: parseFloat(e.target.value) || 0}))} />
                    </div>
                    <div className="space-y-2">
                        <Label>Enthaltene Leistungen</Label>
                        {formData.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input value={benefit} onChange={e => handleBenefitChange(index, e.target.value)} />
                                <Button variant="ghost" size="icon" onClick={() => removeBenefit(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive"/>
                                </Button>
                            </div>
                        ))}
                         <Button variant="outline" size="sm" onClick={addBenefit}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Leistung hinzufügen
                        </Button>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>Abbrechen</Button>
                    <Button onClick={() => onSave(formData)}>Speichern</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function SponsoringSettingsPage() {
  const { sponsorTypes, isLoading, addSponsorType, updateSponsorType, deleteSponsorType } = useSponsorTypes();
  const [editingType, setEditingType] = useState(null);
  const {currentUserRole} = useTeam();

  const handleEditType = (type) => {
      setEditingType(type);
  };
  
  const handleAddNewType = () => {
    setEditingType({
        id: null,
        name: '',
        color: '#cccccc',
        description: '',
        baseAmount: 0,
        benefits: [],
    });
  };

  const handleSaveType = (updatedType) => {
      if (updatedType.id) {
          updateSponsorType(updatedType);
      } else {
          addSponsorType(updatedType);
      }
      setEditingType(null);
  };

  if (isLoading) {
      return <div>Lade Sponsoring-Pakete...</div>;
  }

  return (
    <>
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Sponsoring-Pakete verwalten</CardTitle>
                <CardDescription>
                  {currentUserRole === 'Super-Admin' 
                    ? 'Definieren Sie die globalen Sponsoring-Pakete, die als Vorlage für neue Vereine dienen.' 
                    : 'Definieren Sie hier die verschiedenen Sponsoring-Pakete, die Ihr Verein anbietet, inklusive Leistungen und Preise.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {sponsorTypes.map((type) => (
                        <Card key={type.id} className="flex items-start justify-between p-4">
                            <div className="flex items-start gap-4">
                                <span className="block w-4 h-4 rounded-full mt-1" style={{backgroundColor: type.color}}></span>
                                <div>
                                    <h3 className="font-semibold">{type.name}</h3>
                                    <p className="text-sm text-muted-foreground">{type.description}</p>
                                    <p className="text-sm font-bold mt-1">CHF {type.baseAmount.toLocaleString('de-CH')}</p>
                                    <ul className="text-xs text-muted-foreground list-disc list-inside mt-2">
                                        {type.benefits.map((b,i) => <li key={i}>{b}</li>)}
                                    </ul>
                                </div>
                            </div>
                             <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEditType(type)}>
                                    <Edit className="h-4 w-4"/>
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => deleteSponsorType(type.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
                 <Button variant="outline" className="w-full" onClick={handleAddNewType}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Neues Paket hinzufügen
                </Button>
            </CardContent>
        </Card>
        {editingType && (
            <EditTypeModal
                type={editingType}
                onSave={handleSaveType}
                onCancel={() => setEditingType(null)}
            />
        )}
    </>
  );
}
