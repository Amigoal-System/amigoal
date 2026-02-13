
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Save, Trash2, Globe, Loader2, ChevronsUpDown, Building, FileText, Bot, Settings, Users, Calendar, Trophy, BarChart, Upload, FileDown } from 'lucide-react';
import { getConfiguration, updateConfiguration } from '@/ai/flows/configurations';
import type { Configuration, TeamCategory, League, Association, CountryLeagueStructure, LeagueGroup, JSSettings } from '@/ai/flows/configurations.types';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Papa from 'papaparse';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const countryFlags = {
    CH: '🇨🇭', DE: '🇩🇪', IT: '🇮🇹', AT: '🇦🇹', XK: '🇽🇰',
    AL: '🇦🇱', HR: '🇭🇷', GB: '🇬🇧', ES: '🇪🇸', PT: '🇵🇹',
    FR: '🇫🇷', BE: '🇧🇪', NL: '🇳🇱', SUI: '🇨🇭', GER: '🇩🇪', ENG: '🇬🇧',
    SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', IE: '🇮🇪',
};

const currencies = ['CHF', 'EUR', 'GBP', 'USD'];

const LeagueStructureEditor = ({ structure, onStructureChange }) => {
    
    const handleAssociationChange = (assocIndex, field, value) => {
        const newAssociations = [...structure.associations];
        newAssociations[assocIndex] = { ...newAssociations[assocIndex], [field]: value };
        onStructureChange({ ...structure, associations: newAssociations });
    };

    const addAssociation = () => {
        const newAssociation: Association = { id: `assoc-${Date.now()}`, name: '', leagues: [] };
        onStructureChange({ ...structure, associations: [...structure.associations, newAssociation] });
    };
    
    const removeAssociation = (assocIndex) => {
        const newAssociations = structure.associations.filter((_, i) => i !== assocIndex);
        onStructureChange({ ...structure, associations: newAssociations });
    }

    const handleLeagueChange = (assocIndex, leagueIndex, field, value) => {
        const newAssociations = [...structure.associations];
        const newLeagues = [...newAssociations[assocIndex].leagues];
        newLeagues[leagueIndex] = { ...newLeagues[leagueIndex], [field]: value };
        newAssociations[assocIndex].leagues = newLeagues;
        onStructureChange({ ...structure, associations: newAssociations });
    }

    const addLeague = (assocIndex) => {
        const newLeague: League = { id: `league-${Date.now()}`, name: '', level: 1, groups: [] };
        const newAssociations = [...structure.associations];
        newAssociations[assocIndex].leagues.push(newLeague);
        onStructureChange({ ...structure, associations: newAssociations });
    }
    
    const removeLeague = (assocIndex, leagueIndex) => {
        const newAssociations = [...structure.associations];
        newAssociations[assocIndex].leagues = newAssociations[assocIndex].leagues.filter((_, i) => i !== leagueIndex);
        onStructureChange({ ...structure, associations: newAssociations });
    }

    const addGroup = (assocIndex, leagueIndex) => {
        const newGroup: LeagueGroup = { id: `group-${Date.now()}`, name: 'Gruppe 1' };
        const newAssociations = [...structure.associations];
        const league = newAssociations[assocIndex].leagues[leagueIndex];
        league.groups = [...(league.groups || []), newGroup];
        onStructureChange({ ...structure, associations: newAssociations });
    };

    const handleGroupChange = (assocIndex, leagueIndex, groupIndex, value) => {
        const newAssociations = [...structure.associations];
        const league = newAssociations[assocIndex].leagues[leagueIndex];
        const newGroups = [...(league.groups || [])];
        newGroups[groupIndex] = { ...newGroups[groupIndex], name: value };
        league.groups = newGroups;
        onStructureChange({ ...structure, associations: newAssociations });
    };

    const removeGroup = (assocIndex, leagueIndex, groupIndex) => {
        const newAssociations = [...structure.associations];
        const league = newAssociations[assocIndex].leagues[leagueIndex];
        league.groups = (league.groups || []).filter((_, i) => i !== groupIndex);
        onStructureChange({ ...structure, associations: newAssociations });
    };
    
    const handleJSSettingsChange = (field: keyof JSSettings, value: string) => {
        const numericValue = parseFloat(value);
        if (isNaN(numericValue) && value !== '') return;
        const newJSSettings = { ...(structure.jsSettings || {}), [field]: value === '' ? undefined : numericValue };
        onStructureChange({ ...structure, jsSettings: newJSSettings });
    };
    
    const handleJSContactChange = (field: string, value: string) => {
        const newContactInfo = { ...(structure.jsSettings?.contactInfo || {}), [field]: value };
        const newJSSettings = { ...(structure.jsSettings || {}), contactInfo: newContactInfo };
        onStructureChange({ ...structure, jsSettings: newJSSettings });
    };


    return (
        <div className="space-y-4">
             <Card>
                <CardHeader><CardTitle className="text-base">Jugend+Sport Einstellungen</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Währung</Label>
                            <Select 
                                value={structure.currency || 'CHF'} 
                                onValueChange={value => onStructureChange({ ...structure, currency: value })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Entschädigung / TN</Label>
                            <Input 
                                type="number" 
                                value={structure.jsSettings?.compensationPerParticipant || ''}
                                onChange={(e) => handleJSSettingsChange('compensationPerParticipant', e.target.value)}
                                step="0.01"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Min. Trainingsdauer (Min.)</Label>
                            <Input 
                                type="number"
                                value={structure.jsSettings?.minTrainingDurationMinutes || ''}
                                onChange={(e) => handleJSSettingsChange('minTrainingDurationMinutes', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Min. Teilnehmer / Training</Label>
                            <Input 
                                type="number"
                                value={structure.jsSettings?.minParticipantsPerTraining || ''}
                                onChange={(e) => handleJSSettingsChange('minParticipantsPerTraining', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Min. Alter</Label>
                            <Input 
                                type="number"
                                value={structure.jsSettings?.minAge || ''}
                                onChange={(e) => handleJSSettingsChange('minAge', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Max. Alter</Label>
                                <Input 
                                type="number"
                                value={structure.jsSettings?.maxAge || ''}
                                onChange={(e) => handleJSSettingsChange('maxAge', e.target.value)}
                            />
                        </div>
                    </div>
                     <div className="border-t pt-4 mt-4 space-y-2">
                        <Label className="font-semibold">Kontakt J+S Amt</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input placeholder="Name des Amts" value={structure.jsSettings?.contactInfo?.name || ''} onChange={(e) => handleJSContactChange('name', e.target.value)} />
                            <Input placeholder="E-Mail" type="email" value={structure.jsSettings?.contactInfo?.email || ''} onChange={(e) => handleJSContactChange('email', e.target.value)} />
                            <Input placeholder="Telefon" type="tel" value={structure.jsSettings?.contactInfo?.phone || ''} onChange={(e) => handleJSContactChange('phone', e.target.value)} />
                        </div>
                    </div>
                </CardContent>
            </Card>
             <Button onClick={addAssociation} variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Verband hinzufügen</Button>
            <Accordion type="multiple" className="w-full">
                {structure.associations.map((assoc, assocIndex) => (
                    <AccordionItem key={assoc.id || assocIndex} value={assoc.id || `assoc-${assocIndex}`}>
                        <AccordionTrigger>
                             <div className="flex items-center gap-2 w-full pr-4">
                                <Input value={assoc.name} onChange={(e) => handleAssociationChange(assocIndex, 'name', e.target.value)} className="font-semibold text-base" placeholder="Verbandsname"/>
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Verband löschen?</AlertDialogTitle></AlertDialogHeader>
                                        <AlertDialogDescription>Möchten Sie "{assoc.name}" wirklich löschen? Alle zugehörigen Ligen werden ebenfalls entfernt.</AlertDialogDescription>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => removeAssociation(assocIndex)}>Löschen</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 bg-muted/50 rounded-b-md space-y-3">
                            <Button onClick={() => addLeague(assocIndex)} variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Liga hinzufügen</Button>
                            {assoc.leagues.map((league, leagueIndex) => (
                                <Card key={league.id || leagueIndex}>
                                    <CardHeader className="p-3">
                                        <div className="flex items-center gap-2">
                                            <Input value={league.name} onChange={(e) => handleLeagueChange(assocIndex, leagueIndex, 'name', e.target.value)} placeholder="Liganame"/>
                                            <Input type="number" value={league.level} onChange={(e) => handleLeagueChange(assocIndex, leagueIndex, 'level', parseInt(e.target.value))} placeholder="Level" className="w-20"/>
                                            <Button variant="ghost" size="icon" onClick={() => removeLeague(assocIndex, leagueIndex)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0">
                                        <Label className="text-xs">Gruppen</Label>
                                         <div className="space-y-2 mt-1">
                                            {(league.groups || []).map((group, groupIndex) => (
                                                <div key={group.id} className="flex items-center gap-2">
                                                    <Input value={group.name} onChange={(e) => handleGroupChange(assocIndex, leagueIndex, groupIndex, e.target.value)} />
                                                    <Button variant="ghost" size="icon" onClick={() => removeGroup(assocIndex, leagueIndex, groupIndex)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                </div>
                                            ))}
                                            <Button variant="ghost" size="sm" onClick={() => addGroup(assocIndex, leagueIndex)}>+ Gruppe</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    )
}


export default function LeagueStructuresPage() {
  const [config, setConfig] = useState<Configuration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedConfig = await getConfiguration();
      setConfig(fetchedConfig || { teamCategories: { 'CH': [] }, leagueStructures: {}, sponsorshipPackages: [] });
    } catch (error) {
      console.error("Failed to fetch configuration:", error);
      toast({ title: "Fehler beim Laden", description: "Die Konfigurationen konnten nicht geladen werden.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!config) return;
    setIsLoading(true);
    try {
      await updateConfiguration(config);
      toast({ title: "Länderkonfiguration gespeichert!", description: "Die Änderungen wurden erfolgreich übernommen." });
    } catch (error) {
      console.error("Failed to save configuration:", error);
      toast({ title: "Fehler beim Speichern", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeagueStructureChange = (countryCode: string, newStructure: CountryLeagueStructure) => {
      setConfig(prevConfig => ({
          ...prevConfig!,
          leagueStructures: {
              ...prevConfig!.leagueStructures,
              [countryCode]: newStructure,
          }
      }));
  }
  
    const handleAddCountry = () => {
        const newCountryCode = 'NEW';
        const newCountryName = 'Neues Land';
        if (config?.leagueStructures[newCountryCode]) {
            toast({ title: "Land bereits vorhanden", variant: "default"});
            return;
        }
        
        const newStructure: CountryLeagueStructure = {
            id: newCountryCode,
            countryName: newCountryName,
            associations: [],
            currency: 'EUR',
            jsSettings: {
                compensationPerParticipant: 0,
                minTrainingDurationMinutes: 60,
                minParticipantsPerTraining: 5,
                minAge: 5,
                maxAge: 20
            }
        };

        setConfig(prevConfig => ({
            ...prevConfig!,
            leagueStructures: {
                ...prevConfig!.leagueStructures,
                [newCountryCode]: newStructure
            }
        }));
    };

  const handleDownloadTemplate = () => {
    const headers = "countryCode,associationName,leagueName,leagueLevel,groupName";
    const exampleRow = "CH,FVRZ,2. Liga,5,Gruppe 1";
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + exampleRow;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "liga_import_vorlage.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
            const newStructures = { ...config?.leagueStructures };
            
            results.data.forEach((row: any) => {
                const { countryCode, associationName, leagueName, leagueLevel, groupName } = row;
                if (!countryCode || !associationName || !leagueName || !leagueLevel) return;

                if (!newStructures[countryCode]) {
                    newStructures[countryCode] = { id: countryCode, countryName: countryCode, associations: [], currency: 'CHF' };
                }
                
                let assoc = newStructures[countryCode].associations.find(a => a.name === associationName);
                if (!assoc) {
                    assoc = { id: associationName, name: associationName, leagues: [] };
                    newStructures[countryCode].associations.push(assoc);
                }

                let league = assoc.leagues.find(l => l.name === leagueName);
                if (!league) {
                    league = { id: leagueName, name: leagueName, level: parseInt(leagueLevel, 10), groups: [] };
                    assoc.leagues.push(league);
                }

                if (groupName && !league.groups?.some(g => g.name === groupName)) {
                    league.groups.push({ id: groupName, name: groupName });
                }
            });

            setConfig(prev => ({...prev!, leagueStructures: newStructures }));
            toast({ title: 'Import erfolgreich', description: 'Die Daten wurden geladen. Bitte überprüfen und speichern Sie die Änderungen.' });
        }
    });
  };

  if (isLoading || !config) {
    return <div className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Lade Konfiguration...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Länderkonfiguration</CardTitle>
                <CardDescription>
                Verwalten Sie hier die Ligen und Förderprogramme (z.B. J+S) für jedes Land.
                </CardDescription>
            </div>
            <div className="flex gap-2">
                 <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                    <FileDown className="mr-2 h-4 w-4"/> Vorlage
                </Button>
                <Button variant="outline" size="sm" asChild>
                    <label htmlFor="csv-upload" className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4"/> Importieren
                    </label>
                </Button>
                <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                <Button size="sm" onClick={handleAddCountry}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Hinzufügen
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
         <Accordion type="single" collapsible className="w-full">
            {Object.values(config.leagueStructures || {}).length > 0 ? (
                Object.values(config.leagueStructures || {}).map((structure: CountryLeagueStructure) => (
                    <AccordionItem key={structure.id} value={structure.id}>
                        <AccordionTrigger className="text-base font-medium">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{countryFlags[structure.id] || '🌍'}</span>
                            {structure.countryName}
                        </div>
                    </AccordionTrigger>
                        <AccordionContent className="p-4 bg-muted/50 rounded-b-md">
                            <LeagueStructureEditor 
                                structure={structure}
                                onStructureChange={(newStructure) => handleLeagueStructureChange(structure.id, newStructure)}
                            />
                        </AccordionContent>
                    </AccordionItem>
                ))
            ) : (
                <div className="text-center text-muted-foreground p-8">
                    Keine Länder konfiguriert.
                </div>
            )}
        </Accordion>
      </CardContent>
       <CardFooter>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" /> Änderungen speichern
        </Button>
      </CardFooter>
    </Card>
  );
}
