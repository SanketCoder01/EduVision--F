"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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
  Zap, 
  Loader2, 
  CheckCircle, 
  Copy, 
  RefreshCw,
  Eye,
  EyeOff,
  Code,
  Clock,
  Target,
  BookOpen
} from "lucide-react"

interface GeneratedQuestion {
  id: string
  title: string
  description: string
  difficulty: string
  marks: number
  timeLimit: string
  inputFormat: string
  outputFormat: string
  constraints: string
  sampleInput: string
  sampleOutput: string
  testCases: Array<{
    input: string
    expectedOutput: string
    isHidden: boolean
  }>
  hints: string[]
  tags: string[]
}

interface AIQuestionGeneratorProps {
  language: string
  totalMarks: number
  duration: number
  examTitle?: string
  availableTopics?: string[]
  onQuestionsGenerated: (questions: GeneratedQuestion[]) => void
}

export default function AIQuestionGenerator({ 
  language, 
  totalMarks, 
  duration, 
  examTitle,
  availableTopics,
  onQuestionsGenerated 
}: AIQuestionGeneratorProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([])
  const [showPreview, setShowPreview] = useState(false)
  
  const [config, setConfig] = useState({
    difficulty: 'medium',
    numQuestions: 3,
    topics: [] as string[],
    includeHints: true,
    includeTestCases: true
  })

  const difficultyOptions = [
    { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-800' }
  ]

  const topicOptions = availableTopics || [
    'Arrays', 'Strings', 'Loops', 'Conditionals', 'Functions',
    'Data Structures', 'Algorithms', 'Sorting', 'Searching',
    'Dynamic Programming', 'Recursion', 'Graph Theory',
    'Tree Traversal', 'Hash Tables', 'Linked Lists'
  ]

  const handleTopicToggle = (topic: string) => {
    setConfig(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }))
  }

  const generateQuestions = async () => {
    if (config.topics.length === 0) {
      toast({
        title: "Select Topics",
        description: "Please select at least one topic for question generation.",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/ai/generate-exam-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          difficulty: config.difficulty,
          topics: config.topics,
          numQuestions: config.numQuestions,
          examDuration: duration,
          totalMarks
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate questions')
      }

      const data = await response.json()
      
      if (data.success) {
        setGeneratedQuestions(data.questions)
        setShowPreview(true)
        toast({
          title: "Questions Generated!",
          description: `Successfully generated ${data.questions.length} exam questions.`
        })
      } else {
        throw new Error('Question generation failed')
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
    onQuestionsGenerated(generatedQuestions)
    toast({
      title: "Questions Added",
      description: "Generated questions have been added to your exam."
    })
  }

  const copyQuestionText = (question: GeneratedQuestion) => {
    const questionText = `
${question.title}

${question.description}

Input Format: ${question.inputFormat}
Output Format: ${question.outputFormat}
Constraints: ${question.constraints}

Sample Input:
${question.sampleInput}

Sample Output:
${question.sampleOutput}
    `.trim()

    navigator.clipboard.writeText(questionText)
    toast({
      title: "Copied!",
      description: "Question text copied to clipboard."
    })
  }

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            AI Question Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
                max="10"
                value={config.numQuestions}
                onChange={(e) => setConfig(prev => ({ ...prev, numQuestions: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Topics to Include</Label>
            <div className="flex flex-wrap gap-2">
              {topicOptions.map(topic => (
                <div key={topic} className="flex items-center space-x-2">
                  <Checkbox
                    id={topic}
                    checked={config.topics.includes(topic)}
                    onCheckedChange={() => handleTopicToggle(topic)}
                  />
                  <Label htmlFor={topic} className="text-sm cursor-pointer">
                    {topic}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hints"
                  checked={config.includeHints}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeHints: !!checked }))}
                />
                <Label htmlFor="hints">Include hints</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="testcases"
                  checked={config.includeTestCases}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeTestCases: !!checked }))}
                />
                <Label htmlFor="testcases">Include test cases</Label>
              </div>
            </div>

            <Button
              onClick={generateQuestions}
              disabled={isGenerating || config.topics.length === 0}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Questions
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Questions Preview */}
      {generatedQuestions.length > 0 && (
        <Card>
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
                  onClick={generateQuestions}
                  variant="outline"
                  size="sm"
                  disabled={isGenerating}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
                <Button
                  onClick={useGeneratedQuestions}
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Use These Questions
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {showPreview && (
            <CardContent className="space-y-4">
              {generatedQuestions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-2">
                        Question {index + 1}: {question.title}
                      </h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={difficultyOptions.find(d => d.value === question.difficulty)?.color}>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          <Target className="w-3 h-3 mr-1" />
                          {question.marks} marks
                        </Badge>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {question.timeLimit}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyQuestionText(question)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium mb-1">Problem Statement:</h5>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{question.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-1">Input Format:</h5>
                        <p className="text-sm text-gray-700">{question.inputFormat}</p>
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Output Format:</h5>
                        <p className="text-sm text-gray-700">{question.outputFormat}</p>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium mb-1">Constraints:</h5>
                      <p className="text-sm text-gray-700">{question.constraints}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-1">Sample Input:</h5>
                        <pre className="text-sm bg-gray-100 p-2 rounded border">{question.sampleInput}</pre>
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Sample Output:</h5>
                        <pre className="text-sm bg-gray-100 p-2 rounded border">{question.sampleOutput}</pre>
                      </div>
                    </div>

                    {question.hints.length > 0 && config.includeHints && (
                      <div>
                        <h5 className="font-medium mb-1">Hints:</h5>
                        <ul className="text-sm text-gray-700 list-disc list-inside">
                          {question.hints.map((hint, hintIndex) => (
                            <li key={hintIndex}>{hint}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {question.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  )
}
