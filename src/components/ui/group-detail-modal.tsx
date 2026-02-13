
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Checkbox } from './checkbox';
import { ScrollArea } from './scroll-area';
import { Search, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const GroupDetailModal = ({ groupName, allSubscribers, isOpen, onOpenChange, onUpdateGroup, onDeleteGroup }) => {
    const [members, setMembers] = useState([]);
    const [nonMembers, setNonMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (groupName) {
            const groupMembers = allSubscribers.filter(s => s.newsletterGroups.includes(groupName));
            const otherSubscribers = allSubscribers.filter(s => !s.newsletterGroups.includes(groupName));
            setMembers(groupMembers);
            setNonMembers(otherSubscribers);
        }
    }, [groupName, allSubscribers, isOpen]);

    const handleAddMember = (subscriber) => {
        setMembers(prev => [...prev, subscriber]);
        setNonMembers(prev => prev.filter(s => s.id !== subscriber.id));
    };

    const handleRemoveMember = (subscriber) => {
        setNonMembers(prev => [...prev, subscriber]);
        setMembers(prev => prev.filter(s => s.id !== subscriber.id));
    };

    const handleSave = () => {
        onUpdateGroup(groupName, members);
        onOpenChange(false);
    };
    
    const handleDelete = () => {
        onDeleteGroup(groupName);
        onOpenChange(false);
    }

    const filteredNonMembers = useMemo(() => {
        return nonMembers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [nonMembers, searchTerm]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Gruppe verwalten: {groupName}</DialogTitle>
                    <DialogDescription>
                        Fügen Sie Mitglieder zur Gruppe hinzu oder entfernen Sie sie.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-6 py-4">
                    {/* Members in Group */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">Mitglieder in dieser Gruppe ({members.length})</h4>
                        <ScrollArea className="h-96 w-full rounded-md border">
                            <Table>
                                <TableBody>
                                    {members.map(sub => (
                                        <TableRow key={sub.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback>{sub.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{sub.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(sub)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>

                    {/* Add new members */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">Mitglieder hinzufügen ({filteredNonMembers.length})</h4>
                         <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Abonnenten suchen..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <ScrollArea className="h-[330px] w-full rounded-md border">
                            <Table>
                                <TableBody>
                                    {filteredNonMembers.map(sub => (
                                        <TableRow key={sub.id} className="cursor-pointer" onClick={() => handleAddMember(sub)}>
                                            <TableCell>
                                                 <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback>{sub.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{sub.name}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>
                </div>
                <DialogFooter className="justify-between">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Gruppe löschen</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Gruppe "{groupName}" löschen?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Diese Aktion kann nicht rückgängig gemacht werden. Die Gruppe wird dauerhaft entfernt, die Abonnenten bleiben aber erhalten.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Löschen</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                        <Button onClick={handleSave}>Speichern</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
