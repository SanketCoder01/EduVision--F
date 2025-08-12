"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Settings, User, Camera, Upload } from "lucide-react"
import EnhancedProfilePage from "./EnhancedProfilePage"

interface ClickableProfileCircleProps {
  userType: "student" | "faculty"
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function ClickableProfileCircle({ userType, size = "md", className = "" }: ClickableProfileCircleProps) {
  const [profileImage, setProfileImage] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  }

  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }

  useEffect(() => {
    const loadUserData = () => {
      try {
        const sessionKey = `${userType}_session`
        const usersKey = `${userType}_users`
        
        const session = localStorage.getItem(sessionKey)
        if (session) {
          const sessionData = JSON.parse(session)
          const users = JSON.parse(localStorage.getItem(usersKey) || "[]")
          const user = users.find((u: any) => u.email === sessionData.email) || sessionData
          
          setProfileImage(user.profileImage || user.profile_image || user.photo || "")
          setUserName(user.name || "")
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      }
    }

    loadUserData()

    // Listen for profile updates
    const handleStorageChange = () => loadUserData()
    const handleProfileUpdate = () => loadUserData()
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('profileImageUpdated', handleProfileUpdate)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('profileImageUpdated', handleProfileUpdate)
    }
  }, [userType])

  const handleProfileClick = () => {
    // Only show settings menu, not direct profile editor
    setShowSettingsDialog(true)
  }

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowSettingsDialog(true)
  }

  const handleEditProfileClick = () => {
    setShowSettingsDialog(false)
    setShowProfileDialog(true)
  }

  return (
    <>
      {/* Clickable Profile Circle */}
      <div className={`relative group cursor-pointer ${className}`} onClick={handleProfileClick}>
        <Avatar className={`${sizeClasses[size]} ring-2 ring-white shadow-lg hover:ring-blue-300 transition-all duration-200`}>
          <AvatarImage src={profileImage} alt={userName} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
            {userName?.charAt(0)?.toUpperCase() || (userType === "student" ? "S" : "F")}
          </AvatarFallback>
        </Avatar>
        
        {/* Settings Icon Overlay */}
        <div 
          className="absolute -bottom-1 -right-1 bg-gray-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={handleSettingsClick}
        >
          <Settings className={`${iconSizeClasses[size]} text-white`} />
        </div>
      </div>

      {/* Profile Editor Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </DialogTitle>
          </DialogHeader>
          <EnhancedProfilePage userType={userType} onBack={() => setShowProfileDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Quick Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleEditProfileClick}
            >
              <User className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setShowSettingsDialog(false)
                // Navigate to face capture
                window.location.href = `/${userType}/face-capture`
              }}
            >
              <Camera className="mr-2 h-4 w-4" />
              Update Face ID
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
