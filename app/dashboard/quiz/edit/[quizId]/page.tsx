"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Save, 
  Eye, 
  Clock, 
  Brain,
  FileText,
  Upload,
  Download,
  Sparkles,
  Loader2,
  ArrowLeft,
  Trash2,
  Plus
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

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

const EditQuiz = () => {
  const router = useRouter()
  const params = useParams()
  const quizId = params.quizId as string

  const [faculty, setFaculty] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
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
    is_published: true
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

  const years = ['1st', '2nd', '3rd', '4th']

  useEffect(() => {
    fetchFacultyAndQuiz()
  }, [quizId])

  const fetchFacultyAndQuiz = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login?type=faculty')
        return
      }

      const { data: facultyData } = await supabase
        .from('faculty')
        .select('*')
        .eq('email', user.email)
        .single()

      if (facultyData) {
        setFaculty(facultyData)
      }

      // Fetch quiz
      const { data: quiz, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()

      if (error) throw error

      if (quiz) {
        setQuizData({
          title: quiz.title || '',
          description: quiz.description || '',
          subject: quiz.subject || '',
          department: quiz.department || '',
          targetYears: quiz.target_years || [],
          duration: quiz.duration_minutes || 60,
          totalMarks: quiz.total_marks || 0,
          passingMarks: quiz.passing_marks || 0,
          instructions: quiz.instructions || '',
          startDate: quiz.start_time ? new Date(quiz.start_time).toISOString().slice(0, 16) : '',
          endDate: quiz.end_time ? new Date(quiz.end_time).toISOString().slice(0, 16) : '',
          showResults: quiz.show_results ?? true,
          allowReview: quiz.allow_review ?? true,
          proctoring: quiz.proctoring_enabled ?? false,
          is_published: quiz.is_published ?? false
        })
      }

      // Fetch questions
      const { data: questionsData } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('order_number', { ascending: true })

      if (questionsData) {
        setQuestions(questionsData.map(q => ({
          id: q.id,
          type: q.question_type || 'mcq',
          question: q.question_text,
          options: q.options ? Object.values(q.options) : undefined,
          correctAnswer: q.correct_answer,
          points: q.marks || 1,
          difficulty: q.difficulty || 'medium',
          tags: [],
          explanation: q.explanation
        })))
      }

    } catch (error) {
      console.error('Error fetching quiz:', error)
      toast({
        title: "Error",
        description: "Failed to load quiz data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
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
    setQuizData(prev => ({
      ...prev,
      totalMarks: prev.totalMarks + (currentQuestion.points || 1)
    }))

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

    toast({
      title: "Success",
      description: "Question added",
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

    setIsSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: facultyData } = await supabase
        .from('faculty')
        .select('*')
        .eq('email', user.email)
        .single()

      if (!facultyData) return

      const totalMarks = questions.reduce((sum, q) => sum + q.points, 0)

      // Check if any student has started the quiz
      const { data: attempts } = await supabase
        .from('quiz_attempts')
        .select('id')
        .eq('quiz_id', quizId)
        .limit(1)

      if (attempts && attempts.length > 0) {
        toast({
          title: "Cannot Edit Quiz",
          description: "Students have already started this quiz. Editing is disabled.",
          variant: "destructive"
        })
        setIsSaving(false)
        return
      }

      // Validate passing marks
      if (!quizData.passingMarks || quizData.passingMarks <= 0) {
        toast({
          title: "Validation Error",
          description: "Please set passing marks for the quiz",
          variant: "destructive"
        })
        setIsSaving(false)
        return
      }

      // Convert local datetime to ISO string for proper timezone handling
      const startTimeISO = quizData.startDate ? new Date(quizData.startDate).toISOString() : null
      const endTimeISO = quizData.endDate ? new Date(quizData.endDate).toISOString() : null

      // Update quiz
      const { error: quizError } = await supabase
        .from('quizzes')
        .update({
          title: quizData.title,
          description: quizData.description,
          subject: quizData.subject || quizData.title,
          department: quizData.department || facultyData.department,
          target_years: quizData.targetYears,
          duration_minutes: quizData.duration,
          total_marks: totalMarks,
          passing_marks: quizData.passingMarks,
          start_time: startTimeISO,
          end_time: endTimeISO,
          is_published: quizData.is_published,
          show_results: quizData.showResults,
          instructions: quizData.instructions,
          proctoring_enabled: quizData.proctoring,
          allow_review: quizData.allowReview
        })
        .eq('id', quizId)

      if (quizError) throw quizError

      // Delete existing questions
      await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', quizId)

      // Insert updated questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: quizId,
            question_text: q.question,
            question_type: q.type,
            options: q.options ? {
              A: q.options[0],
              B: q.options[1],
              C: q.options[2],
              D: q.options[3]
            } : null,
            correct_answer: q.correctAnswer?.toString() || '',
            marks: q.points,
            difficulty: q.difficulty,
            explanation: q.explanation,
            order_number: i + 1
          })
      }

      toast({
        title: "Success",
        description: "Quiz updated successfully!",
      })

      router.push('/dashboard/quiz')
    } catch (error: any) {
      console.error('Error saving quiz:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save quiz",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/quiz">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Quiz</h1>
            <p className="text-gray-600">Modify quiz details and questions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setQuizData({...quizData, is_published: !quizData.is_published})}>
            {quizData.is_published ? 'Unpublish' : 'Save as Draft'}
          </Button>
          <Button onClick={saveQuiz} disabled={isSaving} className="bg-gradient-to-r from-blue-600 to-purple-600">
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quiz Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Quiz Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={quizData.title}
                onChange={(e) => setQuizData({...quizData, title: e.target.value})}
                placeholder="Quiz title"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={quizData.description}
                onChange={(e) => setQuizData({...quizData, description: e.target.value})}
                placeholder="Quiz description"
              />
            </div>

            <div>
              <Label>Subject *</Label>
              <Input
                value={quizData.subject}
                onChange={(e) => setQuizData({...quizData, subject: e.target.value})}
                placeholder="e.g., Data Structures, Operating Systems..."
              />
            </div>

            <div>
              <Label>Department</Label>
              <Input
                value={quizData.department || faculty?.department || ''}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div>
              <Label>Target Years</Label>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration (min)</Label>
                <Input
                  type="number"
                  value={quizData.duration}
                  onChange={(e) => setQuizData({...quizData, duration: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <Label>Total Marks</Label>
                <Input value={quizData.totalMarks} disabled className="bg-gray-100" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="datetime-local"
                  value={quizData.startDate}
                  onChange={(e) => setQuizData({...quizData, startDate: e.target.value})}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="datetime-local"
                  value={quizData.endDate}
                  onChange={(e) => setQuizData({...quizData, endDate: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Show Results</Label>
                <Switch
                  checked={quizData.showResults}
                  onCheckedChange={(checked) => setQuizData({...quizData, showResults: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Allow Review</Label>
                <Switch
                  checked={quizData.allowReview}
                  onCheckedChange={(checked) => setQuizData({...quizData, allowReview: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>AI Proctoring</Label>
                <Switch
                  checked={quizData.proctoring}
                  onCheckedChange={(checked) => setQuizData({...quizData, proctoring: checked})}
                />
              </div>
              <p className="text-xs text-gray-500">Enable camera monitoring during quiz</p>
              <div>
                <Label>Passing Marks *</Label>
                <Input
                  type="number"
                  value={quizData.passingMarks}
                  onChange={(e) => setQuizData({...quizData, passingMarks: parseInt(e.target.value) || 0})}
                  min={1}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Minimum marks required to pass</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Current Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-600" />
                  Questions ({questions.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No questions yet. Add questions below.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.map((q, index) => (
                    <div key={q.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">Q{index + 1}</Badge>
                          <Badge variant="outline">{q.type}</Badge>
                          <Badge variant="outline">{q.points} pts</Badge>
                        </div>
                        <p className="text-sm">{q.question}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeQuestion(q.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Question */}
          <Card>
            <CardHeader>
              <CardTitle>Add Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={currentQuestion.type} onValueChange={(value) => setCurrentQuestion({...currentQuestion, type: value as Question['type']})}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="mcq">MCQ</TabsTrigger>
                  <TabsTrigger value="true_false">T/F</TabsTrigger>
                  <TabsTrigger value="fill_blank">Fill</TabsTrigger>
                  <TabsTrigger value="descriptive">Desc</TabsTrigger>
                </TabsList>

                <TabsContent value="mcq" className="space-y-4 mt-4">
                  <div>
                    <Label>Question</Label>
                    <Textarea
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                      placeholder="Enter question"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['A', 'B', 'C', 'D'].map((opt, i) => (
                      <div key={opt}>
                        <Label>Option {opt}</Label>
                        <Input
                          value={currentQuestion.options?.[i] || ''}
                          onChange={(e) => {
                            const newOptions = [...(currentQuestion.options || ['', '', '', ''])]
                            newOptions[i] = e.target.value
                            setCurrentQuestion({...currentQuestion, options: newOptions})
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <Label>Correct Answer</Label>
                    <Select value={currentQuestion.correctAnswer as string} onValueChange={(value) => setCurrentQuestion({...currentQuestion, correctAnswer: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select correct answer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="true_false" className="space-y-4 mt-4">
                  <div>
                    <Label>Statement</Label>
                    <Textarea
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                      placeholder="Enter true/false statement"
                    />
                  </div>
                  <div>
                    <Label>Correct Answer</Label>
                    <Select value={currentQuestion.correctAnswer as string} onValueChange={(value) => setCurrentQuestion({...currentQuestion, correctAnswer: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select answer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="fill_blank" className="space-y-4 mt-4">
                  <div>
                    <Label>Question (use ___ for blank)</Label>
                    <Textarea
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                      placeholder="The capital of India is ___"
                    />
                  </div>
                  <div>
                    <Label>Correct Answer</Label>
                    <Input
                      value={currentQuestion.correctAnswer as string}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, correctAnswer: e.target.value})}
                      placeholder="New Delhi"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="descriptive" className="space-y-4 mt-4">
                  <div>
                    <Label>Question</Label>
                    <Textarea
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                      placeholder="Enter descriptive question"
                    />
                  </div>
                  <div>
                    <Label>Sample Answer (for reference)</Label>
                    <Textarea
                      value={currentQuestion.explanation}
                      onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                      placeholder="Sample answer for grading reference"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Points</Label>
                  <Input
                    type="number"
                    value={currentQuestion.points}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, points: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select value={currentQuestion.difficulty} onValueChange={(value) => setCurrentQuestion({...currentQuestion, difficulty: value as any})}>
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
              </div>

              <Button onClick={addQuestion} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default EditQuiz
