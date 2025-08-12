"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchFacultyDirectory } from '@/lib/facultyDirectory';
import { fetchMessages, sendMessage, subscribeToMessages } from '@/lib/messages';
import { uploadChatAttachment } from '@/lib/storage';
import { Skeleton } from '@/components/ui/skeleton';

// Data structures
interface Faculty {
  id: string;
  name: string;
  profile_pic_url: string;
  department: string;
  online_status: boolean;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'file' | 'audio';
  attachment_url?: string;
}

// Mock current user ID - replace with actual auth user ID
const currentStudentId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';

export function ChatLayout() {
  // State management
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingFaculty, setLoadingFaculty] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch faculty list on initial load
  useEffect(() => {
    const loadFaculty = async () => {
      try {
        const { data, error } = await fetchFacultyDirectory('Computer Science');
        if (error) throw new Error('Failed to fetch faculty data.');
        if (data) {
          setFacultyList(data as Faculty[]);
          if (data.length > 0) setSelectedFaculty(data[0] as Faculty);
        }
      } catch (err) {
        setError('Failed to load faculty directory.');
      } finally {
        setLoadingFaculty(false);
      }
    };
    loadFaculty();
  }, []);

  // Fetch messages and subscribe to real-time updates when faculty is selected
  useEffect(() => {
    if (!selectedFaculty) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      const { data, error } = await fetchMessages(currentStudentId, selectedFaculty.id);
      if (error) {
        setError('Failed to load messages.');
      } else if (data) {
        setMessages(data as Message[]);
      }
      setLoadingMessages(false);
    };

    loadMessages();

    const channel = subscribeToMessages(currentStudentId, selectedFaculty.id, (payload) => {
      setMessages((prevMessages) => [...prevMessages, payload.new as Message]);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [selectedFaculty]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedFaculty) return;

    await sendMessage(currentStudentId, 'student', selectedFaculty.id, 'faculty', newMessage, 'text');
    setNewMessage('');
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selectedFaculty) return;

    const file = e.target.files[0];
    setUploading(true);

    const { error: uploadError, publicURL } = await uploadChatAttachment(file);

    setUploading(false);

    if (uploadError || !publicURL) {
      setError('Failed to upload file.');
      return;
    }

    const messageType = file.type.startsWith('image/') ? 'image' : 'file';

    await sendMessage(
      currentStudentId,
      'student',
      selectedFaculty.id,
      'faculty',
      file.name, // Use file name as content for non-text messages
      messageType,
      publicURL
    );
  };

  const handleVoiceMessage = async () => {
    if (!selectedFaculty) return;

    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });
        
        setUploading(true);
        const { error: uploadError, publicURL } = await uploadChatAttachment(audioFile);
        setUploading(false);

        if (uploadError || !publicURL) {
          setError('Failed to upload voice message.');
          return;
        }

        await sendMessage(
          currentStudentId,
          'student',
          selectedFaculty.id,
          'faculty',
          'Voice Message',
          'audio',
          publicURL
        );
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Microphone access was denied.');
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
      {/* Faculty Sidebar */}
      <motion.div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">Chats</h2>
        </div>
        <div className="flex-grow overflow-y-auto">
          {loadingFaculty ? (
            <div className="p-3 space-y-4">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : error ? (
            <p className="p-3 text-red-500">{error}</p>
          ) : (
            facultyList.map((faculty, index) => (
              <motion.div 
                key={faculty.id} 
                className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedFaculty?.id === faculty.id ? 'bg-blue-100 dark:bg-blue-900/50' : ''}`}
                onClick={() => setSelectedFaculty(faculty)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
              >
                <img src={faculty.profile_pic_url || '/avatars/default.png'} alt={faculty.name} className="w-12 h-12 rounded-full mr-4 bg-gray-300" />
                <div>
                  <h3 className="font-semibold">{faculty.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{faculty.department}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Chat Window */}
      <motion.div className="w-2/3 flex flex-col" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
        <AnimatePresence mode="wait">
          {selectedFaculty ? (
            <motion.div key={selectedFaculty.id} className="flex flex-col h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center">
                <img src={selectedFaculty.profile_pic_url || '/avatars/default.png'} alt={selectedFaculty.name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h3 className="text-lg font-bold">{selectedFaculty.name}</h3>
                  <p className={`text-sm ${selectedFaculty.online_status ? 'text-green-500' : 'text-gray-500'}`}>
                    {selectedFaculty.online_status ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              {/* Messages Area */}
              <div className="flex-grow p-6 overflow-y-auto bg-gray-50 dark:bg-gray-800">
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full"><p>Loading messages...</p></div>
                ) : (
                  messages.map((msg) => (
                    <motion.div key={msg.id} className={`flex ${msg.sender_id === currentStudentId ? 'justify-end' : 'justify-start'} mb-4`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className={`rounded-lg px-4 py-2 max-w-sm shadow ${msg.sender_id === currentStudentId ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-700'}`}>
                        {msg.message_type === 'image' && msg.attachment_url ? (
                          <img src={msg.attachment_url} alt={msg.content} className="rounded-md max-w-xs" />
                        ) : msg.message_type === 'file' && msg.attachment_url ? (
                          <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">
                            {msg.content}
                          </a>
                        ) : msg.message_type === 'audio' && msg.attachment_url ? (
                          <audio controls src={msg.attachment_url} className="w-64" />
                        ) : (
                          msg.content
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-2">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                <button type="button" onClick={handleAttachmentClick} disabled={uploading} className="p-2 text-gray-500 hover:text-blue-500 disabled:opacity-50">
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-blue-500"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  )}
                </button>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-grow p-2 border rounded-lg bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button type="button" onClick={handleVoiceMessage} className={`p-2 text-gray-500 hover:text-blue-500 ${isRecording ? 'text-red-500' : ''}`}>
                  {isRecording ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3z"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  )}
                </button>
                <button type="submit" className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600 disabled:bg-gray-400">
                  {/* Send Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </form>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">{loadingFaculty ? 'Loading faculty...' : 'Select a chat'}</p>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
