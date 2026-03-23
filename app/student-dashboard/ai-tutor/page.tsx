"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bot, Send, BookOpen, Brain, Lightbulb, MessageCircle, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  subject?: string
}

export default function AITutorPage() {
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("general")
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const studentSession = localStorage.getItem("studentSession")
    if (studentSession) {
      try {
        setCurrentUser(JSON.parse(studentSession))
      } catch (error) {
        console.error("Error parsing session:", error)
      }
    }

    setMessages([{
      id: "welcome",
      type: "ai",
      content: "Hello! I'm your AI Tutor powered by EduVision. I'm here to help you with your studies - programming, mathematics, science, engineering concepts, and more. What would you like to learn about today?",
      timestamp: new Date()
    }])
  }, [])

  const subjects = [
    { id: "general", name: "General Help", icon: Brain },
    { id: "programming", name: "Programming", icon: BookOpen },
    { id: "mathematics", name: "Mathematics", icon: Lightbulb },
    { id: "data-structures", name: "Data Structures", icon: MessageCircle },
  ]

  const quickQuestions = [
    "Explain binary search algorithm",
    "What is object-oriented programming?",
    "How do I solve quadratic equations?",
    "Explain Big O notation",
  ]

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return

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

    try {
      const response = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage, subject: selectedSubject })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to get response')

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.message,
        timestamp: new Date(),
        subject: selectedSubject
      }
      setMessages(prev => [...prev, aiResponse])
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickQuestion = (question: string) => setInputMessage(question)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3"><Bot className="h-8 w-8" />AI Tutor</h1>
            <p className="text-indigo-100">Get personalized tutoring assistance for {currentUser?.department || "your subjects"}</p>
          </div>
          <div className="text-center"><div className="text-2xl font-bold">24/7</div><div className="text-sm text-indigo-200">Available</div></div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2"><MessageCircle className="h-5 w-5" />Chat with AI Tutor</h3>
              <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="px-3 py-1 border rounded-md text-sm">
                {subjects.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div key={message.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${message.type === "user" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-900"}`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">{message.timestamp.toLocaleTimeString()}</p>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
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

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} placeholder="Ask me anything about your studies..." className="flex-1 min-h-[40px] max-h-[120px]" onKeyPress={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }} />
                <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping} className="px-4">
                  {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-4 border-b"><h3 className="font-semibold flex items-center gap-2"><Lightbulb className="h-5 w-5" />Quick Questions</h3></div>
            <div className="p-4 space-y-2">
              {quickQuestions.map((question, index) => (
                <button key={index} onClick={() => handleQuickQuestion(question)} className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">{question}</button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center gap-2 text-indigo-600 mb-2"><AlertCircle className="h-5 w-5" /><span className="font-semibold">Note</span></div>
            <p className="text-sm text-gray-600">I only answer academic and educational questions. For other topics, please use appropriate resources.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
