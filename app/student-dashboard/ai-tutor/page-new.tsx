"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Bot,
  Send,
  BookOpen,
  Brain,
  Lightbulb,
  MessageCircle,
  Users,
  Sparkles,
  Clock,
  Star,
  TrendingUp,
  Target,
  Award,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  subject?: string
}

export default function AITutorPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("general")
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const studentSession = localStorage.getItem("studentSession")
    const currentUserData = localStorage.getItem("currentUser")

    if (studentSession) {
      try {
        const user = JSON.parse(studentSession)
        setCurrentUser(user)
      } catch (error) {
        console.error("Error parsing student session:", error)
      }
    } else if (currentUserData) {
      try {
        const user = JSON.parse(currentUserData)
        setCurrentUser(user)
      } catch (error) {
        console.error("Error parsing current user data:", error)
      }
    }

    // Add welcome message
    const welcomeMessage: Message = {
      id: "welcome",
      type: "ai",
      content: "Hello! I'm your AI Tutor. I'm here to help you with your studies. What would you like to learn about today?",
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
  }, [])

  const subjects = [
    { id: "general", name: "General Help", icon: Brain },
    { id: "programming", name: "Programming", icon: BookOpen },
    { id: "mathematics", name: "Mathematics", icon: Target },
    { id: "data-structures", name: "Data Structures", icon: Lightbulb },
  ]

  const quickQuestions = [
    "Explain binary search algorithm",
    "What is object-oriented programming?",
    "How do I solve quadratic equations?",
    "What are the different sorting algorithms?",
  ]

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
      subject: selectedSubject
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `Great question about ${selectedSubject}! Let me help you with that. ${inputMessage.includes("algorithm") ? "Algorithms are step-by-step procedures for solving problems. Would you like me to explain a specific algorithm?" : "I'd be happy to provide a detailed explanation. Could you be more specific about what aspect you'd like to focus on?"}`,
        timestamp: new Date(),
        subject: selectedSubject
      }
      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 2000)
  }

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Bot className="h-8 w-8" />
              AI Tutor
            </h1>
            <p className="text-indigo-100">
              Get personalized tutoring assistance for {currentUser?.department || "your subjects"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-indigo-200">Available</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Chat with AI Tutor
                </h3>
                <select 
                  value={selectedSubject} 
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === "user" 
                      ? "bg-indigo-600 text-white" 
                      : "bg-gray-100 text-gray-900"
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about your studies..."
                  className="flex-1 min-h-[40px] max-h-[120px]"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Questions */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Quick Questions
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Progress */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Learning Progress
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">85%</div>
                <div className="text-sm text-gray-600">Overall Progress</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Programming</span>
                  <span>90%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "90%" }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Mathematics</span>
                  <span>75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Study Stats */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <Award className="h-5 w-5" />
                Study Stats
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-gray-600">Sessions Today</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">2.5h</div>
                <div className="text-sm text-gray-600">Study Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">45</div>
                <div className="text-sm text-gray-600">Questions Answered</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
