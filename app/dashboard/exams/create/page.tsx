"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  Calendar, 
  Clock, 
  Shield, 
  Save, 
  Send, 
  ArrowLeft,
  Settings,
  FileText,
  Monitor,
  AlertTriangle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"

const departments = [
  { id: "cse", name: "Computer Science & Engineering", code: "CSE" },
  { id: "cy", name: "Cyber Security", code: "CY" },
  { id: "aids", name: "Artificial Intelligence & Data Science", code: "AIDS" },
  { id: "aiml", name: "Artificial Intelligence & Machine Learning", code: "AIML" },
]

const years = [
  { id: "first", name: "First Year" },
  { id: "second", name: "Second Year" },
  { id: "third", name: "Third Year" },
  { id: "fourth", name: "Fourth Year" },
]

const languages = [
  { id: "javascript", name: "JavaScript" },
  { id: "python", name: "Python" },
  { id: "java", name: "Java" },
  { id: "cpp", name: "C++" },
  { id: "c", name: "C" },
]

export default function CreateExamPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    year: "",
    examDate: "",
    examTime: "09:00",
    duration: 120, // minutes
    language: "",
    maxMarks: 100,
    passingMarks: 40,
    instructions: "",
    
    // Security Settings
    enableSecurity: true,
    allowCopyPaste: false,
    allowTabSwitching: false,
    enableScreenRecording: true,
    enableWebcamMonitoring: true,
    maxWarnings: 3,
    autoSubmitOnViolation: true,
    
    // Exam Settings
    allowLateEntry: false,
    lateEntryMinutes: 15,
    showResultsImmediately: false,
    allowReview: true,
    randomizeQuestions: true,
    
    // Questions
    questions: [] as any[],
    
    visibility: true,
  })

  const [currentQuestion, setCurrentQuestion] = useState({
    title: "",
    description: "",
    points: "",
    difficulty: "medium",
    testCases: [] as any[]
  })

  const [showQuestionDialog, setShowQuestionDialog] = useState(false)

  useEffect(() => {
    // Get current user from localStorage or session
    const facultySession = localStorage.getItem("facultySession")
    if (facultySession) {
      try {
        const user = JSON.parse(facultySession)
        setCurrentUser(user)
        setFormData((prev) => ({
          ...prev,
          department: user.department || "",
        }))
      } catch (error) {
        console.error("Error parsing faculty session:", error)
        router.push("/login?type=faculty")
      }
    } else {
      router.push("/login?type=faculty")
    }
  }, [router])

  const handleSubmit = async (status: "draft" | "published") => {
    if (!formData.title || !formData.description || !formData.examDate || !formData.year || !formData.language) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (formData.questions.length === 0) {
      toast({
        title: "No Questions",
        description: "Please add at least one question to the exam.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const examData = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        faculty_id: currentUser.id,
        department: formData.department,
        year: formData.year,
        exam_date: new Date(`${formData.examDate}T${formData.examTime}`).toISOString(),
        duration: formData.duration,
        language: formData.language,
        max_marks: formData.maxMarks,
        passing_marks: formData.passingMarks,
        instructions: formData.instructions,
        
        // Security settings
        enable_security: formData.enableSecurity,
        allow_copy_paste: formData.allowCopyPaste,
        allow_tab_switching: formData.allowTabSwitching,
        enable_screen_recording: formData.enableScreenRecording,
        enable_webcam_monitoring: formData.enableWebcamMonitoring,
        max_warnings: formData.maxWarnings,
        auto_submit_on_violation: formData.autoSubmitOnViolation,
        
        // Exam settings
        allow_late_entry: formData.allowLateEntry,
        late_entry_minutes: formData.lateEntryMinutes,
        show_results_immediately: formData.showResultsImmediately,
        allow_review: formData.allowReview,
        randomize_questions: formData.randomizeQuestions,
        
        questions: formData.questions,
        status: status,
        visibility: status === "published" ? formData.visibility : false,
        created_at: new Date().toISOString(),
        isExam: true
      }

      // Store in localStorage for demo purposes
      const existingExams = JSON.parse(localStorage.getItem('coding_assignments') || '[]')
      existingExams.push(examData)
      localStorage.setItem('coding_assignments', JSON.stringify(existingExams))

      toast({
        title: status === "published" ? "Exam Published" : "Exam Saved",
        description:
          status === "published"
            ? "Your coding exam has been published and is now available to students."
            : "Your coding exam has been saved as a draft.",
      })

      router.push("/dashboard/exams")
    } catch (error) {
      console.error("Error creating exam:", error)
      toast({
        title: "Error",
        description: "Failed to create exam. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddQuestion = () => {
    if (!currentQuestion.title || !currentQuestion.description || !currentQuestion.points) {
      toast({
        title: "Missing Information",
        description: "Please fill in all question fields.",
        variant: "destructive",
      })
      return
    }

    const newQuestion = {
      id: Date.now().toString(),
      ...currentQuestion,
      points: parseInt(currentQuestion.points)
    }

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }))

    setCurrentQuestion({ title: "", description: "", points: "", difficulty: "medium", testCases: [] })
    setShowQuestionDialog(false)
    toast({
      title: "Question Added",
      description: "Question has been added to the exam."
    })
  }

  const handleRemoveQuestion = (questionId: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }))
    toast({
      title: "Question Removed",
      description: "Question has been removed from the exam."
    })
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Create Coding Exam</h1>
            <p className="text-lg text-gray-600 mt-1">
              Design secure coding exams with real-time monitoring
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Exam Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Exam Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter exam title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Academic Year *</Label>
                    <Select
                      value={formData.year}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Programming Language *</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.id} value={lang.id}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="examDate">Exam Date *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="examDate"
                        type="date"
                        value={formData.examDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, examDate: e.target.value }))}
                        className="flex-1"
                      />
                      <Input
                        type="time"
                        value={formData.examTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, examTime: e.target.value }))}
                        className="w-32"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <Select
                      value={formData.duration.toString()}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, duration: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxMarks">Maximum Marks *</Label>
                    <Input
                      id="maxMarks"
                      type="number"
                      min="1"
                      value={formData.maxMarks}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxMarks: parseInt(e.target.value) }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passingMarks">Passing Marks *</Label>
                    <Input
                      id="passingMarks"
                      type="number"
                      min="1"
                      value={formData.passingMarks}
                      onChange={(e) => setFormData(prev => ({ ...prev, passingMarks: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Exam Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the exam objectives and requirements"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Exam Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Enter specific instructions for students"
                    value={formData.instructions}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="questions" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Exam Questions</h3>
                  <Button onClick={() => setShowQuestionDialog(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>

                {formData.questions.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No questions added yet</h3>
                    <p className="text-gray-500 mb-4">Add coding questions for your exam</p>
                    <Button onClick={() => setShowQuestionDialog(true)}>
                      Add First Question
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.questions.map((question, index) => (
                      <Card key={question.id} className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">
                                Q{index + 1}: {question.title}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">{question.description}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{question.points} points</Badge>
                                <Badge variant="outline">{question.difficulty}</Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveQuestion(question.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Question Dialog */}
                {showQuestionDialog && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-2xl mx-4">
                      <CardHeader>
                        <CardTitle>Add Question</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="questionTitle">Question Title *</Label>
                          <Input
                            id="questionTitle"
                            placeholder="Enter question title"
                            value={currentQuestion.title}
                            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="questionDescription">Question Description *</Label>
                          <Textarea
                            id="questionDescription"
                            placeholder="Describe what students need to implement"
                            value={currentQuestion.description}
                            onChange={(e) => setCurrentQuestion(prev => ({ ...prev, description: e.target.value }))}
                            rows={4}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="questionPoints">Points *</Label>
                            <Input
                              id="questionPoints"
                              type="number"
                              placeholder="Enter points"
                              value={currentQuestion.points}
                              onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: e.target.value }))}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="questionDifficulty">Difficulty</Label>
                            <Select
                              value={currentQuestion.difficulty}
                              onValueChange={(value) => setCurrentQuestion(prev => ({ ...prev, difficulty: value }))}
                            >
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

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowQuestionDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddQuestion}>
                            Add Question
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-red-900">Security & Monitoring Settings</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Enable Security Monitoring</Label>
                        <p className="text-sm text-gray-600">Monitor student activities during exam</p>
                      </div>
                      <Switch
                        checked={formData.enableSecurity}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableSecurity: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Allow Copy Paste</Label>
                        <p className="text-sm text-gray-600">Students can copy and paste code</p>
                      </div>
                      <Switch
                        checked={formData.allowCopyPaste}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowCopyPaste: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Allow Tab Switching</Label>
                        <p className="text-sm text-gray-600">Students can switch browser tabs</p>
                      </div>
                      <Switch
                        checked={formData.allowTabSwitching}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowTabSwitching: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Enable Screen Recording</Label>
                        <p className="text-sm text-gray-600">Record student screens during exam</p>
                      </div>
                      <Switch
                        checked={formData.enableScreenRecording}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableScreenRecording: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Enable Webcam Monitoring</Label>
                        <p className="text-sm text-gray-600">Monitor students via webcam</p>
                      </div>
                      <Switch
                        checked={formData.enableWebcamMonitoring}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableWebcamMonitoring: checked }))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxWarnings">Maximum Warnings</Label>
                        <Select
                          value={formData.maxWarnings.toString()}
                          onValueChange={(value) => setFormData(prev => ({ ...prev, maxWarnings: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Warning</SelectItem>
                            <SelectItem value="2">2 Warnings</SelectItem>
                            <SelectItem value="3">3 Warnings</SelectItem>
                            <SelectItem value="5">5 Warnings</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-base">Auto-submit on Violation</Label>
                          <p className="text-sm text-gray-600">Automatically submit when max warnings reached</p>
                        </div>
                        <Switch
                          checked={formData.autoSubmitOnViolation}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoSubmitOnViolation: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Exam Settings</h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Allow Late Entry</Label>
                        <p className="text-sm text-gray-600">Students can join after exam starts</p>
                      </div>
                      <Switch
                        checked={formData.allowLateEntry}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowLateEntry: checked }))}
                      />
                    </div>

                    {formData.allowLateEntry && (
                      <div className="space-y-2 ml-4">
                        <Label htmlFor="lateEntryMinutes">Late Entry Window (minutes)</Label>
                        <Input
                          id="lateEntryMinutes"
                          type="number"
                          min="5"
                          max="60"
                          value={formData.lateEntryMinutes}
                          onChange={(e) => setFormData(prev => ({ ...prev, lateEntryMinutes: parseInt(e.target.value) }))}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Show Results Immediately</Label>
                        <p className="text-sm text-gray-600">Display results after submission</p>
                      </div>
                      <Switch
                        checked={formData.showResultsImmediately}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showResultsImmediately: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Allow Review</Label>
                        <p className="text-sm text-gray-600">Students can review answers before submit</p>
                      </div>
                      <Switch
                        checked={formData.allowReview}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowReview: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Randomize Questions</Label>
                        <p className="text-sm text-gray-600">Show questions in random order</p>
                      </div>
                      <Switch
                        checked={formData.randomizeQuestions}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, randomizeQuestions: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Visibility</Label>
                        <p className="text-sm text-gray-600">Make exam visible to students</p>
                      </div>
                      <Switch
                        checked={formData.visibility}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, visibility: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => handleSubmit("draft")}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit("published")}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
          >
            <Send className="h-4 w-4" />
            Publish Exam
          </Button>
        </div>
      </div>
    </div>
  )
}
