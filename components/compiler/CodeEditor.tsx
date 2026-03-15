"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import Editor from "@monaco-editor/react"
import { Play, RotateCcw, Save, Download, Upload, Clock, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

interface CodeEditorProps {
  sessionType: 'assignment' | 'exam' | 'free_coding'
  sessionId?: string
  initialLanguage?: string
  initialCode?: string
  readOnly?: boolean
  showTimer?: boolean
  timeLimit?: number // in minutes
  onCodeChange?: (code: string) => void
  onSubmit?: (code: string, output: string) => void
}

const LANGUAGES = [
  { id: 'c', name: 'C', monaco: 'c', template: `#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}` },
  { id: 'cpp', name: 'C++', monaco: 'cpp', template: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello World" << endl;\n    return 0;\n}` },
  { id: 'python3', name: 'Python', monaco: 'python', template: `# Python program\nprint("Hello World")` },
  { id: 'java', name: 'Java', monaco: 'java', template: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}` },
  { id: 'javascript', name: 'JavaScript', monaco: 'javascript', template: `// JavaScript program\nconsole.log("Hello World");` },
  { id: 'go', name: 'Go', monaco: 'go', template: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World")\n}` },
  { id: 'typescript', name: 'TypeScript', monaco: 'typescript', template: `// TypeScript program\nconsole.log("Hello World");` },
]

export default function CodeEditor({
  sessionType,
  sessionId,
  initialLanguage = 'python3',
  initialCode = '',
  readOnly = false,
  showTimer = false,
  timeLimit = 60,
  onCodeChange,
  onSubmit
}: CodeEditorProps) {
  const { toast } = useToast()
  const editorRef = useRef<any>(null)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  const [studentId, setStudentId] = useState<string>("")
  const [language, setLanguage] = useState(initialLanguage)
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60)
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')

  // Load student data and saved code
  useEffect(() => {
    loadStudentData()
    loadSavedCode()
  }, [])

  // Timer for exams
  useEffect(() => {
    if (showTimer && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            handleAutoSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [showTimer, timeRemaining])

  // Auto-save when user stops typing for 3 seconds
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    
    autoSaveTimerRef.current = setTimeout(() => {
      if (code && studentId) {
        autoSaveCode()
      }
    }, 3000)

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [code])

  const loadStudentData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setStudentId(user.id)
      }
    } catch (error) {
      console.error("Error loading student:", error)
    }
  }

  const loadSavedCode = async () => {
    if (!sessionId && sessionType === 'free_coding') {
      // Load last free coding session
      const { data } = await supabase
        .from('student_code_sessions')
        .select('*')
        .eq('student_id', studentId)
        .eq('session_type', 'free_coding')
        .order('last_updated', { ascending: false })
        .limit(1)
        .single()
      
      if (data) {
        setCode(data.code || '')
        setLanguage(data.language || 'python3')
      }
    } else if (sessionId) {
      const { data } = await supabase
        .from('student_code_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()
      
      if (data) {
        setCode(data.code || '')
        setLanguage(data.language || 'python3')
      }
    }
  }

  const autoSaveCode = async () => {
    if (!studentId || !code) return
    
    setIsSaving(true)
    try {
      const sessionData = {
        student_id: studentId,
        session_type: sessionType,
        assignment_id: sessionType === 'assignment' ? sessionId : null,
        exam_id: sessionType === 'exam' ? sessionId : null,
        language,
        code,
        last_updated: new Date().toISOString()
      }

      // Upsert the session
      const { error } = await supabase
        .from('student_code_sessions')
        .upsert(sessionData, { onConflict: 'student_id,session_type' })

      if (!error) {
        setLastSaved(new Date())
      }
    } catch (error) {
      console.error("Auto-save error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor
    editor.focus()
  }

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || ''
    setCode(newCode)
    onCodeChange?.(newCode)
  }

  const handleLanguageChange = (langId: string) => {
    const lang = LANGUAGES.find(l => l.id === langId)
    if (lang) {
      setLanguage(langId)
      if (!code) {
        setCode(lang.template)
      }
    }
  }

  const runCode = async () => {
    if (!code.trim()) {
      toast({ title: "Error", description: "Please write some code first", variant: "destructive" })
      return
    }

    setIsRunning(true)
    setExecutionStatus('running')
    setOutput("Running...")

    try {
      const response = await fetch('/api/compiler/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, input: '' })
      })

      const result = await response.json()

      if (result.status === 'Accepted' || result.status === 'Success') {
        setExecutionStatus('success')
        setOutput(result.stdout || 'Program executed successfully with no output.')
      } else {
        setExecutionStatus('error')
        setOutput(result.stderr || result.compile_output || result.error || 'Execution failed')
      }
    } catch (error: any) {
      setExecutionStatus('error')
      setOutput(`Error: ${error.message}`)
    } finally {
      setIsRunning(false)
    }
  }

  const clearCode = () => {
    const lang = LANGUAGES.find(l => l.id === language)
    setCode(lang?.template || '')
    setOutput("")
    setExecutionStatus('idle')
  }

  const saveCode = async () => {
    await autoSaveCode()
    toast({ title: "Saved", description: "Code saved successfully" })
  }

  const handleAutoSubmit = () => {
    autoSaveCode()
    onSubmit?.(code, output)
    toast({ title: "Time's Up!", description: "Your code has been auto-submitted" })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentLang = LANGUAGES.find(l => l.id === language)

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Bar */}
      <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-white text-gray-800 px-3 py-1.5 rounded-md text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>

          {/* Status */}
          <Badge variant="outline" className="text-gray-600 border-gray-300">
            {currentLang?.name} | {code.split('\n').length} lines
          </Badge>

          {/* Auto-save indicator */}
          {isSaving ? (
            <span className="text-yellow-400 text-sm flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Saving...
            </span>
          ) : lastSaved && (
            <span className="text-gray-500 text-sm">Saved {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Timer for exams */}
          {showTimer && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-md ${
              timeRemaining < 300 ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-700'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
            </div>
          )}

          {/* Action Buttons */}
          <Button variant="outline" size="sm" onClick={clearCode} className="text-gray-600 border-gray-300">
            <RotateCcw className="w-4 h-4 mr-1" /> Clear
          </Button>
          <Button variant="outline" size="sm" onClick={saveCode} className="text-gray-600 border-gray-300">
            <Save className="w-4 h-4 mr-1" /> Save
          </Button>
          <Button 
            size="sm" 
            onClick={runCode} 
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isRunning ? (
              <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Running...</>
            ) : (
              <><Play className="w-4 h-4 mr-1" /> Run</>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <Editor
              height="100%"
              language={currentLang?.monaco || 'python'}
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorMount}
              theme="light"
              options={{
                fontSize: 14,
                fontFamily: "'Fira Code', 'Consolas', monospace",
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                wordWrap: 'on',
                lineNumbers: 'on',
                glyphMargin: false,
                folding: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
                renderLineHighlight: 'all',
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                padding: { top: 10 },
                readOnly: readOnly,
                bracketPairColorization: { enabled: true },
                guides: {
                  bracketPairs: true,
                  indentation: true
                }
              }}
            />
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="w-[400px] bg-gray-50 border-l border-gray-300 flex flex-col">
          <div className="px-4 py-2 border-b border-gray-300 flex items-center justify-between">
            <h3 className="text-gray-800 font-medium flex items-center gap-2">
              {executionStatus === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
              {executionStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
              {executionStatus === 'running' && <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />}
              Output
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setOutput("")}
              className="text-gray-500 hover:text-gray-800"
            >
              Clear
            </Button>
          </div>
          <div className="flex-1 p-4 overflow-auto bg-white">
            <pre className={`font-mono text-sm whitespace-pre-wrap ${
              executionStatus === 'error' ? 'text-red-600' : 'text-gray-700'
            }`}>
              {output || 'Run your code to see output here...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
