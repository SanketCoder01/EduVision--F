"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Eye, Mail, Phone, GraduationCap, Building, Users, X, BadgeCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"

const departments = [
  { id: "cse", name: "Computer Science & Engineering", code: "CSE", color: "bg-blue-500" },
  { id: "cyber", name: "Cyber Security", code: "CY", color: "bg-purple-500" },
  { id: "aids", name: "AI & Data Science", code: "AIDS", color: "bg-green-500" },
  { id: "aiml", name: "AI & Machine Learning", code: "AIML", color: "bg-orange-500" },
]

export default function ManageFacultyPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [facultyData, setFacultyData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null)
  const channelRef = useRef<any>(null)

  const loadFaculty = async () => {
    try {
      const { data, error } = await supabase
        .from("faculty")
        .select("*")
        .order("name", { ascending: true })
      if (error) throw error
      setFacultyData(data || [])
    } catch (error) {
      console.error("Error loading faculty:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFaculty()

    // Supabase realtime subscription
    channelRef.current = supabase
      .channel("faculty-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "faculty" }, () => {
        loadFaculty()
      })
      .subscribe()

    return () => {
      channelRef.current?.unsubscribe()
    }
  }, [])

  const filteredFaculty = facultyData.filter((f) => {
    const matchesSearch =
      f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDept = selectedDepartment === "all" || f.department?.toLowerCase() === selectedDepartment
    return matchesSearch && matchesDept
  })

  const getDeptInfo = (deptVal: string) => {
    if (!deptVal) return departments[0]
    return (
      departments.find(
        (d) =>
          d.id === deptVal?.toLowerCase() ||
          d.id === deptVal?.toLowerCase().replace(/\s+/g, "").substring(0, 3) ||
          deptVal?.toLowerCase().includes(d.id)
      ) || { id: "other", name: deptVal, code: deptVal?.substring(0, 3).toUpperCase(), color: "bg-gray-500" }
    )
  }

  const getCountByDept = (deptId: string) =>
    facultyData.filter((f) => f.department?.toLowerCase().includes(deptId)).length

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-lg" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header — View Only */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faculty Directory</h1>
          <p className="text-gray-600 mt-1">
            View all faculty members across departments •{" "}
            <span className="font-semibold text-blue-600">{facultyData.length} total</span>
          </p>
        </div>
        <Badge className="bg-green-100 text-green-700 border border-green-200 text-sm px-3 py-1">
          🔴 Live Realtime
        </Badge>
      </div>

      {/* Department Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {departments.map((dept, index) => (
          <motion.div
            key={dept.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={`border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer ${selectedDepartment === dept.id ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => setSelectedDepartment(selectedDepartment === dept.id ? "all" : dept.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                      <Badge variant="secondary" className="text-xs font-medium">{dept.code}</Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{dept.name}</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{getCountByDept(dept.id)}</p>
                    <p className="text-xs text-gray-500">Faculty Members</p>
                  </div>
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or employee ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant={selectedDepartment === "all" ? "default" : "outline"} onClick={() => setSelectedDepartment("all")} size="sm">All</Button>
              {departments.map((dept) => (
                <Button key={dept.id} variant={selectedDepartment === dept.id ? "default" : "outline"} onClick={() => setSelectedDepartment(dept.id)} size="sm" className="hidden md:inline-flex">{dept.code}</Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Faculty Grid */}
      {filteredFaculty.length === 0 ? (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Faculty Found</h3>
            <p className="text-gray-600">No faculty match your search criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((faculty, index) => {
            const deptInfo = getDeptInfo(faculty.department)
            return (
              <motion.div
                key={faculty.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-14 w-14 ring-2 ring-gray-200 shrink-0">
                        <AvatarImage src={faculty.face_image || faculty.photo_url || faculty.photo || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-lg font-bold">
                          {faculty.name?.charAt(0) || "F"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{faculty.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{faculty.designation || "Faculty"}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className={`w-2 h-2 rounded-full ${deptInfo.color}`} />
                          <Badge variant="secondary" className="text-xs">{deptInfo.code}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{faculty.email}</span>
                      </div>
                      {faculty.department && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{faculty.department}</span>
                        </div>
                      )}
                      {faculty.college_name && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{faculty.college_name}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={() => setSelectedFaculty(faculty)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Faculty Detail Modal */}
      <Dialog open={!!selectedFaculty} onOpenChange={() => setSelectedFaculty(null)}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          {selectedFaculty && (
            <div>
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
                <button
                  onClick={() => setSelectedFaculty(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/40 shrink-0 bg-white/20">
                    {selectedFaculty.face_image || selectedFaculty.photo_url || selectedFaculty.photo ? (
                      <img src={selectedFaculty.face_image || selectedFaculty.photo_url || selectedFaculty.photo} alt={selectedFaculty.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                        {selectedFaculty.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedFaculty.name}</h2>
                    <p className="text-blue-100">{selectedFaculty.designation || "Faculty Member"}</p>
                    <Badge className="mt-1 bg-white/20 text-white border border-white/30">
                      <BadgeCheck className="h-3 w-3 mr-1" /> Faculty
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {[
                  { label: "Employee ID", value: selectedFaculty.employee_id },
                  { label: "Email", value: selectedFaculty.email, icon: <Mail className="h-4 w-4 text-blue-500" /> },
                  { label: "Phone", value: selectedFaculty.phone, icon: <Phone className="h-4 w-4 text-green-500" /> },
                  { label: "Department", value: selectedFaculty.department, icon: <Building className="h-4 w-4 text-purple-500" /> },
                  { label: "College", value: selectedFaculty.college_name, icon: <GraduationCap className="h-4 w-4 text-orange-500" /> },
                  { label: "Qualification", value: selectedFaculty.qualification },
                  { label: "Experience", value: selectedFaculty.experience_years ? `${selectedFaculty.experience_years} years` : undefined },
                  { label: "Address", value: selectedFaculty.address },
                ].map(({ label, value, icon }) =>
                  value ? (
                    <div key={label} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      {icon && <div className="mt-0.5">{icon}</div>}
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
                      </div>
                    </div>
                  ) : null
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={selectedFaculty.status === "active" ? "default" : "secondary"} className={selectedFaculty.status === "active" ? "bg-green-100 text-green-700" : ""}>
                    {selectedFaculty.status || "active"}
                  </Badge>
                  {selectedFaculty.created_at && (
                    <span className="text-xs text-gray-500">Joined: {new Date(selectedFaculty.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
