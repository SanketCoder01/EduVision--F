"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Upload, Camera, Save, User, ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import Webcam from "react-webcam"

export default function FaceSetupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const webcamRef = useRef<Webcam>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [userType, setUserType] = useState<"faculty" | "student">("faculty")
  const [department, setDepartment] = useState("")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [showWebcam, setShowWebcam] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [savedUser, setSavedUser] = useState<any>(null)

  const departments = [
    "Computer Science",
    "Information Technology",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Civil Engineering",
    "Electronics Engineering",
    "Chemical Engineering",
    "Mathematics",
    "Physics",
    "Chemistry",
  ]

  const capturePhoto = () => {
    if (!webcamRef.current) return

    const imageSrc = webcamRef.current.getScreenshot()
    if (imageSrc) {
      setCapturedImage(imageSrc)
      setShowWebcam(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageSrc = e.target?.result as string
      setCapturedImage(imageSrc)
    }
    reader.readAsDataURL(file)
  }

  const saveFaceData = async () => {
    if (!firstName || !lastName || !department || !capturedImage) {
      toast({
        title: "Error",
        description: "Please fill all fields and capture/upload a photo",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/save-face", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          userType,
          department,
          image: capturedImage,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setSavedUser({
          name: `${firstName} ${lastName}`,
          email: data.email,
          userId: data.userId,
          userType,
          department,
        })

        toast({
          title: "Success",
          description: "Face data saved successfully!",
        })

        // Reset form
        setFirstName("")
        setLastName("")
        setDepartment("")
        setCapturedImage(null)
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to save face data",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Save error:", error)
      toast({
        title: "Error",
        description: `Failed to save face data: ${error instanceof Error ? error.message : "Network error"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      router.push("/")
    }
  }

  const resetForm = () => {
    setSavedUser(null)
    setFirstName("")
    setLastName("")
    setDepartment("")
    setCapturedImage(null)
    setShowWebcam(false)
  }

  if (savedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleBack}
          className="flex items-center text-green-700 hover:text-green-900 transition-colors mb-8"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Home
        </motion.button>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Card className="shadow-lg border-green-200">
              <CardContent className="p-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex justify-center mb-6"
                >
                  <CheckCircle className="h-20 w-20 text-green-500" />
                </motion.div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h1>
                <p className="text-gray-600 mb-8">Face data has been saved successfully</p>

                <div className="bg-green-50 p-6 rounded-lg mb-8 text-left">
                  <h3 className="font-semibold text-green-800 mb-4">User Details:</h3>
                  <div className="space-y-2 text-green-700">
                    <p>
                      <strong>Name:</strong> {savedUser.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {savedUser.email}
                    </p>
                    <p>
                      <strong>User ID:</strong> {savedUser.userId}
                    </p>
                    <p>
                      <strong>Type:</strong> {savedUser.userType}
                    </p>
                    <p>
                      <strong>Department:</strong> {savedUser.department}
                    </p>
                    <p>
                      <strong>Default Password:</strong> password123
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={resetForm} className="flex-1 bg-green-600 hover:bg-green-700">
                    Register Another User
                  </Button>
                  <Button onClick={handleBack} variant="outline" className="flex-1 bg-transparent">
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onClick={handleBack}
        className="flex items-center text-blue-700 hover:text-blue-900 transition-colors mb-8"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Back to Home
      </motion.button>

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Face Registration Setup</h1>
          <p className="text-gray-600">Register faces for biometric authentication</p>
        </motion.div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-6 w-6 text-blue-600" />
              Register New Face
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User Details Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userType">User Type</Label>
                <Select value={userType} onValueChange={(value: "faculty" | "student") => setUserType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Photo Capture Section */}
            <div className="space-y-4">
              <Label>Face Photo</Label>

              {!capturedImage && !showWebcam && (
                <div className="flex gap-4">
                  <Button onClick={() => setShowWebcam(true)} variant="outline" className="flex-1">
                    <Camera className="h-5 w-5 mr-2" />
                    Use Camera
                  </Button>
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Photo
                  </Button>
                </div>
              )}

              {showWebcam && (
                <div className="text-center space-y-4">
                  <div className="relative inline-block rounded-lg overflow-hidden border-4 border-gray-200">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{
                        width: 640,
                        height: 480,
                        facingMode: "user",
                      }}
                      className="w-full max-w-md"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={capturePhoto} className="flex-1">
                      <Camera className="h-5 w-5 mr-2" />
                      Capture Photo
                    </Button>
                    <Button onClick={() => setShowWebcam(false)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {capturedImage && (
                <div className="text-center space-y-4">
                  <div className="relative inline-block rounded-lg overflow-hidden border-4 border-green-200">
                    <img src={capturedImage || "/placeholder.svg"} alt="Captured face" className="w-full max-w-md" />
                  </div>
                  <Button
                    onClick={() => {
                      setCapturedImage(null)
                      setShowWebcam(false)
                    }}
                    variant="outline"
                  >
                    Retake Photo
                  </Button>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>

            {/* Save Button */}
            <Button
              onClick={saveFaceData}
              disabled={isLoading || !capturedImage}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Save Face Data
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
