"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  Upload,
  FileText,
  Trash2,
  Plus,
  Download,
  Copy,
  Eye,
  EyeOff
} from "lucide-react"

interface QuizQuestion {
  id: string
  type: 'mcq' | 'true_false' | 'fill_blank' | 'descriptive'
  question: string
  options?: Record<string, string>
  correctAnswer: string
  points: number
  difficulty: string
  explanation?: string
}

interface AIQuestionGeneratorProps {
  onQuestionsGenerated?: (questions: QuizQuestion[]) => void
  defaultDifficulty?: string
}

export default function AIQuestionGenerator({ 
  onQuestionsGenerated,
  defaultDifficulty = 'medium'
}: AIQuestionGeneratorProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<QuizQuestion[]>([])
  const [showPreview, setShowPreview] = useState(true)
  
  const [config, setConfig] = useState({
    difficulty: defaultDifficulty,
    numQuestions: 20,
    questionTypes: ['mcq'] as string[],
    prompt: '',
    uploadedFile: null as File | null
  })

  const questionTypeOptions = [
    { value: 'mcq', label: 'Multiple Choice', icon: '📝' },
    { value: 'true_false', label: 'True/False', icon: '✅' },
    { value: 'fill_blank', label: 'Fill in Blanks', icon: '📋' },
    { value: 'descriptive', label: 'Descriptive', icon: '📖' }
  ]

  const difficultyOptions = [
    { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-800' }
  ]

  const handleQuestionTypeToggle = (type: string) => {
    setConfig(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter(t => t !== type)
        : [...prev.questionTypes, type]
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setConfig(prev => ({ ...prev, uploadedFile: file }))
      toast({
        title: "File Uploaded",
        description: `${file.name} ready for processing`
      })
    }
  }

  const removeFile = () => {
    setConfig(prev => ({ ...prev, uploadedFile: null }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const generateQuestions = async () => {
    if (config.questionTypes.length === 0) {
      toast({
        title: "Select Question Types",
        description: "Please select at least one question type",
        variant: "destructive"
      })
      return
    }

    if (!config.prompt.trim() && !config.uploadedFile) {
      toast({
        title: "Input Required",
        description: "Please enter a topic/prompt or upload a file",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)

    try {
      const formData = new FormData()
      formData.append('prompt', config.prompt)
      formData.append('questionTypes', JSON.stringify(config.questionTypes))
      formData.append('difficulty', config.difficulty)
      formData.append('numQuestions', config.numQuestions.toString())
      
      if (config.uploadedFile) {
        formData.append('file', config.uploadedFile)
      }

      const response = await fetch('/api/ai/generate-quiz-questions', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      console.log('API Response:', data)
      console.log('Questions count:', data.questions?.length)

      if (data.success && data.questions && data.questions.length > 0) {
        console.log('Setting generated questions:', data.questions)
        setGeneratedQuestions(data.questions)
        setShowPreview(true)
        
        toast({
          title: "Questions Generated!",
          description: data.note 
            ? `Generated ${data.questions.length} questions (using fallback due to API limits)`
            : `Successfully generated ${data.questions.length} questions`
        })
      } else {
        console.error('No questions in response:', data)
        throw new Error('No questions received from server')
      }
    } catch (error) {
      console.error('Error generating questions:', error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const useGeneratedQuestions = () => {
    if (onQuestionsGenerated) {
      onQuestionsGenerated(generatedQuestions)
    }
    toast({
      title: "Questions Added",
      description: `${generatedQuestions.length} questions added to your quiz`
    })
    setGeneratedQuestions([])
    setConfig(prev => ({
      ...prev,
      prompt: '',
      uploadedFile: null,
      numQuestions: 20
    }))
  }

  const removeQuestion = (id: string) => {
    setGeneratedQuestions(prev => prev.filter(q => q.id !== id))
  }

  const updateQuestion = (id: string, field: string, value: any) => {
    setGeneratedQuestions(prev => prev.map(q => {
      if (q.id === id) {
        if (field.startsWith('option_')) {
          const optionKey = field.replace('option_', '')
          return {
            ...q,
            options: { ...q.options, [optionKey]: value }
          }
        }
        return { ...q, [field]: value }
      }
      return q
    }))
  }

  const regenerateQuestion = async (id: string) => {
    const question = generatedQuestions.find(q => q.id === id)
    if (!question) return

    toast({
      title: "Regenerating...",
      description: "Using AI to regenerate this question"
    })

    // Call API to regenerate single question
    try {
      const response = await fetch('/api/ai/generate-quiz-questions', {
        method: 'POST',
        body: JSON.stringify({
          prompt: config.prompt,
          questionTypes: [question.type],
          difficulty: question.difficulty,
          numQuestions: 1
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.questions && data.questions.length > 0) {
          const newQ = data.questions[0]
          setGeneratedQuestions(prev => prev.map(q => 
            q.id === id ? { ...newQ, id } : q
          ))
          toast({
            title: "Regenerated!",
            description: "Question has been regenerated with AI"
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate question",
        variant: "destructive"
      })
    }
  }

  const copyQuestion = (question: QuizQuestion) => {
    let text = question.question
    if (question.options) {
      text += '\n' + Object.entries(question.options).map(([k, v]) => `${k}. ${v}`).join('\n')
    }
    text += `\nAnswer: ${question.correctAnswer}`
    
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Question copied to clipboard"
    })
  }

  const exportQuestions = () => {
    const data = JSON.stringify(generatedQuestions, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quiz-questions-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast({
      title: "Exported!",
      description: "Questions exported as JSON"
    })
  }

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Question Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prompt Input */}
          <div>
            <Label>Topic / Prompt</Label>
            <Textarea
              placeholder="Enter topic, subject matter, or specific content for questions..."
              value={config.prompt}
              onChange={(e) => setConfig(prev => ({ ...prev, prompt: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>

          {/* File Upload */}
          <div>
            <Label>Upload Content (PDF, DOCX, TXT)</Label>
            <div className="mt-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.docx,.doc,.txt"
                className="hidden"
              />
              
              {config.uploadedFile ? (
                <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{config.uploadedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(config.uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={removeFile}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-24 border-dashed"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-6 h-6 text-gray-400" />
                    <span className="text-sm text-gray-500">Click to upload or drag and drop</span>
                  </div>
                </Button>
              )}
            </div>
          </div>

          {/* Question Types */}
          <div>
            <Label className="mb-3 block">Question Types *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {questionTypeOptions.map(option => (
                <div
                  key={option.value}
                  onClick={() => handleQuestionTypeToggle(option.value)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    config.questionTypes.includes(option.value)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={config.questionTypes.includes(option.value)}
                      onCheckedChange={() => handleQuestionTypeToggle(option.value)}
                    />
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Difficulty Level</Label>
              <Select value={config.difficulty} onValueChange={(value) => setConfig(prev => ({ ...prev, difficulty: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficultyOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${option.color.split(' ')[0]}`}></div>
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Number of Questions</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={config.numQuestions}
                onChange={(e) => setConfig(prev => ({ ...prev, numQuestions: parseInt(e.target.value) || 20 }))}
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateQuestions}
            disabled={isGenerating || config.questionTypes.length === 0}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate {config.numQuestions} Questions
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Questions Preview */}
      {generatedQuestions.length > 0 && (
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Generated Questions ({generatedQuestions.length})
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showPreview ? 'Hide' : 'Preview'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportQuestions}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={useGeneratedQuestions}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Quiz
                </Button>
              </div>
            </div>
          </CardHeader>

          {showPreview && (
            <CardContent className="space-y-4">
              {generatedQuestions.map((question, index) => (
                <div
                  key={question.id}
                  className="border rounded-lg p-4 bg-white shadow-sm"
                >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Q{index + 1}</Badge>
                            <Badge className={difficultyOptions.find(d => d.value === question.difficulty)?.color}>
                              {question.difficulty}
                            </Badge>
                            <Badge variant="outline">{question.type.replace('_', ' ')}</Badge>
                            <Badge variant="outline">{question.points} pts</Badge>
                          </div>
                          <p className="font-medium">{question.question}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button variant="ghost" size="sm" onClick={() => regenerateQuestion(question.id)} title="Regenerate with AI">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => copyQuestion(question)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => removeQuestion(question.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      {question.options && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {Object.entries(question.options).map(([key, value]) => (
                            <div
                              key={key}
                              className={`p-2 rounded border text-sm ${
                                key === question.correctAnswer
                                  ? 'bg-green-100 border-green-400 font-medium'
                                  : 'bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                <span className="font-medium">{key}.</span>
                                <input
                                  type="text"
                                  value={value}
                                  onChange={(e) => updateQuestion(question.id, `option_${key}`, e.target.value)}
                                  className="flex-1 bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 outline-none text-sm"
                                />
                              </div>
                              <label className="flex items-center gap-1 text-xs cursor-pointer">
                                <input
                                  type="radio"
                                  name={`correct-${question.id}`}
                                  checked={key === question.correctAnswer}
                                  onChange={() => updateQuestion(question.id, 'correctAnswer', key)}
                                />
                                Correct
                              </label>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm mb-2">
                        <span className="text-gray-500">Answer:</span>
                        <Badge variant="default" className="bg-green-600">
                          {question.correctAnswer}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm mb-2">
                        <span className="text-gray-500">Points:</span>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={question.points}
                          onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value) || 1)}
                          className="w-16 p-1 border rounded text-sm"
                        />
                      </div>

                      {question.explanation && (
                        <div className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Explanation:</span>
                          <textarea
                            value={question.explanation}
                            onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                            className="w-full mt-1 p-2 border rounded text-sm italic"
                            rows={2}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          )}
    </div>
  )
}
