"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  Users,
  Calendar,
  MessageSquare,
  Bell,
  Code,
  Home,
  Menu,
  X,
  LogOut,
  User,
  Settings,
  ChevronRight,
  GraduationCap,
  Camera,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { useUser } from "@/contexts/UserContext"
import ChatbotWidget from "@/components/ChatbotWidget"
import SelfieCapture from "@/components/SelfieCapture"
import RealtimeToasts from "@/components/RealtimeToasts"

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", color: "text-blue-600" },
  { icon: BookOpen, label: "Assignments", href: "/dashboard/assignments", color: "text-green-600" },
  { icon: Camera, label: "Attendance", href: "/dashboard/attendance", color: "text-emerald-600" },
  { icon: Users, label: "Study Groups", href: "/dashboard/study-groups", color: "text-blue-600" },
  { icon: Calendar, label: "Events", href: "/dashboard/events", color: "text-orange-600" },
  { icon: Calendar, label: "Timetable", href: "/dashboard/timetable", color: "text-red-600" },
  { icon: MessageSquare, label: "Student Queries", href: "/dashboard/queries", color: "text-indigo-600" },
  { icon: FileText, label: "Study Material", href: "/dashboard/study-material", color: "text-pink-600" },
  { icon: Bell, label: "Announcements", href: "/dashboard/announcements", color: "text-yellow-600" },
  { icon: Code, label: "Compiler", href: "/dashboard/compiler", color: "text-teal-600" },
  { icon: Settings, label: "Other Services", href: "/dashboard/other-services", color: "text-purple-600" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [showFaceSetup, setShowFaceSetup] = useState(false)
  const [submittingFace, setSubmittingFace] = useState(false)
  const { profile } = useUser()

  // One-time onboarding for face setup
  useEffect(() => {
    const onboarding = searchParams?.get("onboarding")
    const alreadyDone = typeof window !== 'undefined' && localStorage.getItem("faceSetupDone") === 'true'
    if (onboarding === 'face-setup' && !alreadyDone) {
      setShowFaceSetup(true)
    }
  }, [searchParams])

  // Auto-close sidebar on route change
  useEffect(() => {
    if (isSidebarOpen) setSidebarOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const handleFaceCaptured = async (photoData: string) => {
    try {
      setSubmittingFace(true)
      const res = await fetch('/api/face', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageBase64: photoData }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to save face')
      toast({ title: 'Face registered', description: 'Your profile photo has been saved.' })
      // Mark done locally and remove onboarding query param
      localStorage.setItem('faceSetupDone', 'true')
      setShowFaceSetup(false)
      const url = new URL(window.location.href)
      url.searchParams.delete('onboarding')
      router.replace(url.pathname + (url.search ? `?${url.searchParams.toString()}` : ''))
    } catch (e: any) {
      toast({ title: 'Unable to save', description: e.message || 'Try again', variant: 'destructive' })
    } finally {
      setSubmittingFace(false)
    }
  }

  const handleFaceBack = () => {
    setShowFaceSetup(false)
    const url = new URL(window.location.href)
    url.searchParams.delete('onboarding')
    router.replace(url.pathname + (url.search ? `?${url.searchParams.toString()}` : ''))
  }

  // NOTE: The session/user logic from the original file has been simplified
  // or is assumed to be handled by a parent component or context.
  // This layout focuses on the UI shell.

  const handleLogout = () => {
    localStorage.removeItem("facultySession")
    localStorage.removeItem("currentUser")
    localStorage.removeItem("userType")
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    })
    router.push("/")
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar (off-canvas for all breakpoints) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 w-64 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">EduVision</h1>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="mt-4 px-2 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${pathname === item.href ? "bg-primary/10 text-primary" : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
            >
              <item.icon className={`mr-3 h-5 w-5 ${item.color}`} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Screen overlay when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-gray-800/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur flex items-center justify-between px-4 py-3 shadow-sm border-b border-gray-200/60 dark:border-gray-700/60">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-semibold">EduVision</span>
            </Link>
          </div>
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={(profile as any)?.avatar_url || (profile as any)?.face_url || "/placeholder-user.jpg"} alt="User avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 pb-28">
            {/* Page transition animation */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
              {children}
            </motion.div>
          </div>
          <ChatbotWidget />
          <RealtimeToasts />
          {/* Face setup modal */}
          {showFaceSetup && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
                <div className="p-2">
                  <SelfieCapture onCapture={handleFaceCaptured} onBack={handleFaceBack} />
                </div>
                {submittingFace && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-black/50">
                    <div className="h-10 w-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
