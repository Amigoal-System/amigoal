'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GoogleMapsSearch } from './google-maps-search';

export const FindOnMapModal = ({ isOpen, onOpenChange, onSelectLocation }) => {

    const handleSelect = (location) => {
        onSelectLocation(location);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Kontakt auf Karte suchen</DialogTitle>
                    <DialogDescription>
                        Suchen Sie nach einer Praxis, Klinik oder einem Therapeuten und übernehmen Sie die Adresse mit einem Klick.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-grow min-h-0">
                    <GoogleMapsSearch onSelectLocation={handleSelect} />
                </div>
            </DialogContent>
        </Dialog>
    );
};
