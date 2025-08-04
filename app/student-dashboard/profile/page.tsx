"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Camera, User, Lock, Eye, EyeOff, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { updateUserPassword } from "@/lib/supabase"

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
    phone: "",
    address: "",
    photoUrl: null,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    // Get user data from localStorage or session
    const studentSession = localStorage.getItem("studentSession")
    if (studentSession) {
      try {
        const user = JSON.parse(studentSession)
        setProfile({
          id: user.id || "",
          name: user.name || "",
          email: user.email || "",
          prn: user.prn || "",
          department: user.department || "",
          year: user.year || "",
          phone: user.phone || "",
          address: user.address || "",
          photoUrl: user.photoUrl || null,
        })
      } catch (error) {
        console.error("Failed to parse user data from localStorage", error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try logging in again.",
          variant: "destructive",
        })
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = async () => {
    setIsUpdatingProfile(true)

    try {
      // Update localStorage with new data
      const studentSession = localStorage.getItem("studentSession")
      if (studentSession) {
        const user = JSON.parse(studentSession)
        const updatedUser = { ...user, ...profile }
        localStorage.setItem("studentSession", JSON.stringify(updatedUser))
      }

      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingPassword(true)

    try {
      // Verify current password by checking against stored session
      const studentSession = localStorage.getItem("studentSession")
      if (studentSession) {
        const user = JSON.parse(studentSession)

        // In a real implementation, you would verify the current password with the backend
        // For now, we'll update the password in Supabase
        await updateUserPassword(profile.id, passwordData.newPassword, "student")

        // Update the session with new password (in real app, this would be handled by backend)
        const updatedUser = { ...user, password: passwordData.newPassword }
        localStorage.setItem("studentSession", JSON.stringify(updatedUser))

        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
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
                  {profile.photoUrl ? (
                    <img
                      src={profile.photoUrl || "/placeholder.svg"}
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
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
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
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={profile.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
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
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
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

      {/* Change Password Dialog */}
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
