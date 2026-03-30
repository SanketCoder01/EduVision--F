"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Save, User, Camera, Lock, Eye, EyeOff, IdCard, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import ImageCropper from "@/components/ImageCropper"

export default function ProfilePage() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [facultyId, setFacultyId] = useState<string>("")
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    department: "",
    designation: "",
    phone: "",
    address: "",
    experience_years: "",
    face_image: "",
    college_name: "",
    employee_id: "",
    qualification: "",
  })
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [showImageCropper, setShowImageCropper] = useState(false)

  const loadProfile = useCallback(async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      toast({ title: "Error", description: "Please log in to access your profile.", variant: "destructive" })
      return
    }

    const { data: facultyData, error } = await supabase
      .from("faculty")
      .select("*")
      .eq("email", user.email)
      .maybeSingle()

    if (error || !facultyData) {
      toast({ title: "Error", description: "Failed to load profile data.", variant: "destructive" })
      return
    }

    setFacultyId(facultyData.id)
    setProfile({
      name: facultyData.name || "",
      email: facultyData.email || user.email || "",
      department: facultyData.department || "",
      designation: facultyData.designation || "",
      phone: facultyData.phone || "",
      address: facultyData.address || "",
      experience_years: facultyData.experience_years || "",
      face_image: facultyData.face_image || facultyData.photo_url || "",
      college_name: facultyData.college_name || "",
      employee_id: facultyData.employee_id || "",
      qualification: facultyData.qualification || "",
    })
  }, [toast])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  // Real-time subscription so image update from cropper reflects immediately
  useEffect(() => {
    if (!facultyId) return
    const channel = supabase
      .channel("faculty-profile-live")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "faculty", filter: `id=eq.${facultyId}` }, (payload) => {
        const d = payload.new as any
        setProfile((prev) => ({
          ...prev,
          name: d.name || prev.name,
          department: d.department || prev.department,
          designation: d.designation || prev.designation,
          phone: d.phone || prev.phone,
          address: d.address || prev.address,
          experience_years: d.experience_years || prev.experience_years,
          face_image: d.face_image || d.photo_url || prev.face_image,
          college_name: d.college_name || prev.college_name,
          employee_id: d.employee_id || prev.employee_id,
          qualification: d.qualification || prev.qualification,
        }))
      })
      .subscribe()
    return () => { channel.unsubscribe() }
  }, [facultyId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!facultyId) {
      toast({ title: "Error", description: "Faculty ID not found. Please refresh.", variant: "destructive" })
      return
    }
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("faculty")
        .update({
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          designation: profile.designation,
          experience_years: profile.experience_years || null,
          qualification: profile.qualification,
          employee_id: profile.employee_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", facultyId)

      if (error) throw error

      setIsEditing(false)
      toast({ title: "Profile Updated", description: "Your profile has been updated successfully." })
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({ title: "Error", description: error.message || "Failed to update profile.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhotoUpload = () => {
    setShowImageCropper(true)
  }

  const handleSaveCroppedImage = async (croppedImage: string) => {
    if (!facultyId) {
      toast({ title: "Error", description: "Faculty ID not found. Please refresh.", variant: "destructive" })
      return
    }
    
    // Temporarily show the cropped image for immediate feedback
    setProfile((prev) => ({ ...prev, face_image: croppedImage }))

    try {
      // 1. Convert base64 to Blob
      const blob = await (await fetch(croppedImage)).blob()

      // 2. Upload to Supabase Storage
      const fileName = `${facultyId}-${Date.now()}.jpg`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, blob, {
          contentType: "image/jpeg",
          upsert: true,
        })

      if (uploadError) throw uploadError

      // 3. Retrieve Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName)

      // 4. Update the User Profile
      const { error: updateError } = await supabase
        .from("faculty")
        .update({ face_image: publicUrl, photo_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", facultyId)

      if (updateError) throw updateError

      setProfile((prev) => ({ ...prev, face_image: publicUrl }))
      setShowImageCropper(false)
      toast({ title: "Photo Updated", description: "Your profile photo has been saved to storage." })
    } catch (error: any) {
      console.error("Error saving photo:", error)
      toast({ title: "Error", description: error.message || "Failed to save photo.", variant: "destructive" })
    }
  }

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({ title: "Missing Information", description: "Please fill in all password fields.", variant: "destructive" })
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: "Password Mismatch", description: "New password and confirm password do not match.", variant: "destructive" })
      return
    }
    if (passwordData.newPassword.length < 6) {
      toast({ title: "Weak Password", description: "Password must be at least 6 characters long.", variant: "destructive" })
      return
    }
    setIsUpdatingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword })
      if (error) throw error
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setShowPasswordDialog(false)
      toast({ title: "Password Updated", description: "Your password has been changed successfully." })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update password.", variant: "destructive" })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const isProfileComplete = profile.name && profile.email && profile.department && profile.phone

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-2" onClick={() => window.history.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPasswordDialog(true)} className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Change Password
            </Button>
            <Button
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              disabled={isSaving}
              variant={isEditing ? "default" : "outline"}
              className={isEditing ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {isSaving ? (
                <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Saving...</>
              ) : isEditing ? (
                <><Save className="h-4 w-4 mr-2" />Save Changes</>
              ) : "Edit Profile"}
            </Button>
          </div>
        </div>

        {/* Main Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-8">

              {/* LEFT COLUMN: Photo + Virtual ID */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-6 md:w-64 shrink-0"
              >
                <div className="relative">
                  <div 
                    className={`w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-4 border-blue-200 shadow-lg ${isEditing ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                    onClick={isEditing ? handlePhotoUpload : undefined}
                  >
                    {profile.face_image ? (
                      <img
                        key={profile.face_image}
                        src={profile.face_image}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-16 w-16 text-blue-500" />
                    )}
                  </div>
                  {isEditing && (
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full bg-purple-600 hover:bg-purple-700"
                      onClick={handlePhotoUpload}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Virtual ID Card — shown inline in profile when profile is complete */}
                {isProfileComplete && (
                  <div className="w-full">
                    <div className="flex items-center gap-1 mb-2">
                      <IdCard className="h-4 w-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-gray-700">Virtual ID Card</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-auto h-6 text-xs text-gray-500 print:hidden"
                        onClick={() => window.print()}
                      >
                        <Printer className="h-3 w-3 mr-1" />Print
                      </Button>
                    </div>

                    {/* ID Card */}
                    <div
                      id="virtual-id-card"
                      className="rounded-xl overflow-hidden shadow-lg border border-blue-200 print:shadow-none w-full text-xs"
                    >
                      {/* Header */}
                      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-4 pt-4 pb-3 text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-white font-black text-[9px]">SU</span>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold tracking-wide leading-tight">SANJIVANI UNIVERSITY</p>
                            <p className="text-[8px] text-blue-200 leading-tight">{profile.college_name || "Kopargaon, Maharashtra"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="bg-white px-4 py-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-14 h-14 rounded-full overflow-hidden border-3 border-blue-600 shrink-0">
                            {profile.face_image ? (
                              <img src={profile.face_image} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <span className="text-white text-lg font-bold">{profile.name?.charAt(0)}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-black text-gray-900 text-sm leading-tight">{profile.name}</p>
                            <span className="inline-block mt-0.5 px-2 py-px bg-yellow-400 text-yellow-900 text-[9px] font-bold rounded-full uppercase">Faculty</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          {[
                            { label: "Dept", value: profile.department },
                            { label: "Email", value: profile.email },
                            { label: "Phone", value: profile.phone },
                            profile.designation ? { label: "Role", value: profile.designation } : null,
                            profile.employee_id ? { label: "Emp ID", value: profile.employee_id } : null,
                          ].filter(Boolean).map((row: any) => (
                            <div key={row.label} className="flex gap-1 text-gray-700">
                              <span className="text-[9px] font-bold text-gray-400 uppercase w-12 shrink-0 pt-px">{row.label}</span>
                              <span className="text-[10px] font-medium truncate">{row.value}</span>
                            </div>
                          ))}
                        </div>

                        {/* Barcode */}
                        <div className="mt-3 pt-2 border-t border-gray-100">
                          <div className="flex justify-center gap-px h-6">
                            {[1,2,1,3,1,2,1,1,3,1,2,1,2,1,3,1,1,2,1,3,2,1,1,2,3,1,2,1,1,3,2,1,2,1,3,1,1,2,1,2].map((w, i) => (
                              <div key={i} className="bg-gray-800" style={{ width: w + "px" }} />
                            ))}
                          </div>
                          <p className="text-center text-[8px] text-gray-400 mt-0.5 font-mono">
                            EV-FAC-{profile.email?.split("@")[0]?.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-4 py-1.5 text-center">
                        <p className="text-[8px] text-blue-200">If found, please return to Sanjivani University.</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* RIGHT COLUMN: Form fields */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex-1 space-y-4"
              >
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" value={profile.name} onChange={handleInputChange} disabled={!isEditing} placeholder="Your full name" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" value={profile.email} disabled placeholder="Email cannot be changed" className="bg-gray-50" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="employee_id">PRN / Emp ID</Label>
                    <Input id="employee_id" name="employee_id" value={profile.employee_id || ''} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., EV-1024" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" name="department" value={profile.department} disabled placeholder="Department" className="bg-gray-50" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input id="designation" name="designation" value={profile.designation} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., Assistant Professor" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" value={profile.phone} onChange={handleInputChange} disabled={!isEditing} placeholder="Your phone number" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="experience_years">Experience (Years)</Label>
                    <Input id="experience_years" name="experience_years" type="number" value={profile.experience_years} onChange={handleInputChange} disabled={!isEditing} placeholder="Years of experience" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="qualification">Qualification</Label>
                    <Input id="qualification" name="qualification" value={profile.qualification} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g., M.Tech, Ph.D" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="college_name">College</Label>
                    <Input id="college_name" name="college_name" value={profile.college_name} disabled placeholder="College name" className="bg-gray-50" />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" value={profile.address} onChange={handleInputChange} disabled={!isEditing} placeholder="Your address" />
                </div>

                {!isProfileComplete && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                    ⚠️ Complete your profile (name, department, phone) to unlock your Virtual ID Card.
                  </div>
                )}
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>

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
            <div className="relative">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="mt-1 pr-10"
              />
              <button type="button" className="absolute right-3 top-8 text-gray-400" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="relative">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="mt-1 pr-10"
              />
              <button type="button" className="absolute right-3 top-8 text-gray-400" onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="relative">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="mt-1 pr-10"
              />
              <button type="button" className="absolute right-3 top-8 text-gray-400" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
            <Button onClick={handleChangePassword} disabled={isUpdatingPassword} className="bg-blue-600 hover:bg-blue-700">
              {isUpdatingPassword ? "Updating..." : "Update Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Cropper */}
      {showImageCropper && (
        <ImageCropper
          open={true}
          onSave={handleSaveCroppedImage}
          onClose={() => setShowImageCropper(false)}
        />
      )}
    </div>
  )
}
