"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Camera, User, ArrowRight, Check, MapPin, Phone, GraduationCap, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

export default function CompleteProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userType = searchParams.get("type") // 'student' or 'faculty'
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [captureMethod, setCaptureMethod] = useState<'camera' | 'upload'>('camera')
  const [userSession, setUserSession] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    year: "", // for students
    designation: "", // for faculty
    prn: "", // for students only
    phone: "",
    address: "",
    face_image: ""
  })

  useEffect(() => {
    // Get user session data
    const session = localStorage.getItem(userType === 'student' ? 'studentSession' : 'facultySession')
    if (session) {
      const userData = JSON.parse(session)
      setUserSession(userData)
      setFormData(prev => ({
        ...prev,
        name: userData.auth_user?.user_metadata?.full_name || "",
        email: userData.email || ""
      }))
    }
  }, [userType])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageData = e.target?.result as string
          setCapturedImage(imageData)
          setFormData(prev => ({ ...prev, face_image: imageData }))
          toast({
            title: "Photo Uploaded",
            description: "Your photo has been uploaded successfully!",
          })
        }
        reader.readAsDataURL(file)
      } else {
        toast({
          title: "Invalid File",
          description: "Please select an image file (JPG, PNG, etc.)",
          variant: "destructive"
        })
      }
    }
  }

  const startCamera = async () => {
    try {
      // Check if site is secure (HTTPS or localhost)
      const isSecure = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      
      if (!isSecure) {
        toast({
          title: "Security Required",
          description: "Camera access requires HTTPS. Please use localhost or deploy with HTTPS.",
          variant: "destructive"
        })
        return
      }

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser")
      }

      console.log("Requesting camera access...")
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 },
          facingMode: 'user'
        },
        audio: false
      })
      
      console.log("Camera stream obtained:", stream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Set video properties before loading
        videoRef.current.muted = true
        videoRef.current.playsInline = true
        videoRef.current.autoplay = true
        
        // Wait for video to be ready
        const playVideo = async () => {
          try {
            await videoRef.current?.play()
            setIsCameraActive(true)
            console.log("Video playing successfully")
            
            toast({
              title: "Camera Started",
              description: "Camera is now active. Position your face in the frame.",
            })
          } catch (playError) {
            console.error("Play error:", playError)
            setIsCameraActive(true) // Still set active even if autoplay fails
          }
        }
        
        // Handle different video events
        videoRef.current.onloadedmetadata = () => {
          console.log("Video metadata loaded")
          playVideo()
        }
        
        videoRef.current.oncanplay = () => {
          console.log("Video can play")
          if (!isCameraActive) {
            playVideo()
          }
        }
        
        videoRef.current.onerror = (error) => {
          console.error("Video element error:", error)
          toast({
            title: "Video Error",
            description: "Failed to display camera feed. Please try again.",
            variant: "destructive"
          })
        }

        // Force immediate play if ready
        if (videoRef.current.readyState >= 2) {
          playVideo()
        }
      }
    } catch (error) {
      console.error("Camera access error:", error)
      let errorMessage = "Unable to access camera."
      let errorTitle = "Camera Error"
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorTitle = "Permission Denied"
          errorMessage = "Camera access was denied. Please:\n1. Click the camera icon in your browser's address bar\n2. Allow camera access\n3. Refresh the page and try again"
        } else if (error.name === 'NotFoundError') {
          errorTitle = "No Camera Found"
          errorMessage = "No camera device found. Please connect a camera and try again."
        } else if (error.name === 'NotSupportedError') {
          errorTitle = "Not Supported"
          errorMessage = "Camera not supported in this browser. Try Chrome, Firefox, or Safari."
        } else if (error.name === 'NotReadableError') {
          errorTitle = "Camera Busy"
          errorMessage = "Camera is being used by another application. Please close other apps using the camera."
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      // Check if video is ready
      if (video.readyState < video.HAVE_CURRENT_DATA) {
        toast({
          title: "Camera Not Ready",
          description: "Please wait for the camera to fully load before capturing.",
          variant: "destructive"
        })
        return
      }
      
      // Set canvas dimensions to match video
      const width = video.videoWidth || video.clientWidth || 640
      const height = video.videoHeight || video.clientHeight || 480
      
      canvas.width = width
      canvas.height = height
      
      if (context && width > 0 && height > 0) {
        // Clear canvas first
        context.clearRect(0, 0, width, height)
        
        // Save context for transformation
        context.save()
        
        // Flip horizontally to match the mirrored video display
        context.scale(-1, 1)
        context.translate(-width, 0)
        
        // Draw the video frame to canvas
        context.drawImage(video, 0, 0, width, height)
        
        // Restore context
        context.restore()
        
        // Convert to base64 image
        const imageData = canvas.toDataURL('image/jpeg', 0.9)
        
        // Validate image data
        if (imageData && imageData !== 'data:,' && imageData.length > 1000) {
          setCapturedImage(imageData)
          setFormData(prev => ({ ...prev, face_image: imageData }))
          
          // Stop camera stream automatically
          const stream = video.srcObject as MediaStream
          if (stream) {
            stream.getTracks().forEach(track => {
              track.stop()
            })
            video.srcObject = null
          }
          setIsCameraActive(false)
          
          toast({
            title: "Photo Captured Successfully!",
            description: "Camera has been closed automatically.",
          })
        } else {
          toast({
            title: "Capture Failed",
            description: "Failed to capture photo. Please ensure your face is visible and try again.",
            variant: "destructive"
          })
        }
      } else {
        toast({
          title: "Canvas Error",
          description: "Unable to process camera feed. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  const retakePhoto = async () => {
    setCapturedImage(null)
    setFormData(prev => ({ ...prev, face_image: "" }))
    
    // Clean up any existing camera stream
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    
    setIsCameraActive(false)
    
    // Restart camera
    await startCamera()
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.name || !formData.department || 
          (userType === 'student' && (!formData.year || !formData.prn)) || 
          (userType === 'faculty' && !formData.designation)) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive"
        })
        return
      }
    } else if (currentStep === 2) {
      if (!formData.phone || !formData.address) {
        toast({
          title: "Missing Information",
          description: "Please fill in all contact details.",
          variant: "destructive"
        })
        return
      }
    }
    setCurrentStep(prev => prev + 1)
  }

  const handleSubmit = async () => {
    if (!formData.face_image) {
      toast({
        title: "Face Capture Required",
        description: "Please capture your photo to complete registration.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      // Check if we have a valid user session
      if (!userSession?.id) {
        throw new Error("User session not found. Please log in again.")
      }

      // Use API route to save profile
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userSession.id,
          email: formData.email,
          name: formData.name,
          user_type: userType || 'student',
          department: formData.department,
          year: userType === 'student' ? formData.year : null,
          designation: userType === 'faculty' ? formData.designation : null,
          prn: userType === 'student' ? formData.prn : null,
          phone: formData.phone,
          address: formData.address,
          face_image: formData.face_image
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save profile')
      }

      // Store profile data in session for the profile page to use
      const sessionKey = userType === 'student' ? 'studentSession' : 'facultySession'
      const existingSession = localStorage.getItem(sessionKey)
      
      if (existingSession) {
        const sessionData = JSON.parse(existingSession)
        const updatedSession = {
          ...sessionData,
          profile: {
            ...formData,
            user_id: userSession.id,
            user_type: userType,
            profile_completed: true
          }
        }
        localStorage.setItem(sessionKey, JSON.stringify(updatedSession))
      }

      localStorage.setItem('profileCompleted', 'true')

      toast({
        title: "Profile Completed!",
        description: "Your profile has been saved successfully.",
      })

      // Redirect to appropriate dashboard
      if (userType === 'student') {
        router.push('/student-dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error("Error completing profile:", error)
      toast({
        title: "Error",
        description: "Failed to complete profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const departments = [
    { value: "cse", label: "Computer Science & Engineering" },
    { value: "cyber", label: "Cyber Security" },
    { value: "aids", label: "Artificial Intelligence & Data Science" },
    { value: "aiml", label: "Artificial Intelligence & Machine Learning" }
  ]

  const years = [
    { value: "first", label: "First Year" },
    { value: "second", label: "Second Year" },
    { value: "third", label: "Third Year" },
    { value: "fourth", label: "Fourth Year" }
  ]

  const designations = [
    { value: "professor", label: "Professor" },
    { value: "associate_professor", label: "Associate Professor" },
    { value: "assistant_professor", label: "Assistant Professor" },
    { value: "lecturer", label: "Lecturer" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="max-w-2xl mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
            <p className="text-gray-600">
              {userType === 'student' ? 'Please provide your student information to get started' : 'Please provide your faculty information to get started'}
            </p>
          </motion.div>
          {/* Progress Steps */}
          <div className="flex justify-center items-center mt-6 space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step < currentStep ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <GraduationCap className="w-5 h-5" />}
              {currentStep === 2 && <Phone className="w-5 h-5" />}
              {currentStep === 3 && <Camera className="w-5 h-5" />}
              {currentStep === 1 && "Academic Information"}
              {currentStep === 2 && "Contact Details"}
              {currentStep === 3 && "Face Capture"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Academic Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select onValueChange={(value) => handleSelectChange("department", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.value} value={dept.value}>
                          {dept.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {userType === 'student' && (
                  <>
                    <div>
                      <Label htmlFor="prn">PRN (Permanent Registration Number) *</Label>
                      <Input
                        id="prn"
                        name="prn"
                        value={formData.prn}
                        onChange={handleInputChange}
                        placeholder="Enter your PRN (e.g., 22CSE001)"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="year">Academic Year *</Label>
                      <Select onValueChange={(value) => handleSelectChange("year", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your year" />
                        </SelectTrigger>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year.value} value={year.value}>
                              {year.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {userType === 'faculty' && (
                  <div>
                    <Label htmlFor="designation">Designation *</Label>
                    <Select onValueChange={(value) => handleSelectChange("designation", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your designation" />
                      </SelectTrigger>
                      <SelectContent>
                        {designations.map((designation) => (
                          <SelectItem key={designation.value} value={designation.value}>
                            {designation.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Contact Details */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your complete address"
                    required
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Face Capture */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <p className="text-gray-600 mb-6">
                    Please provide a clear photo of your face for verification purposes
                  </p>
                  
                  {/* Method Selection */}
                  <div className="mb-6">
                    <div className="flex justify-center space-x-4">
                      <Button
                        onClick={() => setCaptureMethod('camera')}
                        variant={captureMethod === 'camera' ? 'default' : 'outline'}
                        className="flex items-center space-x-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Use Camera</span>
                      </Button>
                      <Button
                        onClick={() => setCaptureMethod('upload')}
                        variant={captureMethod === 'upload' ? 'default' : 'outline'}
                        className="flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Upload Photo</span>
                      </Button>
                    </div>
                  </div>
                  
                  {/* Photo Display Area */}
                  <div className="relative mx-auto w-80 h-60 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                    {!capturedImage && captureMethod === 'camera' && !isCameraActive && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">Click "Start Camera" to begin</p>
                          <p className="text-gray-400 text-xs mt-1">Camera will open in a new window</p>
                        </div>
                      </div>
                    )}
                    
                    {!capturedImage && captureMethod === 'upload' && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-gray-500 text-sm">Click "Choose File" to upload</p>
                          <p className="text-gray-400 text-xs mt-1">JPG, PNG, or other image formats</p>
                        </div>
                      </div>
                    )}
                    
                    {isCameraActive && (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform scale-x-[-1]"
                        style={{ 
                          filter: 'none',
                          display: 'block',
                          backgroundColor: '#000'
                        }}
                      />
                    )}
                    
                    {capturedImage && (
                      <div className="relative w-full h-full">
                        <img
                          src={capturedImage}
                          alt="Profile photo"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                          ✓ Ready
                        </div>
                      </div>
                    )}
                    
                    {isCameraActive && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white rounded-full opacity-50"></div>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                          Position your face in the circle
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <canvas ref={canvasRef} className="hidden" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  {/* Action Buttons */}
                  <div className="mt-6 space-y-3">
                    {captureMethod === 'camera' && (
                      <div className="space-x-2">
                        {!isCameraActive && !capturedImage && (
                          <Button 
                            onClick={startCamera} 
                            className="bg-blue-600 hover:bg-blue-700"
                            size="lg"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Start Camera
                          </Button>
                        )}
                        
                        {isCameraActive && (
                          <div className="space-x-2">
                            <Button 
                              onClick={capturePhoto} 
                              className="bg-green-600 hover:bg-green-700"
                              size="lg"
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              Capture Photo
                            </Button>
                            <Button 
                              onClick={() => {
                                const stream = videoRef.current?.srcObject as MediaStream
                                stream?.getTracks().forEach(track => track.stop())
                                setIsCameraActive(false)
                              }}
                              variant="outline"
                              size="lg"
                            >
                              Stop Camera
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {captureMethod === 'upload' && !capturedImage && (
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-purple-600 hover:bg-purple-700"
                        size="lg"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Choose File
                      </Button>
                    )}
                    
                    {capturedImage && (
                      <div className="space-x-2">
                        <Button 
                          onClick={() => {
                            setCapturedImage(null)
                            setFormData(prev => ({ ...prev, face_image: "" }))
                            if (captureMethod === 'camera') {
                              retakePhoto()
                            }
                          }}
                          variant="outline"
                          size="lg"
                        >
                          {captureMethod === 'camera' ? 'Retake Photo' : 'Choose Different Photo'}
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {captureMethod === 'camera' && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        💡 <strong>Camera not working?</strong> Switch to "Upload Photo" to select an image from your device.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep < 3 ? (
                <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !formData.face_image}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Completing...
                    </>
                  ) : (
                    <>
                      Complete Profile
                      <Check className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
