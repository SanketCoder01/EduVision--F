"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Shield,
  BarChart3,
  Zap,
  Target,
  Award,
  TrendingUp,
  AlertCircle,
  Download,
  RefreshCw,
  Play,
  Pause,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Submission {
  id: string
  studentName: string
  studentPRN: string
  assignmentTitle: string
  content: string
  files: any[]
  submittedAt: string
  status: string
  plagiarismScore?: number
  grade?: number
  feedback?: string
  autoGradeScore?: number
  gradingCriteria?: any
}

interface GradingCriteria {
  contentQuality: number
  technicalAccuracy: number
  creativity: number
  completeness: number
  presentation: number
}

interface AutoGradingSystemProps {
  submissions: Submission[]
  onGradingComplete: (gradedSubmissions: Submission[]) => void
}

export default function AutoGradingSystem({ submissions, onGradingComplete }: AutoGradingSystemProps) {
  const { toast } = useToast()
  const [isGrading, setIsGrading] = useState(false)
  const [gradingProgress, setGradingProgress] = useState(0)
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(null)
  const [gradedSubmissions, setGradedSubmissions] = useState<Submission[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [gradingSettings, setGradingSettings] = useState({
    enablePlagiarismCheck: true,
    enableAIGrading: true,
    strictMode: false,
    customWeights: {
      contentQuality: 30,
      technicalAccuracy: 25,
      creativity: 15,
      completeness: 20,
      presentation: 10,
    },
    passingGrade: 60,
    plagiarismThreshold: 15,
  })

  // Simulate AI-powered auto-grading
  const performAutoGrading = async (submission: Submission): Promise<Submission> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))

    // Simulate plagiarism check
    const plagiarismScore = Math.floor(Math.random() * 25)
    
    // Simulate AI grading based on content analysis
    const contentLength = submission.content?.length || 0
    const fileCount = submission.files?.length || 0
    
    // Calculate base scores for different criteria
    const contentQuality = Math.min(95, 60 + (contentLength / 100) + Math.random() * 20)
    const technicalAccuracy = Math.min(95, 65 + Math.random() * 25)
    const creativity = Math.min(95, 70 + Math.random() * 20)
    const completeness = Math.min(95, 75 + (fileCount * 5) + Math.random() * 15)
    const presentation = Math.min(95, 70 + Math.random() * 20)

    // Apply plagiarism penalty
    const plagiarismPenalty = plagiarismScore > gradingSettings.plagiarismThreshold ? 
      (plagiarismScore - gradingSettings.plagiarismThreshold) * 2 : 0

    // Calculate weighted score
    const weights = gradingSettings.customWeights
    const weightedScore = (
      (contentQuality * weights.contentQuality) +
      (technicalAccuracy * weights.technicalAccuracy) +
      (creativity * weights.creativity) +
      (completeness * weights.completeness) +
      (presentation * weights.presentation)
    ) / 100

    const finalScore = Math.max(0, Math.min(100, weightedScore - plagiarismPenalty))

    // Generate AI feedback
    const feedback = generateAIFeedback({
      contentQuality,
      technicalAccuracy,
      creativity,
      completeness,
      presentation,
      plagiarismScore,
      finalScore,
    })

    return {
      ...submission,
      plagiarismScore,
      autoGradeScore: Math.round(finalScore),
      grade: Math.round(finalScore),
      feedback,
      status: "graded",
      gradingCriteria: {
        contentQuality: Math.round(contentQuality),
        technicalAccuracy: Math.round(technicalAccuracy),
        creativity: Math.round(creativity),
        completeness: Math.round(completeness),
        presentation: Math.round(presentation),
      },
    }
  }

  // Generate AI-powered feedback
  const generateAIFeedback = (scores: any): string => {
    const { contentQuality, technicalAccuracy, creativity, completeness, presentation, plagiarismScore, finalScore } = scores
    
    let feedback = "## Auto-Generated Feedback\n\n"
    
    // Overall performance
    if (finalScore >= 90) {
      feedback += "🌟 **Excellent Work!** Your submission demonstrates outstanding quality across all criteria.\n\n"
    } else if (finalScore >= 80) {
      feedback += "✅ **Great Job!** Your submission shows strong understanding and good execution.\n\n"
    } else if (finalScore >= 70) {
      feedback += "👍 **Good Effort!** Your submission meets most requirements with room for improvement.\n\n"
    } else if (finalScore >= 60) {
      feedback += "⚠️ **Needs Improvement** Your submission shows basic understanding but requires more work.\n\n"
    } else {
      feedback += "❌ **Requires Significant Improvement** Please review the requirements and resubmit.\n\n"
    }

    // Detailed breakdown
    feedback += "### Detailed Analysis:\n\n"
    
    feedback += `**Content Quality (${Math.round(contentQuality)}/100):** `
    if (contentQuality >= 85) {
      feedback += "Excellent depth and insight demonstrated.\n"
    } else if (contentQuality >= 70) {
      feedback += "Good content with clear understanding.\n"
    } else {
      feedback += "Content needs more depth and clarity.\n"
    }

    feedback += `**Technical Accuracy (${Math.round(technicalAccuracy)}/100):** `
    if (technicalAccuracy >= 85) {
      feedback += "Highly accurate with proper methodology.\n"
    } else if (technicalAccuracy >= 70) {
      feedback += "Generally accurate with minor issues.\n"
    } else {
      feedback += "Several technical inaccuracies need correction.\n"
    }

    feedback += `**Creativity (${Math.round(creativity)}/100):** `
    if (creativity >= 85) {
      feedback += "Innovative approach and original thinking.\n"
    } else if (creativity >= 70) {
      feedback += "Some creative elements present.\n"
    } else {
      feedback += "Consider more creative approaches.\n"
    }

    feedback += `**Completeness (${Math.round(completeness)}/100):** `
    if (completeness >= 85) {
      feedback += "All requirements thoroughly addressed.\n"
    } else if (completeness >= 70) {
      feedback += "Most requirements met adequately.\n"
    } else {
      feedback += "Several requirements missing or incomplete.\n"
    }

    feedback += `**Presentation (${Math.round(presentation)}/100):** `
    if (presentation >= 85) {
      feedback += "Excellent organization and formatting.\n"
    } else if (presentation >= 70) {
      feedback += "Well-presented with good structure.\n"
    } else {
      feedback += "Presentation needs improvement.\n"
    }

    // Plagiarism warning
    if (plagiarismScore > 15) {
      feedback += `\n⚠️ **Plagiarism Alert:** ${plagiarismScore}% similarity detected. Please ensure all sources are properly cited.\n`
    } else if (plagiarismScore > 8) {
      feedback += `\n📝 **Note:** ${plagiarismScore}% similarity detected. Consider reviewing citation practices.\n`
    }

    // Recommendations
    feedback += "\n### Recommendations:\n"
    if (contentQuality < 75) {
      feedback += "• Expand on key concepts with more detailed explanations\n"
    }
    if (technicalAccuracy < 75) {
      feedback += "• Review technical concepts and verify accuracy\n"
    }
    if (creativity < 75) {
      feedback += "• Explore more innovative approaches to the problem\n"
    }
    if (completeness < 75) {
      feedback += "• Ensure all assignment requirements are fully addressed\n"
    }
    if (presentation < 75) {
      feedback += "• Improve formatting, structure, and visual presentation\n"
    }

    return feedback
  }

  // Start auto-grading process
  const startAutoGrading = async () => {
    if (submissions.length === 0) {
      toast({
        title: "No Submissions",
        description: "No submissions available for grading.",
        variant: "destructive",
      })
      return
    }

    setIsGrading(true)
    setGradingProgress(0)
    setGradedSubmissions([])

    const graded: Submission[] = []
    
    for (let i = 0; i < submissions.length; i++) {
      const submission = submissions[i]
      setCurrentSubmission(submission)
      
      try {
        const gradedSubmission = await performAutoGrading(submission)
        graded.push(gradedSubmission)
        setGradedSubmissions([...graded])
        
        // Update progress
        const progress = ((i + 1) / submissions.length) * 100
        setGradingProgress(progress)
        
        toast({
          title: "Grading Complete",
          description: `${submission.studentName}'s submission has been graded.`,
        })
      } catch (error) {
        console.error("Error grading submission:", error)
        toast({
          title: "Grading Error",
          description: `Failed to grade ${submission.studentName}'s submission.`,
          variant: "destructive",
        })
      }
    }

    setIsGrading(false)
    setCurrentSubmission(null)
    setShowResults(true)
    onGradingComplete(graded)

    toast({
      title: "Auto-Grading Complete",
      description: `Successfully graded ${graded.length} submissions.`,
    })
  }

  // Get grade color
  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-green-600"
    if (grade >= 80) return "text-blue-600"
    if (grade >= 70) return "text-yellow-600"
    if (grade >= 60) return "text-orange-600"
    return "text-red-600"
  }

  // Get grade badge
  const getGradeBadge = (grade: number) => {
    if (grade >= 90) return <Badge className="bg-green-100 text-green-800">A+</Badge>
    if (grade >= 80) return <Badge className="bg-blue-100 text-blue-800">A</Badge>
    if (grade >= 70) return <Badge className="bg-yellow-100 text-yellow-800">B</Badge>
    if (grade >= 60) return <Badge className="bg-orange-100 text-orange-800">C</Badge>
    return <Badge className="bg-red-100 text-red-800">F</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Brain className="mr-3 h-8 w-8 text-purple-600" />
            AI-Powered Auto-Grading System
          </CardTitle>
          <p className="text-gray-600">
            Intelligent grading with plagiarism detection and detailed feedback generation
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={startAutoGrading}
              disabled={isGrading || submissions.length === 0}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isGrading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Grading in Progress...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Start Auto-Grading ({submissions.length} submissions)
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowSettings(true)}
              disabled={isGrading}
            >
              <Settings className="mr-2 h-4 w-4" />
              Grading Settings
            </Button>
            
            {gradedSubmissions.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setShowResults(true)}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Results ({gradedSubmissions.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grading Progress */}
      <AnimatePresence>
        {isGrading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-blue-600" />
                  Grading Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-600">{Math.round(gradingProgress)}%</span>
                </div>
                <Progress value={gradingProgress} className="h-3" />
                
                {currentSubmission && (
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <RefreshCw className="mr-3 h-5 w-5 text-blue-600 animate-spin" />
                    <div>
                      <p className="font-medium">Currently Grading:</p>
                      <p className="text-sm text-gray-600">
                        {currentSubmission.studentName} - {currentSubmission.assignmentTitle}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats */}
      {gradedSubmissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Grade</p>
                  <p className="text-2xl font-bold">
                    {Math.round(gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Passing Rate</p>
                  <p className="text-2xl font-bold">
                    {Math.round((gradedSubmissions.filter(s => (s.grade || 0) >= gradingSettings.passingGrade).length / gradedSubmissions.length) * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">High Plagiarism</p>
                  <p className="text-2xl font-bold">
                    {gradedSubmissions.filter(s => (s.plagiarismScore || 0) > gradingSettings.plagiarismThreshold).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Graded</p>
                  <p className="text-2xl font-bold">{gradedSubmissions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grading Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Auto-Grading Settings
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="weights">Criteria Weights</TabsTrigger>
              <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="plagiarism-check">Enable Plagiarism Check</Label>
                <Switch
                  id="plagiarism-check"
                  checked={gradingSettings.enablePlagiarismCheck}
                  onCheckedChange={(checked) =>
                    setGradingSettings(prev => ({ ...prev, enablePlagiarismCheck: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="ai-grading">Enable AI Grading</Label>
                <Switch
                  id="ai-grading"
                  checked={gradingSettings.enableAIGrading}
                  onCheckedChange={(checked) =>
                    setGradingSettings(prev => ({ ...prev, enableAIGrading: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="strict-mode">Strict Mode</Label>
                <Switch
                  id="strict-mode"
                  checked={gradingSettings.strictMode}
                  onCheckedChange={(checked) =>
                    setGradingSettings(prev => ({ ...prev, strictMode: checked }))
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="weights" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label>Content Quality ({gradingSettings.customWeights.contentQuality}%)</Label>
                  <Input
                    type="range"
                    min="0"
                    max="50"
                    value={gradingSettings.customWeights.contentQuality}
                    onChange={(e) =>
                      setGradingSettings(prev => ({
                        ...prev,
                        customWeights: { ...prev.customWeights, contentQuality: parseInt(e.target.value) }
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Technical Accuracy ({gradingSettings.customWeights.technicalAccuracy}%)</Label>
                  <Input
                    type="range"
                    min="0"
                    max="50"
                    value={gradingSettings.customWeights.technicalAccuracy}
                    onChange={(e) =>
                      setGradingSettings(prev => ({
                        ...prev,
                        customWeights: { ...prev.customWeights, technicalAccuracy: parseInt(e.target.value) }
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Creativity ({gradingSettings.customWeights.creativity}%)</Label>
                  <Input
                    type="range"
                    min="0"
                    max="30"
                    value={gradingSettings.customWeights.creativity}
                    onChange={(e) =>
                      setGradingSettings(prev => ({
                        ...prev,
                        customWeights: { ...prev.customWeights, creativity: parseInt(e.target.value) }
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Completeness ({gradingSettings.customWeights.completeness}%)</Label>
                  <Input
                    type="range"
                    min="0"
                    max="40"
                    value={gradingSettings.customWeights.completeness}
                    onChange={(e) =>
                      setGradingSettings(prev => ({
                        ...prev,
                        customWeights: { ...prev.customWeights, completeness: parseInt(e.target.value) }
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Presentation ({gradingSettings.customWeights.presentation}%)</Label>
                  <Input
                    type="range"
                    min="0"
                    max="25"
                    value={gradingSettings.customWeights.presentation}
                    onChange={(e) =>
                      setGradingSettings(prev => ({
                        ...prev,
                        customWeights: { ...prev.customWeights, presentation: parseInt(e.target.value) }
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="thresholds" className="space-y-4">
              <div>
                <Label>Passing Grade (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={gradingSettings.passingGrade}
                  onChange={(e) =>
                    setGradingSettings(prev => ({ ...prev, passingGrade: parseInt(e.target.value) }))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Plagiarism Threshold (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={gradingSettings.plagiarismThreshold}
                  onChange={(e) =>
                    setGradingSettings(prev => ({ ...prev, plagiarismThreshold: parseInt(e.target.value) }))
                  }
                  className="mt-1"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSettings(false)}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Auto-Grading Results
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {gradedSubmissions.map((submission, index) => (
              <Card key={submission.id} className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{submission.studentName}</h3>
                      <p className="text-sm text-gray-600">{submission.assignmentTitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getGradeBadge(submission.grade || 0)}
                      <span className={`text-2xl font-bold ${getGradeColor(submission.grade || 0)}`}>
                        {submission.grade}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                    {submission.gradingCriteria && Object.entries(submission.gradingCriteria).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="font-semibold">{value}/100</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge className={
                      (submission.plagiarismScore || 0) > 15 ? "bg-red-100 text-red-800" :
                      (submission.plagiarismScore || 0) > 8 ? "bg-yellow-100 text-yellow-800" :
                      "bg-green-100 text-green-800"
                    }>
                      <Shield className="mr-1 h-3 w-3" />
                      Plagiarism: {submission.plagiarismScore}%
                    </Badge>
                    
                    <Badge variant="outline">
                      <Clock className="mr-1 h-3 w-3" />
                      Auto-Graded
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResults(false)}>
              Close
            </Button>
            <Button onClick={() => {
              // Export results logic here
              toast({
                title: "Export Started",
                description: "Grading results are being exported...",
              })
            }}>
              <Download className="mr-2 h-4 w-4" />
              Export Results
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
