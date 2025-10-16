"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  Users,
  TrendingUp,
  BookOpen,
  Award,
  Calendar,
  Code,
  BarChart3,
  GraduationCap,
  Bot,
  Home,
  LogOut,
  Menu,
  X,
  Shield,
  Bell,
  Settings
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

// Import module components
import OverviewModule from "./modules/overview"
import StudentProgressModule from "./modules/student-progress"
import FacultyAnalyticsModule from "./modules/faculty-analytics"
import ResultManagementModule from "./modules/result-management"
import EventsModule from "./modules/events"
import HackathonModule from "./modules/hackathon"
import DepartmentAnalyticsModule from "./modules/department-analytics"
import CurriculumModule from "./modules/curriculum-optimization"
import AIcopilotModule from "./modules/ai-copilot"
import ProfileModule from "./modules/profile"
import NotificationsModule from "./modules/notifications"
import SettingsModule from "./modules/settings"

interface DeanUser {
  id: string
  email: string
  name: string
  department: string
  designation?: string
}

export default function DeanDashboard() {
  const [dean, setDean] = useState<DeanUser | null>(null)
  const [activeModule, setActiveModule] = useState("overview")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  const sidebarItems = [
    { id: "overview", label: "Dashboard", icon: Home, color: "text-blue-600" },
    { id: "students", label: "Student Progress", icon: Users, color: "text-green-600" },
    { id: "faculty", label: "Faculty Analytics", icon: TrendingUp, color: "text-purple-600" },
    { id: "results", label: "Result Management", icon: BookOpen, color: "text-orange-600" },
    { id: "events", label: "Event Organizing", icon: Calendar, color: "text-pink-600" },
    { id: "hackathon", label: "Hackathon", icon: Code, color: "text-red-600" },
    { id: "analytics", label: "Department Analytics", icon: BarChart3, color: "text-indigo-600" },
    { id: "curriculum", label: "Curriculum Optimization", icon: GraduationCap, color: "text-teal-600" },
    { id: "ai-copilot", label: "Dean AI Copilot", icon: Bot, color: "text-cyan-600" },
  ]

  useEffect(() => {
    checkAuthentication()
  }, [router])

  const checkAuthentication = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push("/deanlogin")
        return
      }

      // Fetch dean profile
      const { data: deanData, error } = await supabase
        .from('deans')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (error || !deanData) {
        await supabase.auth.signOut()
        router.push("/deanlogin")
        return
      }

      setDean(deanData)
      setIsLoading(false)
    } catch (error) {
      console.error("Authentication error:", error)
      router.push("/deanlogin")
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      })
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const renderModuleContent = () => {
    if (!dean) return null

    switch (activeModule) {
      case "overview":
        return <OverviewModule dean={dean} />
      
      case "students":
        return <StudentProgressModule dean={dean} />
      
      case "faculty":
        return <FacultyAnalyticsModule dean={dean} />
      
      case "results":
        return <ResultManagementModule dean={dean} />
      
      case "events":
        return <EventsModule dean={dean} />
      
      case "hackathon":
        return <HackathonModule dean={dean} />
      
      case "analytics":
        return <DepartmentAnalyticsModule dean={dean} />
      
      case "curriculum":
        return <CurriculumModule dean={dean} />
      
      case "ai-copilot":
        return <AIcopilotModule dean={dean} />
      
      case "profile":
        return <ProfileModule dean={dean} onUpdate={checkAuthentication} />
      
      case "notifications":
        return <NotificationsModule dean={dean} />
      
      case "settings":
        return <SettingsModule dean={dean} />

      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dean Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dean) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isSidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Dean Portal</h1>
                <p className="text-xs text-gray-600">Sanjivani University</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeModule === item.id
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {dean.name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{dean.name}</p>
                <p className="text-xs text-gray-600 truncate">{dean.designation || 'Dean'}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {sidebarItems.find(item => item.id === activeModule)?.label}
                </h2>
                <p className="text-sm text-gray-600">
                  Welcome back, {dean.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveModule('notifications')}
                className="relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  3
                </span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveModule('settings')}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <button
                onClick={() => setActiveModule('profile')}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {dean.name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 bg-gray-50 min-h-screen">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderModuleContent()}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
