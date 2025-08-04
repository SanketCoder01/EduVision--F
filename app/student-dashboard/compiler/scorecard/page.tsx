"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Trophy, Calendar, Download, Eye, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Scorecard from "@/components/scorecard"

interface ScorecardData {
  id: string
  assignmentTitle: string
  facultyName: string
  submissionDate: string
  score: number
  totalMarks: number
  percentage: number
  grade: string
  type: "assignment" | "exam"
  language: string
}

export default function ScorecardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedScorecard, setSelectedScorecard] = useState<ScorecardData | null>(null)

  // Mock scorecard data
  const scorecards: ScorecardData[] = [
    {
      id: "1",
      assignmentTitle: "Array Manipulation Challenge",
      facultyName: "Dr. Sarah Johnson",
      submissionDate: "2024-01-10T14:30:00",
      score: 91,
      totalMarks: 100,
      percentage: 91,
      grade: "A+",
      type: "assignment",
      language: "Python",
    },
    {
      id: "2",
      assignmentTitle: "Data Structures Implementation",
      facultyName: "Prof. Michael Chen",
      submissionDate: "2024-01-08T16:45:00",
      score: 78,
      totalMarks: 100,
      percentage: 78,
      grade: "B",
      type: "assignment",
      language: "Java",
    },
    {
      id: "3",
      assignmentTitle: "Algorithm Optimization",
      facultyName: "Dr. Emily Davis",
      submissionDate: "2024-01-05T11:20:00",
      score: 95,
      totalMarks: 100,
      percentage: 95,
      grade: "A+",
      type: "exam",
      language: "C++",
    },
  ]

  const filteredScorecards = scorecards.filter(
    (scorecard) =>
      scorecard.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scorecard.facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scorecard.language.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600 bg-green-50"
    if (percentage >= 80) return "text-blue-600 bg-blue-50"
    if (percentage >= 70) return "text-yellow-600 bg-yellow-50"
    if (percentage >= 60) return "text-orange-600 bg-orange-50"
    return "text-red-600 bg-red-50"
  }

  const getTypeIcon = (type: string) => {
    return type === "exam" ? "🎓" : "📝"
  }

  const viewScorecard = (scorecard: ScorecardData) => {
    // Mock detailed scorecard data
    const detailedData = {
      assignment: {
        title: scorecard.assignmentTitle,
        facultyName: scorecard.facultyName,
        givenDate: "2024-01-01",
        dueDate: "2024-01-15",
        description: "Implement advanced algorithms and data structures with optimal time complexity.",
        rules: "Write clean, well-commented code. Test your solution with multiple test cases.",
        language: scorecard.language,
        totalMarks: scorecard.totalMarks,
      },
      result: {
        score: scorecard.score,
        feedback: `Code Evaluation Report:

✅ Syntax: No syntax errors found.
✅ Runtime: Code executed successfully.
❌ Test Cases: 1 test case(s) failed. (-10 marks)
📊 Code Quality: 8/10 (-4 marks)
⚡ Performance Bonus: Fast execution time (+5 marks)

📈 Final Score: ${scorecard.score} / ${scorecard.totalMarks} (${scorecard.percentage}%)`,
        submissionDate: scorecard.submissionDate,
        studentName: "John Doe",
        percentage: scorecard.percentage,
      },
    }

    setSelectedScorecard(scorecard)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            My Scorecards
          </h1>
          <p className="text-xl text-gray-600">View and download your assignment and exam results</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search scorecards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Scorecards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScorecards.map((scorecard, index) => (
            <motion.div
              key={scorecard.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-xl">{getTypeIcon(scorecard.type)}</span>
                        {scorecard.assignmentTitle}
                      </CardTitle>
                      <div className="text-sm text-gray-600 mt-2">
                        <div className="flex items-center gap-1 mb-1">
                          <FileText className="h-3 w-3" />
                          {scorecard.facultyName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(scorecard.submissionDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {scorecard.type}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Score Display */}
                    <div className="text-center bg-gray-50 p-4 rounded-lg">
                      <div className={`text-3xl font-bold ${getGradeColor(scorecard.percentage).split(" ")[0]}`}>
                        {scorecard.score}
                      </div>
                      <div className="text-sm text-gray-600">out of {scorecard.totalMarks}</div>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Badge className={getGradeColor(scorecard.percentage)}>{scorecard.percentage}%</Badge>
                        <Badge variant="outline">Grade: {scorecard.grade}</Badge>
                      </div>
                    </div>

                    {/* Language Badge */}
                    <div className="flex justify-center">
                      <Badge variant="secondary">{scorecard.language}</Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => viewScorecard(scorecard)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5" />
                              Scorecard Details
                            </DialogTitle>
                          </DialogHeader>
                          {selectedScorecard && (
                            <Scorecard
                              assignment={{
                                title: selectedScorecard.assignmentTitle,
                                facultyName: selectedScorecard.facultyName,
                                givenDate: "2024-01-01",
                                dueDate: "2024-01-15",
                                description:
                                  "Implement advanced algorithms and data structures with optimal time complexity.",
                                rules: "Write clean, well-commented code. Test your solution with multiple test cases.",
                                language: selectedScorecard.language,
                                totalMarks: selectedScorecard.totalMarks,
                              }}
                              result={{
                                score: selectedScorecard.score,
                                feedback: `Code Evaluation Report:

✅ Syntax: No syntax errors found.
✅ Runtime: Code executed successfully.
❌ Test Cases: 1 test case(s) failed. (-10 marks)
📊 Code Quality: 8/10 (-4 marks)
⚡ Performance Bonus: Fast execution time (+5 marks)

📈 Final Score: ${selectedScorecard.score} / ${selectedScorecard.totalMarks} (${selectedScorecard.percentage}%)`,
                                submissionDate: selectedScorecard.submissionDate,
                                studentName: "John Doe",
                                percentage: selectedScorecard.percentage,
                              }}
                            />
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600"
                        onClick={() => {
                          // Generate PDF directly
                          const printWindow = window.open("", "_blank")
                          if (printWindow) {
                            const htmlContent = `
                              <!DOCTYPE html>
                              <html>
                                <head>
                                  <title>Scorecard - ${scorecard.assignmentTitle}</title>
                                  <style>
                                    body { font-family: Arial, sans-serif; margin: 20px; }
                                    .header { text-align: center; margin-bottom: 30px; }
                                    .score { font-size: 48px; font-weight: bold; color: #2563eb; }
                                  </style>
                                </head>
                                <body>
                                  <div class="header">
                                    <h1>🏆 Assignment Scorecard</h1>
                                    <h2>${scorecard.assignmentTitle}</h2>
                                  </div>
                                  <div class="score">${scorecard.score} / ${scorecard.totalMarks}</div>
                                  <p>Grade: ${scorecard.grade} (${scorecard.percentage}%)</p>
                                  <p>Faculty: ${scorecard.facultyName}</p>
                                  <p>Language: ${scorecard.language}</p>
                                  <p>Submitted: ${new Date(scorecard.submissionDate).toLocaleString()}</p>
                                </body>
                              </html>
                            `
                            printWindow.document.write(htmlContent)
                            printWindow.document.close()
                            setTimeout(() => printWindow.print(), 500)
                          }
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredScorecards.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Trophy className="h-24 w-24 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Scorecards Found</h2>
            <p className="text-gray-600">
              {searchTerm
                ? "No scorecards match your search criteria."
                : "Complete assignments to see your scorecards here."}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
