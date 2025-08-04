"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Play, Square, RotateCcw, Copy, Save, Moon, Sun, AlertTriangle, Camera, Mic, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"

interface Language {
  id: string
  name: string
  icon: string
  color: string
  template: string
  version: string
}

const languages: Language[] = [
  {
    id: "c",
    name: "C",
    icon: "🔵",
    color: "text-blue-600",
    template: "",
    version: "GCC 9.1.0",
  },
  {
    id: "cpp",
    name: "C++",
    icon: "🔷",
    color: "text-blue-700",
    template: "",
    version: "GCC 9.1.0",
  },
  {
    id: "java",
    name: "Java",
    icon: "☕",
    color: "text-orange-600",
    template: "",
    version: "OpenJDK 13.0.1",
  },
  {
    id: "python3",
    name: "Python",
    icon: "🐍",
    color: "text-green-600",
    template: "",
    version: "3.8.1",
  },
  {
    id: "javascript",
    name: "JavaScript",
    icon: "🟨",
    color: "text-yellow-600",
    template: "",
    version: "Node.js 12.14.0",
  },
]

export default function CodeCompilerPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0])
  const [code, setCode] = useState("")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [warnings, setWarnings] = useState(0)
  const [isProctored, setIsProctored] = useState(false)
  const [faceDetected, setFaceDetected] = useState(true)
  const [voiceDetected, setVoiceDetected] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const lastFaceCheckRef = useRef<number>(Date.now())
  const voiceThresholdRef = useRef<number>(0)

  useEffect(() => {
    // Check if this is a proctored session
    const urlParams = new URLSearchParams(window.location.search)
    const assignmentId = urlParams.get("assignment")
    if (assignmentId) {
      setIsProctored(true)
      initializeProctoring()
    }
  }, [])

  const initializeProctoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: { echoCancellation: false, noiseSuppression: false },
      })

      setCameraStream(stream)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      // Initialize audio analysis
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)

      analyser.smoothingTimeConstant = 0.3
      analyser.fftSize = 2048

      microphone.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      // Calibrate voice threshold
      setTimeout(() => {
        calibrateVoiceThreshold()
      }, 2000)

      // Start monitoring
      setIsMonitoring(true)
      startMonitoring()

      toast.success("Proctoring initialized successfully")
    } catch (error) {
      toast.error("Failed to initialize proctoring")
    }
  }

  const calibrateVoiceThreshold = () => {
    if (analyserRef.current) {
      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      analyserRef.current.getByteFrequencyData(dataArray)

      const average = dataArray.reduce((a, b) => a + b) / bufferLength
      voiceThresholdRef.current = average + 15 // Set threshold above ambient noise

      toast.info("Voice calibration complete. Please remain silent during the exam.")
    }
  }

  const startMonitoring = () => {
    const checkAudio = () => {
      if (analyserRef.current && isMonitoring) {
        const bufferLength = analyserRef.current.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyserRef.current.getByteFrequencyData(dataArray)

        const average = dataArray.reduce((a, b) => a + b) / bufferLength

        if (average > voiceThresholdRef.current) {
          if (!voiceDetected) {
            setVoiceDetected(true)
            handleWarning("Voice detected! Please remain silent during the exam.")

            // Reset voice detection after 3 seconds
            setTimeout(() => {
              setVoiceDetected(false)
            }, 3000)
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

          // Enhanced face detection logic
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const data = imageData.data

          // Simple face detection based on skin tone and movement
          let skinPixels = 0
          const totalPixels = data.length / 4

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]
            const g = data[i + 1]
            const b = data[i + 2]

            // Simple skin tone detection
            if (r > 95 && g > 40 && b > 20 && r > g && r > b && r - g > 15) {
              skinPixels++
            }
          }

          const skinRatio = skinPixels / totalPixels
          const facePresent = skinRatio > 0.02 // Threshold for face detection

          const now = Date.now()
          if (!facePresent && faceDetected && now - lastFaceCheckRef.current > 2000) {
            setFaceDetected(false)
            handleWarning("Face not detected! Please look at the camera.")
            lastFaceCheckRef.current = now
          } else if (facePresent && !faceDetected) {
            setFaceDetected(true)
            lastFaceCheckRef.current = now
          }
        }
      }

      if (isMonitoring) {
        setTimeout(checkFace, 1000) // Check every second
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

  const handleLanguageChange = (languageId: string) => {
    const language = languages.find((lang) => lang.id === languageId)
    if (language) {
      setSelectedLanguage(language)
      setCode("") // Clear code when changing language
    }
  }

  const runCode = async () => {
    if (!code.trim()) {
      toast.error("Please write some code before running")
      return
    }

    setIsRunning(true)
    setOutput("Running...")

    try {
      const response = await fetch("/api/compile", {
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

      if (result.success) {
        setOutput(result.output || "Program executed successfully (no output)")
      } else {
        setOutput(`Error: ${result.error || "Compilation failed"}`)
      }
    } catch (error) {
      setOutput("Error: Failed to execute code")
    } finally {
      setIsRunning(false)
    }
  }

  const resetCode = () => {
    setCode("")
    setOutput("")
  }

  const copyCode = () => {
    if (!code.trim()) {
      toast.error("No code to copy")
      return
    }
    navigator.clipboard.writeText(code)
    toast.success("Code copied to clipboard!")
  }

  const saveCode = () => {
    if (!code.trim()) {
      toast.error("No code to save")
      return
    }
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `code.${selectedLanguage.id === "cpp" ? "cpp" : selectedLanguage.id}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Code saved!")
  }

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

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className={`border-b p-4 ${isDarkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Code Compiler</h1>
            {isProctored && (
              <Badge variant="destructive" className="animate-pulse">
                Proctored Session
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
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

            <Button variant="outline" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Language Selection Panel */}
        <div className={`w-64 border-r p-4 ${isDarkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
          <h3 className="font-semibold mb-4">Languages</h3>
          <div className="space-y-2">
            {languages.map((language) => (
              <motion.div key={language.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant={selectedLanguage.id === language.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleLanguageChange(language.id)}
                >
                  <span className="mr-2 text-lg">{language.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{language.name}</div>
                    <div className="text-xs opacity-70">{language.version}</div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex flex-col">
          <div className={`border-b p-4 ${isDarkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedLanguage.icon}</span>
                <span className="font-medium">{selectedLanguage.name}</span>
                <Badge variant="outline">{selectedLanguage.version}</Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={copyCode}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={saveCode}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={resetCode}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
                <Button onClick={runCode} disabled={isRunning}>
                  {isRunning ? <Square className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                  {isRunning ? "Running..." : "Run"}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 flex">
            {/* Code Input */}
            <div className="flex-1 p-4">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={`w-full h-full font-mono text-sm resize-none ${
                  isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
                }`}
                placeholder={`Write your ${selectedLanguage.name} code here...`}
                style={{ minHeight: "500px" }}
              />
            </div>

            {/* Output Panel */}
            <div className={`w-1/2 border-l p-4 ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
              <h3 className="font-semibold mb-4">Output</h3>
              <div
                className={`h-full p-4 rounded-lg font-mono text-sm whitespace-pre-wrap ${
                  isDarkMode ? "bg-gray-900 border border-gray-700" : "bg-gray-100 border border-gray-200"
                }`}
              >
                {output || "Run your code to see the output..."}
              </div>
            </div>
          </div>
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
          </div>
        )}
      </div>

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
    </div>
  )
}
