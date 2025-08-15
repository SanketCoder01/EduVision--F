"use client"

import React, { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import Webcam from 'react-webcam'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, RotateCcw, Check, ArrowLeft } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface SelfieCaptureProps {
  onCapture: (photoData: string) => void
  onBack?: () => void
}

export default function SelfieCapture({ onCapture, onBack }: SelfieCaptureProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const webcamRef = useRef<Webcam>(null)

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user"
  }

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setCapturedImage(imageSrc)
      toast({
        title: "Photo captured successfully!",
        description: "Please review and confirm or retake if needed.",
      })
    }
  }, [])

  const retakePhoto = () => {
    setCapturedImage(null)
  }

  const confirmPhoto = () => {
    if (capturedImage) {
      setIsLoading(true)
      // Add a small delay to show the loading animation
      setTimeout(() => {
        onCapture(capturedImage)
      }, 500)
    }
  }

  return (
    <div className="w-full">
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white shadow-lg border-0 overflow-hidden">
            <CardHeader className="text-center space-y-2 bg-gray-50">
              <CardTitle className="text-xl font-semibold text-gray-800">
                Take Your Photo
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="relative w-full bg-gray-200 rounded-lg overflow-hidden mb-6" style={{ paddingTop: '75%' }}>
                {!capturedImage ? (
                  <div className="absolute inset-0">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={videoConstraints}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="absolute inset-0">
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-3">
                {!capturedImage ? (
                  <>
                    <Button
                      onClick={capturePhoto}
                      className="w-full py-4 text-lg bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Take Photo
                    </Button>
                    <Button
                      onClick={() => onBack?.()}
                      variant="outline"
                      className="w-full py-4 text-gray-700 font-medium border border-gray-300 hover:bg-gray-50 rounded-lg"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Go Back
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={retakePhoto}
                      variant="outline"
                      disabled={isLoading}
                      className="w-full py-4 text-gray-700 font-medium border border-gray-300 hover:bg-gray-50 rounded-lg disabled:opacity-50"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Retake
                    </Button>
                    <Button
                      onClick={confirmPhoto}
                      disabled={isLoading}
                      className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 mr-2"
                          >
                            <Check className="w-5 h-5" />
                          </motion.div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Use This Photo
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
