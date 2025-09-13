"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Users, UserPlus, ArrowLeft, Plus, School, FileText, Shuffle, CheckCircle, Edit, Trash, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getClassById, getStudyGroupsByClass } from "@/app/actions/study-group-actions"

export default function ClassStudyGroupsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [classInfo, setClassInfo] = useState<any>(null)
  const [studyGroups, setStudyGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateOptions, setShowCreateOptions] = useState(false)
  const [showAssignTaskDialog, setShowAssignTaskDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("groups")
  const [showGroupDetails, setShowGroupDetails] = useState(false)
  const [showEditGroup, setShowEditGroup] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [availableStudents, setAvailableStudents] = useState<any[]>([])
  const [editingMembers, setEditingMembers] = useState<any[]>([])
  const [groupTasks, setGroupTasks] = useState<{[key: string]: any[]}>({})
  const [allAssignedTasks, setAllAssignedTasks] = useState<any[]>([])

  const loadGroupTasks = (groups: any[], classId: string) => {
    const tasksData: {[key: string]: any[]} = {}
    const allTasks: any[] = []

    groups.forEach(group => {
      const groupTaskKey = `group_tasks_${group.id}`
      const groupTasks = JSON.parse(localStorage.getItem(groupTaskKey) || "[]")
      tasksData[group.id] = groupTasks
      allTasks.push(...groupTasks)
    })

    // Also load faculty assigned tasks for this class
    const facultyTasks = JSON.parse(localStorage.getItem("faculty_assigned_tasks") || "[]")
    const classTasks = facultyTasks.filter((task: any) => task.classId === classId)
    
    setGroupTasks(tasksData)
    setAllAssignedTasks([...allTasks, ...classTasks])
  }

  const getGroupTaskStats = (groupId: string) => {
    const tasks = groupTasks[groupId] || []
    const now = new Date()
    
    const active = tasks.filter(task => {
      const dueDate = new Date(task.dueDate)
      return task.status === "active" && dueDate >= now
    }).length
    
    const overdue = tasks.filter(task => {
      const dueDate = new Date(task.dueDate)
      return task.status === "active" && dueDate < now
    }).length
    
    const completed = tasks.filter(task => task.status === "completed").length
    
    return { active, overdue, completed, total: tasks.length }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const classId = params.classId as string

        // Load from localStorage for now (replace with server actions later)
        const storedClasses = JSON.parse(localStorage.getItem("study_classes") || "[]")
        const classData = storedClasses.find((cls: any) => cls.id === classId)
        
        // Load study groups from localStorage (both faculty and student created)
        const facultyGroups = JSON.parse(localStorage.getItem(`study_groups_${classId}`) || "[]")
        const studentGroups = JSON.parse(localStorage.getItem("student_study_groups") || "[]")
          .filter((group: any) => group.classId === classId)

        // Combine both types of groups
        const allGroups = [
          ...facultyGroups.map((group: any) => ({ ...group, creation_type: "faculty" })),
          ...studentGroups.map((group: any) => ({ ...group, creation_type: "student" }))
        ]

        // Load available students (mock data for now)
        const mockStudents = [
          { id: 1, name: "Rahul Sharma", prn: "PRN2023001", cgpa: 8.5 },
          { id: 2, name: "Priya Patel", prn: "PRN2023002", cgpa: 9.2 },
          { id: 3, name: "Amit Kumar", prn: "PRN2023003", cgpa: 7.8 },
          { id: 4, name: "Sneha Gupta", prn: "PRN2023004", cgpa: 8.9 },
          { id: 5, name: "Vikram Singh", prn: "PRN2023005", cgpa: 8.1 },
          { id: 6, name: "Neha Verma", prn: "PRN2023006", cgpa: 9.0 },
          { id: 7, name: "Raj Malhotra", prn: "PRN2023007", cgpa: 7.5 },
          { id: 8, name: "Ananya Desai", prn: "PRN2023008", cgpa: 8.7 },
          { id: 9, name: "Rohan Joshi", prn: "PRN2023009", cgpa: 8.3 },
          { id: 10, name: "Kavita Reddy", prn: "PRN2023010", cgpa: 9.1 },
        ]

        // Filter out students already in groups
        const assignedStudentIds = allGroups.flatMap(group => 
          (group.members || []).map((member: any) => member.id)
        )
        const unassignedStudents = mockStudents.filter(student => 
          !assignedStudentIds.includes(student.id)
        )

        setClassInfo(classData || { id: classId, name: `Class ${classId}` })
        setStudyGroups(allGroups)
        setAvailableStudents(unassignedStudents)

        // Load task data for each group
        loadGroupTasks(allGroups, classId)
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
  }, [params.classId, toast])

  const handleCreateGroups = (mode: "faculty" | "student") => {
    router.push(`/dashboard/study-groups/${params.classId}/create-groups?mode=${mode}`)
  }

  const handleAssignTask = (mode: "manual" | "shuffle") => {
    router.push(`/dashboard/study-groups/${params.classId}/assign-task?mode=${mode}`)
  }

  const handleDeleteGroup = (group: any) => {
    setGroupToDelete(group)
    setShowDeleteDialog(true)
  }

  const handleViewDetails = (group: any) => {
    setSelectedGroup(group)
    setShowGroupDetails(true)
  }

  const handleEditGroup = (group: any) => {
    setSelectedGroup(group)
    setEditingMembers([...group.members])
    setShowEditGroup(true)
  }

  const handleAddMember = (student: any) => {
    setEditingMembers(prev => [...prev, student])
    setAvailableStudents(prev => prev.filter(s => s.id !== student.id))
  }

  const handleRemoveMember = (student: any) => {
    setEditingMembers(prev => prev.filter(m => m.id !== student.id))
    setAvailableStudents(prev => [...prev, student])
  }

  const saveGroupChanges = () => {
    if (!selectedGroup) return

    const classId = params.classId as string
    const updatedGroup = { ...selectedGroup, members: editingMembers }

    try {
      if (selectedGroup.creation_type === "faculty") {
        const facultyGroups = JSON.parse(localStorage.getItem(`study_groups_${classId}`) || "[]")
        const updatedGroups = facultyGroups.map((group: any) => 
          group.id === selectedGroup.id ? updatedGroup : group
        )
        localStorage.setItem(`study_groups_${classId}`, JSON.stringify(updatedGroups))
      } else {
        const studentGroups = JSON.parse(localStorage.getItem("student_study_groups") || "[]")
        const updatedGroups = studentGroups.map((group: any) => 
          group.id === selectedGroup.id ? updatedGroup : group
        )
        localStorage.setItem("student_study_groups", JSON.stringify(updatedGroups))
      }

      // Update displayed groups
      setStudyGroups(prev => prev.map(group => 
        group.id === selectedGroup.id ? updatedGroup : group
      ))

      toast({
        title: "Success",
        description: "Group members updated successfully.",
      })

      setShowEditGroup(false)
      setSelectedGroup(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update group members.",
        variant: "destructive",
      })
    }
  }

  const confirmDeleteGroup = () => {
    if (!groupToDelete) return

    const classId = params.classId as string
    
    try {
      if (groupToDelete.creation_type === "faculty") {
        // Delete from faculty groups
        const facultyGroups = JSON.parse(localStorage.getItem(`study_groups_${classId}`) || "[]")
        const updatedFacultyGroups = facultyGroups.filter((group: any) => group.id !== groupToDelete.id)
        localStorage.setItem(`study_groups_${classId}`, JSON.stringify(updatedFacultyGroups))
      } else {
        // Delete from student groups
        const studentGroups = JSON.parse(localStorage.getItem("student_study_groups") || "[]")
        const updatedStudentGroups = studentGroups.filter((group: any) => group.id !== groupToDelete.id)
        localStorage.setItem("student_study_groups", JSON.stringify(updatedStudentGroups))
      }

      // Update the displayed groups
      setStudyGroups(prev => prev.filter(group => group.id !== groupToDelete.id))
      
      toast({
        title: "Success",
        description: `Study group "${groupToDelete.name}" has been deleted.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the study group. Please try again.",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setGroupToDelete(null)
    }
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-none mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold flex items-center">
            <School className="inline-block mr-2 h-6 w-6 text-blue-600" />
            {classInfo?.name || "Class Study Groups"}
          </h1>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setShowCreateOptions(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Groups
          </Button>

          {studyGroups.length > 0 && (
            <Button
              onClick={() => setShowAssignTaskDialog(true)}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <FileText className="mr-2 h-4 w-4" />
              Assign Task
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="groups" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Users className="mr-2 h-4 w-4" />
              Study Groups
              {studyGroups.length > 0 && (
                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                  {studyGroups.length}
                </Badge>
              )}
            </motion.div>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
            <motion.div
              className="flex items-center"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <FileText className="mr-2 h-4 w-4" />
              Tasks & Activities
            </motion.div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups">
          <AnimatePresence>
            {studyGroups.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center text-center py-8">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No study groups yet</h3>
                      <p className="text-gray-500 mb-6 max-w-md">
                        Create study groups for this class to help students collaborate effectively.
                      </p>
                      <Button onClick={() => setShowCreateOptions(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Groups
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studyGroups.map((group) => (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card className="h-full flex flex-col">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>{group.name}</CardTitle>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {group.creation_type === "faculty" ? "Faculty Created" : "Student Created"}
                          </Badge>
                        </div>
                        <CardDescription>
                          {group.members?.length || 0} {(group.members?.length || 0) === 1 ? "member" : "members"}
                          {group.subject && <span className="ml-2 text-blue-600">• {group.subject}</span>}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-2 flex-grow">
                        <div className="flex flex-wrap gap-1 mb-4">
                          {(group.members || []).slice(0, 5).map((member: any, index: number) => (
                            <Avatar key={index} className="h-8 w-8 border-2 border-white">
                              <AvatarFallback>{member.student_name?.[0] || member.name?.[0] || "S"}</AvatarFallback>
                            </Avatar>
                          ))}
                          {(group.members?.length || 0) > 5 && (
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-xs font-medium">
                              +{(group.members?.length || 0) - 5}
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 flex justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500"
                          onClick={() => handleViewDetails(group)}
                        >
                          View Details
                        </Button>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600"
                            onClick={() => handleAssignTask("manual")}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Assign Task
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-blue-600"
                            onClick={() => handleEditGroup(group)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-600"
                            onClick={() => handleDeleteGroup(group)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="space-y-4">
            {studyGroups.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md">
                      Create study groups first to assign tasks and activities.
                    </p>
                    <Button disabled className="opacity-50">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Groups First
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Task Management & Activities</h3>
                    <p className="text-sm text-gray-600">
                      Total Tasks: {allAssignedTasks.length} • Groups: {studyGroups.length} (Faculty: {studyGroups.filter(g => g.creation_type === "faculty").length}, Student: {studyGroups.filter(g => g.creation_type === "student").length})
                    </p>
                  </div>
                  <Button onClick={() => setShowAssignTaskDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Assign New Task
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studyGroups.map((group) => {
                    const taskStats = getGroupTaskStats(group.id)
                    const groupTasksList = groupTasks[group.id] || []
                    
                    return (
                      <Card key={group.id} className="h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base">{group.name}</CardTitle>
                              <CardDescription>
                                {group.members?.length || 0} members • {group.creation_type === "faculty" ? "Faculty Created" : "Student Created"}
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className={group.creation_type === "faculty" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}>
                              {group.creation_type === "faculty" ? "Faculty" : "Student"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Active Tasks:</span>
                              <span className="font-medium text-blue-600">{taskStats.active}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Completed:</span>
                              <span className="font-medium text-green-600">{taskStats.completed}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Overdue:</span>
                              <span className="font-medium text-red-600">{taskStats.overdue}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Total Tasks:</span>
                              <span className="font-medium">{taskStats.total}</span>
                            </div>
                            
                            {/* Show recent tasks */}
                            {groupTasksList.length > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                <h5 className="text-xs font-medium text-gray-700 mb-2">Recent Tasks:</h5>
                                <div className="space-y-1 max-h-20 overflow-y-auto">
                                  {groupTasksList.slice(0, 3).map((task: any, index: number) => (
                                    <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                                      <div className="font-medium truncate">{task.title}</div>
                                      <div className="text-gray-500">
                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                        <Badge className={`ml-2 text-xs ${
                                          task.priority === "high" ? "bg-red-100 text-red-700" :
                                          task.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                                          "bg-gray-100 text-gray-700"
                                        }`}>
                                          {task.priority}
                                        </Badge>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex gap-2 pt-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => handleAssignTask("manual")}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                Assign
                              </Button>
                              {groupTasksList.length > 0 && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => {
                                    // Navigate to group task details
                                    router.push(`/dashboard/study-groups/${params.classId}/group-tasks/${group.id}`)
                                  }}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View All
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* All Tasks Summary */}
                {allAssignedTasks.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-lg">All Class Tasks Summary</CardTitle>
                      <CardDescription>Overview of all tasks assigned to this class</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <div className="text-2xl font-bold text-blue-600">
                            {allAssignedTasks.filter(task => {
                              const dueDate = new Date(task.dueDate)
                              return task.status === "active" && dueDate >= new Date()
                            }).length}
                          </div>
                          <div className="text-sm text-blue-700">Active Tasks</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded">
                          <div className="text-2xl font-bold text-red-600">
                            {allAssignedTasks.filter(task => {
                              const dueDate = new Date(task.dueDate)
                              return task.status === "active" && dueDate < new Date()
                            }).length}
                          </div>
                          <div className="text-sm text-red-700">Overdue Tasks</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded">
                          <div className="text-2xl font-bold text-green-600">
                            {allAssignedTasks.filter(task => task.status === "completed").length}
                          </div>
                          <div className="text-sm text-green-700">Completed</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <div className="text-2xl font-bold text-gray-600">{allAssignedTasks.length}</div>
                          <div className="text-sm text-gray-700">Total Tasks</div>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => router.push("/dashboard/study-groups/assigned-tasks")}
                        className="w-full"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View All Assigned Tasks Dashboard
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Options Dialog */}
      <Dialog open={showCreateOptions} onOpenChange={setShowCreateOptions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Study Groups</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <Button
              onClick={() => handleCreateGroups("faculty")}
              className="flex items-center justify-center gap-2 h-20 bg-blue-600 hover:bg-blue-700"
            >
              <UserPlus className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Faculty Creates Groups</div>
                <div className="text-xs opacity-90">You'll select students and create groups manually</div>
              </div>
            </Button>

            <Button
              onClick={() => handleCreateGroups("student")}
              className="flex items-center justify-center gap-2 h-20 bg-green-600 hover:bg-green-700"
            >
              <Users className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Let Students Decide</div>
                <div className="text-xs opacity-90">Students will form their own groups</div>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateOptions(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={showAssignTaskDialog} onOpenChange={setShowAssignTaskDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Task or Activity</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <Button
              onClick={() => handleAssignTask("manual")}
              className="flex items-center justify-center gap-2 h-20 bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Assign Manually</div>
                <div className="text-xs opacity-90">Select which groups get which tasks</div>
              </div>
            </Button>

            <Button
              onClick={() => handleAssignTask("shuffle")}
              className="flex items-center justify-center gap-2 h-20 bg-purple-600 hover:bg-purple-700"
            >
              <Shuffle className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Shuffle Mode</div>
                <div className="text-xs opacity-90">Randomly assign tasks to groups</div>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignTaskDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Study Group</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete the study group <strong>"{groupToDelete?.name}"</strong>?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Warning</h3>
                  <div className="mt-1 text-sm text-red-700">
                    <p>This action cannot be undone. All group data, tasks, and messages will be permanently deleted.</p>
                  </div>
                </div>
              </div>
            </div>
            {groupToDelete && (
              <div className="text-sm text-gray-500">
                <p><strong>Group Type:</strong> {groupToDelete.creation_type === "faculty" ? "Faculty Created" : "Student Created"}</p>
                <p><strong>Members:</strong> {groupToDelete.members?.length || 0}</p>
                {groupToDelete.subject && <p><strong>Subject:</strong> {groupToDelete.subject}</p>}
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteGroup}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group Details Dialog */}
      <Dialog open={showGroupDetails} onOpenChange={setShowGroupDetails}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Group Details</DialogTitle>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-6 py-4">
              <div>
                <h3 className="font-semibold text-xl mb-2">{selectedGroup.name}</h3>
                <div className="flex gap-2 mb-3">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {selectedGroup.creation_type === "faculty" ? "Faculty Created" : "Student Created"}
                  </Badge>
                  <Badge variant="outline">
                    {selectedGroup.members?.length || 0} members
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Group Members</h4>
                <div className="space-y-2">
                  {(selectedGroup.members || []).map((member: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarFallback>{member.name?.[0] || "S"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-500">{member.prn}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        CGPA: {member.cgpa}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedGroup.method && (
                <div>
                  <h4 className="font-medium mb-2">Grouping Method</h4>
                  <Badge variant="outline" className="capitalize">
                    {selectedGroup.method.replace('-', ' ')}
                  </Badge>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGroupDetails(false)}>
              Close
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setShowGroupDetails(false)
                handleEditGroup(selectedGroup)
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={showEditGroup} onOpenChange={setShowEditGroup}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Group - {selectedGroup?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div>
              <h4 className="font-medium mb-3">Current Members ({editingMembers.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {editingMembers.map((member: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-3">
                        <AvatarFallback>{member.name?.[0] || "S"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.prn} • CGPA: {member.cgpa}</div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMember(member)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {availableStudents.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Available Students ({availableStudents.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableStudents.map((student: any) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-blue-50 rounded">
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarFallback>{student.name?.[0] || "S"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.prn} • CGPA: {student.cgpa}</div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddMember(student)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availableStudents.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No available students to add</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditGroup(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveGroupChanges}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
