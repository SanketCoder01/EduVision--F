"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, CheckCircle, AlertCircle, RotateCcw, User } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface EnhancedFaceCaptureProps {
  onCapture: (imageData: string) => void
  onBack: () => void
  userType: 'student' | 'faculty'
  userName: string
}

export default function EnhancedFaceCapture({ onCapture, onBack, userType, userName }: EnhancedFaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [faceCount, setFaceCount] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<string[]>(['Position your face in the center of the frame'])
  const [qualityScore, setQualityScore] = useState(0)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  useEffect(() => {
    let intervalId: NodeJS.Timeout
    if (isStreaming && !capturedImage) {
      intervalId = setInterval(detectFace, 500) // Check twice per second
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isStreaming, capturedImage])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user',
          frameRate: { ideal: 30 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsStreaming(true)
        toast({
          title: 'Camera Ready',
          description: 'Position your face in the center for best results.',
        })
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions and try again.',
        variant: 'destructive'
      })
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsStreaming(false)
  }

  const detectFace = () => {
    if (!videoRef.current || capturedImage || !isStreaming) return
    
    const video = videoRef.current
    if (video.videoWidth === 0 || video.videoHeight === 0) return

    // Create temporary canvas for face detection
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    if (!tempCtx) return

    tempCanvas.width = video.videoWidth
    tempCanvas.height = video.videoHeight
    tempCtx.drawImage(video, 0, 0)

    // Get image data for analysis
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
    const brightness = calculateBrightness(imageData)
    const centerRegion = getCenterRegion(imageData)
    
    // Simulate face detection (in production, use face-api.js or similar)
    const hasGoodLighting = brightness > 50 && brightness < 200
    const isCentered = centerRegion.brightness > brightness * 0.8
    const isStable = faceCount > 5 // Require stable detection
    
    let newFeedback: string[] = []
    let newQualityScore = 0
    
    if (!hasGoodLighting) {
      if (brightness < 50) {
        newFeedback.push('⚡ Increase lighting - too dark')
      } else {
        newFeedback.push('⚡ Reduce lighting - too bright')
      }
    } else {
      newQualityScore += 30
    }
    
    if (!isCentered) {
      newFeedback.push('📍 Center your face in the frame')
    } else {
      newQualityScore += 30
    }
    
    if (isStable) {
      newQualityScore += 40
      newFeedback.push('✅ Face detected - hold steady')
    } else {
      newFeedback.push('👤 Keep your face visible and still')
    }

    if (hasGoodLighting && isCentered) {
      setFaceCount(prev => prev + 1)
      setFaceDetected(true)
      
      if (isStable && !countdown) {
        startCountdown()
      }
    } else {
      setFaceCount(0)
      setFaceDetected(false)
    }

    setFeedback(newFeedback)
    setQualityScore(newQualityScore)
  }

  const calculateBrightness = (imageData: ImageData): number => {
    const data = imageData.data
    let brightness = 0
    for (let i = 0; i < data.length; i += 4) {
      brightness += (data[i] + data[i + 1] + data[i + 2]) / 3
    }
    return brightness / (data.length / 4)
  }

  const getCenterRegion = (imageData: ImageData) => {
    const { width, height, data } = imageData
    const centerX = Math.floor(width / 2)
    const centerY = Math.floor(height / 2)
    const regionSize = Math.min(width, height) / 4
    
    let brightness = 0
    let pixelCount = 0
    
    for (let y = centerY - regionSize; y < centerY + regionSize; y++) {
      for (let x = centerX - regionSize; x < centerX + regionSize; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const index = (y * width + x) * 4
          brightness += (data[index] + data[index + 1] + data[index + 2]) / 3
          pixelCount++
        }
      }
    }
    
    return { brightness: pixelCount > 0 ? brightness / pixelCount : 0 }
  }

  const startCountdown = () => {
    let count = 3
    setCountdown(count)
    
    const countdownInterval = setInterval(() => {
      count--
      setCountdown(count)
      
      if (count === 0) {
        clearInterval(countdownInterval)
        setCountdown(null)
        handleAutoCapture()
      }
    }, 1000)
  }

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return null
    
    // Set high quality capture
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    // Draw video frame
    ctx.drawImage(video, 0, 0)
    
    // Add overlay information
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(10, 10, 300, 80)
    ctx.fillStyle = 'white'
    ctx.font = '16px Arial'
    ctx.fillText(`${userType.toUpperCase()}: ${userName}`, 20, 35)
    ctx.fillText(`Captured: ${new Date().toLocaleString()}`, 20, 55)
    ctx.fillText(`Quality Score: ${qualityScore}%`, 20, 75)
    
    return canvas.toDataURL('image/jpeg', 0.9)
  }

  const handleAutoCapture = () => {
    const frameData = captureFrame()
    if (frameData) {
      setCapturedImage(frameData)
      toast({
        title: 'Auto Capture Success!',
        description: `High-quality image captured with ${qualityScore}% quality score.`,
      })
    }
  }

  const handleManualCapture = () => {
    const frameData = captureFrame()
    if (frameData) {
      setCapturedImage(frameData)
      toast({
        title: 'Manual Capture Success!',
        description: 'Image captured successfully.',
      })
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setFeedback(['Position your face in the center of the frame'])
    setFaceDetected(false)
    setFaceCount(0)
    setCountdown(null)
    setQualityScore(0)
  }

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="backdrop-blur-sm bg-white/90 shadow-xl border-0">
            <CardHeader className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto"
              >
                <Camera className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl">Enhanced Face Capture</CardTitle>
              <CardDescription>
                {userType === 'student' ? 'Student' : 'Faculty'} Registration: {userName}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Camera Feed */}
              <div className="relative">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative">
                  {!capturedImage ? (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                      <canvas
                        ref={canvasRef}
                        className="hidden"
                      />
                      
                      {/* Face Detection Overlay */}
                      {faceDetected && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="w-64 h-64 border-4 border-green-500 rounded-full animate-pulse" />
                        </motion.div>
                      )}
                      
                      {/* Countdown Overlay */}
                      {countdown && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute inset-0 flex items-center justify-center bg-black/50"
                        >
                          <div className="text-white text-8xl font-bold">
                            {countdown}
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Quality Score */}
                      <div className="absolute top-2 left-2">
                        <div className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          Quality: {qualityScore}%
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={capturedImage}
                      alt="Captured face"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                
                {/* Status Indicator */}
                <div className="absolute top-2 right-2">
                  {faceDetected ? (
                    <div className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Face Detected ({faceCount})
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
                      <AlertCircle className="w-4 h-4" />
                      Position Face
                    </div>
                  )}
                </div>
              </div>
              
              {/* Feedback */}
              {feedback.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Live Feedback:</h4>
                  <ul className="space-y-1">
                    {feedback.map((message, index) => (
                      <li key={index} className="text-blue-800 text-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        {message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-4">
                {!capturedImage ? (
                  <>
                    <Button
                      onClick={handleManualCapture}
                      disabled={!isStreaming}
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Manual Capture
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onBack}
                      className="px-6 h-12"
                    >
                      Back
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleRetake}
                      variant="outline"
                      className="flex-1 h-12"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Retake Photo
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      className="flex-1 h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm & Submit
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
