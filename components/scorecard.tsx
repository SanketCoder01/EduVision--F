"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Trophy, Calendar, User, BookOpen, FileText, Target } from "lucide-react"
import { toast } from "sonner"

interface ScorecardProps {
  assignment: {
    title: string
    facultyName: string
    givenDate: string
    dueDate: string
    description: string
    rules: string
    language: string
    totalMarks: number
  }
  result: {
    score: number
    feedback: string
    submissionDate: string
    studentName: string
    percentage: number
  }
}

const Scorecard: React.FC<ScorecardProps> = ({ assignment, result }) => {
  const generatePDF = () => {
    // Create a new window for PDF generation
    const printWindow = window.open("", "_blank")

    if (!printWindow) {
      toast.error("Please allow popups to download the scorecard")
      return
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Assignment Scorecard</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
            }
            .scorecard {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 15px;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 2.5em;
              font-weight: bold;
            }
            .header p {
              margin: 10px 0 0 0;
              opacity: 0.9;
              font-size: 1.1em;
            }
            .content {
              padding: 30px;
            }
            .section {
              margin-bottom: 25px;
              padding: 20px;
              border-radius: 10px;
              background: #f8f9fa;
              border-left: 4px solid #667eea;
            }
            .section h3 {
              margin: 0 0 15px 0;
              color: #333;
              font-size: 1.3em;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-item {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .info-label {
              font-weight: bold;
              color: #555;
            }
            .score-section {
              text-align: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              border-radius: 15px;
              margin: 20px 0;
            }
            .score-number {
              font-size: 4em;
              font-weight: bold;
              margin: 10px 0;
            }
            .percentage {
              font-size: 1.5em;
              opacity: 0.9;
            }
            .feedback {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 10px;
              border-left: 4px solid #28a745;
              white-space: pre-line;
              font-family: monospace;
              line-height: 1.6;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              border-top: 1px solid #eee;
              margin-top: 30px;
            }
            @media print {
              body { background: white; }
              .scorecard { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="scorecard">
            <div class="header">
              <h1>🏆 Assignment Scorecard</h1>
              <p>EduVision Learning Platform</p>
            </div>
            
            <div class="content">
              <div class="section">
                <h3>📋 Assignment Information</h3>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">Title:</span>
                    <span>${assignment.title}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Faculty:</span>
                    <span>${assignment.facultyName}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Given Date:</span>
                    <span>${new Date(assignment.givenDate).toLocaleDateString()}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Due Date:</span>
                    <span>${new Date(assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Language:</span>
                    <span>${assignment.language.toUpperCase()}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Student:</span>
                    <span>${result.studentName}</span>
                  </div>
                </div>
                
                <div style="margin-top: 15px;">
                  <div class="info-label">Description:</div>
                  <p style="margin: 5px 0; color: #666;">${assignment.description}</p>
                </div>
                
                <div style="margin-top: 15px;">
                  <div class="info-label">Rules:</div>
                  <p style="margin: 5px 0; color: #666;">${assignment.rules || "No specific rules provided"}</p>
                </div>
              </div>

              <div class="score-section">
                <h2>🎯 Your Score</h2>
                <div class="score-number">${result.score}</div>
                <div style="font-size: 1.2em; margin: 10px 0;">out of ${assignment.totalMarks}</div>
                <div class="percentage">${result.percentage}%</div>
              </div>

              <div class="section">
                <h3>📊 Detailed Feedback</h3>
                <div class="feedback">${result.feedback}</div>
              </div>

              <div class="section">
                <h3>📅 Submission Details</h3>
                <div class="info-item">
                  <span class="info-label">Submitted on:</span>
                  <span>${new Date(result.submissionDate).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              <p>Generated on ${new Date().toLocaleString()} | EduVision Learning Platform</p>
              <p>This is an automatically generated scorecard</p>
            </div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print()
      toast.success("Scorecard downloaded successfully!")
    }, 500)
  }

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 80) return "text-blue-600"
    if (percentage >= 70) return "text-yellow-600"
    if (percentage >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return "A+"
    if (percentage >= 80) return "A"
    if (percentage >= 70) return "B"
    if (percentage >= 60) return "C"
    return "F"
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Trophy className="h-6 w-6" />
          Assignment Scorecard
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Assignment Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Title:</span>
              <span>{assignment.title}</span>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-green-500" />
              <span className="font-medium">Faculty:</span>
              <span>{assignment.facultyName}</span>
            </div>

            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Language:</span>
              <Badge variant="outline">{assignment.language.toUpperCase()}</Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-orange-500" />
              <span className="font-medium">Given:</span>
              <span>{new Date(assignment.givenDate).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-red-500" />
              <span className="font-medium">Due:</span>
              <span>{new Date(assignment.dueDate).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Total Marks:</span>
              <Badge>{assignment.totalMarks}</Badge>
            </div>
          </div>
        </div>

        {/* Score Display */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Your Score</h3>
          <div className={`text-6xl font-bold mb-2 ${getGradeColor(result.percentage)}`}>{result.score}</div>
          <div className="text-xl text-gray-600 mb-2">out of {assignment.totalMarks}</div>
          <div className="flex items-center justify-center gap-4">
            <Badge className={`text-lg px-4 py-2 ${getGradeColor(result.percentage)}`}>{result.percentage}%</Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Grade: {getGrade(result.percentage)}
            </Badge>
          </div>
        </div>

        {/* Feedback */}
        <div>
          <h4 className="font-semibold mb-3 text-lg">Detailed Feedback:</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm font-mono">{result.feedback}</pre>
          </div>
        </div>

        {/* Download Button */}
        <div className="text-center">
          <Button
            onClick={generatePDF}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Scorecard PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default Scorecard
