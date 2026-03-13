"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { supabase } from "@/lib/supabase"

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
  const router = useRouter()
  const [faculty, setFaculty] = useState<any>(null)
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
    showResults: true,
    allowReview: true,
    proctoring: false,
    maxAttempts: 1
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
  const [pendingAIQuestions, setPendingAIQuestions] = useState<any[]>([])

  const years = ['1st', '2nd', '3rd', '4th']

  // Fetch faculty data on mount
  useEffect(() => {
    fetchFacultyData()
  }, [])

  const fetchFacultyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: facultyData } = await supabase
        .from('faculty')
        .select('*')
        .eq('email', user.email)
        .single()

      if (facultyData) {
        setFaculty(facultyData)
        setQuizData(prev => ({ ...prev, department: facultyData.department }))
      }
    } catch (error) {
      console.error('Error fetching faculty:', error)
    }
  }

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

  // Handle AI-generated questions - store for preview
  const handleAIQuestionsGenerated = (aiQuestions: any[]) => {
    setPendingAIQuestions(aiQuestions)
    toast({
      title: "Questions Generated",
      description: `${aiQuestions.length} questions ready to add. Review and click 'Add All to Quiz' below.`,
    })
    setShowAIGenerator(false)
  }

  // Add pending AI questions to quiz
  const addPendingQuestionsToQuiz = () => {
    const formattedQuestions: Question[] = pendingAIQuestions.map(q => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type: q.type as Question['type'],
      question: q.question,
      options: q.options ? Object.values(q.options) : undefined,
      correctAnswer: q.correctAnswer,
      points: q.points || 1,
      difficulty: q.difficulty as Question['difficulty'],
      tags: [],
      explanation: q.explanation || ''
    }))

    setQuestions(prev => [...prev, ...formattedQuestions])
    setQuizData(prev => ({
      ...prev,
      totalMarks: prev.totalMarks + formattedQuestions.reduce((sum, q) => sum + q.points, 0)
    }))

    toast({
      title: "Questions Added",
      description: `${formattedQuestions.length} AI-generated questions added to your quiz`,
    })
    setPendingAIQuestions([])
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

  const saveQuiz = async () => {
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

    try {
      // Get faculty data
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({ title: "Error", description: "Not authenticated", variant: "destructive" })
        return
      }

      const { data: facultyData } = await supabase
        .from('faculty')
        .select('id, name, department')
        .eq('email', user.email)
        .single()

      if (!facultyData) {
        toast({ title: "Error", description: "Faculty profile not found", variant: "destructive" })
        return
      }

      // Calculate total marks from questions
      const totalMarks = questions.reduce((sum, q) => sum + q.points, 0)

      // Validate passing marks
      if (!quizData.passingMarks || quizData.passingMarks <= 0) {
        toast({ 
          title: "Validation Error", 
          description: "Please set passing marks for the quiz", 
          variant: "destructive" 
        })
        return
      }

      // Convert local datetime to ISO string for proper timezone handling
      const startTimeISO = quizData.startDate ? new Date(quizData.startDate).toISOString() : null
      const endTimeISO = quizData.endDate ? new Date(quizData.endDate).toISOString() : null

      // Insert quiz
      const { data: quiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          faculty_id: facultyData.id,
          faculty_name: facultyData.name,
          title: quizData.title,
          description: quizData.description,
          subject: quizData.subject || quizData.title,
          year: quizData.targetYears.length > 0 ? quizData.targetYears[0] : 'first',
          department: quizData.department || facultyData.department,
          target_years: quizData.targetYears,
          duration_minutes: quizData.duration,
          total_marks: totalMarks,
          passing_marks: quizData.passingMarks,
          start_time: startTimeISO,
          end_time: endTimeISO,
          is_published: true,
          show_results: quizData.showResults,
          max_attempts: quizData.maxAttempts || 1,
          difficulty: 'medium',
          instructions: quizData.instructions,
          allow_review: quizData.allowReview,
          proctoring_enabled: quizData.proctoring
        })
        .select('id')
        .single()

      if (quizError) throw quizError

      // Insert questions
      const questionsData = questions.map((q, index) => ({
        quiz_id: quiz.id,
        question_text: q.question,
        question_type: q.type,
        options: q.options ? { A: q.options[0], B: q.options[1], C: q.options[2], D: q.options[3] } : null,
        correct_answer: String(q.correctAnswer || ''),
        marks: q.points,
        order_number: index + 1
      }))

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsData)

      if (questionsError) throw questionsError

      toast({
        title: "Success",
        description: `Quiz "${quizData.title}" created successfully!`,
      })

      // Redirect to quiz dashboard
      router.push('/dashboard/quiz')
    } catch (error) {
      console.error('Error saving quiz:', error)
      toast({
        title: "Error",
        description: "Failed to save quiz. Please try again.",
        variant: "destructive"
      })
    }
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
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the quiz..."
                      value={quizData.description}
                      onChange={(e) => setQuizData({...quizData, description: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Data Structures, Operating Systems..."
                      value={quizData.subject}
                      onChange={(e) => setQuizData({...quizData, subject: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={quizData.department || faculty?.department || ''}
                        disabled
                        className="bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Department is locked to your profile</p>
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
                    <div>
                      <Label htmlFor="max-attempts">Maximum Attempts *</Label>
                      <Input
                        id="max-attempts"
                        type="number"
                        min="1"
                        max="10"
                        placeholder="1"
                        value={quizData.maxAttempts}
                        onChange={(e) => setQuizData({...quizData, maxAttempts: parseInt(e.target.value) || 1})}
                      />
                      <p className="text-xs text-gray-500 mt-1">How many times can a student retake this quiz?</p>
                    </div>
                  </div>

                  <div>
                    <Label>Target Years *</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {years.map(year => (
                        <Button
                          key={year}
                          type="button"
                          variant={quizData.targetYears.includes(year) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const newYears = quizData.targetYears.includes(year)
                              ? quizData.targetYears.filter(y => y !== year)
                              : [...quizData.targetYears, year]
                            setQuizData({...quizData, targetYears: newYears})
                          }}
                        >
                          {year} Year
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Select which years can take this quiz</p>
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

            {/* Pending AI Generated Questions Preview */}
            {pendingAIQuestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Generated Questions ({pendingAIQuestions.length})
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPendingAIQuestions([])}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Discard All
                        </Button>
                        <Button
                          onClick={addPendingQuestionsToQuiz}
                          className="bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add All to Quiz
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {pendingAIQuestions.map((question, index) => (
                        <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">Q{index + 1}</Badge>
                                <Badge className={question.difficulty === 'easy' ? 'bg-green-100 text-green-800' : question.difficulty === 'hard' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                                  {question.difficulty}
                                </Badge>
                                <Badge variant="outline">{question.type?.replace('_', ' ')}</Badge>
                                <Badge variant="outline">{question.points} pts</Badge>
                              </div>
                              <p className="font-medium text-gray-900">{question.question}</p>
                              {question.options && (
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                  {Object.entries(question.options).map(([key, value]) => (
                                    <div key={key} className={`text-sm p-2 rounded ${key === question.correctAnswer ? 'bg-green-100 text-green-700 font-medium' : 'bg-gray-50 text-gray-600'}`}>
                                      {key}. {String(value)}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {!question.options && (
                                <div className="mt-2 text-sm text-gray-600">
                                  <span className="font-medium">Answer:</span> {question.correctAnswer}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

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
                    <Label htmlFor="passing-marks">Passing Marks *</Label>
                    <Input
                      id="passing-marks"
                      type="number"
                      value={quizData.passingMarks}
                      onChange={(e) => setQuizData({...quizData, passingMarks: parseInt(e.target.value) || 0})}
                      required
                      min={1}
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum marks required to pass the quiz</p>
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
                      <AIQuestionGenerator 
                        onQuestionsGenerated={handleAIQuestionsGenerated}
                        defaultDifficulty="medium"
                      />
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
                    <span className="font-semibold">{quizData.passingMarks || 'Not set'} *</span>
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
