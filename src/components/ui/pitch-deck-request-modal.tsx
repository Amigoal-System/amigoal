

'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { useToast } from '@/hooks/use-toast';
import { Send, Loader2 } from 'lucide-react';

export const PitchDeckRequestModal = ({ isOpen, onOpenChange, onSubmit }) => {
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!name || !email) {
            toast({
                title: "Information Missing",
                description: "Please fill in at least your name and email address.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({ name, company, email, message });
            toast({
                title: "Request Sent!",
                description: "Thank you for your interest. We will send you the pitch deck shortly.",
            });
            onOpenChange(false);
        } catch (error) {
            console.error("Pitch deck request failed:", error);
            toast({
                title: "Error",
                description: "Your request could not be submitted.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    useEffect(() => {
        if (!isOpen) {
            setName('');
            setCompany('');
            setEmail('');
            setMessage('');
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Request Pitch Deck</DialogTitle>
                    <DialogDescription>
                        Leave your contact details to receive our pitch deck by email.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Max Mustermann" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="company">Company (optional)</Label>
                        <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Your Company" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Your Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="max@example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message (optional)</Label>
                        <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your message to us..." />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                        Send Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
