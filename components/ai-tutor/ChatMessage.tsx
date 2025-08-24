"use client"

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, User, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  image?: string;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied to clipboard!" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
        <Card className={`p-4 ${
          message.type === 'user' 
            ? 'bg-blue-500 text-white ml-auto' 
            : 'bg-white border shadow-sm'
        }`}>
          {message.image && (
            <div className="mb-3">
              <img 
                src={message.image} 
                alt="Uploaded" 
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${
              message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {message.type === 'ai' && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyMessage(message.content)}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </Card>
        <div className={`flex items-center gap-2 mt-1 ${
          message.type === 'user' ? 'justify-end' : 'justify-start'
        }`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            message.type === 'user' 
              ? 'bg-blue-500' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500'
          }`}>
            {message.type === 'user' ? (
              <User className="h-3 w-3 text-white" />
            ) : (
              <Bot className="h-3 w-3 text-white" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
