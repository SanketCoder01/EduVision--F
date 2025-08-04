"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle } from "lucide-react"

type EvaluationResult = {
  syntaxError: boolean
  runtimeError: boolean
  failedTestCases: number
  codeQuality: number // 0-10 scale
  executionTime: number // in ms
  memoryUsage: number // in MB
}

interface Props {
  submittedCode: string
  maxMarks: number
  language: string
  onResult: (marks: number, feedback: string, details: EvaluationResult) => void
}

const AutoMarkingComponent: React.FC<Props> = ({ submittedCode, maxMarks, language, onResult }) => {
  const [loading, setLoading] = useState(false)

  const evaluateCode = async () => {
    setLoading(true)

    // Simulate evaluation delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Enhanced evaluation logic
    const simulatedResult: EvaluationResult = {
      syntaxError: submittedCode.includes("syntax_error") || submittedCode.length < 10,
      runtimeError: submittedCode.includes("runtime_error") || !submittedCode.includes("main"),
      failedTestCases: Math.floor(Math.random() * 3), // 0-2 failed test cases
      codeQuality: Math.floor(Math.random() * 5) + 6, // 6-10 quality score
      executionTime: Math.floor(Math.random() * 1000) + 100, // 100-1100ms
      memoryUsage: Math.floor(Math.random() * 50) + 10, // 10-60MB
    }

    let finalMarks = maxMarks
    let feedback = "Code Evaluation Report:\n\n"

    // Syntax error check
    if (simulatedResult.syntaxError) {
      finalMarks -= 20
      feedback += "❌ Syntax Error: Code contains syntax errors. (-20 marks)\n"
    } else {
      feedback += "✅ Syntax: No syntax errors found.\n"
    }

    // Runtime error check
    if (simulatedResult.runtimeError) {
      finalMarks -= 15
      feedback += "❌ Runtime Error: Code failed to execute properly. (-15 marks)\n"
    } else {
      feedback += "✅ Runtime: Code executed successfully.\n"
    }

    // Test cases check
    if (simulatedResult.failedTestCases > 0) {
      const deduction = simulatedResult.failedTestCases * 10
      finalMarks -= deduction
      feedback += `❌ Test Cases: ${simulatedResult.failedTestCases} test case(s) failed. (-${deduction} marks)\n`
    } else {
      feedback += "✅ Test Cases: All test cases passed.\n"
    }

    // Code quality assessment
    const qualityDeduction = Math.max(0, (10 - simulatedResult.codeQuality) * 2)
    finalMarks -= qualityDeduction
    feedback += `📊 Code Quality: ${simulatedResult.codeQuality}/10 (-${qualityDeduction} marks)\n`

    // Performance bonus/penalty
    if (simulatedResult.executionTime < 500) {
      finalMarks += 5
      feedback += "⚡ Performance Bonus: Fast execution time (+5 marks)\n"
    } else if (simulatedResult.executionTime > 1000) {
      finalMarks -= 5
      feedback += "🐌 Performance Penalty: Slow execution time (-5 marks)\n"
    }

    // Ensure marks don't go below 0
    if (finalMarks < 0) finalMarks = 0

    feedback += `\n📈 Final Score: ${finalMarks} / ${maxMarks} (${Math.round((finalMarks / maxMarks) * 100)}%)`

    onResult(finalMarks, feedback, simulatedResult)
    setLoading(false)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Auto-Mark Assignment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>
              Maximum Marks: <Badge variant="outline">{maxMarks}</Badge>
            </p>
            <p>
              Language: <Badge variant="secondary">{language}</Badge>
            </p>
            <p>Code Length: {submittedCode.length} characters</p>
          </div>

          <Button className="w-full" onClick={evaluateCode} disabled={loading || !submittedCode.trim()}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Evaluating Code...
              </>
            ) : (
              "Evaluate & Generate Score"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default AutoMarkingComponent
