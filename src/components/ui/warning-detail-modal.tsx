
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export const WarningDetailModal = ({ warning, isOpen, onOpenChange }) => {
    if (!warning) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{warning.type}</DialogTitle>
                    <DialogDescription>Datum: {warning.date}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p>{warning.detail}</p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Schliessen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
