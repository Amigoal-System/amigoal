

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Bot, Send, X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { clubChatbot } from '@/ai/flows/clubChatbot';
import type { ChatMessage, ChatHistory } from '@/ai/flows/clubChatbot.types';
import { createPublicChatSession } from '@/ai/flows/chat';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';

const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isAi = message.role === 'model';
    return (
        <div className={`flex gap-3 ${!isAi ? 'justify-end' : 'justify-start'}`}>
            {isAi && (
                <Avatar className="w-8 h-8">
                    <AvatarFallback><Bot/></AvatarFallback>
                </Avatar>
            )}
            <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl ${!isAi ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                <p className="text-sm">{message.content}</p>
            </div>
        </div>
    );
};

interface PublicChatbotProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    initialMessage?: string;
}

export const PublicChatbot = ({ isOpen, onOpenChange, initialMessage }: PublicChatbotProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const db = useFirestore();
    const { user } = useUser(); // Using the user from useUser hook for sender info

    // Listen for new messages if a chatId is set
    useEffect(() => {
        if (!chatId || !db) return;

        const messagesQuery = query(
            collection(db, 'chatRooms', chatId, 'messages'),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const newMessages: ChatMessage[] = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    role: data.senderId === 'ai-amigo' ? 'model' : 'user',
                    content: data.text
                };
            });
            setMessages(newMessages);
        });

        return () => unsubscribe();
    }, [chatId, db]);

    const sendMessage = async (messageContent: string) => {
        if (!messageContent.trim()) return;

        setIsLoading(true);
        setInput('');

        const userMessage: ChatMessage = { role: 'user', content: messageContent };
        const currentHistory = [...messages, userMessage];

        try {
            if (!chatId) {
                // First message: create the chat session
                const response = await clubChatbot({ query: messageContent, history: [] });
                const newChatId = await createPublicChatSession({
                    userMessage: messageContent,
                    aiMessage: response.response,
                });
                setChatId(newChatId);
                // Snapshot listener will update the messages state
            } else {
                 // Subsequent messages: just add the user message and get AI response
                const messagesCol = collection(db, 'chatRooms', chatId, 'messages');
                await addDoc(messagesCol, {
                    senderId: user?.uid || 'public-user',
                    senderName: user?.displayName || 'Web-Besucher',
                    text: messageContent,
                    timestamp: serverTimestamp(),
                });

                const historyForAI = currentHistory.slice(-7).map(m => ({ role: m.role, content: m.content })) as ChatHistory;
                const response = await clubChatbot({ query: messageContent, history: historyForAI });

                await addDoc(messagesCol, {
                    senderId: 'ai-amigo',
                    senderName: 'Amigo',
                    text: response.response,
                    timestamp: serverTimestamp(),
                });
                
                const chatRoomRef = doc(db, 'chatRooms', chatId);
                await updateDoc(chatRoomRef, {
                    lastMessage: {
                        text: response.response,
                        timestamp: serverTimestamp(),
                    }
                });
            }
        } catch (error) {
            console.error("Chatbot error:", error);
            // Optionally show an error message in the chat
            setMessages(prev => [...prev, {role: 'model', content: 'Entschuldigung, es ist ein Fehler aufgetreten.'}]);
        } finally {
            setIsLoading(false);
        }
    };


    // Effect to handle initial greeting or initial user message
    useEffect(() => {
        if (isOpen && messages.length === 0 && !chatId) {
            if (initialMessage) {
                // Defer sending the message slightly to ensure UI is ready
                setTimeout(() => sendMessage(initialMessage), 100);
            } else {
                setIsLoading(true);
                clubChatbot({ query: '' }).then(response => {
                    const initialAiMessage: ChatMessage = { role: 'model', content: response.response };
                    setMessages([initialAiMessage]);
                }).catch(e => console.error(e)).finally(() => setIsLoading(false));
            }
        } else if (!isOpen) {
            // Reset chat when closed
            setMessages([]);
            setChatId(null);
        }
    }, [isOpen, initialMessage]);

     const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-6 right-6 z-[100]"
                    >
                        <Card className="w-96 h-[60vh] flex flex-col shadow-2xl">
                            <CardHeader className="flex flex-row items-center justify-between border-b">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback><Bot/></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle>Amigo</CardTitle>
                                        <CardDescription>AI Assistant</CardDescription>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                                    <X className="h-4 w-4"/>
                                </Button>
                            </CardHeader>
                            <CardContent className="flex-1 p-4 overflow-hidden">
                                <ScrollArea className="h-full">
                                    <div className="space-y-4">
                                        {messages.map((msg, index) => (
                                            <MessageBubble key={index} message={msg} />
                                        ))}
                                        {isLoading && <MessageBubble message={{role: 'model', content: '...'}}/>}
                                    </div>
                                    <div ref={messagesEndRef} />
                                </ScrollArea>
                            </CardContent>
                            <CardFooter className="border-t p-4">
                                <form onSubmit={handleFormSubmit} className="flex w-full items-center gap-2">
                                    <Input
                                        placeholder="Frag mich etwas..."
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <Button type="submit" disabled={isLoading || !input.trim()}>
                                        {isLoading ? <Loader2 className="animate-spin"/> : <Send/>}
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
            <Button
                size="icon"
                className="fixed bottom-6 right-6 z-[101] w-16 h-16 rounded-full shadow-lg"
                onClick={() => onOpenChange(!isOpen)}
                style={{ display: isOpen ? 'none' : 'flex' }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isOpen ? 'x' : 'chat'}
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
                    </motion.div>
                </AnimatePresence>
            </Button>
        </>
    );
};
