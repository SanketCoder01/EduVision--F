'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CaptureImagePage() {
  const router = useRouter()
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [captureStatus, setCaptureStatus] = useState<string>('waiting')
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  // Get user email on component mount
  useEffect(() => {
    const getUserEmail = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUserEmail(user.email)
      }
    }
    getUserEmail()
  }, [])

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 }, 
          audio: false 
        })
        setStream(mediaStream)
        setError(null)
      } catch (err) {
        setError('Camera access denied. Please allow camera permissions.')
      }
    }
    initCamera()
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Set video source when stream is available
  useEffect(() => {
    if (videoRef && stream) {
      videoRef.srcObject = stream
    }
  }, [videoRef, stream])

  const captureImage = () => {
    if (!videoRef) return
    
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.videoWidth
    canvas.height = videoRef.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(videoRef, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      setImgSrc(imageData)
      setCaptureStatus('captured')
      saveImage(imageData)
    }
  }

  const saveImage = async (imageData: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/face-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          imageData: imageData
        })
      })
      
      if (response.ok) {
        setTimeout(() => {
          router.push('/auth/pending-approval')
        }, 1500)
      } else {
        setError('Failed to save image. Please try again.')
      }
    } catch (err) {
      setError('Failed to save image. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetake = () => {
    setImgSrc(null)
    setCaptureStatus('waiting')
  }

  if (error && !userEmail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-600 mb-4 text-4xl">⚠️</div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/auth/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border-0">
          <div className="text-center p-6 border-b">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Capture Your Photo
            </h1>
            <p className="text-lg text-gray-600">
              Take a clear photo for verification
            </p>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">⚠️</span>
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {captureStatus === 'captured' && imgSrc ? (
              <div className="text-center space-y-6">
                <div className="text-green-600 text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Face Captured Successfully!</h2>
                <div className="rounded-2xl overflow-hidden border-4 border-green-200 shadow-2xl max-w-md mx-auto">
                  <img src={imgSrc} alt="Captured" className="w-full h-auto" />
                </div>
                {isLoading ? (
                  <div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Saving and redirecting...</p>
                  </div>
                ) : (
                  <button
                    onClick={handleRetake}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                  >
                    🔄 Retake
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-6">
                  <div className="rounded-2xl overflow-hidden border-4 border-white shadow-2xl bg-black relative">
                    <video
                      ref={setVideoRef}
                      autoPlay
                      playsInline
                      muted
                      width="540"
                      height="380"
                      className="w-full h-auto"
                    />
                    {stream && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                        <button
                          onClick={captureImage}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg"
                        >
                          📸 Capture Photo
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Position your face in the camera frame and click capture when ready.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
