"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { getMessages, sendMessage, getOrCreateConversation, uploadAttachment } from '@/app/actions/chat-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Mic, Send, Image as ImageIcon, File as FileIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Types
// These should ideally be in a types file
type Faculty = { id: string; name: string; email: string | null; designation: string | null; department: string; profile_image_url: string | null; };
type Student = { id: string; name: string; email: string | null; profile_image_url: string | null; };
type Conversation = {
    id: string;
    student: Student;
    faculty: Faculty;
    last_message_at: string;
};
type Message = {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string | null;
    attachment_url: string | null;
    message_type: string;
    created_at: string;
};

interface ChatLayoutProps {
    user: User;
    initialConversations: Conversation[];
    facultyDirectory: Faculty[];
}

export function ChatLayout({ user, initialConversations, facultyDirectory }: ChatLayoutProps) {
    const supabase = createClient();
    const { toast } = useToast();
    const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Fetch messages when a conversation is selected
    useEffect(() => {
        if (!activeConversation) return;

        const loadMessages = async () => {
            setLoadingMessages(true);
            const result = await getMessages(activeConversation.id);
            if (result.success) {
                setMessages(result.data as Message[]);
            } else {
                toast({ title: 'Error', description: 'Failed to load messages.', variant: 'destructive' });
            }
            setLoadingMessages(false);
        };

        loadMessages();
    }, [activeConversation]);

    // Real-time message subscription
    useEffect(() => {
        if (!activeConversation) return;

        const channel = supabase
            .channel(`realtime-messages:${activeConversation.id}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'messages',
                filter: `conversation_id=eq.${activeConversation.id}`
            }, (payload) => {
                setMessages((prev) => [...prev, payload.new as Message]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [activeConversation, supabase]);

    const handleSelectConversation = (conv: Conversation) => {
        setActiveConversation(conv);
    };

    const handleStartNewConversation = async (faculty: Faculty) => {
        const result = await getOrCreateConversation(user.id, faculty.id);
        if (result.success && result.data) {
            // Check if conversation already exists in state
            if (!conversations.find(c => c.id === result.data.id)) {
                 // The result from getOrCreateConversation doesn't have the nested student/faculty objects
                 // So we construct a temporary one for the UI.
                 const newConvForState: Conversation = {
                    id: result.data.id,
                    student: { id: user.id, name: user.user_metadata.name, email: user.email || null, profile_image_url: user.user_metadata.profile_image_url || null },
                    faculty: { ...faculty, profile_image_url: faculty.profile_image_url || null },
                    last_message_at: new Date().toISOString(),
                 }
                setConversations(prev => [newConvForState, ...prev]);
            }
            setActiveConversation(result.data as Conversation);
        } else {
            toast({ title: 'Error', description: 'Could not start conversation.', variant: 'destructive' });
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !activeConversation) return;

        const receiver = activeConversation.faculty.id === user.id ? activeConversation.student : activeConversation.faculty;

        await sendMessage({
            conversation_id: activeConversation.id,
            sender_id: user.id,
            receiver_id: receiver.id,
            content: newMessage,
            message_type: 'text',
        });
        setNewMessage('');
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !activeConversation) return;
        const file = e.target.files[0];
        setUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('conversationId', activeConversation.id);

        const uploadResult = await uploadAttachment(formData);

        setUploading(false);
        if (uploadResult.success && uploadResult.data) {
            const receiver = activeConversation.faculty.id === user.id ? activeConversation.student : activeConversation.faculty;
            const messageType = file.type.startsWith('image/') ? 'image' : 'file';
            await sendMessage({
                conversation_id: activeConversation.id,
                sender_id: user.id,
                receiver_id: receiver.id,
                content: file.name,
                attachment_url: uploadResult.data.url,
                message_type: messageType,
            });
        } else {
            toast({ title: 'Upload Failed', description: 'Could not upload the attachment.', variant: 'destructive' });
        }
    };

    const otherParticipant = activeConversation ? 
        (activeConversation.faculty.id === user.id ? activeConversation.student : activeConversation.faculty) 
        : null;

    return (
        <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
            {/* Sidebar */}
            <motion.div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                <Tabs defaultValue="chats" className="flex flex-col h-full">
                    <TabsList className="p-2">
                        <TabsTrigger value="chats">Chats</TabsTrigger>
                        <TabsTrigger value="new">New</TabsTrigger>
                    </TabsList>
                    <TabsContent value="chats" className="flex-grow overflow-y-auto">
                        {conversations.map((conv, index) => {
                            const participant = conv.faculty.id === user.id ? conv.student : conv.faculty;
                            return (
                                <motion.div
                                    key={conv.id}
                                    className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${activeConversation?.id === conv.id ? 'bg-blue-100 dark:bg-blue-900/50' : ''}`}
                                    onClick={() => handleSelectConversation(conv)}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                                >
                                    <Avatar className="w-12 h-12 mr-4">
                                        <AvatarImage src={participant.profile_image_url || undefined} alt={participant.name} />
                                        <AvatarFallback>{participant.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold">{participant.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{ (participant as Faculty).designation || 'Student' }</p>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </TabsContent>
                    <TabsContent value="new" className="flex-grow overflow-y-auto">
                         {facultyDirectory.map((faculty, index) => (
                            <motion.div 
                                key={faculty.id} 
                                className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800`}
                                onClick={() => handleStartNewConversation(faculty)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                            >
                                <Avatar className="w-12 h-12 mr-4">
                                    <AvatarImage src={faculty.profile_image_url || undefined} alt={faculty.name} />
                                    <AvatarFallback>{faculty.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold">{faculty.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{faculty.designation}</p>
                                </div>
                            </motion.div>
                        ))}
                    </TabsContent>
                </Tabs>
            </motion.div>

            {/* Chat Window */}
            <motion.div className="w-2/3 flex flex-col" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <AnimatePresence mode="wait">
                    {activeConversation && otherParticipant ? (
                        <motion.div key={activeConversation.id} className="flex flex-col h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="p-4 border-b flex items-center">
                                <Avatar className="w-12 h-12 mr-4">
                                    <AvatarImage src={otherParticipant.profile_image_url || undefined} alt={otherParticipant.name} />
                                    <AvatarFallback>{otherParticipant.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-bold">{otherParticipant.name}</h3>
                                </div>
                            </div>
                            <div className="flex-grow p-6 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                                {loadingMessages ? (
                                    <div className="flex justify-center items-center h-full"><p>Loading messages...</p></div>
                                ) : (
                                    messages.map((msg) => (
                                        <motion.div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'} mb-4`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                            <div className={`rounded-lg px-4 py-2 max-w-sm shadow ${msg.sender_id === user.id ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700'}`}>
                                                {msg.message_type === 'image' && msg.attachment_url ? (
                                                    <img src={msg.attachment_url} alt={msg.content || 'Image'} className="rounded-md max-w-xs cursor-pointer" onClick={() => window.open(msg.attachment_url, '_blank')} />
                                                ) : msg.message_type === 'file' && msg.attachment_url ? (
                                                    <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300 flex items-center gap-2">
                                                        <FileIcon className="w-4 h-4" /> {msg.content}
                                                    </a>
                                                ) : (
                                                    msg.content
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-2">
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                                <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                                    {uploading ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-blue-500"></div> : <Paperclip className="w-5 h-5" />}
                                </Button>
                                <Input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-grow"
                                />
                                <Button type="submit" variant="default" size="icon" disabled={!newMessage.trim()}>
                                    <Send className="w-5 h-5" />
                                </Button>
                            </form>
                        </motion.div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Select a chat or start a new conversation</p>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
