"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  GraduationCap, Search, Eye, Mail, Phone, BookOpen, AlertCircle,
  Users, Building, CreditCard, Calendar, X, BadgeCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"

const DEPARTMENTS = [
  { id: "cse", name: "Computer Science & Engineering", code: "CSE", color: "bg-blue-500" },
  { id: "cyber", name: "Cyber Security", code: "CY", color: "bg-purple-500" },
  { id: "aids", name: "AI & Data Science", code: "AIDS", color: "bg-green-500" },
  { id: "aiml", name: "AI & Machine Learning", code: "AIML", color: "bg-orange-500" },
]

const YEARS = [
  { id: "1st", name: "1st Year" },
  { id: "2nd", name: "2nd Year" },
  { id: "3rd", name: "3rd Year" },
  { id: "4th", name: "4th Year" },
]

const YEAR_LABELS: Record<string, string> = {
  "1st": "First Year", "2nd": "Second Year", "3rd": "Third Year", "4th": "Fourth Year",
}

const DEPT_LABELS: Record<string, string> = {
  cse: "Computer Science & Engineering (CSE)",
  cyber: "Cyber Security",
  aids: "AI & Data Science (AIDS)",
  aiml: "AI & Machine Learning (AIML)",
}

export default function ManageStudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDept, setSelectedDept] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")
  const [studentsData, setStudentsData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const channelRefs = useRef<any[]>([])

  const loadAllStudents = async () => {
    try {
      const allStudents: any[] = []
      for (const dept of DEPARTMENTS) {
        for (const year of YEARS) {
          const tableName = `students_${dept.id}_${year.id}_year`
          const { data, error } = await supabase
            .from(tableName)
            .select("*")
          if (!error && data) {
            const enriched = data.map((s) => ({
              ...s,
              _dept: dept.id,
              _year: year.id,
            }))
            allStudents.push(...enriched)
          }
        }
      }
      setStudentsData(allStudents)
    } catch (err) {
      console.error("Error loading students:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAllStudents()

    // Subscribe to all sharded tables
    channelRefs.current.forEach((ch) => ch?.unsubscribe())
    channelRefs.current = []

    for (const dept of DEPARTMENTS) {
      for (const year of YEARS) {
        const tableName = `students_${dept.id}_${year.id}_year`
        const ch = supabase
          .channel(`rt-${tableName}`)
          .on("postgres_changes", { event: "*", schema: "public", table: tableName }, () => {
            loadAllStudents()
          })
          .subscribe()
        channelRefs.current.push(ch)
      }
    }

    return () => {
      channelRefs.current.forEach((ch) => ch?.unsubscribe())
    }
  }, [])

  const filtered = studentsData.filter((s) => {
    const name = s.name || s.full_name || ""
    const email = s.email || ""
    const prn = s.prn || ""
    const matchSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prn.toLowerCase().includes(searchTerm.toLowerCase())
    const matchDept = selectedDept === "all" || s._dept === selectedDept
    const matchYear = selectedYear === "all" || s._year === selectedYear
    return matchSearch && matchDept && matchYear
  })

  const getCount = (dept: string, year: string) =>
    studentsData.filter((s) =>
      (dept === "all" || s._dept === dept) && (year === "all" || s._year === year)
    ).length

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
          <h1 className="text-3xl font-bold text-gray-900">Student Directory</h1>
          <p className="text-gray-600 mt-1">
            All enrolled students across all departments and years •{" "}
            <span className="font-semibold text-emerald-600">{studentsData.length} total</span>
          </p>
        </div>
        <Badge className="bg-green-100 text-green-700 border border-green-200 text-sm px-3 py-1">
          🔴 Live Realtime
        </Badge>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {DEPARTMENTS.map((dept, i) => (
          <motion.div key={dept.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card
              className={`border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all cursor-pointer ${selectedDept === dept.id ? "ring-2 ring-emerald-500" : ""}`}
              onClick={() => setSelectedDept(selectedDept === dept.id ? "all" : dept.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                      <Badge variant="secondary" className="text-xs">{dept.code}</Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{dept.name}</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{getCount(dept.id, "all")}</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                  <GraduationCap className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Year Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {YEARS.map((year, i) => (
          <motion.div key={year.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.4 }}>
            <Card
              className={`border-0 shadow-md hover:shadow-lg transition-all cursor-pointer ${selectedYear === year.id ? "ring-2 ring-blue-400" : ""}`}
              onClick={() => setSelectedYear(selectedYear === year.id ? "all" : year.id)}
            >
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-gray-900 text-sm">{year.name}</h3>
                <p className="text-xl font-bold text-gray-900">{getCount(selectedDept, year.id)}</p>
                <p className="text-xs text-gray-500">Students</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search & Filters */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or PRN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {DEPARTMENTS.map((d) => <SelectItem key={d.id} value={d.id}>{d.code}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {YEARS.map((y) => <SelectItem key={y.id} value={y.id}>{y.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      {filtered.length === 0 ? (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-600">No students match your search.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((student, index) => {
            const name = student.name || student.full_name || "Unknown"
            const deptInfo = DEPARTMENTS.find((d) => d.id === student._dept) || DEPARTMENTS[0]
            return (
              <motion.div key={`${student._dept}-${student._year}-${student.id || student.email}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar className="h-12 w-12 ring-2 ring-gray-200 shrink-0">
                        <AvatarImage src={student.photo || student.face_image || student.photo_url || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white font-bold">
                          {name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
                        {student.prn && <p className="text-xs text-gray-500">PRN: {student.prn}</p>}
                        <div className="flex gap-1 mt-1">
                          <Badge variant="secondary" className="text-xs">{deptInfo.code}</Badge>
                          <Badge variant="outline" className="text-xs">{YEAR_LABELS[student._year] || student._year}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{student.email}</span>
                      </div>
                      {(student.phone || student.phone_number) && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>{student.phone || student.phone_number}</span>
                        </div>
                      )}
                      {student.college_name && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Building className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{student.college_name}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                        onClick={() => setSelectedStudent({ ...student, _deptInfo: deptInfo })}
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

      {/* Student Detail Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          {selectedStudent && (() => {
            const name = selectedStudent.name || selectedStudent.full_name || "Unknown"
            const deptInfo = selectedStudent._deptInfo || DEPARTMENTS[0]
            return (
              <div>
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white relative">
                  <button onClick={() => setSelectedStudent(null)} className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white/40 shrink-0 bg-white/20">
                      {selectedStudent.photo || selectedStudent.face_image || selectedStudent.photo_url ? (
                        <img src={selectedStudent.photo || selectedStudent.face_image || selectedStudent.photo_url} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">{name?.charAt(0)}</div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{name}</h2>
                      <p className="text-emerald-100">{deptInfo.name}</p>
                      <Badge className="mt-1 bg-white/20 text-white border border-white/30">
                        <BadgeCheck className="h-3 w-3 mr-1" /> Student — {YEAR_LABELS[selectedStudent._year] || selectedStudent._year}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  {[
                    { label: "PRN", value: selectedStudent.prn, icon: <CreditCard className="h-4 w-4 text-blue-500" /> },
                    { label: "Email", value: selectedStudent.email, icon: <Mail className="h-4 w-4 text-blue-500" /> },
                    { label: "Phone", value: selectedStudent.phone || selectedStudent.phone_number, icon: <Phone className="h-4 w-4 text-green-500" /> },
                    { label: "College", value: selectedStudent.college_name, icon: <Building className="h-4 w-4 text-orange-500" /> },
                    { label: "Department", value: DEPT_LABELS[selectedStudent._dept] || selectedStudent._dept, icon: <BookOpen className="h-4 w-4 text-purple-500" /> },
                    { label: "Year", value: YEAR_LABELS[selectedStudent._year] || selectedStudent._year, icon: <Calendar className="h-4 w-4 text-teal-500" /> },
                    { label: "Address", value: selectedStudent.address },
                    { label: "Parent Name", value: selectedStudent.parent_name },
                    { label: "Parent Phone", value: selectedStudent.parent_phone },
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
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
