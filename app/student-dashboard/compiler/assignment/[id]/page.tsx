"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Square,
  RotateCcw,
  Save,
  Moon,
  Sun,
  AlertTriangle,
  Camera,
  Mic,
  Eye,
  EyeOff,
  Send,
  Sparkles,
  Code,
  Zap,
  Trophy,
  Target,
  Clock,
  CheckCircle,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import AutoMarkingComponent from "@/components/auto-marking"
import Scorecard from "@/components/scorecard"

interface Assignment {
  id: string
  title: string
  description: string
  language: string
  dueDate: string
  allowCopyPaste: boolean
  allowResubmission: boolean
  enableMarking: boolean
  totalMarks: string
  attempts: string
  maxAttempts: string
  rules: string
  facultyName: string
  givenDate: string
}

interface Language {
  id: string
  name: string
  icon: string
  color: string
  version: string
}

const languages: Language[] = [
  { id: "c", name: "C", icon: "🔵", color: "text-blue-600", version: "GCC 9.1.0" },
  { id: "cpp", name: "C++", icon: "🔷", color: "text-blue-700", version: "GCC 9.1.0" },
  { id: "java", name: "Java", icon: "☕", color: "text-orange-600", version: "OpenJDK 13.0.1" },
  { id: "python3", name: "Python", icon: "🐍", color: "text-green-600", version: "3.8.1" },
  { id: "javascript", name: "JavaScript", icon: "🟨", color: "text-yellow-600", version: "Node.js 12.14.0" },
  { id: "typescript", name: "TypeScript", icon: "🔷", color: "text-blue-500", version: "4.1.3" },
  { id: "csharp", name: "C#", icon: "💜", color: "text-purple-600", version: ".NET 5.0" },
  { id: "go", name: "Go", icon: "🐹", color: "text-cyan-600", version: "1.14" },
  { id: "rust", name: "Rust", icon: "🦀", color: "text-orange-700", version: "1.44.0" },
  { id: "kotlin", name: "Kotlin", icon: "🟣", color: "text-purple-500", version: "1.3.70" },
  { id: "swift", name: "Swift", icon: "🍎", color: "text-red-500", version: "5.2" },
  { id: "php", name: "PHP", icon: "🐘", color: "text-indigo-600", version: "7.4" },
  { id: "ruby", name: "Ruby", icon: "💎", color: "text-red-600", version: "2.7" },
  { id: "scala", name: "Scala", icon: "🔴", color: "text-red-500", version: "2.13" },
  { id: "perl", name: "Perl", icon: "🐪", color: "text-blue-500", version: "5.30" },
  { id: "bash", name: "Bash", icon: "🖥️", color: "text-gray-600", version: "5.0" },
  { id: "sql", name: "SQL", icon: "🗃️", color: "text-blue-400", version: "MySQL 8.0" },
  { id: "r", name: "R", icon: "📊", color: "text-blue-300", version: "4.0" },
]

