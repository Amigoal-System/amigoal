'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, PlusCircle, Send, Users, Shield, Target, Mic, Settings, Play, Pause } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import LiveTickerLoader from '@/components/ui/live-ticker-loader';

const initialEvents = [
    { time: "88'", type: 'comment', content: 'Wechsel bei FC Amigoal. Müller kommt für Schmidt.' },
    { time: "75'", type: 'goal', content: 'TOR für FC Rivalen! Ausgleich durch einen Kopfball nach einer Ecke.' },
    { time: "62'", type: 'card', card: 'yellow', content: 'Gelbe Karte für Meier (FC Amigoal) wegen eines taktischen Fouls.' },
    { time: "45'", type: 'comment', content: 'Halbzeitpfiff. FC Amigoal führt verdient mit 1:0.' },
    { time: "23'", type: 'goal', content: 'TOOOOR für FC Amigoal! Messi trifft per Freistoss!' },
];

const quickActions = [
    { label: 'Tor', icon: <Target />, type: 'goal' },
    { label: 'Gelbe Karte', icon: <div className="w-3 h-4 bg-yellow-400 rounded-sm"/>, type: 'card', card: 'yellow'},
    { label: 'Rote Karte', icon: <div className="w-3 h-4 bg-red-500 rounded-sm"/>, type: 'card', card: 'red' },
    { label: 'Wechsel', icon: <Users />, type: 'substitution' },
    { label: 'Kommentar', icon: <PlusCircle />, type: 'comment' },
];

export default function LiveTickerPage() {
    const [isLive, setIsLive] = useState(false);
    const [time, setTime] = useState(0);
    const [events, setEvents] = useState(initialEvents);
    const [comment, setComment] = useState('');

    useEffect(() => {
        let timer;
        if (isLive) {
            timer = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000 * 60); // Jede Minute
        }
        return () => clearInterval(timer);
    }, [isLive]);
    
    const formatTime = (minutes) => {
        const mins = String(minutes).padStart(2, '0');
        return `${mins}'`;
    }

    const addEvent = (type, content, card = null) => {
        const newEvent = { time: formatTime(time), type, content, card };
        setEvents(prev => [newEvent, ...prev]);
    }
    
    const handleQuickAction = (action) => {
        // This would open a modal for more details in a real app
        addEvent(action.type, `Aktion: ${action.label}`, action.card);
    };

    const handleSendComment = () => {
        if(comment.trim()) {
            addEvent('comment', comment);
            setComment('');
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Live-Ticker: FC Amigoal vs. FC Rivalen</CardTitle>
                                <CardDescription>Spielminute: <span className="font-bold text-lg">{formatTime(time)}</span></CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon"><Settings /></Button>
                                <Button onClick={() => setIsLive(!isLive)} className={isLive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}>
                                    {isLive ? <Pause className="mr-2 h-4 w-4"/> : <Play className="mr-2 h-4 w-4"/>}
                                    {isLive ? 'Ticker stoppen' : 'Ticker starten'}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[60vh] overflow-y-auto flex flex-col-reverse">
                         <div className="space-y-4">
                            {events.map((event, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <Badge variant="secondary" className="w-16 justify-center">{event.time}</Badge>
                                    <div className="flex items-center gap-2">
                                        {event.type === 'goal' && <Target className="h-4 w-4 text-green-500"/>}
                                        {event.type === 'card' && (
                                            <div className={`w-3 h-4 rounded-sm ${event.card === 'yellow' ? 'bg-yellow-400' : 'bg-red-500'}`}></div>
                                        )}
                                        <p className="text-sm">{event.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-4">
                 <Card>
                    <CardHeader><CardTitle>Live-Erfassung</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-3 gap-2">
                        {quickActions.map(action => (
                            <Button key={action.label} variant="outline" className="flex-col h-20" onClick={() => handleQuickAction(action)}>
                                {action.icon}
                                <span className="text-xs mt-1">{action.label}</span>
                            </Button>
                        ))}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Kommentar & Audio</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea 
                            placeholder="Was passiert gerade auf dem Spielfeld?" 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                         <div className="flex gap-2">
                            <Button className="w-full" onClick={handleSendComment}><Send className="mr-2 h-4 w-4"/>Senden</Button>
                            <Button variant="outline" className="w-full"><Mic className="mr-2 h-4 w-4"/>Audio aufnehmen</Button>
                        </div>
                    </CardContent>
                </Card>
                 <Card className="bg-gray-900 text-white">
                    <CardContent className="p-4">
                        <LiveTickerLoader />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
