"use client"

import { useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Webcam from "react-webcam"

export default function FacultyFaceCapture() {
  const router = useRouter()
  const webcamRef = useRef<Webcam>(null)
  const [name, setName] = useState("")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [detectionMessage, setDetectionMessage] = useState("Position your face in the circle")
  const [userName, setUserName] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  // Real-time face detection
  useEffect(() => {
    const interval = setInterval(() => {
      if (webcamRef.current && !capturedImage) {
        detectFace()
      }
    }, 1000) // Check every second

    return () => clearInterval(interval)
  }, [capturedImage])

  // Get user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('userData')
    if (userData) {
      const user = JSON.parse(userData)
      setName(user.name || user.email || '')
    }
  }, [])

  const detectFace = async () => {
    if (!webcamRef.current) return

    const imageSrc = webcamRef.current.getScreenshot()
    if (!imageSrc) return

    try {
      const response = await fetch('http://localhost:5000/detect_face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageSrc })
      })

      const result = await response.json()
      
      if (result.face_detected) {
        setFaceDetected(true)
        setDetectionMessage("Face detected! Click capture when ready")
      } else {
        setFaceDetected(false)
        setDetectionMessage("No face detected. Please position yourself properly")
      }
    } catch (error) {
      console.error('Face detection error:', error)
      setDetectionMessage("Face detection unavailable")
    }
  }

  const capturePhoto = async () => {
    if (!faceDetected) {
      alert('Please ensure your face is properly detected before capturing')
      return
    }

    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setIsProcessing(true)
      try {
        // Send to Python backend for processing and storage
        const response = await fetch('http://localhost:5000/register_face', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: imageSrc,
            user_id: name,
            user_type: 'faculty'
          })
        })

        const result = await response.json()
        
        if (result.success) {
          setCapturedImage(imageSrc)
          setUserName(result.user_name || name)
          
          // Automatically update profile image in localStorage
          updateProfileImage(imageSrc)
        } else {
          alert('Failed to process face capture: ' + result.message)
        }
      } catch (error) {
        console.error('Capture error:', error)
        alert('Failed to capture and process image')
      } finally {
        setIsProcessing(false)
      }
    }
  }

  const stopWebcam = () => {
    if (webcamRef.current) {
      const stream = webcamRef.current.video?.srcObject as MediaStream
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }

  const handleProceed = () => {
    setIsLoading(true)
    stopWebcam()
    
    // Use Next.js router for proper navigation to faculty dashboard
    router.push('/dashboard')
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setFaceDetected(false)
    setDetectionMessage("Position your face in the circle")
  }

  // Function to automatically update profile image in localStorage
  const updateProfileImage = (imageData: string) => {
    try {
      // Update faculty session data
      const facultySession = localStorage.getItem('faculty_session')
      if (facultySession) {
        const sessionData = JSON.parse(facultySession)
        sessionData.profile_image = imageData
        localStorage.setItem('faculty_session', JSON.stringify(sessionData))
      }

      // Update current user data
      const currentUser = localStorage.getItem('currentUser')
      if (currentUser) {
        const userData = JSON.parse(currentUser)
        userData.profile_image = imageData
        localStorage.setItem('currentUser', JSON.stringify(userData))
      }

      // Update faculty users database
      const facultyUsers = JSON.parse(localStorage.getItem('faculty_users') || '[]')
      const userIndex = facultyUsers.findIndex((user: any) => user.faculty_id === name || user.email === name)
      if (userIndex !== -1) {
        facultyUsers[userIndex].profile_image = imageData
        localStorage.setItem('faculty_users', JSON.stringify(facultyUsers))
      }

      console.log('Faculty profile image updated automatically after face capture')
    } catch (error) {
      console.error('Error updating faculty profile image:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
        <h1 className="text-xl font-bold mb-6 text-center">Faculty Face Capture</h1>

        <div className="space-y-6">
          {/* Webcam/Capture Container */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
              {capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/webp"
                  screenshotQuality={0.6}
                  className="w-full h-full object-cover"
                  videoConstraints={{ 
                    facingMode: "user", 
                    width: 320, 
                    height: 320 
                  }}
                  mirrored
                  playsInline
                />
              )}
            </div>

            {/* Real-time detection status */}
            {!capturedImage && (
              <div className="text-center space-y-2">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  faceDetected 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    faceDetected ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  {detectionMessage}
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-gray-800">{userName || name}</h2>
                <p className="text-gray-600">Face captured successfully!</p>
              </div>
            )}
          </div>

          {!capturedImage ? (
            <div className="space-y-4 px-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter your name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                />
              </div>

              <button
                onClick={capturePhoto}
                disabled={!name.trim() || !faceDetected || isProcessing}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  faceDetected && name.trim() && !isProcessing
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                {isProcessing ? 'Processing...' : faceDetected ? 'Capture Photo' : 'Waiting for face...'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleProceed}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-lg font-medium"
              >
                {isLoading ? 'Redirecting...' : 'Continue to Dashboard →'}
              </button>
              
              <button
                onClick={retakePhoto}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Retake Photo
              </button>
            </div>
          )}
          
          {/* Debug info - only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600 overflow-auto max-h-20">
              <div>Name: {name}</div>
              <div>Face Detected: {faceDetected ? 'Yes' : 'No'}</div>
              <div>Processing: {isProcessing ? 'Yes' : 'No'}</div>
              <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
