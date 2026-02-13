
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Sparkles, Loader2, UserPlus, Search } from 'lucide-react';
import { Switch } from './switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import type { DunningLevel } from '@/lib/types/dunning';
import { allDefaultDunningLevels } from '@/lib/types/dunning';
import { Checkbox } from './checkbox';
import { ScrollArea } from './scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { generateEmailContent } from '@/ai/flows/generateEmailContent';
import { sendMail } from '@/services/email';

interface EmailComposerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  recipients?: {name: string, email: string}[];
  initialSubject?: string;
  initialBody?: string;
  attachmentGenerator?: () => string;
  context?: 'club' | 'member';
  onSendSuccess?: (data: { recipients: {name: string, email: string}[], subject: string }) => void;
}

export const EmailComposerModal = ({ 
  isOpen, 
  onOpenChange,
  recipients = [], 
  initialSubject = '', 
  initialBody = '', 
  attachmentGenerator,
  context = 'member',
  onSendSuccess,
}: EmailComposerModalProps) => {
  const { toast } = useToast();
  const [selectedRecipients, setSelectedRecipients] = useState<{name: string, email: string}[]>([]);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [sendAsAttachment, setSendAsAttachment] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [dunningLevels, setDunningLevels] = useState<DunningLevel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecipients = useMemo(() => {
    return recipients.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [recipients, searchTerm]);
  
  useEffect(() => {
    setDunningLevels(allDefaultDunningLevels);
  }, []);

  const updateBody = () => {
    if (sendAsAttachment && attachmentGenerator) {
        setBody("Bitte finden Sie die angehängte Datei.");
    } else {
        setBody(initialBody);
    }
  }

  useEffect(() => {
    if (isOpen) {
        setSubject(initialSubject);
        setSelectedRecipients([]);
        updateBody();
    }
  }, [isOpen, initialSubject, initialBody, sendAsAttachment, attachmentGenerator]);

  const handleSelectRecipient = (recipient: {name: string, email: string}, isSelected: boolean) => {
      if (isSelected) {
          setSelectedRecipients(prev => [...prev, recipient]);
      } else {
          setSelectedRecipients(prev => prev.filter(r => r.email !== recipient.email));
      }
  }

  const handleSelectAll = (isSelected: boolean) => {
      if (isSelected) {
          setSelectedRecipients(recipients);
      } else {
          setSelectedRecipients([]);
      }
  }

  const handleDunningLevelChange = (levelId: string) => {
    const level = dunningLevels.find(l => l.id === levelId);
    if (level) {
        const bodyText = level.body
            .replace(/{MEMBER_NAME}|{CLUB_MANAGER}/g, 'Empfänger')
            .replace(/{CLUB_NAME}/g, 'Ihr Club')
            .replace(/{AMOUNT}/g, 'CHF XXX.XX')
            .replace(/{SEASON}/g, 'XX/XX')
            .replace(/{DUE_DATE}/g, new Date().toLocaleDateString('de-CH'))
            .replace('{FEE}', `CHF ''{level.fee.toFixed(2)}`);
        
        setSubject(level.subject);
        setBody(bodyText);
    }
  };


  const handleAiAssist = async () => {
    if (!subject && !body) return;
    setIsGenerating(true);
    try {
        const result = await generateEmailContent({ subject, context: body });
        setBody(result.generatedBody);
    } catch(e) {
        toast({ title: "Fehler bei der KI-Assistenz", variant: "destructive" });
    } finally {
        setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    
    try {
      const emailPromises = selectedRecipients.map(recipient => 
          sendMail({
              to: recipient.email,
              subject: subject,
              html: body.replace(/\n/g, '<br />'), // Basic newline to br conversion
          })
      );
      await Promise.all(emailPromises);

      toast({
        title: "E-Mails erfolgreich gesendet!",
        description: `Ihre Nachricht wurde an ${selectedRecipients.length} Empfänger gesendet.`,
      });

      if (onSendSuccess) {
          onSendSuccess({recipients: selectedRecipients, subject});
      }

      onOpenChange(false);

    } catch(error) {
       toast({
        title: "E-Mail-Versand fehlgeschlagen",
        description: "Bitte überprüfen Sie Ihre SMTP-Einstellungen und versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const relevantDunningLevels = dunningLevels.filter(level => {
      return context === 'club' ? level.id.startsWith('saas_') : level.id.startsWith('member_');
  });
  
  const getAvatarText = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`;
    }
    return name.slice(0, 2);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl grid grid-cols-1 md:grid-cols-2">
        <div className="p-6 flex flex-col">
            <DialogHeader>
            <DialogTitle>E-Mail senden</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
            {relevantDunningLevels.length > 0 && (
                <div className="space-y-2">
                    <Label htmlFor="dunning-level">Mahnstufe</Label>
                    <Select onValueChange={handleDunningLevelChange}>
                        <SelectTrigger><SelectValue placeholder="Vorlage auswählen..." /></SelectTrigger>
                        <SelectContent>
                            {relevantDunningLevels.map(level => (
                                <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            <div className="space-y-2">
                <Label htmlFor="subject">Betreff</Label>
                <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="body">Nachricht</Label>
                    <Button variant="outline" size="sm" onClick={handleAiAssist} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="animate-spin mr-2"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                        KI-Assistent
                    </Button>
                </div>
                <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={10} />
            </div>
            {attachmentGenerator && (
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="attachment-switch">Versandart</Label>
                        <Label htmlFor="attachment-switch">Link</Label>
                        <Switch id="attachment-switch" checked={sendAsAttachment} onCheckedChange={setSendAsAttachment} />
                        <Label htmlFor="attachment-switch">Anhang (CSV)</Label>
                    </div>
                )}
            </div>
            <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Abbrechen</Button></DialogClose>
            <Button type="button" onClick={handleSend} disabled={selectedRecipients.length === 0 || isSending}>
                {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                Senden an {selectedRecipients.length} Empfänger
            </Button>
            </DialogFooter>
        </div>
        <div className="bg-muted/50 p-6 flex flex-col">
            <h3 className="font-semibold">Empfänger auswählen</h3>
            <div className="relative my-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Empfänger suchen..." className="pl-8" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
             <div className="flex items-center justify-between mb-2">
                <Label className="text-sm">{selectedRecipients.length} / {recipients.length} ausgewählt</Label>
                 <div className="flex gap-2">
                    <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => handleSelectAll(false)}>Alle abw.</Button>
                    <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => handleSelectAll(true)}>Alle ausw.</Button>
                </div>
            </div>
            <ScrollArea className="h-96 w-full rounded-md border">
                <div className="p-2 space-y-1">
                    {filteredRecipients.map(recipient => (
                        <div key={recipient.email} className="flex items-center gap-2 p-2 hover:bg-background rounded-md">
                           <Checkbox 
                                id={`recipient-''{recipient.email}`}
                                checked={selectedRecipients.some(r => r.email === recipient.email)}
                                onCheckedChange={(checked) => handleSelectRecipient(recipient, !!checked)}
                           />
                           <Label htmlFor={`recipient-''{recipient.email}`} className="flex items-center gap-3 cursor-pointer">
                               <Avatar className="h-8 w-8">
                                   <AvatarImage src={recipient.avatar}/>
                                   <AvatarFallback>{getAvatarText(recipient.name)}</AvatarFallback>
                               </Avatar>
                                <div>
                                    <span>{recipient.name}</span>
                                    <p className="text-xs text-muted-foreground">{recipient.email}</p>
                                </div>
                           </Label>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};
