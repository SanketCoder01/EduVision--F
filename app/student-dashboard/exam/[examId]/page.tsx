"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  Play,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Save,
  Send,
  Camera,
  Mic,
  Shield,
  Clock,
  AlertTriangle,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Code,
  Terminal
} from "lucide-react"

interface Question {
  id: number
  title: string
  description: string
  inputFormat: string
  outputFormat: string
  constraints: string
  sampleInput: string
  sampleOutput: string
  marks: number
  timeLimit: string
}

interface ExamData {
  id: string
  title: string
  language: string
  duration: number
  questions: Question[]
  startTime: string
  endTime: string
}

export default function StudentExamInterface() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [code, setCode] = useState<string[]>([])
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(7200) // 2 hours in seconds
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showPermissionDialog, setShowPermissionDialog] = useState(true)
  const [cameraPermission, setCameraPermission] = useState(false)
  const [micPermission, setMicPermission] = useState(false)
  const [warnings, setWarnings] = useState(0)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [tabSwitches, setTabSwitches] = useState(0)
  const [examStarted, setExamStarted] = useState(false)

  // Mock exam data
  const [examData] = useState<ExamData>({
    id: params.examId as string,
    title: "Java Programming Exam",
    language: "Java",
    duration: 120,
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    questions: [
      {
        id: 1,
        title: "Array Sum",
        description: "Write a program to find the sum of all elements in an array.",
        inputFormat: "First line contains n (size of array), followed by n integers.",
        outputFormat: "Print the sum of all elements.",
        constraints: "1 ≤ n ≤ 1000, 1 ≤ arr[i] ≤ 100",
        sampleInput: "5\n1 2 3 4 5",
        sampleOutput: "15",
        marks: 20,
        timeLimit: "30 minutes"
      },
      {
        id: 2,
        title: "String Reversal",
        description: "Write a program to reverse a given string without using built-in functions.",
        inputFormat: "A single line containing a string.",
        outputFormat: "Print the reversed string.",
        constraints: "1 ≤ length ≤ 1000",
        sampleInput: "hello",
        sampleOutput: "olleh",
        marks: 25,
        timeLimit: "25 minutes"
      },
      {
        id: 3,
        title: "Prime Number Check",
        description: "Write a program to check if a given number is prime or not.",
        inputFormat: "A single integer n.",
        outputFormat: "Print 'Prime' if the number is prime, otherwise 'Not Prime'.",
        constraints: "1 ≤ n ≤ 10^6",
        sampleInput: "17",
        sampleOutput: "Prime",
        marks: 30,
        timeLimit: "35 minutes"
      }
    ]
  })

  // Initialize code arrays for each question
  useEffect(() => {
    const initialCode = examData.questions.map(() => getBoilerplateCode(examData.language))
    setCode(initialCode)
  }, [examData])

  // Timer countdown
  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [examStarted, timeLeft])

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && examStarted) {
        setTabSwitches(prev => prev + 1)
        setWarnings(prev => prev + 1)
        toast({
          title: "Warning!",
          description: "Tab switching detected. This has been recorded.",
          variant: "destructive"
        })
        
        if (tabSwitches >= 3) {
          toast({
            title: "Exam Auto-Submitted",
            description: "Too many tab switches detected. Exam has been submitted automatically.",
            variant: "destructive"
          })
          handleSubmitExam()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [examStarted, tabSwitches])

  const getBoilerplateCode = (language: string) => {
    switch (language) {
      case 'Java':
        return `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        // Your code here
        
        sc.close();
    }
}`
      case 'Python':
        return `# Your code here
def main():
    pass

if __name__ == "__main__":
    main()`
      case 'C++':
        return `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    // Your code here
    return 0;
}`
      case 'C':
        return `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Your code here
    return 0;
}`
      default:
        return '// Your code here'
    }
  }

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      setCameraPermission(true)
      setMicPermission(true)
      setIsMonitoring(true)
      setShowPermissionDialog(false)
      setExamStarted(true)
      
      toast({
        title: "Permissions Granted",
        description: "Camera and microphone access granted. Monitoring started.",
      })
    } catch (error) {
      toast({
        title: "Permission Denied",
        description: "Camera and microphone access is required to take the exam.",
        variant: "destructive"
      })
    }
  }

  const runCode = async () => {
    setIsRunning(true)
    setOutput("Compiling and running your code...")
    
    // Simulate code execution
    setTimeout(() => {
      const currentCode = code[currentQuestion]
      if (currentCode.includes('// Your code here') || currentCode.trim() === getBoilerplateCode(examData.language).trim()) {
        setOutput("Error: Please write your solution before running.")
      } else {
        // Mock successful execution
        setOutput(`Compilation successful!\n\nInput:\n${examData.questions[currentQuestion].sampleInput}\n\nOutput:\n${examData.questions[currentQuestion].sampleOutput}\n\nExecution time: 0.12s\nMemory used: 2.1 MB`)
      }
      setIsRunning(false)
    }, 2000)
  }

  const resetCode = () => {
    const newCode = [...code]
    newCode[currentQuestion] = getBoilerplateCode(examData.language)
    setCode(newCode)
    setOutput("")
    toast({
      title: "Code Reset",
      description: "Code has been reset to boilerplate."
    })
  }

  const saveCode = () => {
    // Auto-save functionality
    localStorage.setItem(`exam_${examData.id}_question_${currentQuestion}`, code[currentQuestion])
    toast({
      title: "Code Saved",
      description: "Your code has been saved automatically."
    })
  }

  const nextQuestion = () => {
    if (currentQuestion < examData.questions.length - 1) {
      saveCode()
      setCurrentQuestion(currentQuestion + 1)
      setOutput("")
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      saveCode()
      setCurrentQuestion(currentQuestion - 1)
      setOutput("")
    }
  }

  const handleSubmitExam = () => {
    // Save all code and submit
    examData.questions.forEach((_, index) => {
      localStorage.setItem(`exam_${examData.id}_question_${index}`, code[index] || '')
    })
    
    toast({
      title: "Exam Submitted",
      description: "Your exam has been submitted successfully."
    })
    
    router.push('/student-dashboard')
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Permission Dialog */}
      <Dialog open={showPermissionDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Exam Permissions Required
            </DialogTitle>
            <DialogDescription>
              This exam requires camera and microphone access for monitoring purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Camera className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Camera Access</p>
                <p className="text-xs text-blue-700">Required for identity verification</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Mic className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Microphone Access</p>
                <p className="text-xs text-green-700">Required for audio monitoring</p>
              </div>
            </div>
            <Button 
              onClick={requestPermissions}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Grant Permissions & Start Exam
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {examStarted && (
        <>
          {/* Header */}
          <div className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold">{examData.title}</h1>
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  {examData.language}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Timer */}
                <div className="flex items-center gap-2 bg-red-600 px-3 py-1 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
                </div>
                
                {/* Monitoring Status */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${cameraPermission ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <Camera className="w-4 h-4" />
                  <div className={`w-2 h-2 rounded-full ${micPermission ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <Mic className="w-4 h-4" />
                </div>
                
                {/* Warnings */}
                {warnings > 0 && (
                  <div className="flex items-center gap-2 bg-yellow-600 px-2 py-1 rounded">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">{warnings} warnings</span>
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex h-[calc(100vh-80px)]">
            {/* Question Panel */}
            <div className="w-1/3 bg-gray-800 border-r border-gray-700 overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">
                    Question {currentQuestion + 1} of {examData.questions.length}
                  </h2>
                  <Badge className="bg-purple-600">
                    {examData.questions[currentQuestion].marks} marks
                  </Badge>
                </div>
                
                <Card className="bg-gray-700 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white">
                      {examData.questions[currentQuestion].title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-gray-300">
                    <div>
                      <h4 className="font-medium text-white mb-2">Problem Statement:</h4>
                      <p className="text-sm">{examData.questions[currentQuestion].description}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-white mb-2">Input Format:</h4>
                      <p className="text-sm">{examData.questions[currentQuestion].inputFormat}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-white mb-2">Output Format:</h4>
                      <p className="text-sm">{examData.questions[currentQuestion].outputFormat}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-white mb-2">Constraints:</h4>
                      <p className="text-sm">{examData.questions[currentQuestion].constraints}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-white mb-2">Sample Input:</h4>
                        <pre className="text-sm bg-gray-800 p-2 rounded border text-green-400">
                          {examData.questions[currentQuestion].sampleInput}
                        </pre>
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-2">Sample Output:</h4>
                        <pre className="text-sm bg-gray-800 p-2 rounded border text-blue-400">
                          {examData.questions[currentQuestion].sampleOutput}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Question Navigation */}
                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={previousQuestion}
                    disabled={currentQuestion === 0}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={nextQuestion}
                    disabled={currentQuestion === examData.questions.length - 1}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Code Editor and Output */}
            <div className="flex-1 flex flex-col">
              {/* Code Editor */}
              <div className="flex-1 bg-gray-900">
                <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    <span className="text-sm">Solution.{examData.language.toLowerCase()}</span>
                    <Badge variant="outline" className="text-xs">
                      {examData.language} (Locked)
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={saveCode}
                      className="text-gray-300 hover:bg-gray-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetCode}
                      className="text-gray-300 hover:bg-gray-700"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    <Button
                      onClick={runCode}
                      disabled={isRunning}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {isRunning ? 'Running...' : 'Run Code'}
                    </Button>
                  </div>
                </div>
                
                <textarea
                  value={code[currentQuestion] || ''}
                  onChange={(e) => {
                    const newCode = [...code]
                    newCode[currentQuestion] = e.target.value
                    setCode(newCode)
                  }}
                  className="w-full h-full bg-gray-900 text-gray-100 p-4 font-mono text-sm resize-none outline-none"
                  style={{ minHeight: '400px' }}
                  placeholder="Write your code here..."
                />
              </div>

              {/* Output Panel */}
              <div className="h-64 bg-gray-800 border-t border-gray-700">
                <div className="flex items-center gap-2 bg-gray-700 px-4 py-2">
                  <Terminal className="w-4 h-4" />
                  <span className="text-sm">Output</span>
                </div>
                <pre className="p-4 text-sm text-gray-300 h-full overflow-auto">
                  {output || 'Click "Run Code" to see the output...'}
                </pre>
              </div>
            </div>

            {/* Monitoring Panel */}
            <div className="w-64 bg-gray-800 border-l border-gray-700 p-4">
              <h3 className="text-lg font-semibold mb-4">Monitoring</h3>
              
              {/* Camera Feed */}
              <div className="mb-4">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-32 bg-gray-700 rounded-lg object-cover"
                />
                <p className="text-xs text-gray-400 mt-1">Live monitoring active</p>
              </div>
              
              {/* Stats */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Tab Switches:</span>
                  <span className={tabSwitches > 2 ? 'text-red-400' : 'text-gray-300'}>{tabSwitches}/3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Warnings:</span>
                  <span className={warnings > 0 ? 'text-yellow-400' : 'text-gray-300'}>{warnings}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Questions:</span>
                  <span className="text-gray-300">{currentQuestion + 1}/{examData.questions.length}</span>
                </div>
              </div>
              
              {/* Submit Button */}
              <Button
                onClick={handleSubmitExam}
                className="w-full mt-6 bg-red-600 hover:bg-red-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Exam
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
