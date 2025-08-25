"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

interface ChatLayoutProps {
    user: User;
    initialConversations: Conversation[];
    facultyDirectory: Faculty[];
}

export function ChatLayout({ user, initialConversations, facultyDirectory }: ChatLayoutProps) {
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
            // Mock messages for demo
            const mockMessages = [
              {
                id: '1',
                content: 'Hello! How can I help you today?',
                sender_id: activeConversation.faculty.id,
                created_at: new Date().toISOString(),
                is_faculty: true
              }
            ];
            setMessages(mockMessages);
            setLoadingMessages(false);
        };

        loadMessages();
    }, [activeConversation]);

    // Mock real-time updates (disabled for demo)
    useEffect(() => {
        // Real-time functionality disabled for mock data demo
    }, [activeConversation]);

    const handleSelectConversation = (conv: Conversation) => {
        setActiveConversation(conv);
    };

    const startNewConversation = (facultyId: string) => {
        const faculty = facultyDirectory.find(f => f.id === facultyId);
        if (!faculty) return;
        
        const newConversation = {
          id: `conv_${Date.now()}`,
          faculty_id: facultyId,
          faculty_name: faculty.name,
          faculty_avatar: faculty.profile_image_url,
          last_message: 'New conversation started',
          last_message_time: new Date().toISOString(),
          unread_count: 0
        };
        
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversation(newConversation);
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() && !uploading) return;
        if (!activeConversation) return;

        const mockMessage = {
          id: `msg_${Date.now()}`,
          content: newMessage.trim(),
          sender_id: user.id,
          created_at: new Date().toISOString(),
          is_faculty: false,
        };

        setMessages(prev => [...prev, mockMessage]);
        setNewMessage('');
        
        // Mock faculty response after 2 seconds
        setTimeout(() => {
            const facultyResponse = {
              id: `msg_${Date.now() + 1}`,
              content: 'Thank you for your message. I\'ll get back to you soon!',
              sender_id: activeConversation.faculty.id,
              created_at: new Date().toISOString(),
              is_faculty: true
            };
            setMessages(prev => [...prev, facultyResponse]);
        }, 2000);
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
            const mockMessage = {
              id: `msg_${Date.now()}`,
              content: file.name,
              sender_id: user.id,
              created_at: new Date().toISOString(),
              is_faculty: false,
              attachment_url: uploadResult.data.url,
              message_type: messageType,
            };
            setMessages(prev => [...prev, mockMessage]);
        } else {
            toast({ title: 'Upload Failed', description: 'Could not upload the attachment.', variant: 'destructive' });
        }
    };

    const otherParticipant = activeConversation ? 
        (activeConversation.faculty.id === user.id ? activeConversation.student : activeConversation.faculty) 
        : null;

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
            {/* Mobile/Desktop Sidebar */}
            <motion.div 
                className={`${activeConversation ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex-col`} 
                initial={{ x: -50, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                transition={{ duration: 0.5 }}
            >
                <Tabs defaultValue="chats" className="flex flex-col h-full">
                    <TabsList className="p-2 mx-2 mt-2">
                        <TabsTrigger value="chats" className="flex-1">My Chats</TabsTrigger>
                        <TabsTrigger value="new" className="flex-1">New Chat</TabsTrigger>
                    </TabsList>
                    <TabsContent value="chats" className="flex-grow overflow-y-auto px-2">
                        {conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                <div className="text-gray-400 mb-2">💬</div>
                                <p className="text-gray-500 text-sm">No conversations yet</p>
                                <p className="text-gray-400 text-xs mt-1">Start a new chat with faculty</p>
                            </div>
                        ) : (
                            conversations.map((conv, index) => {
                                const participant = conv.faculty.id === user.id ? conv.student : conv.faculty;
                                return (
                                    <motion.div
                                        key={conv.id}
                                        className={`flex items-center p-3 my-1 cursor-pointer rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${activeConversation?.id === conv.id ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500' : ''}`}
                                        onClick={() => handleSelectConversation(conv)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                                    >
                                        <Avatar className="w-10 h-10 mr-3">
                                            <AvatarImage src={participant.profile_image_url || undefined} alt={participant.name} />
                                            <AvatarFallback className="text-sm">{participant.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-sm truncate">{participant.name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                {(participant as Faculty).designation || 'Student'}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </TabsContent>
                    <TabsContent value="new" className="flex-grow overflow-y-auto px-2">
                        <div className="mb-3 px-3">
                            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Faculty</h3>
                            <p className="text-xs text-gray-500">Tap to start a conversation</p>
                        </div>
                        {facultyDirectory.map((faculty, index) => (
                            <motion.div 
                                key={faculty.id} 
                                className="flex items-center p-3 my-1 cursor-pointer rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
                                onClick={() => startNewConversation(faculty.id)}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                            >
                                <Avatar className="w-10 h-10 mr-3">
                                    <AvatarImage src={faculty.profile_image_url || undefined} alt={faculty.name} />
                                    <AvatarFallback className="text-sm">{faculty.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-sm truncate">{faculty.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{faculty.designation}</p>
                                    <p className="text-xs text-gray-400 truncate">{faculty.department}</p>
                                </div>
                            </motion.div>
                        ))}
                    </TabsContent>
                </Tabs>
            </motion.div>

            {/* Chat Window */}
            <motion.div 
                className={`${activeConversation ? 'flex' : 'hidden md:flex'} w-full md:w-2/3 flex-col`} 
                initial={{ x: 50, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }}
            >
                <AnimatePresence mode="wait">
                    {activeConversation && otherParticipant ? (
                        <motion.div key={activeConversation.id} className="flex flex-col h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Chat Header */}
                            <div className="p-3 md:p-4 border-b flex items-center bg-white dark:bg-gray-900">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="md:hidden mr-2 p-1"
                                    onClick={() => setActiveConversation(null)}
                                >
                                    ←
                                </Button>
                                <Avatar className="w-8 h-8 md:w-10 md:h-10 mr-3">
                                    <AvatarImage src={otherParticipant.profile_image_url || undefined} alt={otherParticipant.name} />
                                    <AvatarFallback className="text-sm">{otherParticipant.name?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm md:text-base truncate">{otherParticipant.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {(otherParticipant as Faculty).designation || 'Student'}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Messages Area */}
                            <div className="flex-grow p-3 md:p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                                {loadingMessages ? (
                                    <div className="flex justify-center items-center h-full">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                            <p className="text-sm text-gray-500">Loading messages...</p>
                                        </div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <div className="text-4xl mb-2">👋</div>
                                        <p className="text-gray-500 text-sm mb-1">Start your conversation</p>
                                        <p className="text-gray-400 text-xs">Send a message to {otherParticipant.name}</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <motion.div 
                                            key={msg.id} 
                                            className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'} mb-3`} 
                                            initial={{ opacity: 0, y: 10 }} 
                                            animate={{ opacity: 1, y: 0 }}
                                        >
                                            <div className={`rounded-2xl px-3 py-2 max-w-[85%] md:max-w-sm shadow-sm ${
                                                msg.sender_id === user.id 
                                                    ? 'bg-blue-500 text-white rounded-br-md' 
                                                    : 'bg-white dark:bg-gray-700 rounded-bl-md'
                                            }`}>
                                                {msg.message_type === 'image' && msg.attachment_url ? (
                                                    <img 
                                                        src={msg.attachment_url} 
                                                        alt={msg.content || 'Image'} 
                                                        className="rounded-lg max-w-full cursor-pointer" 
                                                        onClick={() => window.open(msg.attachment_url, '_blank')} 
                                                    />
                                                ) : msg.message_type === 'file' && msg.attachment_url ? (
                                                    <a 
                                                        href={msg.attachment_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="underline hover:text-blue-300 flex items-center gap-2 text-sm"
                                                    >
                                                        <FileIcon className="w-4 h-4" /> {msg.content}
                                                    </a>
                                                ) : (
                                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            
                            {/* Message Input */}
                            <form onSubmit={handleSendMessage} className="p-3 md:p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-2">
                                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="sm" 
                                        className="p-2"
                                        onClick={() => fileInputRef.current?.click()} 
                                        disabled={uploading}
                                    >
                                        {uploading ? (
                                            <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-blue-500"></div>
                                        ) : (
                                            <Paperclip className="w-4 h-4" />
                                        )}
                                    </Button>
                                    <Input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="flex-grow text-sm"
                                    />
                                    <Button 
                                        type="submit" 
                                        size="sm" 
                                        className="p-2"
                                        disabled={!newMessage.trim()}
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <div className="text-6xl mb-4">💬</div>
                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Welcome to Queries</h3>
                            <p className="text-gray-500 text-sm mb-4">Connect with faculty members for academic support</p>
                            <div className="text-xs text-gray-400 space-y-1">
                                <p>• Ask questions about your courses</p>
                                <p>• Get help with assignments</p>
                                <p>• Discuss academic concerns</p>
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
