"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Edit3,
  Download,
  Filter,
  Search,
  BarChart3,
  AlertTriangle,
  Trophy,
  FileText,
  Timer,
  Target
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"

interface Submission {
  id: string
  studentName: string
  studentId: string
  submittedAt: string
  duration: number
  score?: number
  totalMarks: number
  status: 'submitted' | 'graded' | 'reviewing'
  autoGraded: number
  manualGrading: number
  flagged: boolean
  proctoring: {
    violations: number
    tabSwitches: number
    suspicious: boolean
  }
}

const QuizSubmissions = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'graded' | 'flagged'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [gradingDialogOpen, setGradingDialogOpen] = useState(false)

  const quizInfo = {
    title: "Data Structures Fundamentals",
    totalStudents: 45,
    submitted: 42,
    graded: 35,
    pending: 7,
    averageScore: 78.5,
    duration: 60
  }

  const submissions: Submission[] = [
    {
      id: '1',
      studentName: 'Arjun Patel',
      studentId: 'CSE001',
      submittedAt: '2024-01-20T15:30:00',
      duration: 45,
      score: 42,
      totalMarks: 50,
      status: 'graded',
      autoGraded: 35,
      manualGrading: 7,
      flagged: false,
      proctoring: { violations: 0, tabSwitches: 1, suspicious: false }
    },
    {
      id: '2',
      studentName: 'Priya Singh',
      studentId: 'CSE002',
      submittedAt: '2024-01-20T15:45:00',
      duration: 52,
      score: 38,
      totalMarks: 50,
      status: 'graded',
      autoGraded: 30,
      manualGrading: 8,
      flagged: false,
      proctoring: { violations: 1, tabSwitches: 2, suspicious: false }
    },
    {
      id: '3',
      studentName: 'Rahul Kumar',
      studentId: 'CSE003',
      submittedAt: '2024-01-20T16:00:00',
      duration: 38,
      totalMarks: 50,
      status: 'submitted',
      autoGraded: 28,
      manualGrading: 0,
      flagged: false,
      proctoring: { violations: 0, tabSwitches: 0, suspicious: false }
    },
    {
      id: '4',
      studentName: 'Sneha Sharma',
      studentId: 'CSE004',
      submittedAt: '2024-01-20T15:20:00',
      duration: 60,
      totalMarks: 50,
      status: 'reviewing',
      autoGraded: 25,
      manualGrading: 0,
      flagged: true,
      proctoring: { violations: 5, tabSwitches: 8, suspicious: true }
    },
    {
      id: '5',
      studentName: 'Vikram Joshi',
      studentId: 'CSE005',
      submittedAt: '2024-01-20T15:55:00',
      duration: 41,
      score: 45,
      totalMarks: 50,
      status: 'graded',
      autoGraded: 38,
      manualGrading: 7,
      flagged: false,
      proctoring: { violations: 0, tabSwitches: 1, suspicious: false }
    }
  ]

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || submission.status === filterStatus
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'pending' && submission.status === 'submitted') ||
                      (activeTab === 'graded' && submission.status === 'graded') ||
                      (activeTab === 'flagged' && submission.flagged)
    
    return matchesSearch && matchesStatus && matchesTab
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded': return 'bg-green-100 text-green-800'
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'reviewing': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleGradeSubmission = (submission: Submission) => {
    setSelectedSubmission(submission)
    setGradingDialogOpen(true)
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
                Quiz Submissions
              </h1>
              <p className="mt-2 text-gray-600">
                {quizInfo.title} - Review and grade student submissions
              </p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
              <Link href="/dashboard/quiz/analytics">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{quizInfo.totalStudents}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{quizInfo.submitted}</div>
              <div className="text-sm text-gray-600">Submitted</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{quizInfo.graded}</div>
              <div className="text-sm text-gray-600">Graded</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{quizInfo.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{quizInfo.averageScore}%</div>
              <div className="text-sm text-gray-600">Avg Score</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{Math.round((quizInfo.submitted / quizInfo.totalStudents) * 100)}%</div>
              <div className="text-sm text-gray-600">Completion</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by student name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
                <SelectItem value="reviewing">Reviewing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex space-x-1 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-lg">
            {[
              { id: 'all', label: 'All Submissions', count: submissions.length },
              { id: 'pending', label: 'Pending Review', count: submissions.filter(s => s.status === 'submitted').length },
              { id: 'graded', label: 'Graded', count: submissions.filter(s => s.status === 'graded').length },
              { id: 'flagged', label: 'Flagged', count: submissions.filter(s => s.flagged).length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {tab.label}
                <Badge variant="secondary" className="ml-2">
                  {tab.count}
                </Badge>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Submissions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>
                Submissions ({filteredSubmissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSubmissions.map((submission, index) => (
                  <motion.div
                    key={submission.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-6 border rounded-lg transition-all duration-200 hover:shadow-md ${
                      submission.flagged ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900">{submission.studentName}</h3>
                          <p className="text-sm text-gray-600">ID: {submission.studentId}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {formatDate(submission.submittedAt)}
                            </span>
                            <span className="text-xs text-gray-500">
                              <Timer className="w-3 h-3 inline mr-1" />
                              {submission.duration}m
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        {/* Score Display */}
                        <div className="text-center">
                          {submission.score !== undefined ? (
                            <>
                              <div className="text-2xl font-bold text-blue-600">
                                {Math.round((submission.score / submission.totalMarks) * 100)}%
                              </div>
                              <div className="text-sm text-gray-500">
                                {submission.score}/{submission.totalMarks}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-lg font-bold text-gray-400">--</div>
                              <div className="text-sm text-gray-500">Not graded</div>
                            </>
                          )}
                        </div>

                        {/* Auto/Manual Grading */}
                        <div className="text-center">
                          <div className="text-sm text-gray-600">Auto: {submission.autoGraded}</div>
                          <div className="text-sm text-gray-600">Manual: {submission.manualGrading}</div>
                        </div>

                        {/* Status and Flags */}
                        <div className="flex flex-col items-end space-y-2">
                          <Badge className={getStatusColor(submission.status)}>
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </Badge>
                          
                          {submission.flagged && (
                            <Badge className="bg-red-100 text-red-800">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Flagged
                            </Badge>
                          )}
                          
                          {submission.proctoring.suspicious && (
                            <Badge className="bg-orange-100 text-orange-800">
                              Suspicious Activity
                            </Badge>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col space-y-2">
                          <Link href={`/dashboard/quiz/submissions/${submission.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </Link>
                          
                          {submission.status !== 'graded' && (
                            <Button 
                              size="sm"
                              onClick={() => handleGradeSubmission(submission)}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Grade
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Proctoring Info */}
                    {(submission.proctoring.violations > 0 || submission.proctoring.tabSwitches > 0) && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-6 text-sm">
                          <span className="text-red-600">
                            Violations: {submission.proctoring.violations}
                          </span>
                          <span className="text-orange-600">
                            Tab Switches: {submission.proctoring.tabSwitches}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                {filteredSubmissions.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Grading Dialog */}
      <Dialog open={gradingDialogOpen} onOpenChange={setGradingDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Grade Submission - {selectedSubmission?.studentName}</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Student</Label>
                  <div className="font-medium">{selectedSubmission.studentName}</div>
                  <div className="text-sm text-gray-500">ID: {selectedSubmission.studentId}</div>
                </div>
                <div>
                  <Label>Auto-graded Score</Label>
                  <div className="font-medium">{selectedSubmission.autoGraded}/{selectedSubmission.totalMarks}</div>
                </div>
              </div>

              <div>
                <Label htmlFor="manual-score">Manual Grading Points</Label>
                <Input
                  id="manual-score"
                  type="number"
                  placeholder="Enter additional points..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="Provide feedback for the student..."
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setGradingDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                  Save Grade
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QuizSubmissions
