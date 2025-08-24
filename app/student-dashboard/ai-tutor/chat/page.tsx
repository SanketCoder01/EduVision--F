"use client"

import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Image, 
  Paperclip, 
  ArrowLeft, 
  Bot, 
  User, 
  Loader2,
  Camera,
  X,
  Copy,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  image?: string;
  isTyping?: boolean;
}

const subjectInfo = {
  dsa: { name: 'Data Structures & Algorithms', color: 'from-blue-500 to-cyan-500' },
  dbms: { name: 'Database Management Systems', color: 'from-green-500 to-emerald-500' },
  cn: { name: 'Computer Networks', color: 'from-purple-500 to-violet-500' },
  os: { name: 'Operating Systems', color: 'from-orange-500 to-red-500' },
  math: { name: 'Mathematics & Statistics', color: 'from-pink-500 to-rose-500' }
};

export default function AITutorChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subject = searchParams?.get('subject') || 'dsa';
  const subjectData = subjectInfo[subject as keyof typeof subjectInfo];
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hello! I'm your AI tutor for ${subjectData?.name}. I'm here to help you understand concepts, solve problems, and answer any questions you have. You can ask me anything - from basic concepts to complex problems. You can also upload images of problems or diagrams!`,
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    const currentImage = selectedImage;
    setInputMessage('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      // First handle OCR if image is present
      let extractedText = '';
      if (currentImage) {
        const ocrResponse = await fetch('/api/ai-tutor/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: currentImage, subject })
        });
        
        if (ocrResponse.ok) {
          const ocrData = await ocrResponse.json();
          extractedText = ocrData.extractedText || '';
        }
      }

      // Get AI response
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: extractedText || currentMessage, 
          subject,
          image: currentImage ? true : false
        })
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (question: string, subject: string, hasImage?: string) => {
    // This would be replaced with actual AI API call
    const responses = {
      dsa: [
        "Great question about data structures! Let me break this down for you in simple terms...",
        "This is a classic algorithm problem. Here's how we can approach it step by step...",
        "Let me explain this concept with a simple example that's easy to understand..."
      ],
      dbms: [
        "Database concepts can be tricky, but I'll explain this clearly...",
        "This SQL query can be optimized. Here's how we can make it better...",
        "Normalization is important here. Let me show you why..."
      ],
      cn: [
        "Network protocols work in interesting ways. Let me explain this concept...",
        "This is related to how data travels across networks. Here's the simple explanation...",
        "Security in networks is crucial. Here's what you need to know..."
      ],
      os: [
        "Operating systems manage this process efficiently. Let me explain how...",
        "This is a fundamental OS concept. Here's the simple breakdown...",
        "Process management works like this in simple terms..."
      ],
      math: [
        "Mathematical concepts become easier with practice. Let me solve this step by step...",
        "This problem requires a systematic approach. Here's how we solve it...",
        "Statistics can be confusing, but this concept is actually quite simple..."
      ]
    };

    if (hasImage) {
      return "I can see the image you've uploaded! Let me analyze this problem and provide a detailed solution with step-by-step explanation...";
    }

    const subjectResponses = responses[subject as keyof typeof responses] || responses.dsa;
    return subjectResponses[Math.floor(Math.random() * subjectResponses.length)];
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied to clipboard!" });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${subjectData?.color} text-white p-4 shadow-lg`}>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-semibold">{subjectData?.name} Tutor</h1>
              <p className="text-sm opacity-90">Online • Always ready to help</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
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
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <Card className="p-4 bg-white border shadow-sm max-w-[80%]">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </Card>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {selectedImage && (
        <div className="p-4 bg-gray-100 border-t">
          <div className="relative inline-block">
            <img 
              src={selectedImage} 
              alt="Selected" 
              className="max-h-20 rounded-lg"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-white border-t">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500 hover:text-gray-700"
          >
            <Image className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700"
          >
            <Camera className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about the subject..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="pr-12 border-gray-300 focus:border-blue-500"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
            className={`bg-gradient-to-r ${subjectData?.color} hover:opacity-90`}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}
