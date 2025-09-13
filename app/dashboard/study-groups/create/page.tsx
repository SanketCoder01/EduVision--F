"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Users, Plus, BookOpen, User, Hash, Calendar, Clock, FileText, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

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
      // Create comprehensive class with all new features
      const newClass = {
        id: Date.now().toString(),
        name: className,
        subject: subject,
        faculty: facultyName,
        description: classDescription,
        maxMembers: maxMembers,
        department: department,
        year: year,
        objectives: objectives,
        groupPurpose: groupPurpose,
        learningGoals: learningGoals,
        expectedOutcomes: expectedOutcomes,
        enableTaskScheduling: enableTaskScheduling,
        taskFrequency: taskFrequency,
        dailyTaskDescription: dailyTaskDescription,
        weeklyTaskDescription: weeklyTaskDescription,
        monthlyTaskDescription: monthlyTaskDescription,
        requireSubmissions: requireSubmissions,
        allowMaterials: allowMaterials,
        enableFileUploads: enableFileUploads,
        enableMessaging: enableMessaging,
        autoNotifications: autoNotifications,
        letStudentsDecide: letStudentsDecide,
        created_at: new Date().toISOString(),
        students_count: 0
      }

      // Store in localStorage for immediate access
      const existingClasses = JSON.parse(localStorage.getItem("study_classes") || "[]")
      existingClasses.push(newClass)
      localStorage.setItem("study_classes", JSON.stringify(existingClasses))

      toast({
        title: "Success",
        description: "Class created successfully! You can now create study groups.",
      })

      // Navigate to the new class page
      router.push(`/dashboard/study-groups/${newClass.id}`)
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
            </div>

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
                      <SelectItem value="monthly">Monthly Tasks</SelectItem>
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
