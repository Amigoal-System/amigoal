'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CreatePollModal } from '@/components/CreatePollModal';
import { usePolls } from '@/hooks/usePolls';
import { useUser } from '@/firebase';

const PollCard = ({ poll, onVote, onDelete, currentUserId }) => {
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    const hasVoted = poll.voters?.includes(currentUserId);

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle>{poll.title}</CardTitle>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {totalVotes} Stimmen
                        </Badge>
                        {onDelete && (
                            <Button variant="ghost" size="icon" onClick={() => onDelete(poll.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        )}
                    </div>
                </div>
                {poll.description && <CardDescription>{poll.description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-2">
                {poll.options.map(option => {
                    const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                    return (
                        <div key={option.id}>
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span>{option.text}</span>
                                <span>{percentage.toFixed(0)}% ({option.votes})</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-6 relative overflow-hidden">
                                <div className="bg-primary h-full rounded-full" style={{ width: `${percentage}%` }}></div>
                                {!hasVoted && (
                                    <Button 
                                        variant="ghost" 
                                        className="absolute inset-0 w-full h-full text-primary-foreground"
                                        onClick={() => onVote(poll.id, option.id)}
                                    >
                                        Abstimmen
                                    </Button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </CardContent>
            <CardFooter>
                 <p className="text-xs text-muted-foreground">Erstellt von {poll.createdBy} am {new Date(poll.createdAt).toLocaleDateString('de-CH')}</p>
            </CardFooter>
        </Card>
    );
};


export default function PollsPage() {
    const { polls, isLoading, addPoll, deletePoll, vote } = usePolls();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { user } = useUser();

    if (isLoading) {
        return <div>Lade Umfragen...</div>
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">Umfragen</h1>
                        <p className="text-muted-foreground">Erstellen und verwalten Sie Umfragen für Ihren Club oder Ihre Teams.</p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Neue Umfrage
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {polls.map(poll => (
                        <PollCard 
                            key={poll.id} 
                            poll={poll}
                            onVote={vote}
                            onDelete={deletePoll}
                            currentUserId={user?.uid}
                        />
                    ))}
                </div>
            </div>
            <CreatePollModal 
                isOpen={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
                onCreatePoll={addPoll}
            />
        </>
    );
}
