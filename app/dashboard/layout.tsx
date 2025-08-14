"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
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
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(0)
  const [showFaceSetup, setShowFaceSetup] = useState(false)

  useEffect(() => {
    // Check for faculty login using correct session key
    const facultySession = localStorage.getItem("faculty_session")
    const currentUser = localStorage.getItem("currentUser")

    if (facultySession) {
      try {
        const faculty = JSON.parse(facultySession)
        setUser(faculty)
        // Don't show face setup if user has photo (already completed during registration)
        if (!faculty.photo && !faculty.faceRegistered) setShowFaceSetup(true)
      } catch (error) {
        console.error("Error parsing faculty session:", error)
        router.push("/login?type=faculty")
      }
    } else if (currentUser) {
      try {
        const userData = JSON.parse(currentUser)
        if (userData.userType === "faculty") {
          setUser(userData)
          // Don't show face setup if user has photo (already completed during registration)
          if (!userData.photo && !userData.faceRegistered) setShowFaceSetup(true)
        } else {
          router.push("/login?type=faculty")
        }
      } catch (error) {
        console.error("Error parsing user data:", error)
        router.push("/login?type=faculty")
      }
    } else {
      router.push("/login?type=faculty")
    }
  }, [router])

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

  const isHomePage = pathname === "/dashboard"

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Faculty Dashboard...</p>
        </div>
      </div>
    )
  }

  const FirstTimeSetup = showFaceSetup ? require("@/components/attendance/first-time-setup").FirstTimeSetup : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/90 backdrop-blur-xl border-r border-gray-200/50 px-6 pb-4 shadow-xl">
          <div className="flex h-16 shrink-0 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  EduVision
                </h1>
                <p className="text-xs text-gray-500">Faculty Portal</p>
              </div>
            </motion.div>
          </div>

          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {sidebarItems.map((item, index) => {
                    const isActive = pathname === item.href
                    return (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          className={`group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-semibold transition-all duration-200 ${
                            isActive
                              ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-md border border-blue-200/50"
                              : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
                          }`}
                        >
                          <item.icon
                            className={`h-6 w-6 shrink-0 transition-colors ${
                              isActive ? "text-blue-600" : `${item.color} group-hover:text-blue-600`
                            }`}
                          />
                          {item.label}
                          {isActive && (
                            <motion.div
                              layoutId="activeTab"
                              className="ml-auto w-2 h-2 bg-blue-600 rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            />
                          )}
                        </Link>
                      </motion.li>
                    )
                  })}
                </ul>
              </li>
            </ul>
          </nav>

          {/* User Profile Section */}
          <div className="mt-auto">
            <div className="flex items-center gap-x-4 px-3 py-3 text-sm font-semibold leading-6 text-gray-900 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200/50">
              <Avatar className="h-10 w-10 ring-2 ring-blue-200">
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  {user?.name?.charAt(0) || "F"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name || "Faculty Member"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                {user?.department && <p className="text-xs text-blue-600 truncate">{user.department.toUpperCase()}</p>}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white/90 backdrop-blur-xl px-4 py-4 shadow-sm sm:px-6 lg:hidden border-b border-gray-200/50">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            EduVision
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs">
                  {user?.name?.charAt(0) || "F"}
                </AvatarFallback>
              </Avatar>
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
                  {notifications}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{user?.name || "Faculty Member"}</p>
                <p className="w-[200px] truncate text-sm text-muted-foreground">{user?.email}</p>
                {user?.department && <p className="text-xs text-blue-600">{user.department.toUpperCase()}</p>}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 lg:hidden"
            >
              <div className="fixed inset-0 bg-gray-900/80" onClick={() => setIsMobileMenuOpen(false)} />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed bottom-0 left-0 top-0 z-50 w-full overflow-y-auto bg-white px-6 pb-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10"
              >
                <div className="flex items-center justify-between py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                      EduVision
                    </span>
                  </div>
                  <button
                    type="button"
                    className="-m-2.5 rounded-md p-2.5 text-gray-700"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <nav className="mt-6">
                  <ul role="list" className="space-y-2">
                    {sidebarItems.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-semibold transition-all duration-200 ${
                              isActive
                                ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-md border border-blue-200/50"
                                : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
                            }`}
                          >
                            <item.icon
                              className={`h-6 w-6 shrink-0 transition-colors ${
                                isActive ? "text-blue-600" : `${item.color} group-hover:text-blue-600`
                              }`}
                            />
                            {item.label}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Breadcrumb */}
        {!isHomePage && (
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200/50 bg-white/90 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6">
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link href="/dashboard" className="text-gray-400 hover:text-gray-500">
                    <Home className="h-4 w-4" />
                  </Link>
                </li>
                <ChevronRight className="h-4 w-4 text-gray-300" />
                <li className="text-sm font-medium text-gray-900 capitalize">
                  {pathname.split("/").pop()?.replace("-", " ")}
                </li>
              </ol>
            </nav>
          </div>
        )}

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {children}
            </motion.div>
            {showFaceSetup && FirstTimeSetup && (
              <FirstTimeSetup
                user_id={user.id}
                user_type="faculty"
                user_name={user.name}
                onComplete={() => {
                  setShowFaceSetup(false)
                  const updated = { ...user, faceRegistered: true }
                  setUser(updated)
                  localStorage.setItem("currentUser", JSON.stringify(updated))
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
