
'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Send, UserPlus, Users, MessageSquare, Bot, Building, User } from 'lucide-react';
import { useTeam } from '@/hooks/use-team';
import { useMembers } from '@/hooks/useMembers';
import { useUser } from '@/firebase';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy, addDoc, serverTimestamp, doc, updateDoc, getDocs, writeBatch } from 'firebase/firestore';
import type { ChatRoom, ChatMessage } from '@/ai/flows/chat.types';
import { format, isToday, isYesterday } from 'date-fns';
import { de } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { getAllClubs } from '@/ai/flows/clubs';
import type { Club } from '@/ai/flows/clubs.types';
import { clubChatbot } from '@/ai/flows/clubChatbot';
import { Separator } from '@/components/ui/separator';
import { useCamps } from '@/hooks/useCamps';
import type { Bootcamp } from '@/ai/flows/bootcamps.types';

const ChatListItem = ({ chat, onClick, isActive, currentUserId }) => {
    const isAiChat = chat.participants.some(p => p.id === 'ai-amigo');
    let displayName = 'Unbekannter Chat';
    let avatarFallback = '?';
    let avatarIcon = <Users />;

    if (isAiChat) {
        displayName = `Support-Chat #${chat.id?.slice(0, 4)}`;
        avatarFallback = 'KI';
        avatarIcon = <Bot />;
    } else if (chat.isGroupChat) {
        displayName = chat.groupName || 'Gruppen-Chat';
        avatarFallback = displayName.slice(0, 2).toUpperCase();
        avatarIcon = <Users />;
    } else {
        const otherParticipant = chat.participants.find(p => p.id !== currentUserId);
        if (otherParticipant) {
            displayName = otherParticipant.name;
            avatarFallback = otherParticipant.name?.slice(0, 2).toUpperCase() || '?';
            avatarIcon = <User />;
        }
    }

    const lastMessageTimestamp = chat.lastMessage?.timestamp?.toDate();
    let displayTime = '';
    if (lastMessageTimestamp) {
        if (isToday(lastMessageTimestamp)) {
            displayTime = format(lastMessageTimestamp, 'HH:mm');
        } else if (isYesterday(lastMessageTimestamp)) {
            displayTime = 'Gestern';
        } else {
            displayTime = format(lastMessageTimestamp, 'dd.MM.yy');
        }
    }

    return (
        <div
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${isActive ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
            onClick={onClick}
        >
            <Avatar>
                <AvatarFallback>{avatarIcon}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{chat.lastMessage?.text || 'Keine Nachrichten'}</p>
            </div>
            <div className="text-xs text-muted-foreground">{displayTime}</div>
        </div>
    );
};

const MessageBubble = ({ message, isOwnMessage }) => {
    const isAiMessage = message.senderId === 'ai-amigo';
    return (
        <div className={`flex gap-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            {!isOwnMessage && (
                 <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">{isAiMessage ? <Bot/> : message.senderName?.slice(0,2)}</AvatarFallback>
                </Avatar>
            )}
            <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${isOwnMessage ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                {!isOwnMessage && <p className="text-xs font-bold text-primary mb-1">{isAiMessage ? "Amigo (KI)" : message.senderName}</p>}
                <p className="text-sm">{message.text}</p>
            </div>
        </div>
    );
};

const NewChatModal = ({ isOpen, onOpenChange, members, currentUserId, onCreateChat }) => {
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [groupName, setGroupName] = useState('');
    const [isGroup, setIsGroup] = useState(false);

    const handleCreate = () => {
        if (selectedMembers.length === 0) return;
        
        if (isGroup && !groupName.trim()) {
            return;
        }

        const participantIds = [currentUserId, ...selectedMembers];
        onCreateChat(participantIds, isGroup, groupName);
        onOpenChange(false);
        setSelectedMembers([]);
        setGroupName('');
        setIsGroup(false);
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>Neuen Chat starten</DialogTitle></DialogHeader>
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Checkbox id="isGroup" checked={isGroup} onCheckedChange={(checked) => setIsGroup(!!checked)} />
                        <Label htmlFor="isGroup">Gruppen-Chat</Label>
                    </div>
                    {isGroup && (
                        <Input 
                            placeholder="Gruppenname" 
                            value={groupName} 
                            onChange={e => setGroupName(e.target.value)} 
                        />
                    )}
                    <ScrollArea className="h-64 border rounded-md p-2">
                        {members.filter(m => m.id !== currentUserId).map(member => (
                            <div key={member.id} className="flex items-center gap-3 p-2">
                                <Checkbox
                                    id={`member-${member.id}`}
                                    checked={selectedMembers.includes(member.id!)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            if (!isGroup) {
                                                setSelectedMembers([member.id!]);
                                            } else {
                                                setSelectedMembers(prev => [...prev, member.id!]);
                                            }
                                        } else {
                                            setSelectedMembers(prev => prev.filter(id => id !== member.id));
                                        }
                                    }}
                                />
                                <Label htmlFor={`member-${member.id}`} className="flex-1 cursor-pointer">{member.firstName} {member.lastName}</Label>
                            </div>
                        ))}
                    </ScrollArea>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
                    <Button onClick={handleCreate}>Chat erstellen</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const SuperAdminChatView = () => {
    const [allClubs, setAllClubs] = useState<Club[]>([]);
    const [isLoadingClubs, setIsLoadingClubs] = useState(true);
    const [selectedContext, setSelectedContext] = useState<{type: 'club' | 'unassigned', id: string} | null>(null);

    const db = useFirestore();
    const { user } = useUser();

    const chatListQuery = useMemo(() => {
        if (!db) return null;
        let q = collection(db, 'chatRooms');
        
        if(selectedContext?.type === 'club') {
            q = query(q, where('clubId', '==', selectedContext.id));
        } else if (selectedContext?.type === 'unassigned') {
            q = query(q, where('clubId', '==', null));
        }
        
        return query(q, orderBy('lastMessage.timestamp', 'desc'));
    }, [db, selectedContext]);
    
    const { data: chatList, isLoading: isLoadingChats } = useCollection<ChatRoom>(chatListQuery);
    
    useEffect(() => {
        const fetchClubs = async () => {
            setIsLoadingClubs(true);
            const clubs = await getAllClubs({ includeArchived: false });
            setAllClubs(clubs);
            setIsLoadingClubs(false);
        }
        fetchClubs();
    }, []);

    const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
    const [newMessage, setNewMessage] = useState('');
     const messageQuery = selectedChat ? query(
        collection(db, 'chatRooms', selectedChat.id, 'messages'),
        orderBy('timestamp', 'asc')
    ) : null;
    const { data: messages, isLoading: isLoadingMessages } = useCollection<ChatMessage>(messageQuery);
    
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
     const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedChat || !user || !db) return;
        
        const messageData: Partial<ChatMessage> = {
            senderId: user.uid,
            senderName: user.displayName || 'Super-Admin',
            text: newMessage,
            timestamp: serverTimestamp(),
        };

        const messagesCol = collection(db, 'chatRooms', selectedChat.id, 'messages');
        await addDoc(messagesCol, messageData);

        const chatRoomRef = doc(db, 'chatRooms', selectedChat.id);
        await updateDoc(chatRoomRef, {
            lastMessage: {
                text: newMessage,
                timestamp: serverTimestamp(),
            }
        });
        setNewMessage('');
    };

    return (
         <div className="h-[calc(100vh-100px)] flex gap-6">
            {/* Left Column: Context Selection (Clubs, Website etc.) */}
            <Card className="w-1/4 flex flex-col">
                 <CardHeader>
                    <CardTitle>Kontexte</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                    <div className="space-y-1">
                        <div
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${selectedContext?.type === 'unassigned' ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
                            onClick={() => setSelectedContext({ type: 'unassigned', id: 'website' })}
                        >
                            <Bot className="h-8 w-8 text-primary"/>
                            <p className="font-semibold">Support & Website Chats</p>
                        </div>
                        <Separator className="my-2"/>
                         {isLoadingClubs ? <p>Lade Vereine...</p> : allClubs.map(club => (
                            <div key={club.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${selectedContext?.id === club.id ? 'bg-primary/10' : 'hover:bg-muted/50'}`} onClick={() => setSelectedContext({ type: 'club', id: club.id! })}>
                                <Avatar><AvatarFallback><Building/></AvatarFallback></Avatar>
                                <p className="font-semibold truncate">{club.name}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Middle Column: Chat List */}
            <Card className="w-1/3 flex flex-col">
                <CardHeader>
                    <CardTitle>Chats</CardTitle>
                    <Input placeholder="Suchen..."/>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                     <div className="space-y-1">
                        {isLoadingChats ? <p>Lade Chats...</p> : (
                            chatList?.map(chat => (
                                <ChatListItem 
                                    key={chat.id} 
                                    chat={chat} 
                                    onClick={() => setSelectedChat(chat)}
                                    isActive={selectedChat?.id === chat.id}
                                    currentUserId={user?.uid}
                                />
                            ))
                        )}
                        {(chatList?.length === 0 && !isLoadingChats) && <p className="text-sm text-center text-muted-foreground p-4">Keine Chats in diesem Kontext.</p>}
                    </div>
                </CardContent>
            </Card>

            {/* Right Column: Active Chat */}
             <Card className="flex-1 flex flex-col">
                {selectedChat ? (
                    <>
                        <CardHeader className="border-b">
                            <CardTitle>{selectedChat.isGroupChat ? selectedChat.groupName : selectedChat.participants.find(p => p.id !== user?.uid)?.name || 'Support Chat'}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
                            {isLoadingMessages ? <p>Lade Nachrichten...</p> : (
                                messages?.map(msg => (
                                    <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.senderId === user?.uid} />
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </CardContent>
                        <CardFooter className="border-t p-4">
                            <div className="flex w-full items-center gap-2">
                                <Input placeholder="Nachricht schreiben..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                                <Button onClick={handleSendMessage}><Send className="h-4 w-4"/></Button>
                            </div>
                        </CardFooter>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquare className="w-16 h-16 mb-4"/>
                        <p>Wählen Sie einen Chat aus.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

const ProviderChatView = () => {
    const db = useFirestore();
    const { user } = useUser();
    const { userName } = useTeam();
    const providerName = userName;

    const { camps, isLoading: isLoadingCamps } = useCamps('bootcamp', providerName ? 'provider' : undefined);
    const [activeBootcamp, setActiveBootcamp] = useState<Bootcamp | null>(null);
    const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);

    const SUPER_ADMIN_ID = 'amigoal-super-admin-uid'; // A fixed, known UID for the super-admin

    const supportChatQuery = useMemo(() => {
        if (!db || !user) return null;
        return query(
            collection(db, 'chatRooms'),
            where('participantIds', 'array-contains', user.uid),
            where('isGroupChat', '==', false), // Direct message
            // A special identifier for support chats
            where('isSupportChat', '==', true) 
        );
    }, [db, user]);
    const { data: supportChatList } = useCollection<ChatRoom>(supportChatQuery);
    const supportChat = useMemo(() => supportChatList?.[0], [supportChatList]);

    const handleSendMessage = async (chatId, text) => { /* ... send message logic ... */ };

    const handleSelectBootcamp = (bootcamp: Bootcamp) => {
        setActiveBootcamp(bootcamp);
        // Here you would find or create the chat for this bootcamp.
        // For simplicity, we'll just set it as active and mock a chat.
        setSelectedChat({
            id: `bootcamp-${bootcamp.id}`,
            isGroupChat: true,
            groupName: `${bootcamp.name} - Teilnehmer`,
            participants: bootcamp.registrations?.map(r => ({id: r.userId, name: r.name})) || [],
            lastMessage: { text: 'Willkommen!', timestamp: serverTimestamp() }
        })
    };
    
    return (
        <div className="h-[calc(100vh-100px)] flex gap-6">
            {/* Left Column: Bootcamps & Support Chat */}
            <Card className="w-1/3 flex flex-col">
                <CardHeader>
                    <CardTitle>Meine Chats</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                    <div className="space-y-1">
                        {supportChat ? (
                             <ChatListItem 
                                chat={{...supportChat, groupName: "Amigoal Support", isGroupChat: true}} // Override for display
                                onClick={() => { setActiveBootcamp(null); setSelectedChat(supportChat); }}
                                isActive={selectedChat?.id === supportChat.id}
                                currentUserId={user?.uid}
                            />
                        ) : (
                            <p>Support-Chat wird geladen...</p>
                        )}
                        <Separator className="my-3"/>
                        <p className="text-sm font-semibold mb-2 px-2">Bootcamp Gruppen</p>
                        {isLoadingCamps ? <p>Lade Bootcamps...</p> : camps.map(camp => (
                            <div 
                                key={camp.id} 
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${activeBootcamp?.id === camp.id ? 'bg-primary/10' : 'hover:bg-muted/50'}`}
                                onClick={() => handleSelectBootcamp(camp)}>
                                <Avatar><AvatarFallback><Users/></AvatarFallback></Avatar>
                                <div>
                                    <p className="font-semibold truncate">{camp.name}</p>
                                    <p className="text-xs text-muted-foreground">{camp.registrations?.length || 0} Teilnehmer</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Right Column: Active Chat */}
             <Card className="flex-1 flex flex-col">
                {selectedChat ? (
                    <>
                        <CardHeader className="border-b"><CardTitle>{selectedChat.groupName}</CardTitle></CardHeader>
                        <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
                            {/* Messages would be loaded here */}
                            <p className="text-sm text-center text-muted-foreground pt-10">Chat-Ansicht für "{selectedChat.groupName}"</p>
                        </CardContent>
                        <CardFooter className="border-t p-4">
                             <div className="flex w-full items-center gap-2">
                                <Input placeholder="Nachricht schreiben..." />
                                <Button><Send className="h-4 w-4"/></Button>
                            </div>
                        </CardFooter>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquare className="w-16 h-16 mb-4"/>
                        <p>Wählen Sie einen Chat aus der Liste aus.</p>
                    </div>
                )}
            </Card>
        </div>
    )
}

const ClubUserChatView = () => {
    const db = useFirestore();
    const { user } = useUser();
    const { club, currentUserRole, isLoading: isLoadingTeam } = useTeam();
    const { members, isLoading: isLoadingMembers } = useMembers(club?.id);
    
    const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
    
    const chatListQuery = user && club ? query(
        collection(db, 'chatRooms'),
        where('clubId', '==', club.id),
        where('participantIds', 'array-contains', user.uid)
    ) : null;
    const { data: chatList, isLoading: isLoadingChats } = useCollection<ChatRoom>(chatListQuery);

    const messageQuery = selectedChat ? query(
        collection(db, 'chatRooms', selectedChat.id, 'messages'),
        orderBy('timestamp', 'asc')
    ) : null;
    const { data: messages, isLoading: isLoadingMessages } = useCollection<ChatMessage>(messageQuery);
    
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedChat || !user || !db) return;
        
        const messageData = {
            senderId: user.uid,
            senderName: user.displayName || 'Unbekannt',
            text: newMessage,
            timestamp: serverTimestamp(),
        };

        const messagesCol = collection(db, 'chatRooms', selectedChat.id, 'messages');
        await addDoc(messagesCol, messageData);

        const chatRoomRef = doc(db, 'chatRooms', selectedChat.id);
        await updateDoc(chatRoomRef, {
            lastMessage: {
                text: newMessage,
                timestamp: serverTimestamp(),
            }
        });

        setNewMessage('');
    };
    
    const handleCreateChat = async (participantIds: string[], isGroup: boolean, groupName?: string) => {
        if (!db || !user) return;

        const participants = members
            .filter(m => participantIds.includes(m.id!))
            .map(m => ({ id: m.id!, name: `${m.firstName} ${m.lastName}` }));
        
        participants.push({ id: user.uid, name: user.displayName! });
            
        const chatRoomData = {
            ownerId: user.uid,
            participantIds,
            participants,
            isGroup,
            groupName: isGroup ? groupName : null,
            createdAt: serverTimestamp(),
            lastMessage: null,
            clubId: club?.id,
        };
        const chatRoomsCol = collection(db, 'chatRooms');
        await addDoc(chatRoomsCol, chatRoomData);
    };

    const canCreateChat = currentUserRole && !['Player', 'Parent', 'Sponsor', 'Fan'].includes(currentUserRole);

    if (isLoadingTeam || isLoadingMembers) {
        return <div>Lade Chat...</div>;
    }

    return (
        <div className="h-[calc(100vh-100px)] flex gap-6">
            <Card className="w-1/3 flex flex-col">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Chats</CardTitle>
                        {canCreateChat && (
                         <Button size="icon" variant="ghost" onClick={() => setIsNewChatModalOpen(true)}>
                            <UserPlus className="h-5 w-5"/>
                        </Button>
                        )}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Suchen..." className="pl-8" />
                    </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto">
                    <div className="space-y-1">
                        {isLoadingChats ? <p>Lade Chats...</p> : (
                            chatList?.map(chat => (
                                <ChatListItem 
                                    key={chat.id} 
                                    chat={chat} 
                                    onClick={() => setSelectedChat(chat)}
                                    isActive={selectedChat?.id === chat.id}
                                    currentUserId={user?.uid}
                                />
                            ))
                        )}
                         {(chatList?.length === 0 && !isLoadingChats) && <p className="text-sm text-center text-muted-foreground p-4">Keine Chats vorhanden.</p>}
                    </div>
                </CardContent>
            </Card>

            <Card className="flex-1 flex flex-col">
                {selectedChat ? (
                    <>
                        <CardHeader className="border-b">
                            <CardTitle>{selectedChat.isGroupChat ? selectedChat.groupName : selectedChat.participants.find(p => p.id !== user?.uid)?.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
                            {isLoadingMessages ? <p>Lade Nachrichten...</p> : (
                                messages?.map(msg => (
                                    <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.senderId === user?.uid} />
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </CardContent>
                        <CardFooter className="border-t p-4">
                            <div className="flex w-full items-center gap-2">
                                <Input 
                                    placeholder="Nachricht schreiben..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button onClick={handleSendMessage}><Send className="h-4 w-4"/></Button>
                            </div>
                        </CardFooter>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquare className="w-16 h-16 mb-4"/>
                        <p>Wählen Sie einen Chat aus oder starten Sie eine neue Konversation.</p>
                    </div>
                )}
            </Card>
            <NewChatModal 
                isOpen={isNewChatModalOpen}
                onOpenChange={setIsNewChatModalOpen}
                members={members}
                currentUserId={user?.uid}
                onCreateChat={handleCreateChat}
            />
        </div>
    );
};


export default function ChatPage() {
    const { currentUserRole } = useTeam();
    const isProvider = currentUserRole?.includes('Anbieter');

    if (currentUserRole === 'Super-Admin') {
        return <SuperAdminChatView />;
    }
    
    if (isProvider) {
        return <ProviderChatView />;
    }
    
    return <ClubUserChatView />;
}
