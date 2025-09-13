"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileCheck, 
  Shield, 
  Award,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"

interface AnalyticsProps {
  submissions: any[]
  assignment: any
  students: any[]
}

export default function AssignmentAnalytics({ submissions, assignment, students }: AnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>({})

  useEffect(() => {
    calculateAnalytics()
  }, [submissions, students])

  const calculateAnalytics = () => {
    const totalStudents = students.length
    const submittedCount = submissions.length
    const gradedCount = submissions.filter(s => s.status === 'graded').length
    const lateCount = submissions.filter(s => s.is_late).length
    
    // Submission rate
    const submissionRate = totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 100) : 0
    
    // Grade distribution
    const gradedSubmissions = submissions.filter(s => s.grade !== null && s.grade !== undefined)
    const gradeRanges = {
      excellent: gradedSubmissions.filter(s => s.grade >= assignment.max_marks * 0.9).length,
      good: gradedSubmissions.filter(s => s.grade >= assignment.max_marks * 0.7 && s.grade < assignment.max_marks * 0.9).length,
      average: gradedSubmissions.filter(s => s.grade >= assignment.max_marks * 0.5 && s.grade < assignment.max_marks * 0.7).length,
      poor: gradedSubmissions.filter(s => s.grade < assignment.max_marks * 0.5).length
    }
    
    // Plagiarism statistics
    const plagiarismScores = submissions.filter(s => s.plagiarism_score !== null && s.plagiarism_score !== undefined)
    const plagiarismStats = {
      low: plagiarismScores.filter(s => s.plagiarism_score < 5).length,
      moderate: plagiarismScores.filter(s => s.plagiarism_score >= 5 && s.plagiarism_score < 15).length,
      high: plagiarismScores.filter(s => s.plagiarism_score >= 15).length,
      average: plagiarismScores.length > 0 ? 
        Math.round(plagiarismScores.reduce((sum, s) => sum + s.plagiarism_score, 0) / plagiarismScores.length) : 0
    }
    
    // Average grade
    const averageGrade = gradedSubmissions.length > 0 ? 
      Math.round((gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length) * 10) / 10 : 0
    
    // Submission timeline (last 7 days)
    const now = new Date()
    const submissionTimeline = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now)
      date.setDate(date.getDate() - (6 - i))
      const daySubmissions = submissions.filter(s => {
        const submissionDate = new Date(s.submitted_at)
        return submissionDate.toDateString() === date.toDateString()
      }).length
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count: daySubmissions
      }
    })

    setAnalytics({
      totalStudents,
      submittedCount,
      gradedCount,
      lateCount,
      submissionRate,
      gradeRanges,
      plagiarismStats,
      averageGrade,
      submissionTimeline
    })
  }

  const getGradeColor = (range: string) => {
    switch (range) {
      case 'excellent': return 'bg-green-500'
      case 'good': return 'bg-blue-500'
      case 'average': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getPlagiarismColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'moderate': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submission Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.submissionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {analytics.submittedCount}/{analytics.totalStudents} students
            </p>
            <Progress value={analytics.submissionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averageGrade > 0 ? `${analytics.averageGrade}/${assignment.max_marks}` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.gradedCount} graded submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plagiarism Average</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.plagiarismStats?.average || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Across all submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Submissions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.lateCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.submittedCount > 0 ? 
                Math.round((analytics.lateCount / analytics.submittedCount) * 100) : 0}% of submissions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Grade Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.gradeRanges || {}).map(([range, count]) => {
              const percentage = analytics.gradedCount > 0 ? Math.round((count as number / analytics.gradedCount) * 100) : 0
              return (
                <div key={range} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded ${getGradeColor(range)}`} />
                    <span className="capitalize font-medium">{range}</span>
                    <Badge variant="outline">{String(count)} students</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getGradeColor(range)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-10">{percentage}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Plagiarism Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Plagiarism Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className={`p-4 rounded-lg ${getPlagiarismColor('low')}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Low Risk</p>
                  <p className="text-xs opacity-75">&lt; 5% similarity</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{analytics.plagiarismStats?.low || 0}</p>
                  <CheckCircle className="h-4 w-4 ml-auto" />
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${getPlagiarismColor('moderate')}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Moderate Risk</p>
                  <p className="text-xs opacity-75">5-15% similarity</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{analytics.plagiarismStats?.moderate || 0}</p>
                  <AlertTriangle className="h-4 w-4 ml-auto" />
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${getPlagiarismColor('high')}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">High Risk</p>
                  <p className="text-xs opacity-75">&gt; 15% similarity</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{analytics.plagiarismStats?.high || 0}</p>
                  <AlertTriangle className="h-4 w-4 ml-auto" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Submission Timeline (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-32 gap-2">
            {analytics.submissionTimeline?.map((day: any, index: number) => {
              const maxCount = Math.max(...(analytics.submissionTimeline?.map((d: any) => d.count) || [1]))
              const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="flex flex-col items-center justify-end h-24 w-full">
                    <div 
                      className="bg-blue-500 rounded-t w-full min-h-[4px] flex items-end justify-center text-xs text-white font-medium"
                      style={{ height: `${height}%` }}
                    >
                      {day.count > 0 && <span className="mb-1">{String(day.count)}</span>}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{day.date}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
