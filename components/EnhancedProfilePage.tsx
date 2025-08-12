"use client"

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Camera, User, Lock, Eye, EyeOff, Save, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface EnhancedProfilePageProps {
  userType: 'student' | 'faculty'
  onBack: () => void
}

export default function EnhancedProfilePage({ userType, onBack }: EnhancedProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  const [profile, setProfile] = useState({
    id: '',
    name: '',
    email: '',
    prn: '',
    department: '',
    year: '',
    mobile: '',
    address: '',
    photo: null as string | null,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Image crop states
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadUserProfile()
  }, [userType])

  const loadUserProfile = () => {
    try {
      const sessionKey = userType === 'student' ? 'student_session' : 'faculty_session'
      const session = localStorage.getItem(sessionKey)
      
      if (session) {
        const userData = JSON.parse(session)
        setProfile({
          id: userData.id || '',
          name: userData.name || '',
          email: userData.email || '',
          prn: userData.student_id || userData.faculty_id || '',
          department: userData.department || '',
          year: userData.year || '',
          mobile: userData.mobile || '',
          address: userData.address || '',
          photo: userData.profile_image || userData.profileImage || null,
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
      })
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setSelectedImage(reader.result as string)
        setShowImageDialog(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<string> => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = crop.width
    canvas.height = crop.height

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Canvas is empty')
        }
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
      }, 'image/jpeg', 0.95)
    })
  }

  const handleCropComplete = async () => {
    if (imgRef.current && completedCrop) {
      try {
        const croppedImageUrl = await getCroppedImg(imgRef.current, completedCrop)
        setProfile(prev => ({ ...prev, photo: croppedImageUrl }))
        setShowImageDialog(false)
        setSelectedImage(null)
        
        // Update profile image in localStorage immediately
        updateProfileImageInStorage(croppedImageUrl)
        
        toast({
          title: 'Success',
          description: 'Profile image updated successfully',
        })
      } catch (error) {
        console.error('Error cropping image:', error)
        toast({
          title: 'Error',
          description: 'Failed to crop image',
          variant: 'destructive',
        })
      }
    }
  }

  const updateProfileImageInStorage = (imageData: string) => {
    try {
      const sessionKey = userType === 'student' ? 'student_session' : 'faculty_session'
      const session = localStorage.getItem(sessionKey)
      
      if (session) {
        const sessionData = JSON.parse(session)
        sessionData.profile_image = imageData
        localStorage.setItem(sessionKey, JSON.stringify(sessionData))
      }

      const currentUser = localStorage.getItem('currentUser')
      if (currentUser) {
        const userData = JSON.parse(currentUser)
        userData.profile_image = imageData
        localStorage.setItem('currentUser', JSON.stringify(userData))
      }

      const usersKey = userType === 'student' ? 'student_users' : 'faculty_users'
      const users = JSON.parse(localStorage.getItem(usersKey) || '[]')
      const userIndex = users.findIndex((user: any) => user.email === profile.email)
      if (userIndex !== -1) {
        users[userIndex].profile_image = imageData
        localStorage.setItem(usersKey, JSON.stringify(users))
      }
    } catch (error) {
      console.error('Error updating profile image in storage:', error)
    }
  }

  const handleProfileUpdate = async () => {
    setIsUpdatingProfile(true)
    try {
      const sessionKey = userType === 'student' ? 'student_session' : 'faculty_session'
      const session = localStorage.getItem(sessionKey)
      
      if (session) {
        const sessionData = JSON.parse(session)
        const updatedData = {
          ...sessionData,
          name: profile.name,
          email: profile.email,
          department: profile.department,
          year: profile.year,
          mobile: profile.mobile,
          address: profile.address,
        }
        localStorage.setItem(sessionKey, JSON.stringify(updatedData))
      }

      const usersKey = userType === 'student' ? 'student_users' : 'faculty_users'
      const users = JSON.parse(localStorage.getItem(usersKey) || '[]')
      const userIndex = users.findIndex((user: any) => user.email === profile.email)
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...profile }
        localStorage.setItem(usersKey, JSON.stringify(users))
      }

      setIsEditing(false)
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      })
      return
    }

    setIsUpdatingPassword(true)
    try {
      const usersKey = userType === 'student' ? 'student_users' : 'faculty_users'
      const users = JSON.parse(localStorage.getItem(usersKey) || '[]')
      const userIndex = users.findIndex((user: any) => user.email === profile.email)
      
      if (userIndex !== -1 && users[userIndex].password === passwordData.currentPassword) {
        users[userIndex].password = passwordData.newPassword
        localStorage.setItem(usersKey, JSON.stringify(users))
        
        setShowPasswordDialog(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        
        toast({
          title: 'Success',
          description: 'Password updated successfully',
        })
      } else {
        toast({
          title: 'Error',
          description: 'Current password is incorrect',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error updating password:', error)
      toast({
        title: 'Error',
        description: 'Failed to update password',
        variant: 'destructive',
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <User className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0">
            <CardHeader className="text-center pb-6">
              <div className="relative mx-auto">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={profile.photo || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl">
                    {profile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 bg-blue-600 hover:bg-blue-700"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              
              <div className="mt-4">
                <h2 className="text-xl font-semibold text-gray-900">{profile.name}</h2>
                <p className="text-gray-600">{profile.email}</p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Profile Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="prn">{userType === 'student' ? 'PRN' : 'Faculty ID'}</Label>
                  <Input
                    id="prn"
                    value={profile.prn}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div>
                
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                
                {userType === 'student' && (
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      value={profile.year}
                      onChange={(e) => setProfile(prev => ({ ...prev, year: e.target.value }))}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    id="mobile"
                    value={profile.mobile}
                    onChange={(e) => setProfile(prev => ({ ...prev, mobile: e.target.value }))}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleProfileUpdate}
                    disabled={isUpdatingProfile}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      loadUserProfile()
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              <Separator className="my-6" />

              {/* Password Update Button */}
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordDialog(true)}
                  className="w-full md:w-auto"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Image Crop Dialog */}
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crop Profile Image</DialogTitle>
            </DialogHeader>
            
            {selectedImage && (
              <div className="space-y-4">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    src={selectedImage}
                    alt="Crop preview"
                    className="max-w-full h-auto"
                  />
                </ReactCrop>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCropComplete}>
                <Camera className="w-4 h-4 mr-2" />
                Apply Crop
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Password Update Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Password</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handlePasswordUpdate}
                disabled={isUpdatingPassword}
              >
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
