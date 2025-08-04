"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Submission } from "@/types/assignment"

interface AssignmentAnalyticsProps {
  submissions: Submission[]
  totalStudents: number
  maxMarks: number
}

export function AssignmentAnalytics({ submissions, totalStudents, maxMarks }: AssignmentAnalyticsProps) {
  // Calculate statistics
  const stats = {
    total: submissions.length,
    submitted: submissions.filter((sub) => sub.status === "submitted").length,
    graded: submissions.filter((sub) => sub.status === "graded").length,
    late: submissions.filter((sub) => sub.status === "late").length,
    returned: submissions.filter((sub) => sub.status === "returned").length,
    missing: totalStudents - submissions.length,
    onTime: submissions.filter((sub) => sub.status !== "late").length,
    highPlagiarism: submissions.filter((sub) => (sub.plagiarism_score || 0) > 10).length,
  }

  // Calculate average grade
  const gradedSubmissions = submissions.filter((sub) => sub.marks !== undefined && sub.marks !== null)
  const averageMarks =
    gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, sub) => sum + (sub.marks || 0), 0) / gradedSubmissions.length
      : 0

  // Calculate grade distribution
  const gradeDistribution = {
    excellent: gradedSubmissions.filter((sub) => (sub.marks || 0) >= maxMarks * 0.9).length,
    good: gradedSubmissions.filter((sub) => (sub.marks || 0) >= maxMarks * 0.75 && (sub.marks || 0) < maxMarks * 0.9)
      .length,
    average: gradedSubmissions.filter((sub) => (sub.marks || 0) >= maxMarks * 0.6 && (sub.marks || 0) < maxMarks * 0.75)
      .length,
    belowAverage: gradedSubmissions.filter(
      (sub) => (sub.marks || 0) >= maxMarks * 0.4 && (sub.marks || 0) < maxMarks * 0.6,
    ).length,
    poor: gradedSubmissions.filter((sub) => (sub.marks || 0) < maxMarks * 0.4).length,
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Submission Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {stats.total} / {totalStudents}
            </div>
            <Progress value={(stats.total / totalStudents) * 100} className="h-2 mb-2" />
            <div className="text-xs text-gray-500">{stats.missing} students haven't submitted</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Grading Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {stats.graded} / {stats.total}
            </div>
            <Progress value={stats.total ? (stats.graded / stats.total) * 100 : 0} className="h-2 mb-2" />
            <div className="text-xs text-gray-500">{stats.total - stats.graded} submissions need grading</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Plagiarism Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{stats.highPlagiarism}</div>
            <Progress
              value={stats.total ? (stats.highPlagiarism / stats.total) * 100 : 0}
              className="h-2 mb-2 bg-red-100"
              indicatorClassName="bg-red-500"
            />
            <div className="text-xs text-gray-500">{stats.highPlagiarism} submissions with high similarity (>10%)</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Average Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold mb-1">
                {averageMarks.toFixed(1)} <span className="text-lg font-normal text-gray-500">/ {maxMarks}</span>
              </div>
              <div className="text-sm text-gray-500">Average marks</div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Excellent (90-100%)</span>
                  <span>{gradeDistribution.excellent}</span>
                </div>
                <Progress
                  value={(gradeDistribution.excellent / (gradedSubmissions.length || 1)) * 100}
                  className="h-2"
                  indicatorClassName="bg-green-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Good (75-89%)</span>
                  <span>{gradeDistribution.good}</span>
                </div>
                <Progress
                  value={(gradeDistribution.good / (gradedSubmissions.length || 1)) * 100}
                  className="h-2"
                  indicatorClassName="bg-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Average (60-74%)</span>
                  <span>{gradeDistribution.average}</span>
                </div>
                <Progress
                  value={(gradeDistribution.average / (gradedSubmissions.length || 1)) * 100}
                  className="h-2"
                  indicatorClassName="bg-yellow-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Below Average (40-59%)</span>
                  <span>{gradeDistribution.belowAverage}</span>
                </div>
                <Progress
                  value={(gradeDistribution.belowAverage / (gradedSubmissions.length || 1)) * 100}
                  className="h-2"
                  indicatorClassName="bg-orange-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Poor (0-39%)</span>
                  <span>{gradeDistribution.poor}</span>
                </div>
                <Progress
                  value={(gradeDistribution.poor / (gradedSubmissions.length || 1)) * 100}
                  className="h-2"
                  indicatorClassName="bg-red-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Submission Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Submitted On Time</span>
                  <span>{stats.onTime}</span>
                </div>
                <Progress value={(stats.onTime / totalStudents) * 100} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Late Submissions</span>
                  <span>{stats.late}</span>
                </div>
                <Progress
                  value={(stats.late / totalStudents) * 100}
                  className="h-2"
                  indicatorClassName="bg-orange-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Graded</span>
                  <span>{stats.graded}</span>
                </div>
                <Progress
                  value={(stats.graded / totalStudents) * 100}
                  className="h-2"
                  indicatorClassName="bg-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Returned for Revision</span>
                  <span>{stats.returned}</span>
                </div>
                <Progress
                  value={(stats.returned / totalStudents) * 100}
                  className="h-2"
                  indicatorClassName="bg-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Missing</span>
                  <span>{stats.missing}</span>
                </div>
                <Progress
                  value={(stats.missing / totalStudents) * 100}
                  className="h-2"
                  indicatorClassName="bg-red-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
