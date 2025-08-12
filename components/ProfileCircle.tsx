"use client"

import React, { useState, useEffect } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface ProfileCircleProps {
  userType?: 'student' | 'faculty'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function ProfileCircle({ userType = 'student', size = 'sm', className = '' }: ProfileCircleProps) {
  const [profileData, setProfileData] = useState<any>(null)

  useEffect(() => {
    const loadProfileData = () => {
      try {
        // Try to get user data from multiple sources
        const sessionKey = userType === 'student' ? 'student_session' : 'faculty_session'
        let userData = localStorage.getItem(sessionKey) || 
                      localStorage.getItem('currentUser')

        if (userData) {
          const parsedData = JSON.parse(userData)
          setProfileData(parsedData)
        }
      } catch (error) {
        console.error('Error loading profile data:', error)
      }
    }

    loadProfileData()

    // Listen for storage changes to update profile image in real-time
    const handleStorageChange = () => {
      loadProfileData()
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom profile update events
    window.addEventListener('profileUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('profileUpdated', handleStorageChange)
    }
  }, [userType])

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const displayName = profileData?.name || profileData?.full_name || 'User'
  const profileImage = profileData?.profile_image

  return (
    <Avatar className={`${sizeClasses[size]} border-2 border-white shadow-sm ${className}`}>
      <AvatarImage 
        src={profileImage} 
        alt={displayName}
        className="object-cover"
      />
      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-xs">
        {displayName.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}
