"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Camera, User, Lock, Eye, EyeOff, Save, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

// Mock password update function
const updateUserPassword = async (userId: string, newPassword: string) => {
  const users = JSON.parse(localStorage.getItem("student_users") || "[]")
  const userIndex = users.findIndex((u: any) => u.id === userId)
  if (userIndex !== -1) {
    users[userIndex].password = newPassword
    localStorage.setItem("student_users", JSON.stringify(users))
    return true
  }
  throw new Error("User not found")
}

export default function StudentProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    prn: "",
    department: "",
    year: "",
    mobile: "",
    address: "",
    photo: null as string | null,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [errors, setErrors] = useState<Partial<Record<keyof Omit<typeof profile, 'id' | 'prn' | 'department' | 'year' | 'photo'>, string>>>({})
  const [passwordErrors, setPasswordErrors] = useState<Partial<Record<keyof typeof passwordData, string>>>({})

  useEffect(() => {
    const studentSession = localStorage.getItem("student_session")
    if (studentSession) {
      const session = JSON.parse(studentSession)
      const users = JSON.parse(localStorage.getItem("student_users") || "[]")
      const user = users.find((u: any) => u.email === session.email)
      
      if (user) {
        setProfile({
          id: user.id || "",
          name: user.name || "",
          email: user.email || "",
          prn: user.prn || "",
          department: user.department || "",
          year: user.year || "",
          mobile: user.mobile || "",
          address: user.address || "",
          photo: user.photo || null,
        })
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    if (passwordErrors[name as keyof typeof passwordErrors]) {
      setPasswordErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validateProfile = () => {
    const newErrors: Partial<typeof errors> = {}
    if (!profile.name.trim()) newErrors.name = "Full name is required."
    if (!profile.email.trim()) {
      newErrors.email = "Email is required."
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = "Please enter a valid email address."
    }
    if (!profile.mobile.trim()) {
      newErrors.mobile = "Mobile number is required."
    } else if (!/^\d{10}$/.test(profile.mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits."
    }
    if (!profile.address.trim()) newErrors.address = "Address is required."

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveProfile = async () => {
    if (!validateProfile()) {
      toast({
        title: "Validation Error",
        description: "Please check the fields and try again.",
        variant: "destructive",
      })
      return
    }
    setIsUpdatingProfile(true)

    try {
      const studentSession = localStorage.getItem("student_session")
      const users = JSON.parse(localStorage.getItem("student_users") || "[]")
      
      if (studentSession) {
        const sessionUser = JSON.parse(studentSession)
        const updatedUser = { ...sessionUser, ...profile }
        localStorage.setItem("student_session", JSON.stringify(updatedUser))
        
        const userIndex = users.findIndex((u: any) => u.email === sessionUser.email)
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...profile }
          localStorage.setItem("student_users", JSON.stringify(users))
        }
      }

      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const validatePassword = () => {
    const newErrors: Partial<typeof passwordErrors> = {}
    if (!passwordData.currentPassword) newErrors.currentPassword = "Current password is required."
    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required."
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters long."
    }
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password."
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "The new passwords do not match."
    }
    setPasswordErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return
    }
    setIsUpdatingPassword(true)

    try {
      const studentSession = localStorage.getItem("student_session")
      if (studentSession) {
        const user = JSON.parse(studentSession)
        // NOTE: This is a mock verification. In a real app, you'd verify against the backend.
        if (user.password !== passwordData.currentPassword) {
            toast({
                title: "Incorrect Password",
                description: "The current password you entered is incorrect.",
                variant: "destructive",
            })
            setIsUpdatingPassword(false)
            return
        }
        
        await updateUserPassword(profile.id, passwordData.newPassword)

        const updatedUser = { ...user, password: passwordData.newPassword }
        localStorage.setItem("student_session", JSON.stringify(updatedUser))

        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setShowPasswordDialog(false)
        toast({
          title: "Password Updated",
          description: "Your password has been changed successfully.",
        })
      }
    } catch (error) {
      console.error("Error updating password:", error)
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handlePhotoUpload = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Photo upload functionality will be available soon.",
    })
  }

  const getDepartmentName = (dept: string) => {
    const departments = {
      cse: "Computer Science & Engineering",
      cy: "Cyber Security",
      aids: "Artificial Intelligence & Data Science",
      aiml: "Artificial Intelligence & Machine Learning",
    }
    return departments[dept as keyof typeof departments] || dept.toUpperCase()
  }

  const getYearName = (year: string) => {
    const years = {
      first: "First Year",
      second: "Second Year",
      third: "Third Year",
      fourth: "Fourth Year",
    }
    return years[year as keyof typeof years] || year
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="mr-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">My Profile</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPasswordDialog(true)} className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Change Password
          </Button>
          <Button
            onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
            variant={isEditing ? "default" : "outline"}
            className={isEditing ? "bg-green-600 hover:bg-green-700" : ""}
            disabled={isUpdatingProfile}
          >
            {isUpdatingProfile ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                {isEditing ? <Save className="h-4 w-4 mr-2" /> : null}
                {isEditing ? "Save Changes" : "Edit Profile"}
              </>
            )}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                  {profile.photo ? (
                    <img
                      src={profile.photo}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-green-500" />
                  )}
                </div>
                {isEditing && (
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full bg-green-600 hover:bg-green-700"
                    onClick={handlePhotoUpload}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-xl font-semibold">{profile.name}</h2>
                <p className="text-gray-600">{profile.prn}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {getDepartmentName(profile.department)} • {getYearName(profile.year)}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 space-y-6"
            >
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`${!isEditing ? "bg-gray-50" : ""} ${errors.name ? "border-red-500" : ""}`}
                    />
                    {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`${!isEditing ? "bg-gray-50" : ""} ${errors.email ? "border-red-500" : ""}`}
                    />
                    {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      value={profile.mobile}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`${!isEditing ? "bg-gray-50" : ""} ${errors.mobile ? "border-red-500" : ""}`}
                    />
                    {errors.mobile && <p className="text-sm text-red-600 mt-1">{errors.mobile}</p>}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="prn">PRN</Label>
                    <Input id="prn" name="prn" value={profile.prn} disabled={true} className="bg-gray-50" />
                  </div>
                </div>

                <div className="grid gap-2 mt-4">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={profile.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`${!isEditing ? "bg-gray-50" : ""} ${errors.address ? "border-red-500" : ""}`}
                  />
                  {errors.address && <p className="text-sm text-red-600 mt-1">{errors.address}</p>}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={getDepartmentName(profile.department)}
                      disabled={true}
                      className="bg-gray-50"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="year">Academic Year</Label>
                    <Input id="year" value={getYearName(profile.year)} disabled={true} className="bg-gray-50" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className={passwordErrors.currentPassword ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {passwordErrors.currentPassword && <p className="text-sm text-red-600 mt-1">{passwordErrors.currentPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  className={passwordErrors.newPassword ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {passwordErrors.newPassword && <p className="text-sm text-red-600 mt-1">{passwordErrors.newPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  className={passwordErrors.confirmPassword ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {passwordErrors.confirmPassword && <p className="text-sm text-red-600 mt-1">{passwordErrors.confirmPassword}</p>}
            </div>

            <div className="text-sm text-gray-500">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>At least 6 characters long</li>
                <li>Mix of letters and numbers recommended</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isUpdatingPassword}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUpdatingPassword ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}