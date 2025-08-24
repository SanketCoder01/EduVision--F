"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, CheckCircle, AlertCircle, Loader2, RotateCcw } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface PythonFaceCaptureProps {
  onCapture: (imageData: string) => void
  onBack: () => void
}

export default function PythonFaceCapture({ onCapture, onBack }: PythonFaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string[]>([])
  const [faceDetected, setFaceDetected] = useState(false)
  const [autoCapturing, setAutoCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  useEffect(() => {
    let intervalId: NodeJS.Timeout
    if (isStreaming && !capturedImage) {
      intervalId = setInterval(processFrame, 500) // Process every 500ms
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isStreaming, capturedImage])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setIsStreaming(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
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

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return null
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)
    
    return canvas.toDataURL('image/jpeg', 0.8)
  }

  const processFrame = async () => {
    if (isProcessing || capturedImage) return
    
    const frameData = captureFrame()
    if (!frameData) return
    
    try {
      setIsProcessing(true)
      
      const response = await fetch('http://localhost:5000/auto_detect_and_capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: frameData
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setFaceDetected(result.face_detected)
        setFeedback(result.feedback || [])
        
        if (result.should_capture && result.captured) {
          setCapturedImage(result.captured_image)
          setAutoCapturing(false)
          toast({
            title: 'Auto Capture Success!',
            description: 'Face detected and captured automatically.',
          })
        } else if (result.face_detected && result.feedback.includes("Perfect! Capturing image...")) {
          setAutoCapturing(true)
        }
      }
    } catch (error) {
      console.error('Error processing frame:', error)
      setFeedback(['Unable to connect to face detection service'])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleManualCapture = async () => {
    const frameData = captureFrame()
    if (!frameData) return
    
    try {
      setIsProcessing(true)
      
      const response = await fetch('http://localhost:5000/manual_capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: frameData
        })
      })
      
      if (response.ok) {
        setCapturedImage(frameData)
        toast({
          title: 'Manual Capture Success!',
          description: 'Image captured successfully.',
        })
      }
    } catch (error) {
      console.error('Error with manual capture:', error)
      toast({
        title: 'Capture Failed',
        description: 'Unable to capture image. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setFeedback([])
    setFaceDetected(false)
    setAutoCapturing(false)
  }

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
              <CardTitle className="text-2xl">Face Capture</CardTitle>
              <CardDescription>
                Position your face in the camera frame. The system will automatically detect and capture when ready.
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
                          <div className="w-48 h-48 border-4 border-green-500 rounded-full animate-pulse" />
                        </motion.div>
                      )}
                      
                      {/* Auto Capturing Indicator */}
                      {autoCapturing && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                        >
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Auto Capturing...
                        </motion.div>
                      )}
                      
                      {/* Processing Indicator */}
                      {isProcessing && (
                        <div className="absolute bottom-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                          Processing...
                        </div>
                      )}
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
                      Face Detected
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
                      <AlertCircle className="w-4 h-4" />
                      No Face
                    </div>
                  )}
                </div>
              </div>
              
              {/* Feedback */}
              {feedback.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
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
                      disabled={isProcessing}
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-2" />
                          Manual Capture
                        </>
                      )}
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
                      Retake
                    </Button>
                    <Button
                      onClick={handleConfirm}
                      className="flex-1 h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirm & Continue
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
