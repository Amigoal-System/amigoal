
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Member } from '@/ai/flows/members.types';
import { Trash2, Save, Edit, PlusCircle, X, User } from 'lucide-react';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Checkbox } from './ui/checkbox';
import { useTeams } from '@/hooks/useTeams';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { countries } from '@/lib/countries';
import { Combobox } from './ui/combobox';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { CheckCircle } from 'lucide-react';
import { useTeam } from '@/hooks/use-team';
import { getAllClubs } from '@/ai/flows/clubs';
import type { Club } from '@/ai/flows/clubs.types';
import { OneTimePasswordDialog } from './ui/one-time-password-dialog';
import { useSponsorTypes } from '@/hooks/useSponsorTypes';
import { Combobox as HeadlessCombobox } from '@headlessui/react'
import { useRouter, useParams } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

const emptyMember: Partial<Member> & { parent?: {name: string, email: string}} = {
    salutation: 'Unbekannt',
    firstName: '', 
    lastName: '', 
    email: '', 
    geb: '', 
    address: { street: '', zip: '', city: '' },
    roles: ['Spieler'], 
    teams: [],
    team: '',
    fee: { season: '24/25', amount: 300, date: new Date().toISOString().split('T')[0], paid: false },
    avatar: null,
    nationality: 'Schweiz',
    maritalStatus: 'Unbekannt',
    leadSource: '',
    phonePrivate: '', 
    phoneMobile: '', 
    phoneBusiness: '',
    status: 'Aktiv',
    memberNr: '', // Will be generated
    memberSince: new Date().toISOString().split('T')[0],
    entryDate: new Date().toISOString().split('T')[0],
    exitDate: null,
    alternativeEmail: null, 
    jsNumber: null, 
    ahvNumber: null, 
    passportNumber: null,
};

const availableRoles = [
    "Spieler", "Trainer", "Vorstand", "Passivmitglied", "Gönner", "Schiedsrichter", "Sponsor", "Fan", "Marketing", "Finanzen", "Administration", "Elternteil"
];

