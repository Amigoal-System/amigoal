'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ReferralCard } from './referral-card';
import { Crown, Gift, Share2, ArrowLeft } from 'lucide-react';
import { ReferralForm } from './referral-form';
import { Button } from './button';

export const ReferralModal = ({ isOpen, onOpenChange }) => {
    const [referralLink, setReferralLink] = useState('');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const email = localStorage.getItem('amigoal_email');
            if (email) {
                const identifier = btoa(email).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_').substring(0, 10);
                setReferralLink(`https://amigoal.app/ref?id=${identifier}`);
            } else {
                setReferralLink('https://amigoal.app/ref?id=gast');
            }
        } else {
            // Reset state when modal closes
            setTimeout(() => setShowForm(false), 300);
        }
    }, [isOpen]);
    
    const referralSteps = [
        {
          icon: <Share2 className="h-4 w-4" />,
          text: "Teilen Sie Ihren persönlichen Empfehlungslink.",
        },
        {
          icon: <Crown className="h-4 w-4" />,
          text: (
            <>
              Ihr geworbener Verein erhält <span className="font-semibold text-card-foreground">einen Monat gratis</span>,
              wenn er ein Abo abschliesst.
            </>
          ),
        },
        {
          icon: <Gift className="h-4 w-4" />,
          text: (
            <>
              Sie erhalten eine <span className="font-semibold text-card-foreground">Gutschrift von CHF 15</span> für jede erfolgreiche Empfehlung.
            </>
          ),
        },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-transparent border-none shadow-none p-0 max-w-2xl">
                 {showForm ? (
                    <div className="relative">
                         <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} className="absolute -top-2 -left-4 text-white">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Zurück
                        </Button>
                        <ReferralForm onFormSubmit={() => onOpenChange(false)} />
                    </div>
                ) : (
                    <ReferralCard
                        badgeText="Bonus erhalten"
                        title="Verein empfehlen & profitieren"
                        description="für jeden Verein, den Sie einladen"
                        imageUrl="https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-v0vbLLyS37IDvS2JqhJONhIAEgpeZP.png&w=320&q=75"
                        steps={referralSteps}
                        referralLink={referralLink}
                        onDirectReferralClick={() => setShowForm(true)}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};
