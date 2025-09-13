"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Code,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Eye,
  Download,
  MessageSquare,
  Bot,
  Award,
  TrendingUp,
  FileText,
  Play,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function FacultySubmissionReviewPage() {
  const { toast } = useToast()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
  const [showGradingDialog, setShowGradingDialog] = useState(false)
  const [manualGrade, setManualGrade] = useState("")
  const [facultyFeedback, setFacultyFeedback] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    const loadSubmissions = () => {
      const storedSubmissions = JSON.parse(localStorage.getItem("assignment_submissions") || "[]")
      
      // Add sample submissions if none exist
      if (storedSubmissions.length === 0) {
        const sampleSubmissions = [
          {
            id: "sub_001",
            assignmentId: "assignment-1",
            assignmentTitle: "Data Structures Implementation",
            studentId: "student_001",
            studentName: "Alice Johnson",
            code: `#include <iostream>\nusing namespace std;\n\nclass BST {\nprivate:\n    struct Node {\n        int data;\n        Node* left;\n        Node* right;\n        Node(int val) : data(val), left(nullptr), right(nullptr) {}\n    };\n    Node* root;\n\npublic:\n    BST() : root(nullptr) {}\n    \n    void insert(int val) {\n        root = insertHelper(root, val);\n    }\n    \n    Node* insertHelper(Node* node, int val) {\n        if (node == nullptr) {\n            return new Node(val);\n        }\n        if (val < node->data) {\n            node->left = insertHelper(node->left, val);\n        } else {\n            node->right = insertHelper(node->right, val);\n        }\n        return node;\n    }\n    \n    bool search(int val) {\n        return searchHelper(root, val);\n    }\n    \n    bool searchHelper(Node* node, int val) {\n        if (node == nullptr) return false;\n        if (node->data == val) return true;\n        if (val < node->data) {\n            return searchHelper(node->left, val);\n        }\n        return searchHelper(node->right, val);\n    }\n};`,
            language: "cpp",
            submittedAt: new Date(Date.now() - 3600000).toISOString(),
            warnings: 0,
            status: "submitted",
            aiEvaluation: {
              score: 85,
              feedback: [
                "✓ Excellent class implementation",
                "✓ Proper BST structure",
                "✓ Insert and search methods implemented",
                "✗ Missing delete method",
                "✗ No traversal methods"
              ]
            },
            grade: 85,
            timeSpent: 45,
            facultyReviewed: false
          },
          {
            id: "sub_002",
            assignmentId: "assignment-1",
            assignmentTitle: "Data Structures Implementation",
            studentId: "student_002",
            studentName: "Bob Smith",
            code: `class BST:\n    def __init__(self):\n        self.root = None\n    \n    def insert(self, val):\n        if self.root is None:\n            self.root = TreeNode(val)\n        else:\n            self._insert_helper(self.root, val)\n    \n    def _insert_helper(self, node, val):\n        if val < node.val:\n            if node.left is None:\n                node.left = TreeNode(val)\n            else:\n                self._insert_helper(node.left, val)\n        else:\n            if node.right is None:\n                node.right = TreeNode(val)\n            else:\n                self._insert_helper(node.right, val)\n\nclass TreeNode:\n    def __init__(self, val):\n        self.val = val\n        self.left = None\n        self.right = None`,
            language: "python",
            submittedAt: new Date(Date.now() - 7200000).toISOString(),
            warnings: 1,
            status: "submitted",
            aiEvaluation: {
              score: 65,
              feedback: [
                "✓ Basic class structure",
                "✓ Insert method implemented",
                "✗ Missing search method",
                "✗ Missing delete method",
                "✗ Incomplete implementation"
              ]
            },
            grade: 65,
            timeSpent: 30,
            facultyReviewed: false
          }
        ]
        localStorage.setItem("assignment_submissions", JSON.stringify(sampleSubmissions))
        setSubmissions(sampleSubmissions)
      } else {
        setSubmissions(storedSubmissions)
      }
    }

    loadSubmissions()
  }, [])

  const handleGradeSubmission = (submission: any) => {
    setSelectedSubmission(submission)
    setManualGrade(submission.grade?.toString() || "")
    setFacultyFeedback("")
    setShowGradingDialog(true)
  }

  const submitGrade = () => {
    if (!manualGrade || !facultyFeedback) {
      toast({
        title: "Missing Information",
        description: "Please provide both grade and feedback.",
        variant: "destructive",
      })
      return
    }

    const updatedSubmissions = submissions.map(sub => 
      sub.id === selectedSubmission.id 
        ? {
            ...sub,
            grade: parseInt(manualGrade),
            facultyFeedback,
            facultyReviewed: true,
            reviewedAt: new Date().toISOString()
          }
        : sub
    )

    setSubmissions(updatedSubmissions)
    localStorage.setItem("assignment_submissions", JSON.stringify(updatedSubmissions))

    toast({
      title: "Grade Submitted",
      description: `Grade ${manualGrade}/100 assigned to ${selectedSubmission.studentName}`,
    })

    setShowGradingDialog(false)
  }

  const runCode = (code: string, language: string) => {
    toast({
      title: "Code Execution",
      description: "Simulating code execution...",
    })
    
    setTimeout(() => {
      toast({
        title: "Execution Complete",
        description: "Code executed successfully with sample output.",
      })
    }, 2000)
  }

  const filteredSubmissions = submissions.filter(sub => {
    if (filterStatus === "all") return true
    if (filterStatus === "reviewed") return sub.facultyReviewed
    if (filterStatus === "pending") return !sub.facultyReviewed
    return true
  })

  const averageGrade = submissions.length > 0 
    ? Math.round(submissions.reduce((sum, sub) => sum + (sub.grade || 0), 0) / submissions.length)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="w-full max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Submissions Review</h1>
            <p className="text-gray-600 mt-1">Review and grade student code submissions with AI assistance</p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Submissions</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold">{submissions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Reviewed</p>
                  <p className="text-2xl font-bold">{submissions.filter(s => s.facultyReviewed).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{submissions.filter(s => !s.facultyReviewed).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Grade</p>
                  <p className="text-2xl font-bold">{averageGrade}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions List */}
        <div className="grid gap-6">
          {filteredSubmissions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Submissions Found</h3>
                <p className="text-gray-600">No submissions match the current filter criteria.</p>
              </CardContent>
            </Card>
          ) : (
            filteredSubmissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Student Info & AI Analysis */}
                    <div className="lg:w-1/3 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{submission.studentName}</h3>
                          <p className="text-sm text-gray-600">{submission.assignmentTitle}</p>
                        </div>
                        <Badge variant={submission.facultyReviewed ? "default" : "secondary"}>
                          {submission.facultyReviewed ? "Reviewed" : "Pending"}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Submitted:</span>
                          <span>{new Date(submission.submittedAt).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Time Spent:</span>
                          <span>{submission.timeSpent} minutes</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Language:</span>
                          <Badge variant="outline">{submission.language.toUpperCase()}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Warnings:</span>
                          <Badge variant={submission.warnings > 0 ? "destructive" : "default"}>
                            {submission.warnings}
                          </Badge>
                        </div>
                      </div>

                      {/* AI Evaluation */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Bot className="h-5 w-5 text-blue-600" />
                          <h4 className="font-semibold text-blue-900">AI Analysis</h4>
                          <Badge variant="outline" className="bg-blue-100">
                            {submission.aiEvaluation.score}/100
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {submission.aiEvaluation.feedback.map((feedback: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              {feedback.startsWith("✓") ? (
                                <ThumbsUp className="h-3 w-3 text-green-600" />
                              ) : (
                                <ThumbsDown className="h-3 w-3 text-red-600" />
                              )}
                              <span className={feedback.startsWith("✓") ? "text-green-700" : "text-red-700"}>
                                {feedback}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Code Display */}
                    <div className="lg:w-2/3 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          Submitted Code
                        </h4>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => runCode(submission.code, submission.language)}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Run Code
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGradeSubmission(submission)}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {submission.facultyReviewed ? "Update Grade" : "Grade"}
                          </Button>
                        </div>
                      </div>

                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto max-h-80 overflow-y-auto">
                        <pre>{submission.code}</pre>
                      </div>

                      {submission.facultyReviewed && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="h-5 w-5 text-green-600" />
                            <h5 className="font-semibold text-green-900">Faculty Review</h5>
                            <Badge className="bg-green-100 text-green-800">
                              {submission.grade}/100
                            </Badge>
                          </div>
                          <p className="text-sm text-green-700">{submission.facultyFeedback}</p>
                          <p className="text-xs text-green-600 mt-2">
                            Reviewed on {new Date(submission.reviewedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Grading Dialog */}
        <Dialog open={showGradingDialog} onOpenChange={setShowGradingDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Grade Submission - {selectedSubmission?.studentName}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">AI Recommendation</h4>
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    AI suggests: {selectedSubmission?.aiEvaluation.score}/100
                  </span>
                </div>
                <div className="text-sm text-blue-700">
                  {selectedSubmission?.aiEvaluation.feedback.join(", ")}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manualGrade">Final Grade (0-100) *</Label>
                <Input
                  id="manualGrade"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Enter grade"
                  value={manualGrade}
                  onChange={(e) => setManualGrade(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facultyFeedback">Faculty Feedback *</Label>
                <Textarea
                  id="facultyFeedback"
                  placeholder="Provide detailed feedback for the student..."
                  value={facultyFeedback}
                  onChange={(e) => setFacultyFeedback(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
            
            <DialogFooter className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowGradingDialog(false)}>
                Cancel
              </Button>
              <Button onClick={submitGrade}>
                Submit Grade
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
