
'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Gift, Cake, Medal } from 'lucide-react';
import { BirthdayCard } from './ui/birthday-card';

const calculateAge = (birthdate: string) => {
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const getUpcomingEvents = (members, eventType) => {
    if (!members) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = members.map(member => {
        let eventDate;
        let eventLabel;
        
        if (eventType === 'birthday' && member.geb) {
            const birthDate = new Date(member.geb);
            eventDate = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
            const age = calculateAge(member.geb) + 1;
            eventLabel = `${age}. Geburtstag`;
        } else if (eventType === 'anniversary' && member.memberSince) {
            const joinDate = new Date(member.memberSince);
            eventDate = new Date(today.getFullYear(), joinDate.getMonth(), joinDate.getDate());
            const years = today.getFullYear() - joinDate.getFullYear();
            if (years > 0 && (years % 5 === 0 || years === 1)) {
                 eventLabel = `${years} Jahre im Verein`;
            } else {
                return null; // Not a notable anniversary
            }
        } else {
            return null;
        }

        if (eventDate < today) {
            eventDate.setFullYear(today.getFullYear() + 1);
        }

        const diffTime = eventDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 30) {
            return {
                ...member,
                date: eventDate,
                daysUntil: diffDays,
                label: eventLabel
            };
        }
        return null;
    }).filter(Boolean);

    return upcoming.sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 5);
}


export const UpcomingEventsCard = ({ title, members, eventType, showCongratulate = false }) => {
    const [selectedMember, setSelectedMember] = useState(null);
    const [isBirthdayCardOpen, setIsBirthdayCardOpen] = useState(false);

    const events = useMemo(() => getUpcomingEvents(members, eventType), [members, eventType]);

    const handleCongratulate = (member) => {
        setSelectedMember({
            ...member,
            age: calculateAge(member.geb) + 1
        });
        setIsBirthdayCardOpen(true);
    };

    const EventIcon = eventType === 'birthday' ? Cake : Medal;

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <EventIcon className="h-5 w-5 text-primary" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {events.length > 0 ? events.map(member => (
                        <div key={member.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback>{member.firstName?.[0]}{member.lastName?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{member.firstName} {member.lastName}</p>
                                    <p className="text-xs text-muted-foreground">{member.label} am {member.date.toLocaleDateString('de-CH')}</p>
                                </div>
                            </div>
                            {showCongratulate && eventType === 'birthday' ? (
                                <Button size="sm" variant="outline" onClick={() => handleCongratulate(member)}>
                                    <Gift className="mr-2 h-4 w-4" /> Gratulieren
                                </Button>
                            ) : (
                                <Badge variant="secondary">in {member.daysUntil} Tagen</Badge>
                            )}
                        </div>
                    )) : (
                        <p className="text-sm text-muted-foreground text-center py-4">Keine anstehenden {eventType === 'birthday' ? 'Geburtstage' : 'Jubiläen'} in den nächsten 30 Tagen.</p>
                    )}
                </CardContent>
            </Card>
            {isBirthdayCardOpen && (
                <BirthdayCard member={selectedMember} isOpen={isBirthdayCardOpen} onOpenChange={setIsBirthdayCardOpen} />
            )}
        </>
    );
};
