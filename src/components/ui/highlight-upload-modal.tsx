
'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Loader2, Upload, Goal, Handshake, Sparkles, Shield, ShieldCheck, MoreHorizontal, UserPlus, X, Search, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ScrollArea } from './scroll-area';
import { Badge } from './badge';
import { RadioGroup, RadioGroupItem } from './radio-group';


interface HighlightUploadModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => void;
  members: any[]; // Assuming members are passed from the parent component
}

const highlightTypes = [
    { value: 'Tor', label: 'Tor', icon: <Goal/> },
    { value: 'Assist', label: 'Assist', icon: <Handshake/> },
    { value: 'Skill', label: 'Skill', icon: <Sparkles/> },
    { value: 'Parade', label: 'Parade', icon: <Shield/> },
    { value: 'Verteidigung', label: 'Verteidigung', icon: <ShieldCheck/> },
    { value: 'Sonstiges', label: 'Sonstiges', icon: <MoreHorizontal/> },
];

export const HighlightUploadModal: React.FC<HighlightUploadModalProps> = ({ isOpen, onOpenChange, onSave, members = [] }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [highlightType, setHighlightType] = useState('Tor');
  const [taggedPlayers, setTaggedPlayers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadFor, setUploadFor] = useState('self');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const availablePlayers = useMemo(() => {
    return members.filter(member => 
        !taggedPlayers.some(tagged => tagged.id === member.id) &&
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, taggedPlayers, searchTerm]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setVideoFile(event.target.files[0]);
    }
  };

  const handleTagPlayer = (player: any) => {
    setTaggedPlayers(prev => [...prev, player]);
    setSearchTerm('');
  };

  const handleUntagPlayer = (playerId: string) => {
    setTaggedPlayers(prev => prev.filter(p => p.id !== playerId));
  };


  const handleSave = () => {
    if (!videoFile) {
      toast({ title: 'Bitte wählen Sie eine Videodatei aus.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    toast({
        title: "Video wird verarbeitet...",
        description: "Dies kann einen Moment dauern. Bitte schliessen Sie das Fenster nicht."
    })

    const reader = new FileReader();
    reader.readAsDataURL(videoFile);
    reader.onload = () => {
      const videoDataUri = reader.result as string;
      
      const finalTaggedPlayers = uploadFor === 'self' 
        ? [] // Empty array implies the highlight is for the uploader
        : taggedPlayers.map(p => ({ id: p.id, name: `${p.firstName} ${p.lastName}`}));

      const dataToSave = {
        videoDataUri,
        type: highlightType,
        taggedPlayers: finalTaggedPlayers,
      };
      onSave(dataToSave).finally(() => {
          setIsSubmitting(false);
          onOpenChange(false);
          // Reset form state
          setVideoFile(null);
          setHighlightType('Tor');
          setTaggedPlayers([]);
          setSearchTerm('');
          setUploadFor('self');
      });
    };
    reader.onerror = (error) => {
        console.error("Error converting file to Data URI:", error);
        toast({ title: "Fehler beim Hochladen", description: "Die Datei konnte nicht verarbeitet werden.", variant: "destructive" });
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Highlight hochladen</DialogTitle>
          <DialogDescription>
            Teilen Sie Ihre besten Momente mit dem Verein und der Community.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-4">
          <div className="space-y-2">
            <Label htmlFor="video-file">1. Videodatei auswählen</Label>
            <Input id="video-file" type="file" accept="video/*" ref={fileInputRef} onChange={handleFileChange} />
             {videoFile && <p className="text-sm text-muted-foreground">Ausgewählt: {videoFile.name}</p>}
          </div>
          <div className="space-y-3">
            <Label>2. Art des Highlights</Label>
             <div className="grid grid-cols-3 gap-2">
                {highlightTypes.map((type) => (
                    <Button
                        key={type.value}
                        variant={highlightType === type.value ? 'default' : 'outline'}
                        className="h-20 flex-col gap-1 text-xs"
                        onClick={() => setHighlightType(type.value)}
                    >
                        <div className="w-6 h-6">{type.icon}</div>
                        <span>{type.label}</span>
                    </Button>
                ))}
            </div>
          </div>
           <div className="space-y-3">
                <Label>3. Für wen ist dieses Highlight?</Label>
                 <RadioGroup value={uploadFor} onValueChange={setUploadFor} className="flex gap-4 pt-1">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="self" id="for-self" />
                        <Label htmlFor="for-self">Für mich</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="teammate" id="for-teammate" />
                        <Label htmlFor="for-teammate">Für Teamkollegen</Label>
                    </div>
                </RadioGroup>
                
                {uploadFor === 'teammate' && (
                    <div className="pt-2 space-y-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Spieler suchen..." 
                                className="pl-8"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {searchTerm && (
                            <ScrollArea className="h-32 border rounded-md">
                                <div className="p-1">
                                    {availablePlayers.map(player => (
                                        <div key={player.id} className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer rounded-md" onClick={() => handleTagPlayer(player)}>
                                            <span className="text-sm">{player.firstName} {player.lastName}</span>
                                            <UserPlus className="h-4 w-4 text-primary" />
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                        {taggedPlayers.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-2">
                                {taggedPlayers.map(player => (
                                    <Badge key={player.id} variant="secondary">
                                        {player.firstName} {player.lastName}
                                        <button type="button" onClick={() => handleUntagPlayer(player.id)} className="ml-1.5 -mr-1 rounded-full p-0.5 hover:bg-muted-foreground/20">
                                            <X className="h-3 w-3"/>
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
             {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Upload className="mr-2 h-4 w-4"/>}
             {isSubmitting ? 'Verarbeite...' : 'Hochladen & Einreichen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
