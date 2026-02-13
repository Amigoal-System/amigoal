
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from './ui/button';

export const StaffDetailModal = ({ isOpen, onOpenChange, staffMember }) => {
    if (!staffMember) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{staffMember.name}</DialogTitle>
                    <DialogDescription>{staffMember.role}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p>Hier werden in Zukunft weitere Details zum Staff-Mitglied angezeigt.</p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Schliessen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
