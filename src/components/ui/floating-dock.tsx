
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Save, Download, Share2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ScrollArea } from './scroll-area';

const formations = {
    '4-4-2': [
        { role: 'Goalkeeper', position: { top: '88%', left: '46.5%' } },
        { role: 'Defender', position: { top: '70%', left: '15%' } },
        { role: 'Defender', position: { top: '70%', left: '35%' } },
        { role: 'Defender', position: { top: '70%', left: '58%' } },
        { role: 'Defender', position: { top: '70%', left: '78%' } },
        { role: 'Midfielder', position: { top: '50%', left: '15%' } },
        { role: 'Midfielder', position: { top: '50%', left: '35%' } },
        { role: 'Midfielder', position: { top: '50%', left: '58%' } },
        { role: 'Midfielder', position: { top: '50%', left: '78%' } },
        { role: 'Forward', position: { top: '25%', left: '35%' } },
        { role: 'Forward', position: { top: '25%', left: '58%' } },
    ],
    '4-3-3': [
        { role: 'Goalkeeper', position: { top: '88%', left: '46.5%' } },
        { role: 'Defender', position: { top: '70%', left: '15%' } },
        { role: 'Defender', position: { top: '70%', left: '35%' } },
        { role: 'Defender', position: { top: '70%', left: '58%' } },
        { role: 'Defender', position: { top: '70%', left: '78%' } },
        { role: 'Midfielder', position: { top: '50%', left: '25%' } },
        { role: 'Midfielder', position: { top: '50%', left: '46.5%' } },
        { role: 'Midfielder', position: { top: '50%', left: '68%' } },
        { role: 'Forward', position: { top: '25%', left: '15%' } },
        { role: 'Forward', position: { top: '25%', left: '46.5%' } },
        { role: 'Forward', position: { top: '25%', left: '78%' } },
    ],
    '3-5-2': [
        { role: 'Goalkeeper', position: { top: '88%', left: '46.5%' } },
        { role: 'Defender', position: { top: '70%', left: '25%' } },
        { role: 'Defender', position: { top: '70%', left: '46.5%' } },
        { role: 'Defender', position: { top: '70%', left: '68%' } },
        { role: 'Midfielder', position: { top: '50%', left: '8%' } },
        { role: 'Midfielder', position: { top: '50%', left: '28%' } },
        { role: 'Midfielder', position: { top: '50%', left: '46.5%' } },
        { role: 'Midfielder', position: { top: '50%', left: '65%' } },
        { role: 'Midfielder', position: { top: '50%', left: '85%' } },
        { role: 'Forward', position: { top: '25%', left: '35%' } },
        { role: 'Forward', position: { top: '25%', left: '58%' } },
    ],
};

const PlayerToken = ({ player, isSelected }) => (
    <div className={cn("relative z-10 cursor-grab active:cursor-grabbing transition-all flex flex-col items-center")}>
        <div className="relative">
            <Avatar className={cn(`w-12 h-12 border-2 bg-gray-200`, isSelected && 'ring-2 ring-primary ring-offset-2', player.isOpponent ? 'border-red-500' : 'border-blue-500')}>
              <AvatarFallback className="text-lg font-bold bg-gray-200 text-gray-700">{player.number || <User />}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-3 w-full flex justify-center">
                <Badge variant="secondary">{player.name.split(' ')[0]}</Badge>
            </div>
        </div>
    </div>
);

const FootballFieldSVG = () => (
    <svg width="100%" height="100%" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
        <rect width="800" height="500" fill="#166534" />
        {/* Outer lines */}
        <rect x="5" y="5" width="790" height="490" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
        {/* Center line */}
        <line x1="400" y1="5" x2="400" y2="495" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
        {/* Center circle */}
        <circle cx="400" cy="250" r="70" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
        <circle cx="400" cy="250" r="3" fill="white" strokeOpacity="0.3" />
        {/* Left Goal Area */}
        <rect x="5" y="100" width="120" height="300" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
        <rect x="5" y="175" width="60" height="150" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
        <path d="M 125 250 A 70 70 0 0 1 125 250" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
        <circle cx="100" cy="250" r="3" fill="white" strokeOpacity="0.3" />
        {/* Right Goal Area */}
        <rect x="675" y="100" width="120" height="300" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
        <rect x="735" y="175" width="60" height="150" fill="none" stroke="white" strokeOpacity="0.3" />
        <path d="M 675 250 A 70 70 0 0 0 675 250" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
        <circle cx="700" cy="250" r="3" fill="white" strokeOpacity="0.3" />
    </svg>
);