const InfoItem = ({ label, value, isEditing, id, onChange, type = 'text', options = [] }: { label: string; value?: string | number | null; isEditing: boolean; id: string; onChange: (e: any) => void; type?: string; options?: {value: string, label: string}[] }) => {
    return (
        <div className='space-y-1'>
            <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
            {isEditing ? (
                type === 'select' ? (
                    <Select value={value?.toString() || ''} onValueChange={(val) => onChange({ target: { id, value: val } })}>
                        <SelectTrigger id={id} className="h-8"><SelectValue placeholder="..."/></SelectTrigger>
                        <SelectContent>
                            {options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                ) : type === 'combobox' ? (
                    <Combobox items={options} value={value as string || ''} onChange={(val) => onChange({ target: { id, value: val } })} placeholder="Land..." />
                ) : (
                    <Input id={id} type={type} value={value || ''} onChange={onChange} className="h-8" />
                )
            ) : (
                <p className="font-medium text-sm h-8 flex items-center">{value || '-'}</p>
            )}
        </div>
    );
};




const OnboardingChecklist = ({ memberData }) => {
  const checklistItems = useMemo(() => [
    { label: 'Persönliche Daten (Name, Geb., Adresse)', completed: !!(memberData.firstName && memberData.lastName && memberData.geb && memberData.address?.street) },
    { label: 'Kontaktinfo (E-Mail & Tel.)', completed: !!(memberData.email && (memberData.phonePrivate || memberData.phoneMobile)) },
    { label: 'Rollen & Teams zugewiesen', completed: (memberData.roles?.length > 0 && memberData.teams?.length > 0) },
    { label: 'Profilbild hochgeladen', completed: !!memberData.avatar },
    { label: 'Mitgliederbeitrag bezahlt', completed: !!memberData.fee?.paid },
    { label: 'Dokumente (Pass/ID) hochgeladen', completed: false }, // Simulating this as not done
  ], [memberData]);

  const completedCount = checklistItems.filter(item => item.completed).length;
  const progressPercentage = (completedCount / checklistItems.length) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Onboarding-Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Progress value={progressPercentage} />
          <div className="text-sm font-medium text-muted-foreground">
            {completedCount} von {checklistItems.length} Schritten erledigt.
          </div>
          <ul className="space-y-2 text-xs">
            {checklistItems.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                {item.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-dashed" />
                )}
                <span className={item.completed ? 'text-muted-foreground line-through' : ''}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}


export const MemberDetailModal = ({ member, isOpen, onOpenChange, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Member>>(member || emptyMember);
  const [isEditing, setIsEditing] = useState(!member);
  const { currentUserRole } = useTeam();
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [newTeam, setNewTeam] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { categorizedTeams, isLoading: isLoadingTeams } = useTeams(formData?.clubId);

  const allTeamsInSelectedClub = React.useMemo(() => Object.values(categorizedTeams).flat().map(t => t.name), [categorizedTeams]);

  useEffect(() => {
    if (isOpen) {
        if (member) {
          setFormData({
            ...member,
            roles: Array.isArray(member.roles) ? member.roles : (member.role ? [member.role] : []),
            teams: Array.isArray(member.teams) ? member.teams : (member.team ? [member.team] : []),
            address: member.address || { street: '', zip: '', city: '' },
          });
          setIsEditing(false);
        } else {
          setFormData(emptyMember);
          setIsEditing(true);
        }
        if (currentUserRole === 'Super-Admin') {
            const fetchClubs = async () => {
                const clubs = await getAllClubs({ includeArchived: false });
                setAllClubs(clubs);
            };
            fetchClubs();
        }
    }
  }, [member, isOpen, currentUserRole]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData(prev => ({ ...prev, address: { ...(prev.address || {}), [id]: value } }));
  }
  
  const handleRoleToggle = (role: string) => {
      setFormData(prev => {
          const newRoles = prev.roles?.includes(role) 
            ? prev.roles.filter(r => r !== role)
            : [...(prev.roles || []), role];
          return { ...prev, roles: newRoles };
      })
  }

  const handleTeamAdd = () => {
    if (newTeam && !formData.teams?.includes(newTeam)) {
        setFormData(prev => ({...prev, teams: [...(prev.teams || []), newTeam]}));
        setNewTeam('');
    }
  };

  const handleTeamRemove = (teamToRemove: string) => {
    setFormData(prev => ({...prev, teams: prev.teams?.filter(t => t !== teamToRemove)}));
  };
  
  const handleAvatarClick = () => {
    if(isEditing) {
        fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
            setFormData(prev => ({ ...prev, avatar: event.target?.result as string }));
        };
        reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = () => {
    const dataToSave = {
        ...formData,
        // Ensure legacy fields are updated for compatibility
        team: formData.teams?.[0] || null,
        role: formData.roles?.[0] || 'Spieler',
    };
    onSave(dataToSave);
    setIsEditing(false);
  };
  
  const handleDelete = () => {
      if(formData.id) {
        onDelete(formData.id);
      }
  };

  const handleCancelClick = () => {
      if(member) {
        setFormData({
            ...member,
            roles: Array.isArray(member.roles) ? member.roles : [member.role],
            teams: Array.isArray(member.teams) ? member.teams : (member.team ? [member.team] : []),
             address: member.address || { street: '', zip: '', city: '' },
        });
        setIsEditing(false);
      } else {
        onOpenChange(false);
      }
  }
  
  const handleClubChange = (clubId: string) => {
      const selectedClub = allClubs.find(c => c.id === clubId);
      setFormData(prev => ({
          ...prev,
          clubId: clubId,
          clubName: selectedClub?.name,
          teams: [] // Reset teams when club changes
      }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>{member ? `Mitglied: ${formData.firstName} ${formData.lastName}` : 'Neues Mitglied'}</DialogTitle>
           {!isEditing && <DialogDescription>#{formData.memberNr}</DialogDescription>}
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-6 -mr-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="flex items-start gap-6 mb-6">
                        <div 
                            className={`relative w-24 h-24 rounded-full border bg-muted flex items-center justify-center ${isEditing ? 'cursor-pointer' : ''}`}
                            onClick={handleAvatarClick}
                        >
                            {formData.avatar ? <Image src={formData.avatar} alt="Avatar" width={96} height={96} className="w-full h-full object-cover rounded-full"/> : <User className="w-12 h-12 text-muted-foreground"/>}
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden"/>
                            {isEditing && (
                                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 border">
                                    <Edit className="w-3 h-3 text-gray-600"/>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 flex-1">
                             <div className="space-y-4">
                                <h4 className="font-semibold text-muted-foreground text-sm">Stammdaten</h4>
                                <InfoItem label="Anrede" id="salutation" value={formData.salutation} isEditing={isEditing} onChange={handleInputChange} type="select" options={[{value: 'Herr', label: 'Herr'}, {value: 'Frau', label: 'Frau'}, {value: 'Unbekannt', label: 'Unbekannt'}]} />
                                <InfoItem label="Vorname" id="firstName" value={formData.firstName} isEditing={isEditing} onChange={handleInputChange} />
                                <InfoItem label="Nachname" id="lastName" value={formData.lastName} isEditing={isEditing} onChange={handleInputChange} />
                                <InfoItem label="Geburtstag" id="geb" value={formData.geb} isEditing={isEditing} onChange={handleInputChange} type="date" />
                                <InfoItem label="Nationalität" id="nationality" value={formData.nationality} isEditing={isEditing} onChange={(e) => handleInputChange({target: {id: 'nationality', value: e.target.value}})} type="combobox" options={countries} />
                                <InfoItem label="Zivilstand" id="maritalStatus" value={formData.maritalStatus} isEditing={isEditing} onChange={handleInputChange} type="select" options={[{value: 'Ledig', label: 'Ledig'}, {value: 'Verheiratet', label: 'Verheiratet'}, {value: 'Geschieden', label: 'Geschieden'}, {value: 'Verwitwet', label: 'Verwitwet'}, {value: 'Unbekannt', label: 'Unbekannt'}]} />
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-semibold text-muted-foreground text-sm">Kontakt & Adresse</h4>
                                <InfoItem label="E-Mail" id="email" value={formData.email} isEditing={isEditing} onChange={handleInputChange} type="email" />
                                <InfoItem label="Strasse & Nr." id="street" value={formData.address?.street} isEditing={isEditing} onChange={handleAddressChange} />
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoItem label="PLZ" id="zip" value={formData.address?.zip} isEditing={isEditing} onChange={handleAddressChange} />
                                    <InfoItem label="Ort" id="city" value={formData.address?.city} isEditing={isEditing} onChange={handleAddressChange} />
                                </div>
                                <InfoItem label="Telefon Privat" id="phonePrivate" value={formData.phonePrivate} isEditing={isEditing} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-4">
                                <h4 className="font-semibold text-muted-foreground text-sm">Vereinsinfos</h4>
                                <InfoItem label="Eintrittsdatum" id="entryDate" value={formData.entryDate} isEditing={isEditing} onChange={handleInputChange} type="date" />
                                <InfoItem label="Status" id="status" value={formData.status} isEditing={isEditing} onChange={handleInputChange} type="select" options={[{value: 'Aktiv', label: 'Aktiv'}, {value: 'Passiv', label: 'Passiv'}, {value: 'Ehemalig', label: 'Ehemalig'}, {value: 'Ausgetreten', label: 'Ausgetreten'}]} />
                                <InfoItem label="AHV-Nummer" id="ahvNumber" value={formData.ahvNumber} isEditing={isEditing} onChange={handleInputChange} />
                                <InfoItem label="Pass-Nummer" id="passportNumber" value={formData.passportNumber} isEditing={isEditing} onChange={handleInputChange} />
                                <InfoItem label="J+S-Nummer" id="jsNumber" value={formData.jsNumber} isEditing={isEditing} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Rollen</Label>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 p-3 border rounded-md min-h-[40px]">
                                {availableRoles.map(role => (
                                    <div key={role} className="flex items-center space-x-2">
                                        <Checkbox id={`role-${role}`} checked={formData.roles?.includes(role)} onCheckedChange={() => isEditing && handleRoleToggle(role)} disabled={!isEditing} />
                                        <label htmlFor={`role-${role}`} className="text-sm">{role}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                             {currentUserRole === 'Super-Admin' && (
                                <div className="space-y-2 mb-4">
                                    <Label>Verein</Label>
                                    <Select value={formData.clubId || ''} onValueChange={handleClubChange} disabled={!isEditing}>
                                        <SelectTrigger><SelectValue placeholder="Verein auswählen..."/></SelectTrigger>
                                        <SelectContent>
                                            {allClubs.map(c => (
                                                <SelectItem key={c.id} value={c.id!}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <Label>Mannschaften</Label>
                            <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[40px]">
                                {formData.teams?.map(team => (
                                    <Badge key={team} variant="secondary" className="flex items-center gap-1">
                                        {team}
                                        {isEditing && <button onClick={() => handleTeamRemove(team)}><X className="h-3 w-3"/></button>}
                                    </Badge>
                                ))}
                            </div>
                            {isEditing && (
                                <div className="flex gap-2">
                                    <Select onValueChange={setNewTeam} value={newTeam}>
                                        <SelectTrigger disabled={!formData.clubId && currentUserRole === 'Super-Admin'}><SelectValue placeholder={isLoadingTeams ? "Lade Teams..." : "Team auswählen..."} /></SelectTrigger>
                                        <SelectContent>
                                            {allTeamsInSelectedClub.map(team => (
                                                <SelectItem key={team} value={team} disabled={formData.teams?.includes(team)}>{team}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={handleTeamAdd} disabled={!newTeam}>
                                        <PlusCircle className="mr-2 h-4 w-4"/> Hinzufügen
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                 <div className="lg:col-span-1">
                    <OnboardingChecklist memberData={formData} />
                 </div>
            </div>
        </div>
        <DialogFooter className="justify-between">
          <div>
            {member && isEditing && (
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Mitglied entfernen
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                            <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Löschen bestätigen</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </div>
          <div className="flex gap-2">
             {isEditing ? (
                 <>
                    <Button variant="outline" onClick={handleCancelClick}>Abbrechen</Button>
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" /> Speichern
                    </Button>
                </>
             ) : (
                <Button onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" /> Bearbeiten
                </Button>
             )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
