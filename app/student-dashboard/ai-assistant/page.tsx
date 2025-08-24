"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Send, Sparkles, BookOpen, Calculator, Code } from "lucide-react"

export default function StudentAIAssistantPage() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: "assistant", content: "Hello! I'm your AI learning assistant. How can I help you today?" }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!input.trim()) return
    
    // Add user message to chat
    const userMessage = { role: "user", content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    
    // Simulate AI response (in a real app, this would call your AI service)
    setTimeout(() => {
      const aiResponses = [
        "I can help explain that concept. Here's a simple breakdown...",
        "Let me solve that problem for you step by step...",
        "Based on your question, here are some study resources that might help...",
        "That's a great question! Here's how you can approach it...",
        "I've analyzed your question and can provide some practice exercises..."
      ]
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]
      setMessages(prev => [...prev, { role: "assistant", content: randomResponse }])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">AI Learning Assistant</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[calc(100vh-220px)]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="mr-2 h-5 w-5" />
                AI Assistant
              </CardTitle>
              <CardDescription>
                Ask questions about your studies, get homework help, or explore new concepts
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col h-[calc(100%-130px)]">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4 rounded-lg bg-slate-50">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === "assistant" 
                          ? "bg-white border border-gray-200" 
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-white border border-gray-200">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce delay-75"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce delay-150"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Ask about concepts, homework help, or study tips..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5" />
                Study Tools
              </CardTitle>
              <CardDescription>
                Specialized tools to enhance your learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="notes">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="math">Math</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                </TabsList>
                
                <TabsContent value="notes" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Topic</label>
                    <Input placeholder="e.g., Computer Networks" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Format</label>
                    <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                      <option>Summary</option>
                      <option>Detailed Notes</option>
                      <option>Flashcards</option>
                      <option>Mind Map</option>
                    </select>
                  </div>
                  <Button className="w-full">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Generate Study Notes
                  </Button>
                </TabsContent>
                
                <TabsContent value="math" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Problem Type</label>
                    <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                      <option>Algebra</option>
                      <option>Calculus</option>
                      <option>Statistics</option>
                      <option>Discrete Math</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Your Problem</label>
                    <Input placeholder="e.g., Solve 2x + 5 = 15" />
                  </div>
                  <Button className="w-full">
                    <Calculator className="mr-2 h-4 w-4" />
                    Solve Problem
                  </Button>
                </TabsContent>
                
                <TabsContent value="code" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Programming Language</label>
                    <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                      <option>Python</option>
                      <option>Java</option>
                      <option>JavaScript</option>
                      <option>C++</option>
                      <option>C#</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Code Description</label>
                    <Input placeholder="e.g., Sort an array using quicksort" />
                  </div>
                  <Button className="w-full">
                    <Code className="mr-2 h-4 w-4" />
                    Generate Code
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}