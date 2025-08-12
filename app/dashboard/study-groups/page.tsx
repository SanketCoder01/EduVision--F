"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Search, School, ArrowRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

interface ClassInfo {
  id: string
  name: string
  description?: string
  subject?: string
  faculty?: string
  maxMembers?: number
  students_count?: number
  created_at?: string
}

export default function StudyGroupsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [classes, setClasses] = useState<ClassInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load classes from localStorage
    const storedClasses = JSON.parse(localStorage.getItem("study_classes") || "[]")
    setClasses(storedClasses)
    setIsLoading(false)
  }, [])

  // Filter classes based on search query
  const filteredClasses = classes.filter((cls) => {
    if (searchQuery === "") return true
    return (
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.faculty?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold flex items-center">
          <Users className="inline-block mr-2 h-6 w-6 text-blue-600" />
          Study Groups Management
        </h1>

        <Button onClick={() => router.push("/dashboard/study-groups/create")} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Create New Groups
        </Button>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search classes..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))
          ) : filteredClasses.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <School className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
              <p className="text-gray-500 mb-4">Create your first class to start managing study groups.</p>
              <Button
                onClick={() => router.push("/dashboard/study-groups/create")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Class
              </Button>
            </div>
          ) : (
            filteredClasses.map((cls) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6" onClick={() => router.push(`/dashboard/study-groups/${cls.id}`)}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{cls.name}</h3>
                        {cls.subject && <p className="text-sm text-blue-600 font-medium">{cls.subject}</p>}
                        {cls.faculty && <p className="text-sm text-gray-500">Faculty: {cls.faculty}</p>}
                        <p className="text-sm text-gray-500">
                          {cls.students_count || 0} {cls.students_count === 1 ? "student" : "students"}
                        </p>
                      </div>
                      <School className="h-8 w-8 text-blue-500" />
                    </div>
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">{cls.description || "No description"}</p>
                    {cls.maxMembers && (
                      <div className="mb-4">
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Max {cls.maxMembers} members per group
                        </span>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" className="text-blue-600">
                        Manage Groups <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </AnimatePresence>
    </div>
  )
}