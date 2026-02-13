'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from './button';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { ScrollArea } from './scroll-area';
import { Badge } from './badge';
import { Calendar, Clock, User, Users, Trash2, Mail, CheckCircle, XCircle, MapPin } from 'lucide-react';
import { format, isFuture } from 'date-fns';
import { de } from 'date-fns/locale';
import { Countdown } from './countdown';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EmailComposerModal } from './email-composer-modal';


export const EventDetailModal = ({ event, isOpen, onOpenChange, onDelete }) => {
    const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);

    if (!event) return null;

    const attendees = event.attendees || [];
    const confirmed = attendees.filter(a => a.status === 'Zusage');
    const declined = attendees.filter(a => a.status === 'Absage');

    const isUrl = (str: string | undefined) => {
        if (!str) return false;
        try {
            new URL(str);
            return str.startsWith('http');
        } catch (_) {
            return false;
        }
    }

    return (
      <>
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{event.title}</DialogTitle>
                     <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 flex-wrap">
                        <Badge variant="secondary">{event.category}</Badge>
                        <span className="hidden md:inline">|</span>
                        <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4"/> {format(new Date(event.from), "eeee, dd. MMMM yyyy", { locale: de })}</div>
                        <div className="flex items-center gap-1.5"><Clock className="h-4 w-4"/> {format(new Date(event.from), "HH:mm")} - {format(new Date(event.to), "HH:mm")} Uhr</div>
                        {event.location && (
                             <div className="flex items-center gap-1.5"><MapPin className="h-4 w-4"/> 
                                {isUrl(event.location) ? <a href={event.location} target="_blank" rel="noopener noreferrer" className="text-primary underline">Online Meeting</a> : event.location}
                             </div>
                        )}
                    </div>
                </DialogHeader>
                <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                    {isFuture(new Date(event.from)) && (
                        <div className="p-4 bg-muted rounded-lg">
                             <h4 className="text-sm font-semibold mb-2 text-center">Event startet in:</h4>
                             <Countdown targetDate={new Date(event.from)} />
                        </div>
                    )}
                    <p className="text-muted-foreground">{event.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Confirmed Attendees */}
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2"><CheckCircle className="text-green-500"/> Zusagen ({confirmed.length})</h3>
                            <ScrollArea className="h-40 border rounded-md">
                                <div className="p-2 space-y-1">
                                    {confirmed.map((att, i) => (
                                        <div key={i} className="flex items-center gap-3 p-1">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{att.name.slice(0,2)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{att.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                        {/* Declined Attendees */}
                        <div className="space-y-2">
                            <h3 className="font-semibold flex items-center gap-2"><XCircle className="text-red-500"/> Absagen ({declined.length})</h3>
                             <ScrollArea className="h-40 border rounded-md">
                                <div className="p-2 space-y-1">
                                    {declined.map((att, i) => (
                                        <div key={i} className="flex items-center gap-3 p-1">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{att.name.slice(0,2)}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{att.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </div>
                </div>
                <DialogFooter className="justify-between">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4"/> Event löschen</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Event wirklich löschen?</AlertDialogTitle></AlertDialogHeader>
                            <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(event.id)}>Löschen</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEmailModalOpen(true)}><Mail className="mr-2 h-4 w-4"/>Teilnehmer kontaktieren</Button>
                        <Button>Event bearbeiten</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <EmailComposerModal
            isOpen={isEmailModalOpen}
            onOpenChange={setIsEmailModalOpen}
            recipients={attendees}
            initialSubject={`Infos zum Event: ${event.title}`}
        />
      </>
    );
};
