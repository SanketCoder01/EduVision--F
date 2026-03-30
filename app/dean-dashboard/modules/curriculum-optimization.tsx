"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  GraduationCap, Plus, Edit, CheckCircle, Clock, TrendingUp,
  BookOpen, Users, Sparkles, Trash2, BookMarked, RefreshCw
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Cyber Security",
  "AI & Data Science",
  "AI & Machine Learning",
]

const DEPT_IDS: Record<string, string> = {
  "Computer Science & Engineering": "cse",
  "Cyber Security": "cyber",
  "AI & Data Science": "aids",
  "AI & Machine Learning": "aiml",
}

const YEARS = [
  { value: "1st", label: "1st Year" },
  { value: "2nd", label: "2nd Year" },
  { value: "3rd", label: "3rd Year" },
  { value: "4th", label: "4th Year" },
]

export default function CurriculumOptimizationModule({ dean }: { dean: any }) {
  const [curriculums, setCurriculums] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { toast } = useToast()

  // Subject Assignment state
  const [subjects, setSubjects] = useState<any[]>([])
  const [subjectLoading, setSubjectLoading] = useState(false)
  const [subjectForm, setSubjectForm] = useState({
    department: "Computer Science & Engineering",
    year: "1st",
    subject_name: "",
    subject_code: "",
    credits: "3",
  })
  const [filterDept, setFilterDept] = useState("Computer Science & Engineering")
  const [filterYear, setFilterYear] = useState("1st")
  const [addingSubject, setAddingSubject] = useState(false)
  const channelRef = useRef<any>(null)

  const [formData, setFormData] = useState({
    department: dean.department || DEPARTMENTS[0],
    year: "3rd",
    subject: "",
    current_syllabus: "",
    proposed_changes: "",
    industry_requirements: "",
    effective_from: "",
  })

  useEffect(() => {
    fetchCurriculums()
    fetchSubjects()

    // Realtime for department_subjects
    channelRef.current = supabase
      .channel("dean-subjects-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "department_subjects" }, () => {
        fetchSubjects()
      })
      .subscribe()

    return () => {
      channelRef.current?.unsubscribe()
    }
  }, [])

  const fetchCurriculums = async () => {
    try {
      const { data, error } = await supabase
        .from("curriculum_optimization")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      setCurriculums(data || [])
    } catch (error) {
      console.error("Error fetching curriculums:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      setSubjectLoading(true)
      const { data, error } = await supabase
        .from("department_subjects")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) throw error
      setSubjects(data || [])
    } catch (error) {
      console.error("Error fetching subjects:", error)
    } finally {
      setSubjectLoading(false)
    }
  }

  const handleAddSubject = async () => {
    if (!subjectForm.subject_name.trim()) {
      toast({ title: "Subject name is required", variant: "destructive" })
      return
    }
    setAddingSubject(true)
    try {
      const { error } = await supabase.from("department_subjects").insert([{
        department: subjectForm.department,
        year: subjectForm.year,
        subject_name: subjectForm.subject_name.trim(),
        subject_code: subjectForm.subject_code.trim() || null,
        credits: parseInt(subjectForm.credits) || 3,
        created_by: dean.id || null,
      }])
      if (error) throw error
      toast({
        title: "Subject added!",
        description: `${subjectForm.subject_name} assigned to ${subjectForm.department} — ${subjectForm.year} Year`,
      })
      setSubjectForm((prev) => ({ ...prev, subject_name: "", subject_code: "", credits: "3" }))
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add subject", variant: "destructive" })
    } finally {
      setAddingSubject(false)
    }
  }

  const handleDeleteSubject = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will remove it from faculty dropdowns.`)) return
    const { error } = await supabase.from("department_subjects").delete().eq("id", id)
    if (error) {
      toast({ title: "Error", description: "Failed to delete subject", variant: "destructive" })
    } else {
      toast({ title: "Subject removed", description: name })
    }
  }

  const filteredSubjects = subjects.filter(
    (s) => s.department === filterDept && s.year === filterYear
  )

  const handleCurriculumSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from("curriculum_optimization").insert([{
        ...formData,
        created_by: dean.id,
        student_feedback_score: 0,
        implementation_status: "proposed",
      }])
      if (error) throw error
      toast({ title: "Curriculum proposal created", description: "Your curriculum optimization proposal has been submitted" })
      setShowCreateForm(false)
      setFormData({ department: dean.department || DEPARTMENTS[0], year: "3rd", subject: "", current_syllabus: "", proposed_changes: "", industry_requirements: "", effective_from: "" })
      fetchCurriculums()
    } catch (error) {
      toast({ title: "Error", description: "Failed to create curriculum proposal", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Proposals", value: curriculums.length, color: "from-blue-500 to-blue-600", icon: <GraduationCap className="h-10 w-10 text-blue-200" /> },
          { label: "Implemented", value: curriculums.filter((c) => c.implementation_status === "implemented").length, color: "from-green-500 to-green-600", icon: <CheckCircle className="h-10 w-10 text-green-200" /> },
          { label: "Pending Review", value: curriculums.filter((c) => c.implementation_status === "proposed").length, color: "from-orange-500 to-orange-600", icon: <Clock className="h-10 w-10 text-orange-200" /> },
          { label: "Total Subjects", value: subjects.length, color: "from-purple-500 to-purple-600", icon: <BookMarked className="h-10 w-10 text-purple-200" /> },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={`border-0 shadow-lg bg-gradient-to-br ${stat.color} text-white`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white/80">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  {stat.icon}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="subjects">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="subjects" className="flex items-center gap-2">
            <BookMarked className="h-4 w-4" />
            Assign Subjects
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Curriculum Proposals
          </TabsTrigger>
        </TabsList>

        {/* ============ TAB 1: ASSIGN SUBJECTS ============ */}
        <TabsContent value="subjects" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Assign Subjects</h2>
              <p className="text-gray-600 text-sm mt-1">
                Add subjects per department &amp; year — faculty will see these in their assignment dropdowns in realtime
              </p>
            </div>
            <Badge className="bg-green-100 text-green-700 border border-green-200 px-3 py-1">
              🔴 Realtime Sync
            </Badge>
          </div>

          {/* Add Subject Form */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <Plus className="h-5 w-5" />
                Add New Subject
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department <span className="text-red-500">*</span></label>
                  <select
                    value={subjectForm.department}
                    onChange={(e) => setSubjectForm({ ...subjectForm, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year <span className="text-red-500">*</span></label>
                  <select
                    value={subjectForm.year}
                    onChange={(e) => setSubjectForm({ ...subjectForm, year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {YEARS.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name <span className="text-red-500">*</span></label>
                  <Input
                    value={subjectForm.subject_name}
                    onChange={(e) => setSubjectForm({ ...subjectForm, subject_name: e.target.value })}
                    placeholder="e.g., Data Structures & Algorithms"
                    onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                  <Input
                    value={subjectForm.subject_code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, subject_code: e.target.value })}
                    placeholder="e.g., CSE301"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credits</label>
                  <Input
                    type="number"
                    min={1}
                    max={6}
                    value={subjectForm.credits}
                    onChange={(e) => setSubjectForm({ ...subjectForm, credits: e.target.value })}
                    placeholder="3"
                  />
                </div>
              </div>
              <Button
                onClick={handleAddSubject}
                disabled={addingSubject || !subjectForm.subject_name.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full md:w-auto"
              >
                {addingSubject ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Adding...</>
                ) : (
                  <><Plus className="h-4 w-4 mr-2" />Add Subject</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Filter & View Subjects */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Assigned Subjects
                </CardTitle>
                <div className="flex gap-2">
                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    {YEARS.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
                  </select>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Showing subjects for <strong>{filterDept}</strong> — <strong>{filterYear} Year</strong>
                <span className="ml-2 text-blue-600 font-semibold">({filteredSubjects.length} subjects)</span>
              </p>
            </CardHeader>
            <CardContent>
              {subjectLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Loading subjects...</p>
                </div>
              ) : filteredSubjects.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <BookMarked className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-700">No subjects assigned yet</h3>
                  <p className="text-sm text-gray-500 mt-1">Add subjects above for this department & year</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredSubjects.map((subject, i) => (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between py-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xs font-bold shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{subject.subject_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {subject.subject_code && <Badge variant="secondary" className="text-xs">{subject.subject_code}</Badge>}
                            {subject.credits && <span className="text-xs text-gray-500">{subject.credits} credits</span>}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSubject(subject.id, subject.subject_name)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============ TAB 2: CURRICULUM PROPOSALS ============ */}
        <TabsContent value="curriculum" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Curriculum Optimization</h2>
              <p className="text-gray-600">Manage and optimize academic curriculum</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {showCreateForm ? "Cancel" : "New Proposal"}
            </Button>
          </div>

          {showCreateForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardTitle className="flex items-center text-blue-900">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Curriculum Optimization Proposal
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleCurriculumSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Department <span className="text-red-500">*</span></label>
                        <select value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year <span className="text-red-500">*</span></label>
                        <select value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                          {YEARS.map((y) => <option key={y.value} value={y.value}>{y.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject <span className="text-red-500">*</span></label>
                        <Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="e.g., Data Structures" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Syllabus</label>
                      <Textarea value={formData.current_syllabus} onChange={(e) => setFormData({ ...formData, current_syllabus: e.target.value })} placeholder="Describe the current syllabus content..." rows={4} className="resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Proposed Changes <span className="text-red-500">*</span></label>
                      <Textarea value={formData.proposed_changes} onChange={(e) => setFormData({ ...formData, proposed_changes: e.target.value })} placeholder="Describe the proposed changes..." rows={4} className="resize-none" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Industry Requirements</label>
                      <Textarea value={formData.industry_requirements} onChange={(e) => setFormData({ ...formData, industry_requirements: e.target.value })} placeholder="Current industry trends and requirements..." rows={3} className="resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Effective From Date</label>
                      <Input type="date" value={formData.effective_from} onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })} />
                    </div>
                    <div className="flex gap-4">
                      <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">Submit Proposal</Button>
                      <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Proposals List */}
          <div className="grid grid-cols-1 gap-6">
            {loading ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading proposals...</p>
                </CardContent>
              </Card>
            ) : curriculums.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Proposals Yet</h3>
                  <p className="text-gray-600 mb-4">Create your first curriculum optimization proposal</p>
                  <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2" />Create Proposal</Button>
                </CardContent>
              </Card>
            ) : (
              curriculums.map((curriculum, index) => (
                <motion.div key={curriculum.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{curriculum.subject}</h3>
                            <Badge className={curriculum.implementation_status === "implemented" ? "bg-green-100 text-green-800" : curriculum.implementation_status === "approved" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"}>
                              {curriculum.implementation_status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1"><Users className="w-4 h-4" />{curriculum.department}</span>
                            <span>{curriculum.year} Year</span>
                            {curriculum.effective_from && <span>Effective: {new Date(curriculum.effective_from).toLocaleDateString()}</span>}
                          </div>
                        </div>
                        <Button size="sm" variant="outline"><Edit className="w-4 h-4 mr-2" />Edit</Button>
                      </div>
                      {curriculum.proposed_changes && <div><h4 className="font-semibold text-gray-900 mb-2">Proposed Changes:</h4><p className="text-gray-700 text-sm">{curriculum.proposed_changes}</p></div>}
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
