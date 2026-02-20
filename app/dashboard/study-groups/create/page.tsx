"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Users, Plus, BookOpen, User, Hash, Calendar, Clock, FileText, Settings, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

export default function CreateStudyGroupsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [className, setClassName] = useState("")
  const [classDescription, setClassDescription] = useState("")
  const [subject, setSubject] = useState("")
  const [facultyName, setFacultyName] = useState("")
  const [maxMembers, setMaxMembers] = useState(5)
  const [department, setDepartment] = useState("")
  const [year, setYear] = useState("")
  const [objectives, setObjectives] = useState("")
  const [enableTaskScheduling, setEnableTaskScheduling] = useState(false)
  const [taskFrequency, setTaskFrequency] = useState("weekly")
  const [enableFileUploads, setEnableFileUploads] = useState(true)
  const [enableMessaging, setEnableMessaging] = useState(true)
  const [autoNotifications, setAutoNotifications] = useState(true)
  const [groupPurpose, setGroupPurpose] = useState("")
  const [learningGoals, setLearningGoals] = useState("")
  const [expectedOutcomes, setExpectedOutcomes] = useState("")
  const [dailyTaskDescription, setDailyTaskDescription] = useState("")
  const [weeklyTaskDescription, setWeeklyTaskDescription] = useState("")
  const [monthlyTaskDescription, setMonthlyTaskDescription] = useState("")
  const [requireSubmissions, setRequireSubmissions] = useState(false)
  const [allowMaterials, setAllowMaterials] = useState(false)
  const [letStudentsDecide, setLetStudentsDecide] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [facultyId, setFacultyId] = useState<string | null>(null)

  // Load faculty ID on mount
  useEffect(() => {
    const session = localStorage.getItem("facultySession")
    if (session) {
      try {
        const user = JSON.parse(session)
        setFacultyId(user.id)
      } catch (error) {
        console.error("Failed to parse faculty session:", error)
      }
    }
  }, [])

  // Fetch students when department and year change
  useEffect(() => {
    if (department && year) {
      fetchStudents(department, year)
    } else {
      setStudents([])
    }
  }, [department, year])

  // Fetch students from Supabase based on department and year
  const fetchStudents = async (dept: string, yr: string) => {
    setLoadingStudents(true)
    try {
      // Map year to table format
      const yearMap: Record<string, string> = {
        "1st_year": "1st",
        "2nd_year": "2nd",
        "3rd_year": "3rd",
        "4th_year": "4th"
      }
      const tableName = `students_${dept}_${yearMap[yr]}_year`
      
      const { data, error } = await supabase
        .from(tableName)
        .select('id, name, email, prn')
        .order('name', { ascending: true })
      
      if (error) {
        console.error('Error fetching students:', error)
        toast({
          title: "Error",
          description: "Failed to load students for this department/year",
          variant: "destructive",
        })
        setStudents([])
      } else {
        setStudents(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
      setStudents([])
    } finally {
      setLoadingStudents(false)
    }
  }

  // Auto-populate class name when department and year are selected
  const generateClassName = (dept: string, yr: string) => {
    if (!dept || !yr) return ""
    const deptMap: Record<string, string> = {
      "cse": "CSE",
      "aids": "AIDS", 
      "aiml": "AIML",
      "cyber": "CYBER"
    }
    const yearMap: Record<string, string> = {
      "1st_year": "FY",
      "2nd_year": "SY", 
      "3rd_year": "TY",
      "4th_year": "Final"
    }
    return `${yearMap[yr]}-${deptMap[dept]}`
  }

  // Update class name when department or year changes
  const handleDepartmentChange = (value: string) => {
    setDepartment(value)
    setClassName(generateClassName(value, year))
  }

  const handleYearChange = (value: string) => {
    setYear(value)
    setClassName(generateClassName(department, value))
  }

  const handleCreateClass = async () => {
    if (!className.trim()) {
      toast({
        title: "Error",
        description: "Please enter a class name",
        variant: "destructive",
      })
      return
    }

    if (!subject.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subject name",
        variant: "destructive",
      })
      return
    }

    if (!department) {
      toast({
        title: "Error",
        description: "Please select a department",
        variant: "destructive",
      })
      return
    }

    if (!year) {
      toast({
        title: "Error",
        description: "Please select a year",
        variant: "destructive",
      })
      return
    }

    if (!facultyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter faculty name",
        variant: "destructive",
      })
      return
    }

    if (!maxMembers || maxMembers < 2) {
      toast({
        title: "Error",
        description: "Please enter a valid number of members (minimum 2)",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      if (!facultyId) {
        toast({
          title: "Error",
          description: "Faculty session not found. Please login again.",
          variant: "destructive",
        })
        return
      }

      // Create comprehensive class with all new features
      const newClass = {
        name: className,
        subject: subject,
        faculty_id: facultyId,
        faculty: facultyName,
        description: classDescription,
        max_members: maxMembers,
        department: department,
        year: year,
        objectives: objectives,
        group_purpose: groupPurpose,
        learning_goals: learningGoals,
        expected_outcomes: expectedOutcomes,
        enable_task_scheduling: enableTaskScheduling,
        task_frequency: taskFrequency,
        daily_task_description: dailyTaskDescription,
        weekly_task_description: weeklyTaskDescription,
        monthly_task_description: monthlyTaskDescription,
        require_submissions: requireSubmissions,
        allow_materials: allowMaterials,
        enable_file_uploads: enableFileUploads,
        enable_messaging: enableMessaging,
        auto_notifications: autoNotifications,
        let_students_decide: letStudentsDecide,
        created_at: new Date().toISOString(),
      }

      // Save to Supabase
      const { data: savedClass, error: saveError } = await supabase
        .from('study_groups')
        .insert([newClass])
        .select()
        .single()

      if (saveError) {
        console.error('Error saving study group:', saveError)
        toast({
          title: "Error",
          description: "Failed to create study group. Please try again.",
          variant: "destructive",
        })
        return
      }

      // If "let students decide" is enabled, send real-time notifications to all students
      if (letStudentsDecide && savedClass) {
        const yearMap: Record<string, string> = {
          "1st_year": "1st",
          "2nd_year": "2nd",
          "3rd_year": "3rd",
          "4th_year": "4th"
        }
        const tableName = `students_${department}_${yearMap[year]}_year`
        
        // Create notification for each student
        const notifications = students.map(student => ({
          user_id: student.id,
          title: 'New Study Group Available',
          message: `${facultyName} has created a new study group for ${subject}. You can now form your own groups!`,
          type: 'study_group',
          reference_id: savedClass.id,
          created_at: new Date().toISOString()
        }))

        if (notifications.length > 0) {
          await supabase.from('notifications').insert(notifications)
        }
      }

      toast({
        title: "Success",
        description: letStudentsDecide 
          ? "Study group created and notifications sent to students!"
          : "Study group created successfully!",
      })

      // Navigate to study groups dashboard
      router.push(`/dashboard/study-groups`)
    } catch (error) {
      console.error("Error creating class:", error)
      toast({
        title: "Error",
        description: "Failed to create class. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-none mx-auto">
      <motion.div
        className="flex items-center gap-4 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold flex items-center">
          <Users className="inline-block mr-2 h-6 w-6 text-blue-600" />
          Create Study Groups
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Create New Class for Study Groups
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="department" className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Department *
                </Label>
                <Select value={department} onValueChange={handleDepartmentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cse">Computer Science & Engineering</SelectItem>
                    <SelectItem value="aids">Artificial Intelligence & Data Science</SelectItem>
                    <SelectItem value="aiml">Artificial Intelligence & Machine Learning</SelectItem>
                    <SelectItem value="cyber">Cyber Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year" className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Year *
                </Label>
                <Select value={year} onValueChange={handleYearChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st_year">1st Year</SelectItem>
                    <SelectItem value="2nd_year">2nd Year</SelectItem>
                    <SelectItem value="3rd_year">3rd Year</SelectItem>
                    <SelectItem value="4th_year">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="className" className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Class Name *
                </Label>
                <Input
                  id="className"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Auto-generated from department and year"
                  disabled={!!(department && year)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Subject Name *
                </Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Data Structures, Machine Learning, Web Development"
                />
              </div>
            </div>

            {/* Show Student List */}
            {department && year && (
              <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <Label className="flex items-center text-lg font-semibold">
                  <Users className="mr-2 h-5 w-5 text-blue-600" />
                  Students in {generateClassName(department, year)}
                </Label>
                {loadingStudents ? (
                  <p className="text-sm text-gray-600">Loading students...</p>
                ) : students.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    <p className="text-sm text-gray-600 mb-2">Total: {students.length} students</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {students.slice(0, 10).map((student) => (
                        <div key={student.id} className="flex items-center space-x-2 bg-white p-2 rounded border">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="text-sm font-medium">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.prn || student.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {students.length > 10 && (
                      <p className="text-xs text-gray-500 mt-2">...and {students.length - 10} more students</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No students found for this department/year combination</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="classDescription" className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Class Description
              </Label>
              <Textarea
                id="classDescription"
                value={classDescription}
                onChange={(e) => setClassDescription(e.target.value)}
                placeholder="Brief description about this class and study groups..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectives">Study Group Objectives</Label>
              <Textarea
                id="objectives"
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                placeholder="Define the learning objectives and goals for study groups in this class..."
                className="min-h-[100px]"
              />
            </div>

            {/* Detailed Group Information */}
            <div className="space-y-6 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900">Detailed Group Information</h3>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="groupPurpose" className="flex items-center">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Group Purpose & Focus
                  </Label>
                  <Textarea
                    id="groupPurpose"
                    value={groupPurpose}
                    onChange={(e) => setGroupPurpose(e.target.value)}
                    placeholder="Describe the main purpose and focus areas of this study group..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="learningGoals" className="flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Learning Goals
                    </Label>
                    <Textarea
                      id="learningGoals"
                      value={learningGoals}
                      onChange={(e) => setLearningGoals(e.target.value)}
                      placeholder="What should students learn from this group?"
                      className="min-h-[80px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedOutcomes" className="flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Expected Outcomes
                    </Label>
                    <Textarea
                      id="expectedOutcomes"
                      value={expectedOutcomes}
                      onChange={(e) => setExpectedOutcomes(e.target.value)}
                      placeholder="What outcomes do you expect from this group?"
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-6">
              <h3 className="text-lg font-semibold flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Study Group Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Task Scheduling</Label>
                    <div className="text-sm text-muted-foreground">
                      Enable automatic task assignment scheduling
                    </div>
                  </div>
                  <Switch
                    checked={enableTaskScheduling}
                    onCheckedChange={setEnableTaskScheduling}
                  />
                </div>

                {enableTaskScheduling && (
                  <div className="space-y-2">
                    <Label htmlFor="taskFrequency" className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Task Frequency
                    </Label>
                    <Select value={taskFrequency} onValueChange={setTaskFrequency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily Tasks</SelectItem>
                        <SelectItem value="weekly">Weekly Tasks</SelectItem>
                        <SelectItem value="monthly">Monthly Tasks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Task Descriptions based on frequency */}
              {enableTaskScheduling && (
                <div className="space-y-6 border-t pt-6">
                  <h4 className="text-md font-semibold text-gray-900">Task Requirements</h4>
                  
                  {taskFrequency === "daily" && (
                    <div className="space-y-2">
                      <Label htmlFor="dailyTaskDescription" className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Daily Task Description
                      </Label>
                      <Textarea
                        id="dailyTaskDescription"
                        value={dailyTaskDescription}
                        onChange={(e) => setDailyTaskDescription(e.target.value)}
                        placeholder="Describe what students need to do daily (e.g., review notes, practice problems, discussion topics)..."
                        className="min-h-[80px]"
                      />
                    </div>
                  )}

                  {taskFrequency === "weekly" && (
                    <div className="space-y-2">
                      <Label htmlFor="weeklyTaskDescription" className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Weekly Task Description
                      </Label>
                      <Textarea
                        id="weeklyTaskDescription"
                        value={weeklyTaskDescription}
                        onChange={(e) => setWeeklyTaskDescription(e.target.value)}
                        placeholder="Describe weekly tasks (e.g., assignments, projects, presentations)..."
                        className="min-h-[80px]"
                      />
                    </div>
                  )}

                  {taskFrequency === "monthly" && (
                    <div className="space-y-2">
                      <Label htmlFor="monthlyTaskDescription" className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        Monthly Task Description
                      </Label>
                      <Textarea
                        id="monthlyTaskDescription"
                        value={monthlyTaskDescription}
                        onChange={(e) => setMonthlyTaskDescription(e.target.value)}
                        placeholder="Describe monthly tasks (e.g., major projects, research work, comprehensive reviews)..."
                        className="min-h-[80px]"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Require Submissions</Label>
                        <div className="text-sm text-muted-foreground">
                          Students must submit their work for tracking
                        </div>
                      </div>
                      <Switch
                        checked={requireSubmissions}
                        onCheckedChange={setRequireSubmissions}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Allow Material Sharing</Label>
                        <div className="text-sm text-muted-foreground">
                          Students can share files and materials
                        </div>
                      </div>
                      <Switch
                        checked={allowMaterials}
                        onCheckedChange={setAllowMaterials}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">File Uploads</Label>
                    <div className="text-sm text-muted-foreground">
                      Allow file sharing in groups
                    </div>
                  </div>
                  <Switch
                    checked={enableFileUploads}
                    onCheckedChange={setEnableFileUploads}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Group Messaging</Label>
                    <div className="text-sm text-muted-foreground">
                      Enable group chat functionality
                    </div>
                  </div>
                  <Switch
                    checked={enableMessaging}
                    onCheckedChange={setEnableMessaging}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Send automatic task reminders
                    </div>
                  </div>
                  <Switch
                    checked={autoNotifications}
                    onCheckedChange={setAutoNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Let Students Decide Groups</Label>
                    <div className="text-sm text-muted-foreground">
                      Allow students to form their own groups
                    </div>
                  </div>
                  <Switch
                    checked={letStudentsDecide}
                    onCheckedChange={setLetStudentsDecide}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxMembers" className="flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Max Members per Group *
                </Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min="2"
                  max="20"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(parseInt(e.target.value))}
                  placeholder="5"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateClass} 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Creating..." : "Create Class & Groups"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
