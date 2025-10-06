"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { 
  Brain, 
  Upload, 
  FileText, 
  Zap, 
  Settings, 
  Download,
  Plus,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"

interface GeneratedQuestion {
  id: string
  type: 'mcq' | 'true_false' | 'fill_blank' | 'descriptive'
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  confidence: number
}

const AIQuestionGenerator = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'text' | 'generated'>('upload')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [textContent, setTextContent] = useState('')
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])

  const [generationSettings, setGenerationSettings] = useState({
    questionCount: 10,
    difficulty: 'mixed',
    questionTypes: ['mcq', 'true_false', 'fill_blank', 'descriptive'],
    subject: 'Data Structures',
    topics: ['Arrays', 'Linked Lists', 'Stacks', 'Queues'],
    includeExplanations: true,
    adaptiveDifficulty: false
  })

  const mockGeneratedQuestions: GeneratedQuestion[] = [
    {
      id: '1',
      type: 'mcq',
      question: 'What is the time complexity of inserting an element at the beginning of an array?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
      correctAnswer: 'O(n)',
      explanation: 'Inserting at the beginning requires shifting all existing elements one position to the right, which takes O(n) time.',
      difficulty: 'medium',
      topic: 'Arrays',
      confidence: 0.92
    },
    {
      id: '2',
      type: 'true_false',
      question: 'A linked list allows constant time insertion at any position.',
      correctAnswer: 'False',
      explanation: 'While insertion at the head is O(1), insertion at any arbitrary position requires O(n) time to traverse to that position.',
      difficulty: 'medium',
      topic: 'Linked Lists',
      confidence: 0.88
    },
    {
      id: '3',
      type: 'fill_blank',
      question: 'In a stack, elements are removed in _____ order.',
      correctAnswer: 'LIFO (Last In First Out)',
      explanation: 'Stack follows LIFO principle where the last element added is the first one to be removed.',
      difficulty: 'easy',
      topic: 'Stacks',
      confidence: 0.95
    },
    {
      id: '4',
      type: 'descriptive',
      question: 'Explain the difference between stack and queue data structures with examples.',
      correctAnswer: 'Stack follows LIFO principle (like a stack of plates), while queue follows FIFO principle (like a line of people). Stack operations: push/pop at top. Queue operations: enqueue at rear, dequeue at front.',
      explanation: 'This tests understanding of fundamental data structure principles and real-world analogies.',
      difficulty: 'medium',
      topic: 'Data Structures',
      confidence: 0.85
    }
  ]

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles(prev => [...prev, ...files])
    toast({
      title: "Files uploaded",
      description: `${files.length} file(s) uploaded successfully`,
    })
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const generateQuestions = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    
    // Simulate AI generation process
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 10
      })
    }, 300)

    // Simulate API call delay
    setTimeout(() => {
      setGeneratedQuestions(mockGeneratedQuestions)
      setIsGenerating(false)
      setActiveTab('generated')
      toast({
        title: "Questions generated successfully!",
        description: `Generated ${mockGeneratedQuestions.length} questions using AI`,
      })
    }, 3000)
  }

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const selectAllQuestions = () => {
    setSelectedQuestions(generatedQuestions.map(q => q.id))
  }

  const deselectAllQuestions = () => {
    setSelectedQuestions([])
  }

  const addSelectedToQuiz = () => {
    const selected = generatedQuestions.filter(q => selectedQuestions.includes(q.id))
    toast({
      title: "Questions added to quiz",
      description: `${selected.length} questions added to your quiz`,
    })
    // Here you would typically add to parent component's question list
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600'
    if (confidence >= 0.8) return 'text-blue-600'
    if (confidence >= 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI Question Generator</h2>
            <p className="text-gray-600">Generate questions from your content using AI</p>
          </div>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Generation Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Number of Questions</Label>
                  <Slider
                    value={[generationSettings.questionCount]}
                    onValueChange={(value) => setGenerationSettings({...generationSettings, questionCount: value[0]})}
                    max={50}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-sm text-gray-500 mt-1">{generationSettings.questionCount} questions</div>
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select value={generationSettings.difficulty} onValueChange={(value) => setGenerationSettings({...generationSettings, difficulty: value})}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Question Types</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[
                    { id: 'mcq', label: 'Multiple Choice' },
                    { id: 'true_false', label: 'True/False' },
                    { id: 'fill_blank', label: 'Fill in Blanks' },
                    { id: 'descriptive', label: 'Descriptive' }
                  ].map(type => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={type.id}
                        checked={generationSettings.questionTypes.includes(type.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGenerationSettings({
                              ...generationSettings,
                              questionTypes: [...generationSettings.questionTypes, type.id]
                            })
                          } else {
                            setGenerationSettings({
                              ...generationSettings,
                              questionTypes: generationSettings.questionTypes.filter(t => t !== type.id)
                            })
                          }
                        }}
                      />
                      <Label htmlFor={type.id}>{type.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="explanations">Include Explanations</Label>
                <Switch
                  id="explanations"
                  checked={generationSettings.includeExplanations}
                  onCheckedChange={(checked) => setGenerationSettings({...generationSettings, includeExplanations: checked})}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="adaptive">Adaptive Difficulty</Label>
                <Switch
                  id="adaptive"
                  checked={generationSettings.adaptiveDifficulty}
                  onCheckedChange={(checked) => setGenerationSettings({...generationSettings, adaptiveDifficulty: checked})}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload Content</TabsTrigger>
              <TabsTrigger value="text">Text Input</TabsTrigger>
              <TabsTrigger value="generated">Generated Questions</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your content</h3>
                <p className="text-gray-600 mb-4">
                  Support for PDF, DOCX, TXT, and image files
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload">
                  <Button className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </Label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Uploaded Files:</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">{file.name}</span>
                        <Badge variant="outline">{(file.size / 1024).toFixed(1)} KB</Badge>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="text" className="space-y-6">
              <div>
                <Label htmlFor="content">Paste your content here</Label>
                <Textarea
                  id="content"
                  placeholder="Paste your notes, lecture content, or study material here..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="mt-2 min-h-[300px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="generated" className="space-y-6">
              {generatedQuestions.length > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold">Generated Questions ({generatedQuestions.length})</h3>
                      <Badge variant="outline">{selectedQuestions.length} selected</Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={selectAllQuestions}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={deselectAllQuestions}>
                        Deselect All
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={addSelectedToQuiz}
                        disabled={selectedQuestions.length === 0}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Selected
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {generatedQuestions.map((question, index) => (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-6 border-2 rounded-lg transition-all ${
                          selectedQuestions.includes(question.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <input
                            type="checkbox"
                            checked={selectedQuestions.includes(question.id)}
                            onChange={() => toggleQuestionSelection(question.id)}
                            className="mt-1"
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-3">
                              <Badge variant="outline">{question.type.replace('_', ' ').toUpperCase()}</Badge>
                              <Badge className={getDifficultyColor(question.difficulty)}>
                                {question.difficulty}
                              </Badge>
                              <Badge variant="secondary">{question.topic}</Badge>
                              <div className={`text-sm font-medium ${getConfidenceColor(question.confidence)}`}>
                                {Math.round(question.confidence * 100)}% confidence
                              </div>
                            </div>
                            
                            <h4 className="font-semibold text-gray-900 mb-3">{question.question}</h4>
                            
                            {question.options && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                {question.options.map((option, optIndex) => (
                                  <div 
                                    key={optIndex}
                                    className={`p-2 rounded border text-sm ${
                                      option === question.correctAnswer 
                                        ? 'bg-green-100 border-green-300 text-green-800' 
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                                  >
                                    {String.fromCharCode(65 + optIndex)}. {option}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {!question.options && (
                              <div className="mb-3">
                                <div className="text-sm font-medium text-gray-700 mb-1">Correct Answer:</div>
                                <div className="p-2 bg-green-100 border border-green-300 rounded text-green-800 text-sm">
                                  {question.correctAnswer}
                                </div>
                              </div>
                            )}
                            
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="text-sm font-medium text-blue-800 mb-1">Explanation:</div>
                              <div className="text-sm text-blue-700">{question.explanation}</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions generated yet</h3>
                  <p className="text-gray-500">Upload content or enter text to generate questions</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Generate Button */}
          {(activeTab === 'upload' || activeTab === 'text') && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              {isGenerating ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                    <span className="text-blue-600 font-medium">Generating questions...</span>
                  </div>
                  <Progress value={generationProgress} className="w-full" />
                  <div className="text-center text-sm text-gray-600">
                    {generationProgress < 30 ? 'Analyzing content...' :
                     generationProgress < 60 ? 'Extracting key concepts...' :
                     generationProgress < 90 ? 'Generating questions...' :
                     'Finalizing questions...'}
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={generateQuestions}
                  disabled={uploadedFiles.length === 0 && !textContent.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  size="lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Generate Questions with AI
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AIQuestionGenerator
