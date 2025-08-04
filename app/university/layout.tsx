"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Users,
  GraduationCap,
  UserPlus,
  BookOpen,
  FileText,
  BarChart3,
  Home,
  Menu,
  X,
  LogOut,
  Settings,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/hooks/use-toast"

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/university/dashboard", color: "text-blue-600" },
  { icon: Users, label: "Manage Faculty", href: "/university/manage-faculty", color: "text-green-600" },
  { icon: GraduationCap, label: "Manage Students", href: "/university/manage-students", color: "text-purple-600" },
  { icon: UserPlus, label: "Admissions", href: "/university/admissions", color: "text-orange-600" },
  { icon: FileText, label: "Examinations", href: "/university/examinations", color: "text-red-600" },
  { icon: BookOpen, label: "Courses", href: "/university/courses", color: "text-indigo-600" },
  { icon: BarChart3, label: "Analytics", href: "/university/analytics", color: "text-teal-600" },
]

export default function UniversityLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [adminData, setAdminData] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (pathname === "/university") return

    const adminSession = localStorage.getItem("universityAdmin")
    if (!adminSession) {
      router.push("/university")
      return
    }

    try {
      const admin = JSON.parse(adminSession)
      setAdminData(admin)
    } catch (error) {
      router.push("/university")
    }
  }, [pathname, router])

  const handleLogout = () => {
    localStorage.removeItem("universityAdmin")
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the admin panel.",
    })
    router.push("/university")
  }

  if (pathname === "/university") {
    return <>{children}</>
  }

  if (!adminData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/80 backdrop-blur-xl border-r border-gray-200/50 px-6 pb-4 shadow-xl">
          <div className="flex h-16 shrink-0 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Sanjivani University
                </h1>
                <p className="text-xs text-gray-500">Admin Portal</p>
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
                              ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md border border-blue-200/50"
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
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {adminData?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{adminData?.name}</p>
                <p className="text-xs text-gray-500 truncate">{adminData?.email}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
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
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white/80 backdrop-blur-xl px-4 py-4 shadow-sm sm:px-6 lg:hidden border-b border-gray-200/50">
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
            Sanjivani University
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                  {adminData?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{adminData?.name}</p>
                <p className="w-[200px] truncate text-sm text-muted-foreground">{adminData?.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
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
      {isMobileMenuOpen && (
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
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Sanjivani University
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
                            ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md border border-blue-200/50"
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
      )}

      {/* Main Content */}
      <div className="lg:pl-72">
        <main>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
