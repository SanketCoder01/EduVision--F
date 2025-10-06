"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  Clock, 
  Shuffle, 
  Brain,
  FileText,
  CheckCircle,
  Circle,
  Edit3,
  Upload,
  Download,
  Zap,
  Target,
  Users,
  Calendar
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import AIQuestionGenerator from "@/components/quiz/AIQuestionGenerator"
import ImportExportQuestions from "@/components/quiz/ImportExportQuestions"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Question {
  id: string
  type: 'mcq' | 'true_false' | 'fill_blank' | 'descriptive'
  question: string
  options?: string[]
  correctAnswer?: string | number
  points: number
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  explanation?: string
}

const CreateQuiz = () => {
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    subject: '',
    department: '',
    targetYears: [] as string[],
    duration: 60,
    totalMarks: 0,
    passingMarks: 0,
    instructions: '',
    startDate: '',
    endDate: '',
    randomizeQuestions: false,
    showResults: true,
    allowReview: true,
    proctoring: false
  })

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    type: 'mcq',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
    difficulty: 'medium',
    tags: [],
    explanation: ''
  })

  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [showImportExport, setShowImportExport] = useState(false)

  const departments = ['CSE', 'AIDS', 'AIML', 'CYBER']
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year']
  const subjects = ['Data Structures', 'Algorithms', 'Database Systems', 'Computer Networks', 'Operating Systems', 'Software Engineering']

  const addQuestion = () => {
    if (!currentQuestion.question?.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive"
      })
      return
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      type: currentQuestion.type as Question['type'],
      question: currentQuestion.question,
      options: currentQuestion.type === 'mcq' ? currentQuestion.options : undefined,
      correctAnswer: currentQuestion.correctAnswer,
      points: currentQuestion.points || 1,
      difficulty: currentQuestion.difficulty as Question['difficulty'],
      tags: currentQuestion.tags || [],
      explanation: currentQuestion.explanation
    }

    setQuestions([...questions, newQuestion])
    setCurrentQuestion({
      type: 'mcq',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1,
      difficulty: 'medium',
      tags: [],
      explanation: ''
    })

    // Update total marks
    setQuizData(prev => ({
      ...prev,
      totalMarks: prev.totalMarks + (currentQuestion.points || 1)
    }))

    toast({
      title: "Success",
      description: "Question added successfully",
    })
  }

  const removeQuestion = (id: string) => {
    const questionToRemove = questions.find(q => q.id === id)
    if (questionToRemove) {
      setQuestions(questions.filter(q => q.id !== id))
      setQuizData(prev => ({
        ...prev,
        totalMarks: prev.totalMarks - questionToRemove.points
      }))
    }
  }

  const renderQuestionForm = () => {
    switch (currentQuestion.type) {
      case 'mcq':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Question *</Label>
              <Textarea
                id="question"
                placeholder="Enter your multiple choice question..."
                value={currentQuestion.question}
                onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Options *</Label>
              <div className="space-y-2 mt-2">
                {currentQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(currentQuestion.options || [])]
                        newOptions[index] = e.target.value
                        setCurrentQuestion({...currentQuestion, options: newOptions})
                      }}
                    />
                    <Button
                      type="button"
                      variant={currentQuestion.correctAnswer === index.toString() ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentQuestion({...currentQuestion, correctAnswer: index.toString()})}
                    >
                      {currentQuestion.correctAnswer === index.toString() ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'true_false':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Question *</Label>
              <Textarea
                id="question"
                placeholder="Enter your true/false question..."
                value={currentQuestion.question}
                onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Correct Answer *</Label>
              <div className="flex space-x-4 mt-2">
                <Button
                  type="button"
                  variant={currentQuestion.correctAnswer === 'true' ? "default" : "outline"}
                  onClick={() => setCurrentQuestion({...currentQuestion, correctAnswer: 'true'})}
                >
                  True
                </Button>
                <Button
                  type="button"
                  variant={currentQuestion.correctAnswer === 'false' ? "default" : "outline"}
                  onClick={() => setCurrentQuestion({...currentQuestion, correctAnswer: 'false'})}
                >
                  False
                </Button>
              </div>
            </div>
          </div>
        )

      case 'fill_blank':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Question *</Label>
              <Textarea
                id="question"
                placeholder="Enter your question with _____ for blanks..."
                value={currentQuestion.question}
                onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">Use _____ to indicate where students should fill in the blank</p>
            </div>
            
            <div>
              <Label htmlFor="answer">Correct Answer *</Label>
              <Input
                id="answer"
                placeholder="Enter the correct answer..."
                value={currentQuestion.correctAnswer}
                onChange={(e) => setCurrentQuestion({...currentQuestion, correctAnswer: e.target.value})}
                className="mt-1"
              />
            </div>
          </div>
        )

      case 'descriptive':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Question *</Label>
              <Textarea
                id="question"
                placeholder="Enter your descriptive question..."
                value={currentQuestion.question}
                onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                className="mt-1"
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="sample-answer">Sample Answer (Optional)</Label>
              <Textarea
                id="sample-answer"
                placeholder="Provide a sample answer for reference..."
                value={currentQuestion.correctAnswer}
                onChange={(e) => setCurrentQuestion({...currentQuestion, correctAnswer: e.target.value})}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const saveQuiz = () => {
    if (!quizData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a quiz title",
        variant: "destructive"
      })
      return
    }

    if (questions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one question",
        variant: "destructive"
      })
      return
    }

    // Here you would save to your backend
    console.log('Quiz Data:', { ...quizData, questions })
    
    toast({
      title: "Success",
      description: "Quiz saved successfully!",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Create New Quiz
              </h1>
              <p className="mt-2 text-gray-600">
                Design comprehensive quizzes with AI-powered features
              </p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <Button variant="outline" className="px-6">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={saveQuiz} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6">
                <Save className="w-4 h-4 mr-2" />
                Save Quiz
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quiz Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Quiz Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Quiz Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter quiz title..."
                        value={quizData.title}
                        onChange={(e) => setQuizData({...quizData, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Select value={quizData.subject} onValueChange={(value) => setQuizData({...quizData, subject: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map(subject => (
                            <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the quiz..."
                      value={quizData.description}
                      onChange={(e) => setQuizData({...quizData, description: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Select value={quizData.department} onValueChange={(value) => setQuizData({...quizData, department: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration (minutes) *</Label>
                      <Input
                        id="duration"
                        type="number"
                        placeholder="60"
                        value={quizData.duration}
                        onChange={(e) => setQuizData({...quizData, duration: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start-date">Start Date & Time *</Label>
                      <Input
                        id="start-date"
                        type="datetime-local"
                        value={quizData.startDate}
                        onChange={(e) => setQuizData({...quizData, startDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date">End Date & Time *</Label>
                      <Input
                        id="end-date"
                        type="datetime-local"
                        value={quizData.endDate}
                        onChange={(e) => setQuizData({...quizData, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Question Builder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-purple-600" />
                    Question Builder
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={currentQuestion.type} onValueChange={(value) => setCurrentQuestion({...currentQuestion, type: value as Question['type']})}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="mcq">MCQ</TabsTrigger>
                      <TabsTrigger value="true_false">True/False</TabsTrigger>
                      <TabsTrigger value="fill_blank">Fill Blanks</TabsTrigger>
                      <TabsTrigger value="descriptive">Descriptive</TabsTrigger>
                    </TabsList>

                    <div className="mt-6 space-y-4">
                      {renderQuestionForm()}

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="points">Points *</Label>
                          <Input
                            id="points"
                            type="number"
                            min="1"
                            value={currentQuestion.points}
                            onChange={(e) => setCurrentQuestion({...currentQuestion, points: parseInt(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="difficulty">Difficulty *</Label>
                          <Select value={currentQuestion.difficulty} onValueChange={(value) => setCurrentQuestion({...currentQuestion, difficulty: value as Question['difficulty']})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">Easy</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="hard">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="tags">Tags</Label>
                          <Input
                            id="tags"
                            placeholder="topic, concept..."
                            onChange={(e) => setCurrentQuestion({...currentQuestion, tags: e.target.value.split(',')})}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="explanation">Explanation (Optional)</Label>
                        <Textarea
                          id="explanation"
                          placeholder="Provide explanation for the answer..."
                          value={currentQuestion.explanation}
                          onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                        />
                      </div>

                      <Button onClick={addQuestion} className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>

            {/* Questions List */}
            {questions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Questions ({questions.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {questions.map((question, index) => (
                        <div key={question.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge variant="outline">{question.type.replace('_', ' ').toUpperCase()}</Badge>
                                <Badge variant="secondary">{question.difficulty}</Badge>
                                <Badge>{question.points} pts</Badge>
                              </div>
                              <p className="text-gray-900 font-medium">{index + 1}. {question.question}</p>
                              {question.options && (
                                <div className="mt-2 space-y-1">
                                  {question.options.map((option, optIndex) => (
                                    <div key={optIndex} className={`text-sm ${question.correctAnswer === optIndex.toString() ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                                      {String.fromCharCode(65 + optIndex)}. {option}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQuestion(question.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quiz Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2 text-green-600" />
                    Quiz Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="randomize">Randomize Questions</Label>
                    <Switch
                      id="randomize"
                      checked={quizData.randomizeQuestions}
                      onCheckedChange={(checked) => setQuizData({...quizData, randomizeQuestions: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-results">Show Results</Label>
                    <Switch
                      id="show-results"
                      checked={quizData.showResults}
                      onCheckedChange={(checked) => setQuizData({...quizData, showResults: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="allow-review">Allow Review</Label>
                    <Switch
                      id="allow-review"
                      checked={quizData.allowReview}
                      onCheckedChange={(checked) => setQuizData({...quizData, allowReview: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="proctoring">AI Proctoring</Label>
                    <Switch
                      id="proctoring"
                      checked={quizData.proctoring}
                      onCheckedChange={(checked) => setQuizData({...quizData, proctoring: checked})}
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="passing-marks">Passing Marks</Label>
                    <Input
                      id="passing-marks"
                      type="number"
                      value={quizData.passingMarks}
                      onChange={(e) => setQuizData({...quizData, passingMarks: parseInt(e.target.value)})}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Tools */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                    AI Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Dialog open={showAIGenerator} onOpenChange={setShowAIGenerator}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Brain className="w-4 h-4 mr-2" />
                        AI Question Generator
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>AI Question Generator</DialogTitle>
                      </DialogHeader>
                      <AIQuestionGenerator />
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={showImportExport} onOpenChange={setShowImportExport}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Upload className="w-4 h-4 mr-2" />
                        Import/Export Questions
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Import/Export Questions</DialogTitle>
                      </DialogHeader>
                      <ImportExportQuestions />
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      // Export current questions
                      const questionsData = {
                        quiz: quizData,
                        questions: questions
                      }
                      const dataStr = JSON.stringify(questionsData, null, 2)
                      const dataBlob = new Blob([dataStr], {type: 'application/json'})
                      const url = URL.createObjectURL(dataBlob)
                      const link = document.createElement('a')
                      link.href = url
                      link.download = `${quizData.title || 'quiz'}-questions.json`
                      link.click()
                      toast({
                        title: "Export completed",
                        description: "Quiz questions exported successfully",
                      })
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Current Quiz
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quiz Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Quiz Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Questions:</span>
                    <span className="font-semibold">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Marks:</span>
                    <span className="font-semibold">{quizData.totalMarks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{quizData.duration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Passing Marks:</span>
                    <span className="font-semibold">{quizData.passingMarks}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateQuiz
