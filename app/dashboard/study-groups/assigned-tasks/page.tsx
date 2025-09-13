"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileText, Calendar, Users, Edit, Trash, Eye, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AssignedTasksPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [assignedTasks, setAssignedTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<any>(null)
  
  // Edit form states
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editDueDate, setEditDueDate] = useState("")
  const [editPriority, setEditPriority] = useState("")

  useEffect(() => {
    loadAssignedTasks()
  }, [])

  const loadAssignedTasks = () => {
    try {
      setIsLoading(true)
      const tasks = JSON.parse(localStorage.getItem("faculty_assigned_tasks") || "[]")
      setAssignedTasks(tasks)
    } catch (error) {
      console.error("Error loading assigned tasks:", error)
      toast({
        title: "Error",
        description: "Failed to load assigned tasks.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditTask = (task: any) => {
    setSelectedTask(task)
    setEditTitle(task.title)
    setEditDescription(task.description)
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "")
    setEditPriority(task.priority)
    setShowEditDialog(true)
  }

  const handleViewTask = (task: any) => {
    setSelectedTask(task)
    setShowViewDialog(true)
  }

  const handleDeleteTask = (task: any) => {
    setTaskToDelete(task)
    setShowDeleteDialog(true)
  }

  const saveTaskChanges = () => {
    if (!selectedTask) return

    try {
      const updatedTask = {
        ...selectedTask,
        title: editTitle,
        description: editDescription,
        dueDate: editDueDate ? new Date(editDueDate).toISOString() : selectedTask.dueDate,
        priority: editPriority,
        updatedAt: new Date().toISOString()
      }

      // Update in faculty tasks
      const tasks = JSON.parse(localStorage.getItem("faculty_assigned_tasks") || "[]")
      const updatedTasks = tasks.map((task: any) => 
        task.id === selectedTask.id ? updatedTask : task
      )
      localStorage.setItem("faculty_assigned_tasks", JSON.stringify(updatedTasks))

      // Update in group tasks
      selectedTask.assignedGroups.forEach((group: any) => {
        const groupTaskKey = `group_tasks_${group.id}`
        const groupTasks = JSON.parse(localStorage.getItem(groupTaskKey) || "[]")
        const updatedGroupTasks = groupTasks.map((task: any) => 
          task.id === selectedTask.id ? updatedTask : task
        )
        localStorage.setItem(groupTaskKey, JSON.stringify(updatedGroupTasks))
      })

      setAssignedTasks(updatedTasks)
      setShowEditDialog(false)
      setSelectedTask(null)

      toast({
        title: "Success",
        description: "Task updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
      })
    }
  }

  const confirmDeleteTask = () => {
    if (!taskToDelete) return

    try {
      // Remove from faculty tasks
      const tasks = JSON.parse(localStorage.getItem("faculty_assigned_tasks") || "[]")
      const updatedTasks = tasks.filter((task: any) => task.id !== taskToDelete.id)
      localStorage.setItem("faculty_assigned_tasks", JSON.stringify(updatedTasks))

      // Remove from group tasks
      taskToDelete.assignedGroups.forEach((group: any) => {
        const groupTaskKey = `group_tasks_${group.id}`
        const groupTasks = JSON.parse(localStorage.getItem(groupTaskKey) || "[]")
        const updatedGroupTasks = groupTasks.filter((task: any) => task.id !== taskToDelete.id)
        localStorage.setItem(groupTaskKey, JSON.stringify(updatedGroupTasks))
      })

      setAssignedTasks(updatedTasks)
      setShowDeleteDialog(false)
      setTaskToDelete(null)

      toast({
        title: "Success",
        description: "Task deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      })
    }
  }

  const getTaskStatusBadge = (task: any) => {
    const now = new Date()
    const dueDate = new Date(task.dueDate)
    
    if (task.status === "completed") {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    } else if (dueDate < now) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Active</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    }
    return <Badge className={colors[priority as keyof typeof colors] || colors.medium}>{priority}</Badge>
  }

  const getTasksByStatus = (status: string) => {
    return assignedTasks.filter(task => {
      const now = new Date()
      const dueDate = new Date(task.dueDate)
      
      switch (status) {
        case "active":
          return task.status === "active" && dueDate >= now
        case "overdue":
          return task.status === "active" && dueDate < now
        case "completed":
          return task.status === "completed"
        default:
          return true
      }
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Assigned Tasks Dashboard</h1>
        </div>
        <Button onClick={() => router.push("/dashboard/study-groups")} className="bg-blue-600 hover:bg-blue-700">
          <FileText className="h-4 w-4 mr-2" />
          Assign New Task
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Tasks ({assignedTasks.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({getTasksByStatus("active").length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({getTasksByStatus("overdue").length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({getTasksByStatus("completed").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedTasks.map((task) => (
              <Card key={task.id} className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-2">{task.title}</CardTitle>
                    {getTaskStatusBadge(task)}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {task.description || "No description provided"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Priority:</span>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-medium">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Groups:</span>
                      <span className="font-medium">{task.assignedGroups.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{task.assignedStudents.length}</span>
                    </div>
                    <div className="flex gap-1 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTask(task)}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTask(task)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTask(task)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getTasksByStatus("active").map((task) => (
              <Card key={task.id} className="h-full border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-2">{task.title}</CardTitle>
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {task.assignedStudents.length} students in {task.assignedGroups.length} groups
                    </div>
                    <div className="flex gap-1 pt-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewTask(task)} className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditTask(task)} className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="overdue">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getTasksByStatus("overdue").map((task) => (
              <Card key={task.id} className="h-full border-red-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-2">{task.title}</CardTitle>
                    <Badge className="bg-red-100 text-red-800">Overdue</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {task.assignedStudents.length} students in {task.assignedGroups.length} groups
                    </div>
                    <div className="flex gap-1 pt-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewTask(task)} className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditTask(task)} className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getTasksByStatus("completed").map((task) => (
              <Card key={task.id} className="h-full border-green-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-2">{task.title}</CardTitle>
                    <Badge className="bg-green-100 text-green-800">Completed</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      {task.assignedStudents.length} students in {task.assignedGroups.length} groups
                    </div>
                    <div className="flex gap-1 pt-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewTask(task)} className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* View Task Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-semibold text-xl mb-2">{selectedTask.title}</h3>
                <div className="flex gap-2 mb-3">
                  {getTaskStatusBadge(selectedTask)}
                  {getPriorityBadge(selectedTask.priority)}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-gray-700">{selectedTask.description || "No description provided"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Due Date</h4>
                  <p className="text-gray-700">{new Date(selectedTask.dueDate).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Task Type</h4>
                  <p className="text-gray-700 capitalize">{selectedTask.taskType}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Assigned Groups ({selectedTask.assignedGroups.length})</h4>
                <div className="space-y-2">
                  {selectedTask.assignedGroups.map((group: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">{group.name}</span>
                      <span className="text-sm text-gray-600">{group.memberCount} members</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Assigned Students ({selectedTask.assignedStudents.length})</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedTask.assignedStudents.map((student: any, index: number) => (
                    <div key={index} className="text-sm p-2 bg-blue-50 rounded">
                      <span className="font-medium">{student.name}</span>
                      <span className="text-gray-600 ml-2">({student.prn})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowViewDialog(false)
              handleEditTask(selectedTask)
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-title">Task Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Enter task description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-due-date">Due Date</Label>
                <Input
                  id="edit-due-date"
                  type="datetime-local"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select value={editPriority} onValueChange={setEditPriority}>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveTaskChanges}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete the task <strong>"{taskToDelete?.title}"</strong>?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Warning</h3>
                  <p className="mt-1 text-sm text-red-700">
                    This will permanently delete the task from all assigned groups and cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTask}>
              <Trash className="h-4 w-4 mr-2" />
              Delete Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {assignedTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned yet</h3>
          <p className="text-gray-500 mb-6">Start by creating study groups and assigning tasks to them.</p>
          <Button onClick={() => router.push("/dashboard/study-groups")} className="bg-blue-600 hover:bg-blue-700">
            <FileText className="h-4 w-4 mr-2" />
            Assign Your First Task
          </Button>
        </div>
      )}
    </div>
  )
}
