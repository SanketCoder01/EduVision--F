"use client"

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Users, BookOpen } from 'lucide-react'

interface WelcomeScreenProps {
  userData: {
    name: string
    email: string
    photo?: string
    userType: 'student' | 'faculty'
  }
  onComplete: () => void
}

export default function WelcomeScreen({ userData, onComplete }: WelcomeScreenProps) {
  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      console.log('WelcomeScreen: Triggering onComplete callback')
      onComplete()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-6 max-w-sm mx-auto px-4"
      >
        {/* Profile Photo in Circle - Centered and Mobile-Optimized */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gray-100 flex items-center justify-center">
            {userData.photo ? (
              <img 
                src={userData.photo} 
                alt={`${userData.name}'s profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-white text-5xl font-bold">
                {userData.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Floating Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 300 }}
            className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
          >
            {userData.userType === 'student' ? (
              <Users className="w-6 h-6 text-white" />
            ) : (
              <BookOpen className="w-6 h-6 text-white" />
            )}
          </motion.div>
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="space-y-4"
        >
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="text-4xl font-bold text-gray-900"
          >
            Welcome, {userData.name}! 🎉
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-lg text-gray-600"
          >
            Your {userData.userType} account is ready!
          </motion.p>
        </motion.div>

        {/* Success Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="flex justify-center space-x-2"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, -180, -360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
            className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4
            }}
            className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full"
          />
        </motion.div>

        {/* Loading Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="space-y-2"
        >
          <p className="text-sm text-gray-500">
            Setting up your dashboard...
          </p>
          <div className="flex justify-center">
            <motion.div
              animate={{ width: ["0%", "100%"] }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
              className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              style={{ width: "200px" }}
            />
          </div>
        </motion.div>

        {/* EduVision Branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.6 }}
          className="flex items-center justify-center space-x-2 text-gray-400"
        >
          <GraduationCap className="w-5 h-5" />
          <span className="text-sm font-medium">EduVision</span>
        </motion.div>
      </motion.div>
    </div>
  )
}
