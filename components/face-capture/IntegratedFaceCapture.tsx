'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import Webcam from 'react-webcam'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Camera, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react'

interface IntegratedFaceCaptureProps {
  onCapture: (imageData: string, faceData: any) => void
  onSkip?: () => void
  isCapturing?: boolean
}

// Utility to resize and compress image
async function resizeAndCompressImage(base64: string, maxSize = 320, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = function () {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = Math.min(img.width, img.height, maxSize);
      canvas.width = size;
      canvas.height = size;
      ctx?.drawImage(img, 0, 0, size, size);
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    img.src = base64;
  });
}

export default function IntegratedFaceCapture({ 
  onCapture, 
  onSkip, 
  isCapturing = true 
}: IntegratedFaceCaptureProps) {
  const webcamRef = useRef<Webcam>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [captureCountdown, setCaptureCountdown] = useState(0)

  // Video constraints for better face detection
  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user',
    aspectRatio: 4/3
  }

  // Start camera when component mounts
  useEffect(() => {
    if (isCapturing) {
      setIsCameraActive(true)
    }
  }, [isCapturing])

  // Auto-capture countdown when face is detected
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout
    
    if (faceDetected && captureCountdown > 0 && !capturedImage) {
      countdownInterval = setInterval(() => {
        setCaptureCountdown(prev => {
          if (prev <= 1) {
            // Auto-capture when countdown reaches 0
            handleAutoCapture()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
    }
  }, [faceDetected, captureCountdown, capturedImage])

  // Simulate face detection (in real app, you'd use a face detection library)
  const simulateFaceDetection = useCallback(() => {
    if (!capturedImage && isCameraActive) {
      // Simulate face detection after 1 second (faster!)
      setTimeout(() => {
        setFaceDetected(true)
        setCaptureCountdown(1) // 1 second countdown (much faster!)
      }, 1000)
    }
  }, [capturedImage, isCameraActive])

  // Start face detection simulation
  useEffect(() => {
    if (isCameraActive && !capturedImage) {
      simulateFaceDetection()
    }
  }, [isCameraActive, capturedImage, simulateFaceDetection])

  const handleAutoCapture = useCallback(async () => {
    if (webcamRef.current && !capturedImage) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setIsProcessing(true);
        // Fast processing without compression for speed
        setTimeout(() => {
          const faceData = {
            face_encoding: 'simulated_face_encoding',
            confidence: 0.95,
            landmarks: 'simulated_landmarks',
          };
          onCapture(imageSrc, faceData);
          setIsProcessing(false);
        }, 200); // Much faster processing!
      }
    }
  }, [capturedImage, onCapture]);

  const handleManualCapture = useCallback(async () => {
    if (webcamRef.current && !capturedImage) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setIsProcessing(true);
        // Fast processing without compression for speed
        setTimeout(() => {
          const faceData = {
            face_encoding: 'manual_capture_face_encoding',
            confidence: 0.90,
            landmarks: 'manual_capture_landmarks',
          };
          onCapture(imageSrc, faceData);
          setIsProcessing(false);
        }, 200); // Much faster processing!
      }
    }
  }, [capturedImage, onCapture]);

  const handleRetake = useCallback(() => {
    setCapturedImage(null)
    setFaceDetected(false)
    setCaptureCountdown(0)
    setIsProcessing(false)
    // Restart face detection
    setTimeout(() => {
      simulateFaceDetection()
    }, 1000)
  }, [simulateFaceDetection])

  const handleCameraError = useCallback((error: string | DOMException) => {
    console.error('Camera error:', error)
    setCameraError('Camera access denied. Please check permissions and try again.')
    setIsCameraActive(false)
  }, [])

  if (capturedImage) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Photo Captured Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <img 
              src={capturedImage} 
              alt="Captured face" 
              className="w-full max-w-md mx-auto rounded-lg border-2 border-green-200"
            />
          </div>
          
          {isProcessing && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Processing face data... Please wait.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleRetake}
              disabled={isProcessing}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Photo
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Camera className="h-6 w-6 text-blue-600" />
          Face Registration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center text-sm text-gray-600 mb-4">
          <p>Position yourself in front of the camera</p>
          <p>Ensure good lighting and look directly at the camera</p>
        </div>

        {cameraError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
        ) : (
          <div className="relative">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMediaError={handleCameraError}
              className="w-full rounded-lg border-2 border-gray-200"
            />
            
            {/* Face detection overlay */}
            {faceDetected && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-green-500 bg-opacity-20 border-4 border-green-500 rounded-full w-48 h-48 flex items-center justify-center">
                  <div className="text-center text-white font-bold">
                    {captureCountdown > 0 ? (
                      <>
                        <div className="text-4xl">{captureCountdown}</div>
                        <div className="text-sm">Auto-capturing in...</div>
                      </>
                    ) : (
                      <div className="text-lg">Face Detected!</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status and controls */}
        <div className="text-center space-y-3">
          {faceDetected ? (
            <div className="text-green-600 font-medium">
                             ✅ Face detected! {captureCountdown > 0 ? `Auto-capturing in ${captureCountdown} second...` : 'Stay still!'}
            </div>
          ) : (
            <div className="text-blue-600 font-medium">
              🔍 Detecting face... Please position yourself in the camera view
            </div>
          )}

          <div className="flex justify-center gap-4">
            <Button 
              onClick={handleManualCapture}
              disabled={!isCameraActive || !!capturedImage}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Camera className="h-4 w-4 mr-2" />
              Manual Capture
            </Button>
            
            {onSkip && (
              <Button 
                variant="outline" 
                onClick={onSkip}
                disabled={!isCameraActive || !!capturedImage}
              >
                Skip for Now
              </Button>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">📋 Instructions:</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Position your face in the center of the camera view</li>
            <li>Ensure good lighting and a clear background</li>
            <li>Look directly at the camera</li>
            <li>Stay still when face is detected (auto-capture in 1 second)</li>
            <li>Use manual capture if auto-capture doesn't work</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
