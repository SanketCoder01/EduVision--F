"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Send, Sparkles, BookOpen, Calculator, Code, Brain, GraduationCap, List, HelpCircle } from "lucide-react"
import { motion } from "framer-motion"

export default function StudentAIAssistantPage() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: "assistant", content: "Hello! I'm your AI learning assistant. How can I help you today?" }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("notes")
  const [language, setLanguage] = useState("english")
  
  // Form states for different tools
  const [notesForm, setNotesForm] = useState({ topic: "", format: "Summary" })
  const [mathForm, setMathForm] = useState({
    problem: '',
    problemType: 'Algebra',
    image: ''
  })
  const [codeForm, setCodeForm] = useState({ description: "", programmingLanguage: "Python" })

  // AI Features for Other tab
  const aiFeatures = [
    {
      title: "Code Analysis & Debugging",
      description: "Upload code snippets for analysis and fixes",
      icon: Code
    },
    {
      title: "Research Paper Summary",
      description: "Get concise academic paper summaries",
      icon: BookOpen
    },
    {
      title: "Language Translation",
      description: "Multi-language translation support",
      icon: GraduationCap
    },
    {
      title: "Math Problem Solver",
      description: "Step-by-step equation solutions",
      icon: Calculator
    },
    {
      title: "Essay Writing Assistant",
      description: "Grammar and content improvement",
      icon: Brain
    },
    {
      title: "Study Schedule Planner",
      description: "Personalized study schedules",
      icon: List
    }
  ]

  const handleSendMessage = async () => {
    if (!input.trim()) return
    
    // Add user message to chat
    const userMessage = { role: "user", content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    
    try {
      // Call OpenAI API for general chat
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, language })
      })
      
      const data = await response.json()
      if (data.success) {
        setMessages(prev => [...prev, { role: "assistant", content: data.response }])
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "I'm having trouble connecting. Please try again." }])
    }
    
    setIsLoading(false)
  }

  const handleNotesGeneration = async () => {
    if (!notesForm.topic.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/notes-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...notesForm, language })
      })
      
      const data = await response.json()
      if (data.success) {
        setMessages(prev => [...prev, 
          { role: "user", content: `Generate ${notesForm.format} for: ${notesForm.topic}` },
          { role: "assistant", content: data.content }
        ])
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Failed to generate notes. Please try again." }])
    }
    setIsLoading(false)
  }

  const handleMathSolving = async () => {
    if (!mathForm.problem) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/math-solver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem: mathForm.problem,
          problemType: mathForm.problemType,
          image: mathForm.image,
          language
        })
      })
      
      const data = await response.json()
      if (data.success) {
        setMessages(prev => [...prev, { role: "assistant", content: data.solution }])
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: "Failed to solve the problem. Please try again." }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Failed to solve the problem. Please try again." }])
    }
    setIsLoading(false)
  }

  const handleCodeGeneration = async () => {
    if (!codeForm.description.trim()) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/ai/code-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...codeForm, language })
      })
      
      const data = await response.json()
      if (data.success) {
        setMessages(prev => [...prev, 
          { role: "user", content: `Generate ${codeForm.programmingLanguage} code for: ${codeForm.description}` },
          { role: "assistant", content: data.code }
        ])
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Failed to generate code. Please try again." }])
    }
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">AI Learning Assistant</h1>
      
      {/* Language Selection */}
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm font-medium">Language:</label>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1 text-sm"
        >
          <option value="english">English</option>
          <option value="hindi">हिंदी</option>
          <option value="marathi">मराठी</option>
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        <div className="xl:col-span-2">
          <Card className="h-[calc(100vh-280px)] min-h-[500px]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Bot className="mr-2 h-5 w-5" />
                AI Assistant
              </CardTitle>
              <CardDescription className="text-sm">
                Ask questions about your studies, get homework help, or explore new concepts
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col h-[calc(100%-100px)] p-4">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-3 border rounded-lg bg-muted/50">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg text-sm ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background border'
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">{message.content}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-background border p-2 sm:p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex space-x-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your studies..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                  className="text-sm"
                />
                <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full xl:w-auto">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">AI Tools</CardTitle>
              <CardDescription className="text-sm">
                Generate notes, solve math problems, or create code
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <Tabs defaultValue="notes">
                <TabsList className="grid w-full grid-cols-4 h-9 mb-4">
                  <TabsTrigger value="notes" className="text-xs sm:text-sm">Notes</TabsTrigger>
                  <TabsTrigger value="math" className="text-xs sm:text-sm">Math</TabsTrigger>
                  <TabsTrigger value="code" className="text-xs sm:text-sm">Code</TabsTrigger>
                  <TabsTrigger value="other" className="text-xs sm:text-sm">Other</TabsTrigger>
                </TabsList>
                
                
                <TabsContent value="notes" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Topic</label>
                    <Input 
                      placeholder="e.g., Computer Networks" 
                      value={notesForm.topic}
                      onChange={(e) => setNotesForm({...notesForm, topic: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Format</label>
                    <select 
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={notesForm.format}
                      onChange={(e) => setNotesForm({...notesForm, format: e.target.value})}
                    >
                      <option>Summary</option>
                      <option>Detailed Notes</option>
                      <option>Flashcards</option>
                      <option>Mind Map</option>
                    </select>
                  </div>
                  <Button className="w-full text-sm" onClick={handleNotesGeneration} disabled={isLoading}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Generate Study Notes
                  </Button>
                </TabsContent>
                
                <TabsContent value="math" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Problem Type</label>
                    <select 
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={mathForm.problemType}
                      onChange={(e) => setMathForm({...mathForm, problemType: e.target.value})}
                    >
                      <option>Algebra</option>
                      <option>Calculus</option>
                      <option>Statistics</option>
                      <option>Discrete Math</option>
                      <option>Engineering Math</option>
                      <option>Linear Algebra</option>
                      <option>Differential Equations</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Math Problem</label>
                    <Input 
                      placeholder="e.g., Solve 2x + 5 = 15" 
                      value={mathForm.problem}
                      onChange={(e) => setMathForm({...mathForm, problem: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload Image (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setMathForm({...mathForm, image: event.target?.result as string});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs sm:text-sm file:border-0 file:bg-transparent file:text-xs file:font-medium"
                    />
                    {mathForm.image && (
                      <div className="mt-2">
                        <img src={mathForm.image} alt="Math problem" className="max-w-full h-24 sm:h-32 object-contain rounded border" />
                      </div>
                    )}
                  </div>
                  <Button className="w-full text-sm" onClick={handleMathSolving} disabled={isLoading}>
                    <Calculator className="mr-2 h-4 w-4" />
                    Solve Problem
                  </Button>
                </TabsContent>
                
                <TabsContent value="code" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Programming Language</label>
                    <select 
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={codeForm.programmingLanguage}
                      onChange={(e) => setCodeForm({...codeForm, programmingLanguage: e.target.value})}
                    >
                      <option>Python</option>
                      <option>Java</option>
                      <option>JavaScript</option>
                      <option>C++</option>
                      <option>C#</option>
                      <option>C</option>
                      <option>PHP</option>
                      <option>Go</option>
                      <option>Rust</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Code Description</label>
                    <Input 
                      placeholder="e.g., Sort an array using quicksort" 
                      value={codeForm.description}
                      onChange={(e) => setCodeForm({...codeForm, description: e.target.value})}
                    />
                  </div>
                  <Button className="w-full text-sm" onClick={handleCodeGeneration} disabled={isLoading}>
                    <Code className="mr-2 h-4 w-4" />
                    Generate Code
                  </Button>
                </TabsContent>
                
                <TabsContent value="other" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-800 mb-4">🤖 AI Features & Capabilities</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {aiFeatures.map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                          whileHover={{ scale: 1.02, y: -2 }}
                          className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border hover:shadow-md transition-all duration-200 cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <motion.div 
                              className="p-2 bg-white rounded-md shadow-sm"
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <feature.icon className="h-4 w-4 text-gray-600" />
                            </motion.div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800 text-sm mb-1">{feature.title}</h4>
                              <p className="text-gray-600 text-xs leading-relaxed">{feature.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                      className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border"
                    >
                      <div className="text-center">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                          <Sparkles className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                        </motion.div>
                        <h4 className="font-semibold text-gray-800 text-sm mb-1">Ready to explore?</h4>
                        <p className="text-gray-600 text-xs">Use the chat above or select Notes/Math/Code tabs to start using these AI features!</p>
                      </div>
                    </motion.div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}