export default function StudentAssignmentCompilerPage({ params }: { params: { id: string } }) {
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [submissionCount, setSubmissionCount] = useState(0)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState("")
  const [copyAttempts, setCopyAttempts] = useState(0)
  const [showScorecard, setShowScorecard] = useState(false)
  const [evaluationResult, setEvaluationResult] = useState<any>(null)

  // Camera and Microphone states
  const [isProctored, setIsProctored] = useState(false)
  const [faceDetected, setFaceDetected] = useState(true)
  const [voiceDetected, setVoiceDetected] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [warnings, setWarnings] = useState(0)
  const [isMonitoring, setIsMonitoring] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const lastFaceCheckRef = useRef<number>(Date.now())
  const voiceThresholdRef = useRef<number>(0)

  // Language mapping for faculty selection to JDoodle ID
  const languageIdMap: Record<string, string> = {
    'Java': 'java', 'Python': 'python3', 'C++': 'cpp', 'C': 'c',
    'JavaScript': 'javascript', 'TypeScript': 'typescript', 'C#': 'csharp',
    'Go': 'go', 'Rust': 'rust', 'Kotlin': 'kotlin', 'Swift': 'swift',
    'PHP': 'php', 'Ruby': 'ruby', 'Scala': 'scala', 'Perl': 'perl',
    'Bash': 'bash', 'SQL': 'sql', 'R': 'r'
  }

  // Fetch assignment from Supabase
  useEffect(() => {
    loadAssignment()
  }, [params.id])

  const loadAssignment = async () => {
    try {
      const response = await fetch(`/api/compiler/assignments/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setAssignment(data)
      } else {
        toast.error("Failed to load assignment")
      }
    } catch (error) {
      console.error("Error loading assignment:", error)
      toast.error("Error loading assignment")
    } finally {
      setLoading(false)
    }
  }

  // Get locked language from assignment
  const selectedLanguage = assignment ? (languages.find((lang) => lang.id === languageIdMap[assignment.language]) || languages[0]) : null

  // Initialize proctoring for assignments
  useEffect(() => {
    setIsProctored(true)
    initializeProctoring()
  }, [])

  const initializeProctoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      setCameraStream(stream)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
        }
      }

      // Initialize audio analysis
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)

      analyser.smoothingTimeConstant = 0.3
      analyser.fftSize = 2048
      analyser.minDecibels = -90
      analyser.maxDecibels = -10

      microphone.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      // Calibrate voice threshold after 2 seconds
      setTimeout(() => {
        calibrateVoiceThreshold()
      }, 2000)

      // Start monitoring
      setIsMonitoring(true)
      startMonitoring()

      toast.success("Camera and microphone initialized successfully")
    } catch (error) {
      console.error("Failed to initialize proctoring:", error)
      toast.error("Failed to access camera/microphone. Please check permissions.")
    }
  }

  const calibrateVoiceThreshold = () => {
    if (analyserRef.current) {
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      // Take multiple samples for better calibration
      let totalAverage = 0
      const samples = 10

      for (let i = 0; i < samples; i++) {
        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / bufferLength
        totalAverage += average
      }

      const ambientLevel = totalAverage / samples
      voiceThresholdRef.current = ambientLevel + 20 // Set threshold above ambient noise

      toast.info(`Voice monitoring calibrated. Ambient level: ${Math.round(ambientLevel)}`)
    }
  }

  const startMonitoring = () => {
    const checkAudio = () => {
      if (analyserRef.current && isMonitoring) {
        const bufferLength = analyserRef.current.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyserRef.current.getByteFrequencyData(dataArray)

        const average = dataArray.reduce((a, b) => a + b) / bufferLength
        const volume = Math.max(...dataArray)

        // More sensitive voice detection
        if (volume > voiceThresholdRef.current && average > voiceThresholdRef.current * 0.7) {
          if (!voiceDetected) {
            setVoiceDetected(true)
            handleWarning("Voice detected! Please remain silent during the assignment.")

            // Reset voice detection after 2 seconds
            setTimeout(() => {
              setVoiceDetected(false)
            }, 2000)
          }
        }
      }

      if (isMonitoring) {
        requestAnimationFrame(checkAudio)
      }
    }

    const checkFace = () => {
      if (videoRef.current && canvasRef.current && isMonitoring) {
        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")

        if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx.drawImage(video, 0, 0)

          // Enhanced face detection
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          let skinPixels = 0
          let brightPixels = 0
          const totalPixels = data.length / 4

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]

            // Enhanced skin tone detection
            if (
              r > 95 &&
              g > 40 &&
              b > 20 &&
              Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
              Math.abs(r - g) > 15 &&
              r > g &&
              r > b
            ) {
              skinPixels++
            }

            // Check for sufficient lighting
            const brightness = (r + g + b) / 3
            if (brightness > 50) {
              brightPixels++
            }
          }

          const skinRatio = skinPixels / totalPixels
          const brightRatio = brightPixels / totalPixels
          const facePresent = skinRatio > 0.015 && brightRatio > 0.3

          const now = Date.now()
          if (!facePresent && faceDetected && now - lastFaceCheckRef.current > 3000) {
            setFaceDetected(false)
            handleWarning("Face not detected! Please ensure you're visible to the camera.")
            lastFaceCheckRef.current = now
          } else if (facePresent && !faceDetected) {
            setFaceDetected(true)
            lastFaceCheckRef.current = now
          }
        }
      }

      if (isMonitoring) {
        setTimeout(checkFace, 1500) // Check every 1.5 seconds
      }
    }

    checkAudio()
    checkFace()
  }

  const handleWarning = (message: string) => {
    const newWarnings = warnings + 1
    setWarnings(newWarnings)

    toast.error(`Warning ${newWarnings}/3: ${message}`, {
      duration: 5000,
    })

    if (newWarnings >= 3) {
      toast.error("Session terminated due to multiple violations!")
      setIsMonitoring(false)

      // Stop camera stream
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }

      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = "/student-dashboard/compiler"
      }, 3000)
    }
  }

  // Calculate time remaining
  useEffect(() => {
    if (!assignment) return
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const due = new Date(assignment.dueDate).getTime()
      const distance = due - now

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))

        setTimeRemaining(`${days}d ${hours}h ${minutes}m`)
      } else {
        setTimeRemaining("Expired")
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [assignment?.dueDate])

  // Progress calculation based on code length
  useEffect(() => {
    const codeLength = code.length
    const estimatedProgress = Math.min((codeLength / 500) * 100, 100)
    setProgress(estimatedProgress)
  }, [code])

  // Handle copy-paste restrictions
  const handlePaste = (e: React.ClipboardEvent) => {
    if (!assignment?.allowCopyPaste) {
      e.preventDefault()
      setCopyAttempts((prev) => prev + 1)

      toast.error("Copy paste is not allowed for this assignment!", {
        description: "Please type your code manually.",
        duration: 3000,
      })

      // Show warning animation
      if (textareaRef.current) {
        textareaRef.current.style.border = "2px solid #ef4444"
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.style.border = ""
          }
        }, 1000)
      }

      if (copyAttempts >= 2) {
        toast.error("Multiple copy-paste attempts detected! This may be reported.", {
          duration: 5000,
        })
      }
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value)
  }

  const runCode = async () => {
    if (!code.trim()) {
      toast.error("Please write some code before running")
      return
    }

    if (!selectedLanguage) {
      toast.error("Language not loaded yet")
      return
    }

    setIsRunning(true)
    setOutput("🚀 Running your code...")

    try {
      const response = await fetch("/api/compiler/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: selectedLanguage.id,
          code: code,
        }),
      })

      const result = await response.json()

      if (result.stdout || result.status === 'Accepted') {
        const outputText = result.stdout || result.compile_output || "✅ Program executed successfully (no output)"
        setOutput(outputText)
        toast.success("Code executed successfully!")
      } else {
        setOutput(`❌ Error: ${result.stderr || result.error || "Compilation failed"}`)
        toast.error("Compilation failed")
      }
    } catch (error) {
      setOutput("❌ Error: Failed to execute code")
      toast.error("Failed to execute code")
    } finally {
      setIsRunning(false)
    }
  }

  const handleSubmit = () => {
    if (!code.trim()) {
      toast.error("Please write some code before submitting")
      return
    }

    const maxSubmissions = assignment?.allowResubmission
      ? assignment.attempts === "yes"
        ? Number.parseInt(assignment.maxAttempts || "1")
        : 1
      : 1

    if (submissionCount >= maxSubmissions) {
      toast.error(`Maximum submission limit (${maxSubmissions}) reached`)
      return
    }

    setShowSubmitDialog(true)
  }

  const confirmSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Get current user
      const { createClient } = await import("@supabase/supabase-js")
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("You must be logged in to submit")
        setIsSubmitting(false)
        return
      }

      // Save submission to Supabase for realtime faculty visibility
      const { error } = await supabase
        .from('student_code_submissions')
        .insert({
          student_id: user.id,
          assignment_id: params.id,
          code: code,
          language: selectedLanguage?.id || 'python3',
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })

      if (error) {
        console.error("Submission error:", error)
        toast.error("Failed to submit assignment")
      } else {
        setSubmissionCount((prev) => prev + 1)
        setShowSubmitDialog(false)
        setShowCelebration(true)
        toast.success("Assignment submitted successfully!")
      }
    } catch (error) {
      console.error("Submit error:", error)
      toast.error("Failed to submit assignment")
    } finally {
      setIsSubmitting(false)
    }

    setTimeout(() => {
      setShowCelebration(false)
      // If marking is enabled, show auto-marking
      if (assignment?.enableMarking) {
        // Auto-trigger evaluation after submission
        handleAutoEvaluation()
      }
    }, 3000)
  }

  const handleAutoEvaluation = () => {
    // Simulate auto-evaluation
    setTimeout(() => {
      const mockResult = {
        score: Math.floor(Math.random() * 30) + 70, // 70-100 score
        feedback: `Code Evaluation Report:

✅ Syntax: No syntax errors found.
✅ Runtime: Code executed successfully.
❌ Test Cases: 1 test case(s) failed. (-10 marks)
📊 Code Quality: 8/10 (-4 marks)
⚡ Performance Bonus: Fast execution time (+5 marks)

📈 Final Score: 91 / ${assignment?.totalMarks || '100'} (91%)`,
        submissionDate: new Date().toISOString(),
        studentName: "John Doe",
        percentage: 91,
      }

      setEvaluationResult(mockResult)
      setShowScorecard(true)
    }, 2000)
  }

  const resetCode = () => {
    setCode("")
    setOutput("")
    setProgress(0)
  }

  const saveCode = () => {
    if (!code.trim()) {
      toast.error("No code to save")
      return
    }

    if (assignment?.id) {
      localStorage.setItem(`assignment_${assignment.id}_code`, code)
      toast.success("Code saved locally!")
    }
  }

  // Load saved code on mount
  useEffect(() => {
    if (assignment?.id) {
      const savedCode = localStorage.getItem(`assignment_${assignment.id}_code`)
      if (savedCode) {
        setCode(savedCode)
        toast.info("Previous code loaded from local storage")
      }
    }
  }, [assignment?.id])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [cameraStream])

  const maxSubmissions = assignment?.allowResubmission
    ? assignment.attempts === "yes"
      ? Number.parseInt(assignment.maxAttempts || "1")
      : 1
    : 1

  // Generate line numbers for code editor
  const generateLineNumbers = (codeText: string) => {
    const lines = codeText.split("\n")
    return lines.map((_, index) => index + 1).join("\n")
  }

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900"
      }`}
    >
      {loading || !assignment || !selectedLanguage ? (
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500">Loading assignment...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`border-b p-6 backdrop-blur-sm ${
          isDarkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-white/50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
            >
              <Code className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {assignment.title}
                <Sparkles className="h-5 w-5 text-yellow-500" />
              </h1>
              <div className="flex items-center gap-4 text-sm opacity-75">
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {selectedLanguage.name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {timeRemaining}
                </span>
                {assignment.enableMarking && (
                  <span className="flex items-center gap-1">
                    <Trophy className="h-4 w-4" />
                    {assignment.totalMarks} marks
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isProctored && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Camera className="h-4 w-4" />
                  {faceDetected ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-xs">{faceDetected ? "Face OK" : "No Face"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mic className="h-4 w-4" />
                  <div
                    className={`w-2 h-2 rounded-full ${voiceDetected ? "bg-red-500 animate-pulse" : "bg-green-500"}`}
                  />
                  <span className="text-xs">{voiceDetected ? "Voice!" : "Silent"}</span>
                </div>
                <Badge variant={warnings > 0 ? "destructive" : "secondary"}>Warnings: {warnings}/3</Badge>
              </div>
            )}

            <motion.div whileHover={{ scale: 1.05 }} className="text-center">
              <div className="text-sm font-medium">Progress</div>
              <div className="flex items-center gap-2">
                <Progress value={progress} className="w-20" />
                <span className="text-xs">{Math.round(progress)}%</span>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="text-center">
              <div className="text-sm font-medium">Submissions</div>
              <Badge variant={submissionCount >= maxSubmissions ? "destructive" : "secondary"}>
                {submissionCount}/{maxSubmissions}
              </Badge>
            </motion.div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="relative overflow-hidden"
            >
              <motion.div animate={{ rotate: isDarkMode ? 180 : 0 }} transition={{ duration: 0.5 }}>
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.div>
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Assignment Info Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`w-80 border-r p-6 overflow-y-auto ${
            isDarkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-white/50"
          }`}
        >
          <div className="space-y-6">
            <Card className={isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white/80 backdrop-blur-sm"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Assignment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description:</h4>
                  <p className="text-sm opacity-75">{assignment.description}</p>
                </div>

                {assignment.rules && (
                  <div>
                    <h4 className="font-medium mb-2">Rules:</h4>
                    <p className="text-sm opacity-75">{assignment.rules}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Copy Paste:</span>
                    <Badge variant={assignment.allowCopyPaste ? "secondary" : "destructive"}>
                      {assignment.allowCopyPaste ? "Allowed" : "Disabled"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>Resubmission:</span>
                    <Badge variant={assignment.allowResubmission ? "secondary" : "outline"}>
                      {assignment.allowResubmission ? "Allowed" : "Single Attempt"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white/80 backdrop-blur-sm"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <selectedLanguage.icon className="text-lg" />
                  {selectedLanguage.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">{selectedLanguage.version}</Badge>
              </CardContent>
            </Card>

            {/* Auto-marking component */}
            {assignment?.enableMarking && (
              <AutoMarkingComponent
                submittedCode={code}
                maxMarks={Number.parseInt(assignment?.totalMarks || "100")}
                language={selectedLanguage.name}
                onResult={(marks, feedback, details) => {
                  const result = {
                    score: marks,
                    feedback,
                    submissionDate: new Date().toISOString(),
                    studentName: "John Doe",
                    percentage: Math.round((marks / Number.parseInt(assignment?.totalMarks || "100")) * 100),
                  }
                  setEvaluationResult(result)
                  setShowScorecard(true)
                }}
              />
            )}
          </div>
        </motion.div>

        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border-b p-4 ${isDarkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-white/50"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="text-lg"
                >
                  {selectedLanguage.icon}
                </motion.span>
                <span className="font-medium">{selectedLanguage.name} Editor</span>
              </div>

              <div className="flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="sm" onClick={saveCode}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="sm" onClick={resetCode}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={runCode}
                    disabled={isRunning}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
                    {isRunning ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      >
                        <Square className="h-4 w-4 mr-1" />
                      </motion.div>
                    ) : (
                      <Play className="h-4 w-4 mr-1" />
                    )}
                    {isRunning ? "Running..." : "Run Code"}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <div className="flex-1 flex">
            {/* Code Input with Line Numbers */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 p-4 relative">
              <div className="flex h-full">
                {/* Line Numbers */}
                <div
                  className={`w-12 pr-2 text-right text-sm font-mono leading-6 ${
                    isDarkMode ? "text-gray-500 bg-gray-900" : "text-gray-400 bg-gray-50"
                  } border-r`}
                >
                  <pre className="pt-3 pb-3 px-2">{generateLineNumbers(code || " ")}</pre>
                </div>

                {/* Code Editor */}
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={code}
                    onChange={handleCodeChange}
                    onPaste={handlePaste}
                    className={`w-full h-full font-mono text-sm resize-none border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 leading-6 pt-3 pb-3 ${
                      isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
                    }`}
                    placeholder={`Write your ${selectedLanguage.name} code here...\n\n${!assignment.allowCopyPaste ? "⚠️ Copy-paste is disabled for this assignment" : ""}`}
                    style={{ minHeight: "500px" }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Output Panel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`w-1/2 border-l p-4 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Output
              </h3>
              <div
                className={`h-full p-4 rounded-lg font-mono text-sm whitespace-pre-wrap transition-all duration-300 ${
                  isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-gray-100 border border-gray-200"
                }`}
              >
                {output || "🚀 Run your code to see the magic happen..."}
              </div>
            </motion.div>
          </div>

          {/* Submit Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border-t p-4 ${isDarkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-white/50"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-medium">Submissions remaining:</span>
                  <Badge className="ml-2" variant={submissionCount >= maxSubmissions ? "destructive" : "secondary"}>
                    {maxSubmissions - submissionCount}
                  </Badge>
                </div>

                {assignment.allowResubmission && (
                  <div className="text-sm opacity-75">You can resubmit this assignment</div>
                )}
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSubmit}
                  disabled={submissionCount >= maxSubmissions}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  size="lg"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Assignment
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Camera Feed (for proctored sessions) */}
        {isProctored && isMonitoring && (
          <div className="fixed bottom-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-white shadow-lg z-50">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute top-2 left-2 flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <Badge variant="destructive" className="text-xs">
                LIVE
              </Badge>
            </div>
            <div className="absolute bottom-2 left-2 text-white text-xs">
              {faceDetected ? "✓ Face OK" : "✗ No Face"}
            </div>
            <div className="absolute bottom-2 right-2 text-white text-xs">{voiceDetected ? "🔊" : "🔇"}</div>
          </div>
        )}
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Submit Assignment
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">Are you sure you want to submit your assignment?</p>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <div>Submission #{submissionCount + 1}</div>
              <div>Remaining attempts: {maxSubmissions - submissionCount - 1}</div>
              {assignment.allowResubmission && <div className="text-green-600">✓ You can resubmit if needed</div>}
              {assignment.enableMarking && (
                <div className="text-blue-600">📊 Auto-marking will be performed after submission</div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Confirm Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Scorecard Dialog */}
      <Dialog open={showScorecard} onOpenChange={setShowScorecard}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Assignment Scorecard
            </DialogTitle>
          </DialogHeader>
          {evaluationResult && (
            <Scorecard
              assignment={{
                title: assignment.title,
                facultyName: assignment.facultyName,
                givenDate: assignment.givenDate,
                dueDate: assignment.dueDate,
                description: assignment.description,
                rules: assignment.rules,
                language: selectedLanguage.name,
                totalMarks: Number.parseInt(assignment.totalMarks),
              }}
              result={evaluationResult}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{ duration: 0.5, repeat: 3 }}
              className="bg-white rounded-lg p-8 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Awesome!</h3>
              <p className="text-gray-600">Your assignment has been submitted successfully!</p>
              {assignment.enableMarking && <p className="text-sm text-blue-600 mt-2">Auto-marking in progress...</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copy Paste Warning */}
      {!assignment.allowCopyPaste && copyAttempts > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-4 z-50"
        >
          <Alert className="border-red-500 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Copy-paste detected {copyAttempts} time(s). Please type manually.</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Warning Alert */}
      {warnings > 0 && (
        <div className="fixed top-20 right-4 z-50">
          <Alert className="border-red-500 bg-red-50 animate-pulse">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Warning {warnings}/3: Proctoring violation detected!
              {warnings >= 2 && " Session will terminate after next violation!"}
            </AlertDescription>
          </Alert>
        </div>
      )}
        </>
      )}
    </div>
  )
}
