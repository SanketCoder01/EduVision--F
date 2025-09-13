"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, FileText, Calendar, Paperclip, Check, Shuffle, Clock, Repeat, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { getClassById, getStudyGroupsByClass, addTaskToStudyGroup } from "@/app/actions/study-group-actions"

export default function AssignTaskPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const mode = searchParams.get("mode") || "manual"

  const [classInfo, setClassInfo] = useState<any>(null)
  const [studyGroups, setStudyGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [taskType, setTaskType] = useState("one-time")
  const [frequency, setFrequency] = useState("weekly")
  const [priority, setPriority] = useState("medium")
  const [requiresSubmission, setRequiresSubmission] = useState(true)
  const [allowLateSubmission, setAllowLateSubmission] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [maxFileSize, setMaxFileSize] = useState("10")
  const [showSelectedStudents, setShowSelectedStudents] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const classId = params.classId as string

        // Load class info from localStorage
        const classes = JSON.parse(localStorage.getItem("study_classes") || "[]")
        const classData = classes.find((cls: any) => cls.id === classId)
        
        if (!classData) {
          throw new Error("Class not found")
        }

        // Load study groups from localStorage (both faculty and student created)
        const facultyGroups = JSON.parse(localStorage.getItem(`study_groups_${classId}`) || "[]")
        const studentGroups = JSON.parse(localStorage.getItem("student_study_groups") || "[]")
        const classStudentGroups = studentGroups.filter((group: any) => group.classId === classId)
        
        const allGroups = [...facultyGroups, ...classStudentGroups]

        setClassInfo(classData)
        setStudyGroups(allGroups)

        // If shuffle mode, select all groups by default
        if (mode === "shuffle") {
          setSelectedGroups(allGroups.map((group: any) => group.id))
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load class and study groups data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.classId, mode, toast])

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroups((prev) => {
      if (prev.includes(groupId)) {
        return prev.filter((id) => id !== groupId)
      } else {
        return [...prev, groupId]
      }
    })
  }

  const getSelectedStudents = () => {
    const selectedGroupsData = studyGroups.filter(group => selectedGroups.includes(group.id))
    const allStudents = selectedGroupsData.reduce((acc: any[], group: any) => {
      const groupStudents = (group.members || []).map((member: any) => ({
        ...member,
        groupName: group.name,
        groupId: group.id
      }))
      return [...acc, ...groupStudents]
    }, [])
    return allStudents
  }

  const handleSelectAllGroups = () => {
    if (selectedGroups.length === studyGroups.length) {
      setSelectedGroups([])
    } else {
      setSelectedGroups(studyGroups.map(group => group.id))
    }
  }

  const handleSubmit = async () => {
    if (selectedGroups.length === 0) {
      toast({
        title: "No groups selected",
        description: "Please select at least one group to assign the task.",
        variant: "destructive",
      })
      return
    }

    if (!taskTitle) {
      toast({
        title: "Missing title",
        description: "Please provide a title for the task.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const classId = params.classId as string

      // Get selected groups data
      const selectedGroupsData = studyGroups.filter(group => selectedGroups.includes(group.id))
      
      // Get all students from selected groups
      const allStudents = selectedGroupsData.reduce((acc: any[], group: any) => {
        return [...acc, ...(group.members || [])]
      }, [])

      // Create task object
      const taskData = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: taskTitle,
        description: taskDescription,
        dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        taskType,
        frequency: taskType === "recurring" ? frequency : null,
        priority,
        requiresSubmission,
        allowLateSubmission,
        maxFileSize: parseInt(maxFileSize),
        attachments: attachments.map(file => ({
          name: file.name,
          fileType: file.type,
          size: file.size,
          fileUrl: `temp/${file.name}` // Will be updated after file upload
        })),
        classId,
        assignedGroups: selectedGroupsData.map(group => ({
          id: group.id,
          name: group.name,
          memberCount: group.members?.length || 0
        })),
        assignedStudents: allStudents,
        createdAt: new Date().toISOString(),
        createdBy: "faculty", // Current user
        status: "active",
        submissions: []
      }

      // Save to faculty tasks for dashboard tracking
      const existingTasks = JSON.parse(localStorage.getItem("faculty_assigned_tasks") || "[]")
      const updatedTasks = [...existingTasks, taskData]
      localStorage.setItem("faculty_assigned_tasks", JSON.stringify(updatedTasks))

      // Save task assignment to each group's task list
      selectedGroupsData.forEach(group => {
        const groupTaskKey = `group_tasks_${group.id}`
        const existingGroupTasks = JSON.parse(localStorage.getItem(groupTaskKey) || "[]")
        const groupTask = {
          ...taskData,
          groupId: group.id,
          groupName: group.name,
          assignedTo: group.members || []
        }
        const updatedGroupTasks = [...existingGroupTasks, groupTask]
        localStorage.setItem(groupTaskKey, JSON.stringify(updatedGroupTasks))
      })

      toast({
        title: "Success",
        description: `Task "${taskTitle}" assigned to ${selectedGroups.length} study groups successfully.`,
      })

      // Redirect back to class study groups page
      router.push(`/dashboard/study-groups/${params.classId}`)
    } catch (error) {
      console.error("Error assigning task:", error)
      toast({
        title: "Error",
        description: "Failed to assign task to study groups.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleShuffleAssign = () => {
    if (mode !== "shuffle") return

    // Implement shuffle logic here
    toast({
      title: "Shuffle Mode",
      description: "Tasks will be randomly assigned to all groups.",
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>

        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-none mx-auto px-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{mode === "manual" ? "Assign Task Manually" : "Shuffle Task Assignment"}</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-600" />
                Task Details
              </CardTitle>
              <CardDescription>Define the task or activity for the study groups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taskTitle">Task Title *</Label>
                    <Input
                      id="taskTitle"
                      placeholder="Enter task title"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority" className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Priority
                    </Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="taskDescription">Task Description</Label>
                  <Textarea
                    id="taskDescription"
                    placeholder="Enter detailed task description and requirements..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center">
                    <Repeat className="mr-2 h-4 w-4" />
                    Task Scheduling
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="taskType">Task Type</Label>
                      <Select value={taskType} onValueChange={setTaskType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Task Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one-time">One-time Task</SelectItem>
                          <SelectItem value="recurring">Recurring Task</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {taskType === "recurring" && (
                      <div>
                        <Label htmlFor="frequency">Frequency</Label>
                        <Select value={frequency} onValueChange={setFrequency}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                        <Input
                          id="dueDate"
                          type="datetime-local"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center">
                    <Upload className="mr-2 h-4 w-4" />
                    Submission Settings
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Requires Submission</Label>
                        <div className="text-sm text-muted-foreground">
                          Students must submit their work
                        </div>
                      </div>
                      <Switch
                        checked={requiresSubmission}
                        onCheckedChange={setRequiresSubmission}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Allow Late Submission</Label>
                        <div className="text-sm text-muted-foreground">
                          Accept submissions after due date
                        </div>
                      </div>
                      <Switch
                        checked={allowLateSubmission}
                        onCheckedChange={setAllowLateSubmission}
                      />
                    </div>

                    {requiresSubmission && (
                      <div>
                        <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                        <Select value={maxFileSize} onValueChange={setMaxFileSize}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Max Size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5 MB</SelectItem>
                            <SelectItem value="10">10 MB</SelectItem>
                            <SelectItem value="25">25 MB</SelectItem>
                            <SelectItem value="50">50 MB</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="flex items-center mb-2">
                    <Paperclip className="mr-2 h-4 w-4 text-gray-500" />
                    Task Materials & Resources
                  </Label>
                  <div className="border border-dashed rounded-md p-4 text-center">
                    <p className="text-sm text-gray-500 mb-2">Upload reference materials, instructions, or resources</p>
                    <p className="text-xs text-gray-400 mb-3">Supported: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, Images (Max 25MB each)</p>
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        const validFiles = files.filter(file => {
                          const maxSize = 25 * 1024 * 1024 // 25MB
                          if (file.size > maxSize) {
                            toast({
                              title: "File too large",
                              description: `${file.name} exceeds 25MB limit`,
                              variant: "destructive",
                            })
                            return false
                          }
                          return true
                        })
                        setAttachments(prev => [...prev, ...validFiles])
                      }}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Browse Files
                    </Button>
                    {attachments.length > 0 && (
                      <div className="mt-4 text-left">
                        <p className="text-sm font-medium mb-2">Selected files ({attachments.length}):</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {attachments.map((file, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <Paperclip className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{file.name}</span>
                              </div>
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                <span className="text-gray-500">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                                >
                                  ×
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center">
                {mode === "manual" ? (
                  <>
                    <Check className="mr-2 h-5 w-5 text-green-600" />
                    Select Groups ({studyGroups.length} Available)
                  </>
                ) : (
                  <>
                    <Shuffle className="mr-2 h-5 w-5 text-purple-600" />
                    Shuffle Assignment ({studyGroups.length} Groups)
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {mode === "manual"
                  ? `Select which groups to assign this task to. Found ${studyGroups.length} groups in this class.`
                  : `Task will be assigned to all ${studyGroups.length} groups randomly`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mode === "shuffle" ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shuffle className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="mb-2">All {studyGroups.length} groups will receive this task</p>
                  <p className="text-sm text-gray-500">
                    The system will randomly assign variations of this task to each group
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {studyGroups.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No study groups found in this class</div>
                  ) : (
                    <>
                      {/* Select All Option */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="select-all-groups"
                            checked={selectedGroups.length === studyGroups.length && studyGroups.length > 0}
                            onCheckedChange={handleSelectAllGroups}
                          />
                          <Label htmlFor="select-all-groups" className="font-medium cursor-pointer">
                            Select All Groups
                          </Label>
                        </div>
                        <span className="text-sm text-gray-600">
                          {selectedGroups.length}/{studyGroups.length} selected
                        </span>
                      </div>

                      {/* Individual Group Selection */}
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {studyGroups.map((group) => (
                          <div
                            key={group.id}
                            className={`flex items-center space-x-3 p-3 rounded-md border transition-colors ${
                              selectedGroups.includes(group.id) 
                                ? "bg-blue-50 border-blue-200" 
                                : "hover:bg-gray-50 border-gray-200"
                            }`}
                          >
                            <Checkbox
                              id={`group-${group.id}`}
                              checked={selectedGroups.includes(group.id)}
                              onCheckedChange={() => handleGroupSelect(group.id)}
                            />
                            <div className="flex-1">
                              <Label
                                htmlFor={`group-${group.id}`}
                                className="flex justify-between items-center cursor-pointer"
                              >
                                <div>
                                  <span className="font-medium">{group.name}</span>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {group.creation_type === "faculty" ? "Faculty Created" : "Student Created"}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-medium text-blue-600">
                                    {group.members?.length || 0} members
                                  </span>
                                </div>
                              </Label>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Selected Students Preview */}
                      {selectedGroups.length > 0 && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-green-800">
                              Task will be assigned to {getSelectedStudents().length} students
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowSelectedStudents(!showSelectedStudents)}
                              className="text-green-700 hover:text-green-800"
                            >
                              {showSelectedStudents ? "Hide" : "Show"} Students
                            </Button>
                          </div>
                          
                          {showSelectedStudents && (
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {getSelectedStudents().map((student: any, index: number) => (
                                <div key={index} className="flex items-center justify-between text-sm bg-white p-2 rounded border">
                                  <div>
                                    <span className="font-medium">{student.name}</span>
                                    <span className="text-gray-500 ml-2">({student.prn})</span>
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {student.groupName} • CGPA: {student.cgpa}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={mode === "shuffle" ? handleShuffleAssign : handleSubmit}
                disabled={
                  (mode === "manual" && selectedGroups.length === 0) ||
                  !taskTitle ||
                  isSubmitting ||
                  studyGroups.length === 0
                }
                className={`w-full ${
                  mode === "manual" ? "bg-blue-600 hover:bg-blue-700" : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Assigning Task...
                  </div>
                ) : (
                  <>
                    {mode === "manual" ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Assign to {selectedGroups.length} Groups
                      </>
                    ) : (
                      <>
                        <Shuffle className="mr-2 h-4 w-4" />
                        Shuffle Assign to All Groups
                      </>
                    )}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
