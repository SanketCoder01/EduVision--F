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
import { useToast } from "@/components/ui/use-toast"
import EduVisionLoader from "@/components/loaders/EduvisionLoader"
import { getStudentProfile, updateStudentProfile, updateUserPassword } from "./actions"

// Helper functions for display names
const getDepartmentName = (dept: string) => {
  const departments: { [key: string]: string } = {
    cse: "Computer Science & Engineering",
    cy: "Cyber Security",
    aids: "Artificial Intelligence & Data Science",
    aiml: "Artificial Intelligence & Machine Learning",
  }
  return departments[dept] || dept.toUpperCase()
}

const getYearName = (year: string) => {
  const years: { [key: string]: string } = {
    first: "First Year",
    second: "Second Year",
    third: "Third Year",
    fourth: "Fourth Year",
  }
  return years[year] || year
}

export default function StudentProfilePage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({ name: "", mobile: "", address: "" })

  useEffect(() => {
    const fetchProfile = async () => {
      const { profile: data, error } = await getStudentProfile()
      if (error) {
        toast({ title: "Error", description: error, variant: "destructive" })
      } else {
        setProfile(data)
        setFormData({ name: data.full_name, mobile: data.mobile_number, address: data.address })
      }
      setIsLoading(false)
    }
    fetchProfile()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = async () => {
    setIsUpdatingProfile(true)
    const result = await updateStudentProfile(formData)
    if (result.error) {
      toast({ title: "Update Failed", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Profile Updated", description: "Your profile has been updated successfully." })
      // Refetch profile to show updated data
      const { profile: data } = await getStudentProfile()
      setProfile(data)
      setIsEditing(false)
    }
    setIsUpdatingProfile(false)
  }

  if (isLoading) {
    return <EduVisionLoader text="Loading your profile..." />
  }

  if (!profile) {
    return <div className="p-6 text-center">Could not load profile. Please try again later.</div>
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
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                  {profile.photo_url ? (
                    <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-16 w-16 text-green-500" />
                  )}
                </div>
                {isEditing && (
                  <Button size="icon" className="absolute bottom-0 right-0 rounded-full bg-green-600 hover:bg-green-700" onClick={() => toast({ title: "Feature Coming Soon" })}>
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-xl font-semibold">{profile.full_name}</h2>
                <p className="text-gray-600">{profile.prn}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {getDepartmentName(profile.department)} • {getYearName(profile.year)}
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex-1 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" value={isEditing ? formData.name : profile.full_name} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" name="email" type="email" value={profile.email} disabled />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input id="mobile" name="mobile" value={isEditing ? formData.mobile : profile.mobile_number} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="prn">PRN</Label>
                    <Input id="prn" name="prn" value={profile.prn} disabled />
                  </div>
                </div>
                <div className="grid gap-2 mt-4">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" value={isEditing ? formData.address : profile.address} onChange={handleInputChange} disabled={!isEditing} />
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-4">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" value={getDepartmentName(profile.department)} disabled />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="year">Academic Year</Label>
                    <Input id="year" value={getYearName(profile.year)} disabled />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      <PasswordChangeDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog} />
    </div>
  )
}

function PasswordChangeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { toast } = useToast()
  const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" })
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handlePasswordChange = async () => {
    if (passwordData.newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters long.", variant: "destructive" })
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" })
      return
    }

    setIsUpdating(true)
    const result = await updateUserPassword(passwordData.newPassword)
    if (result.error) {
      toast({ title: "Update Failed", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "Password Updated", description: "Your password has been changed successfully." })
      onOpenChange(false)
      setPasswordData({ newPassword: "", confirmPassword: "" })
    }
    setIsUpdating(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Enter new password"
              />
              <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
              />
              <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handlePasswordChange} disabled={isUpdating} className="bg-green-600 hover:bg-green-700">
            {isUpdating ? (
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
  )
}