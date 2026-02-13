
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ScrollArea } from './ui/scroll-area';
import { History } from 'lucide-react';

export const ArchivedTasksModal = ({ isOpen, onOpenChange, archivedTasks, onUnarchive }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Archivierte Aufgaben</DialogTitle>
                    <DialogDescription>
                        Hier sind Ihre erledigten Aufgaben. Sie können sie bei Bedarf wiederherstellen.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-96 w-full rounded-md border">
                    <Table>
                        <TableBody>
                            {archivedTasks.length > 0 ? (
                                archivedTasks.map(task => (
                                    <TableRow key={task.id}>
                                        <TableCell className="font-medium line-through text-muted-foreground">
                                            {task.title}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => onUnarchive(task.id)}>
                                                <History className="mr-2 h-4 w-4" />
                                                Wiederherstellen
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                                        Keine archivierten Aufgaben.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Schliessen</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
