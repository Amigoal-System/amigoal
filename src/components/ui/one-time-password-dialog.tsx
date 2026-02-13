
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './button';
import { Input } from './input';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const OneTimePasswordDialog = ({ isOpen, onOpenChange, password }) => {
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      toast({ title: 'Passwort kopiert!' });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Einmalpasswort generiert</DialogTitle>
          <DialogDescription>
            Bitte teilen Sie dieses Passwort sicher mit dem Benutzer. Es muss beim nächsten Login geändert werden.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 flex items-center gap-2">
          <Input value={password} readOnly className="font-mono text-lg" />
          <Button size="icon" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Schliessen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