const TacticalBoardInternal = ({ squad }) => {
    const [starters, setStarters] = useState([]);
    const [bench, setBench] = useState([]);

    useEffect(() => {
        if (squad) {
            setStarters(squad.starters.map((p, i) => ({ ...p, position: formations['4-4-2'][i]?.position || { top: '50%', left: '50%' }})));
            setBench(squad.bench);
        }
    }, [squad]);
    
    const applyFormation = (formationName) => {
        const formation = formations[formationName];
        if (!formation) return;

        setStarters(prevStarters => 
            prevStarters.map((player, index) => ({
                ...player,
                position: formation[index]?.position || { top: '50%', left: '50%' }
            }))
        );
    };

    const onDragEnd = (result) => {
        const { source, destination } = result;
        if (!destination) return;

        let sourceList, setSourceList, destList, setDestList;

        if (source.droppableId === 'starters') {
            sourceList = [...starters];
            setSourceList = setStarters;
        } else {
            sourceList = [...bench];
            setSourceList = setBench;
        }

        if (destination.droppableId === 'starters') {
            destList = [...starters];
            setDestList = setStarters;
        } else {
            destList = [...bench];
            setDestList = setBench;
        }
        
        if (source.droppableId === destination.droppableId) {
             const [removed] = sourceList.splice(source.index, 1);
             sourceList.splice(destination.index, 0, removed);
             setSourceList(sourceList);
        } else {
             const [movedPlayer] = sourceList.splice(source.index, 1);
             destList.splice(destination.index, 0, movedPlayer);
             
             setSourceList(sourceList);
             setDestList(destList);
        }
    };


    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold md:text-2xl font-headline">Taktiktafel</h1>
                    <div className="flex gap-2">
                        <Select onValueChange={applyFormation} defaultValue="4-4-2">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Formation wählen..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="4-4-2">4-4-2</SelectItem>
                                <SelectItem value="4-3-3">4-3-3</SelectItem>
                                <SelectItem value="3-5-2">3-5-2</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline"><Share2 className="mr-2 h-4 w-4" /> Teilen</Button>
                        <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Exportieren</Button>
                        <Button><Save className="mr-2 h-4 w-4" /> Speichern</Button>
                    </div>
                </div>

                <div className="flex flex-col flex-1 w-full gap-4 min-h-0">
                    <div className="flex-1 relative rounded-lg bg-green-800 overflow-hidden h-[500px]">
                        <div className="absolute inset-0">
                            <FootballFieldSVG />
                        </div>
                        <Droppable droppableId="starters" isDropDisabled={true}>
                            {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps} className="w-full h-full">
                                    {starters.map((player, index) => (
                                        <Draggable key={player.id.toString()} draggableId={player.id.toString()} index={index} isCombineEnabled={false}>
                                            {(provided) => (
                                                <div 
                                                  ref={provided.innerRef} 
                                                  {...provided.draggableProps} 
                                                  {...provided.dragHandleProps} 
                                                  style={{...provided.draggableProps.style, position: 'absolute', top: player.position?.top, left: player.position?.left }}
                                                >
                                                    <PlayerToken player={player} isSelected={false} />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>

                    <Card className="bg-background/80 backdrop-blur-sm shadow-2xl w-full flex flex-col">
                        <CardHeader className="p-4">
                            <CardTitle className="text-center">Bank ({bench.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 flex-1 min-h-0">
                            <Droppable droppableId="bench" isDropDisabled={false}>
                                {(provided) => (
                                    <ScrollArea ref={provided.innerRef} {...provided.droppableProps} className="h-48">
                                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-6">
                                            {bench.map((player, index) => (
                                                <Draggable key={player.id.toString()} draggableId={player.id.toString()} index={index} isCombineEnabled={false}>
                                                    {(provided) => (
                                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                            <PlayerToken player={player} isSelected={false} />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </ScrollArea>
                                )}
                            </Droppable>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DragDropContext>
    );
};


export function FloatingDock({ squad }) {
    return <TacticalBoardInternal squad={squad} />;
}
