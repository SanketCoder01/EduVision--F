"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Megaphone, Rss, ArrowLeft, BellOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format } from 'date-fns'

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  department: string;
  year: string | null;
  is_university_wide: boolean;
  faculty: {
    name: string;
    department: string;
  } | null;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/announcements/get')
        if (!response.ok) {
          throw new Error('Failed to fetch announcements')
        }
        const data = await response.json()
        setAnnouncements(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchAnnouncements()
  }, [retryCount])

  const getAudience = (announcement: Announcement) => {
    if (announcement.is_university_wide) {
      return "University-Wide"
    }
    if (announcement.department && !announcement.year) {
      return `For ${announcement.department.toUpperCase()} Department`
    }
    if (announcement.department && announcement.year) {
      return `For ${announcement.department.toUpperCase()} - ${announcement.year.charAt(0).toUpperCase() + announcement.year.slice(1)} Year`
    }
    return "General"
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )
    }

    if (error) {
      return (
        <div className="text-center h-64 flex flex-col justify-center items-center">
            <BellOff className="w-16 h-16 mb-4 text-red-400" />
            <h3 className="text-xl font-semibold text-red-500 mb-2">Failed to Load Announcements</h3>
            <p className="text-red-400 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => setRetryCount(prev => prev + 1)}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
        </div>
      )
    }

    if (announcements.length === 0) {
      return (
        <div className="text-center text-gray-500 h-64 flex flex-col justify-center items-center">
          <BellOff className="w-16 h-16 mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold">No New Announcements</h3>
          <p>There are currently no announcements for you. Please check back later.</p>
        </div>
      )
    }

    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {announcements.map((ann, index) => (
          <motion.div
            key={ann.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 p-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full">
                            <Megaphone className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{ann.title}</CardTitle>
                            <CardDescription className="text-sm">
                                Posted by: {ann.faculty?.name || 'Admin'} on {format(new Date(ann.created_at), 'PPP')}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="text-xs text-gray-500 px-2 py-1 bg-gray-200 rounded-full">
                        {getAudience(ann)}
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ann.content}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => window.history.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Rss className="h-6 w-6 mr-3 text-green-600" />
        <h1 className="text-2xl font-bold">Announcements</h1>
      </div>
      <Separator className="mb-6" />
      {renderContent()}
    </div>
  )
}