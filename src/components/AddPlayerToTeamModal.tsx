
'use client';

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { PlusCircle, Search } from 'lucide-react';
import type { Member } from '@/ai/flows/members.types';

interface AddPlayerToTeamModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  allClubMembers: Member[];
  currentTeamMembers: Member[];
  onAddPlayers: (selectedPlayerIds: string[]) => void;
  onAddNewMember: () => void;
}

export const AddPlayerToTeamModal = ({
  isOpen,
  onOpenChange,
  allClubMembers,
  currentTeamMembers,
  onAddPlayers,
  onAddNewMember,
}: AddPlayerToTeamModalProps) => {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const availablePlayers = useMemo(() => {
    const currentTeamMemberIds = new Set(currentTeamMembers.map(p => p.id));
    return allClubMembers.filter(
      (member) =>
        !currentTeamMemberIds.has(member.id) &&
        `${member.firstName} ${member.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [allClubMembers, currentTeamMembers, searchTerm]);

  const handleTogglePlayer = (playerId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedPlayerIds((prev) => [...prev, playerId]);
    } else {
      setSelectedPlayerIds((prev) => prev.filter((id) => id !== playerId));
    }
  };

  const handleConfirm = () => {
    onAddPlayers(selectedPlayerIds);
    onOpenChange(false);
  };
  
  const handleAddNewMemberClick = () => {
      onOpenChange(false); // Close this modal first
      onAddNewMember(); // Then open the other one
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Spieler zur Mannschaft hinzufügen</DialogTitle>
          <DialogDescription>
            Wählen Sie einen oder mehrere Spieler aus der Liste aus.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Spieler suchen..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="h-72 w-full rounded-md border">
            <div className="p-4 space-y-2">
              {availablePlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md"
                >
                  <Checkbox
                    id={`player-${player.id}`}
                    checked={selectedPlayerIds.includes(player.id!)}
                    onCheckedChange={(checked) =>
                      handleTogglePlayer(player.id!, !!checked)
                    }
                  />
                  <Label
                    htmlFor={`player-${player.id}`}
                    className="flex items-center gap-3 cursor-pointer w-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={player.avatar || undefined} />
                      <AvatarFallback>
                        {player.firstName?.[0]}
                        {player.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <span>
                        {player.firstName} {player.lastName}
                        </span>
                        <p className="text-xs text-muted-foreground">{player.position}</p>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter className="justify-between">
          <Button variant="outline" onClick={handleAddNewMemberClick}>
            <PlusCircle className="mr-2 h-4 w-4" /> Neues Mitglied erstellen
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleConfirm} disabled={selectedPlayerIds.length === 0}>
              {selectedPlayerIds.length} Spieler hinzufügen
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
