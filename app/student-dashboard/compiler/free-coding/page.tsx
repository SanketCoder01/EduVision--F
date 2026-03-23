"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Code, Sparkles, Save } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import CodeEditor from "@/components/compiler/CodeEditor"

const LANGUAGES = [
  { id: 'c', name: 'C' },
  { id: 'cpp', name: 'C++' },
  { id: 'python3', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'go', name: 'Go' },
  { id: 'typescript', name: 'TypeScript' },
]

export default function FreeCodingPage() {
  const { toast } = useToast()
  const [studentId, setStudentId] = useState<string>("")

  useEffect(() => {
    loadStudentData()
  }, [])

  const loadStudentData = async () => {
    try {
      const studentSession = localStorage.getItem("studentSession")
      if (studentSession) {
        const user = JSON.parse(studentSession)
        setStudentId(user.id)
      }
    } catch (error) {
      console.error("Error loading student:", error)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Code className="w-6 h-6 text-white" />
            <div>
              <h1 className="text-white font-semibold">Free Coding</h1>
              <p className="text-green-100 text-sm">Practice coding without limits</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              Auto-save enabled
            </Badge>
          </div>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1">
        <CodeEditor
          sessionType="free_coding"
          initialLanguage="python3"
        />
      </div>
    </div>
  )
}
