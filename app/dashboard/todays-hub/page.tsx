"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Megaphone, Search, AlertTriangle } from "lucide-react"

interface NotificationItem { 
  id: string; 
  title: string; 
  created_at: string; 
  description?: string; 
  type: 'assignment' | 'announcement' | 'lost_found' | 'grievance' | 'study_group' | 'event';
}

export default function TodaysHubPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const allNotifications: NotificationItem[] = []

        // Get assignments (RLS will filter by dept/year automatically)
        const { data: assignments } = await supabase
          .from('assignments')
          .select('id, title, created_at, description')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(20)
        
        if (assignments) {
          assignments.forEach(item => {
            allNotifications.push({
              ...item,
              type: 'assignment'
            })
          })
        }

        // Get announcements (RLS will filter by dept/year automatically)
        const { data: announcements } = await supabase
          .from('announcements')
          .select('id, title, created_at, content')
          .order('created_at', { ascending: false })
          .limit(20)
        
        if (announcements) {
          announcements.forEach(item => {
            allNotifications.push({
              id: item.id,
              title: item.title,
              created_at: item.created_at,
              description: item.content,
              type: 'announcement'
            })
          })
        }

        // Get study groups (RLS will filter by dept/year automatically)
        const { data: studyGroups } = await supabase
          .from('study_groups')
          .select('id, name, created_at, description')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(20)
        
        if (studyGroups) {
          studyGroups.forEach(item => {
            allNotifications.push({
              id: item.id,
              title: item.name,
              created_at: item.created_at,
              description: item.description,
              type: 'study_group'
            })
          })
        }

        // Get events (university-wide)
        const { data: events } = await supabase
          .from('events')
          .select('id, title, created_at, description')
          .order('created_at', { ascending: false })
          .limit(20)
        
        if (events) {
          events.forEach(item => {
            allNotifications.push({
              ...item,
              type: 'event'
            })
          })
        }

        // Get lost & found (university-wide)
        const { data: lostFound } = await supabase
          .from('lost_found_items')
          .select('id, title, created_at, description')
          .order('created_at', { ascending: false })
          .limit(20)
        
        if (lostFound) {
          lostFound.forEach(item => {
            allNotifications.push({
              ...item,
              type: 'lost_found'
            })
          })
        }

        // Sort all notifications by created_at desc and take latest 30
        allNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setNotifications(allNotifications.slice(0, 30))

      } catch (error) {
        console.error('Error loading notifications:', error)
      } finally {
        setLoading(false)
      }
    }
    
    load()
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'assignment': return <BookOpen className="h-4 w-4" />
      case 'announcement': return <Megaphone className="h-4 w-4" />
      case 'study_group': return <BookOpen className="h-4 w-4" />
      case 'event': return <Clock className="h-4 w-4" />
      case 'lost_found': return <Search className="h-4 w-4" />
      case 'grievance': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'assignment': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'announcement': return 'bg-green-100 text-green-800 border-green-200'
      case 'study_group': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'event': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'lost_found': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'grievance': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="space-y-3 md:space-y-4">
        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-xl md:text-2xl font-bold">Today's Hub</motion.h1>
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 h-16 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-xl md:text-2xl font-bold">
        Today's Hub
      </motion.h1>
      
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 md:p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-semibold">Latest Updates</h2>
            <Badge className="bg-blue-600 text-white">{notifications.length}</Badge>
          </div>
          
          <div className="space-y-3">
            {notifications.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-8">
                No notifications yet. Check back later!
              </div>
            )}
            
            {notifications.map((notification, index) => (
              <motion.div 
                key={notification.id} 
                initial={{ opacity: 0, y: 6 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg bg-white dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-sm md:text-base truncate">{notification.title}</h3>
                        <Badge variant="outline" className={`text-xs ${getTypeColor(notification.type)} capitalize`}>
                          {notification.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      {notification.description && (
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                          {notification.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(notification.created_at)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
