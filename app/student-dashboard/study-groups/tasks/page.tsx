"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText,
  Calendar,
  Clock,
  Upload,
  CheckCircle,
  AlertCircle,
  Download,
  MessageSquare,
  Users,
  Filter,
  Search,
  Plus,
  Paperclip,
  Send
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"

export default function StudyGroupTasksPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPriority, setFilterPriority] = useState("all")
  const [selectedTask, setSelectedTask] = useState(null)
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false)
  const [showTaskDetails, setShowTaskDetails] = useState(false)
  const [submissionText, setSubmissionText] = useState("")
  const [submissionFiles, setSubmissionFiles] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Mock data for study group tasks
  const [tasks, setTasks] = useState([
    {
      id: "1",
      title: "Data Structures Assignment - Binary Trees",
      description: "Implement binary tree operations including insertion, deletion, and traversal methods. Create test cases and document your approach.",
      groupName: "Algorithm Masters",
      subjectName: "Data Structures",
      facultyName: "Dr. Smith",
      priority: "high",
      taskType: "one-time",
      dueDate: "2024-01-25T23:59:00",
      createdAt: "2024-01-15T10:00:00",
      requiresSubmission: true,
      allowLateSubmission: false,
      maxFileSize: 10,
      status: "pending",
      materials: [
        { name: "Binary_Tree_Reference.pdf", size: "2.5 MB", url: "#" },
        { name: "Sample_Code.cpp", size: "1.2 KB", url: "#" }
      ],
      submissions: []
    },
    {
      id: "2", 
      title: "Weekly Discussion - AI Ethics",
      description: "Research and discuss current ethical challenges in AI development. Prepare talking points for group discussion.",
      groupName: "AI Innovators",
      subjectName: "Artificial Intelligence",
      facultyName: "Prof. Johnson",
      priority: "medium",
      taskType: "recurring",
      frequency: "weekly",
      dueDate: "2024-01-22T18:00:00",
      createdAt: "2024-01-08T09:00:00",
      requiresSubmission: true,
      allowLateSubmission: true,
      maxFileSize: 5,
      status: "submitted",
      materials: [
        { name: "AI_Ethics_Guidelines.pdf", size: "3.1 MB", url: "#" }
      ],
      submissions: [
        {
          id: "sub1",
          submittedAt: "2024-01-21T16:30:00",
          text: "Researched key ethical concerns including bias, privacy, and job displacement...",
          files: [
            { name: "AI_Ethics_Research.docx", size: "856 KB" }
          ]
        }
      ]
    },
    {
      id: "3",
      title: "Monthly Project - Web App Development",
      description: "Develop a full-stack web application using React and Node.js. Include user authentication and database integration.",
      groupName: "Web Warriors",
      subjectName: "Web Development",
      facultyName: "Dr. Wilson",
      priority: "urgent",
      taskType: "recurring",
      frequency: "monthly",
      dueDate: "2024-01-30T23:59:00",
      createdAt: "2024-01-01T00:00:00",
      requiresSubmission: true,
      allowLateSubmission: false,
      maxFileSize: 50,
      status: "overdue",
      materials: [
        { name: "Project_Requirements.pdf", size: "1.8 MB", url: "#" },
        { name: "Database_Schema.sql", size: "2.3 KB", url: "#" },
        { name: "UI_Mockups.figma", size: "4.2 MB", url: "#" }
      ],
      submissions: []
    }
  ])

  const handleTaskSubmission = async () => {
    if (!submissionText.trim() && submissionFiles.length === 0) {
      toast({
        title: "Submission Required",
        description: "Please provide either text submission or upload files.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      const newSubmission = {
        id: `sub_${Date.now()}`,
        submittedAt: new Date().toISOString(),
        text: submissionText,
        files: submissionFiles.map(file => ({
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`
        }))
      }

      // Update task status
      setTasks(prev => prev.map(task => 
        task.id === selectedTask.id 
          ? { 
              ...task, 
              status: "submitted", 
              submissions: [...task.submissions, newSubmission] 
            }
          : task
      ))

      toast({
        title: "Submission Successful",
        description: "Your task submission has been recorded successfully.",
      })

      setShowSubmissionDialog(false)
      setSubmissionText("")
      setSubmissionFiles([])
      setSelectedTask(null)
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTasksByStatus = (status) => {
    return tasks.filter(task => {
      const matchesStatus = task.status === status
      const matchesSearch = searchQuery === "" || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPriority = filterPriority === "all" || task.priority === filterPriority
      
      return matchesStatus && matchesSearch && matchesPriority
    })
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`
    } else if (diffDays === 0) {
      return "Due today"
    } else if (diffDays === 1) {
      return "Due tomorrow"
    } else {
      return `Due in ${diffDays} days`
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-200"
      case "high": return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted": return "bg-green-100 text-green-800 border-green-200"
      case "overdue": return "bg-red-100 text-red-800 border-red-200"
      case "pending": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const TaskCard = ({ task }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{task.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {task.description}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 ml-4">
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority.toUpperCase()}
              </Badge>
              <Badge className={getStatusColor(task.status)}>
                {task.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {task.groupName}
              </div>
              <div className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                {task.subjectName}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(task.dueDate)}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                {task.taskType === "recurring" ? `${task.frequency} task` : "One-time task"}
              </div>
            </div>

            {task.materials && task.materials.length > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <Paperclip className="h-4 w-4 mr-1" />
                {task.materials.length} material{task.materials.length > 1 ? 's' : ''} attached
              </div>
            )}

            <Separator />

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedTask(task)
                  setShowTaskDetails(true)
                }}
              >
                View Details
              </Button>
              
              {task.status === "pending" && task.requiresSubmission && (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    setSelectedTask(task)
                    setShowSubmissionDialog(true)
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Submit
                </Button>
              )}
              
              {task.status === "submitted" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-600 border-green-200"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submitted
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold flex items-center">
          <FileText className="inline-block mr-2 h-6 w-6 text-blue-600" />
          Study Group Tasks
        </h1>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task Tabs */}
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
            <motion.div className="flex items-center" whileHover={{ scale: 1.03 }}>
              <Clock className="mr-2 h-4 w-4" />
              Pending
              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700">
                {getTasksByStatus("pending").length}
              </Badge>
            </motion.div>
          </TabsTrigger>
          <TabsTrigger value="submitted" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
            <motion.div className="flex items-center" whileHover={{ scale: 1.03 }}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Submitted
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
                {getTasksByStatus("submitted").length}
              </Badge>
            </motion.div>
          </TabsTrigger>
          <TabsTrigger value="overdue" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
            <motion.div className="flex items-center" whileHover={{ scale: 1.03 }}>
              <AlertCircle className="mr-2 h-4 w-4" />
              Overdue
              <Badge variant="outline" className="ml-2 bg-red-50 text-red-700">
                {getTasksByStatus("overdue").length}
              </Badge>
            </motion.div>
          </TabsTrigger>
        </TabsList>

        {["pending", "submitted", "overdue"].map((status) => (
          <TabsContent key={status} value={status}>
            <div className="space-y-4">
              <AnimatePresence>
                {getTasksByStatus(status).length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card>
                      <CardContent className="p-8">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            {status === "pending" && <Clock className="h-8 w-8 text-gray-400" />}
                            {status === "submitted" && <CheckCircle className="h-8 w-8 text-gray-400" />}
                            {status === "overdue" && <AlertCircle className="h-8 w-8 text-gray-400" />}
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No {status} tasks
                          </h3>
                          <p className="text-gray-500">
                            {status === "pending" && "All caught up! No pending tasks at the moment."}
                            {status === "submitted" && "No submitted tasks yet."}
                            {status === "overdue" && "Great! No overdue tasks."}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  getTasksByStatus(status).map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))
                )}
              </AnimatePresence>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Task Submission Dialog */}
      <Dialog open={showSubmissionDialog} onOpenChange={setShowSubmissionDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Task</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedTask.title}</h3>
                <p className="text-gray-600 text-sm">{selectedTask.groupName} • {selectedTask.subjectName}</p>
              </div>
              
              <div>
                <Label htmlFor="submission-text">Submission Text</Label>
                <Textarea
                  id="submission-text"
                  placeholder="Enter your submission details, approach, findings, or any relevant information..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  rows={6}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>File Uploads</Label>
                <div className="border border-dashed rounded-md p-4 text-center mt-1">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drop files here or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    Max file size: {selectedTask.maxFileSize}MB
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Browse Files
                  </Button>
                </div>
                {submissionFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {submissionFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmissionDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleTaskSubmission} 
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Task
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Details Dialog */}
      <Dialog open={showTaskDetails} onOpenChange={setShowTaskDetails}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6 py-4">
              <div>
                <h3 className="font-semibold text-xl mb-2">{selectedTask.title}</h3>
                <div className="flex gap-2 mb-3">
                  <Badge className={getPriorityColor(selectedTask.priority)}>
                    {selectedTask.priority.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(selectedTask.status)}>
                    {selectedTask.status.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    {selectedTask.taskType === "recurring" ? `${selectedTask.frequency} task` : "One-time task"}
                  </Badge>
                </div>
                <p className="text-gray-700">{selectedTask.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">Study Group</Label>
                  <p className="text-sm text-gray-600">{selectedTask.groupName}</p>
                </div>
                <div>
                  <Label className="font-medium">Subject</Label>
                  <p className="text-sm text-gray-600">{selectedTask.subjectName}</p>
                </div>
                <div>
                  <Label className="font-medium">Faculty</Label>
                  <p className="text-sm text-gray-600">{selectedTask.facultyName}</p>
                </div>
                <div>
                  <Label className="font-medium">Due Date</Label>
                  <p className="text-sm text-gray-600">{formatDate(selectedTask.dueDate)}</p>
                </div>
              </div>

              {selectedTask.materials && selectedTask.materials.length > 0 && (
                <div>
                  <Label className="font-medium mb-2 block">Task Materials</Label>
                  <div className="space-y-2">
                    {selectedTask.materials.map((material, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center">
                          <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
                          <span className="text-sm font-medium">{material.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({material.size})</span>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTask.submissions && selectedTask.submissions.length > 0 && (
                <div>
                  <Label className="font-medium mb-2 block">Your Submissions</Label>
                  <div className="space-y-3">
                    {selectedTask.submissions.map((submission) => (
                      <div key={submission.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <Badge className="bg-green-100 text-green-800">
                            Submitted
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(submission.submittedAt).toLocaleString()}
                          </span>
                        </div>
                        {submission.text && (
                          <p className="text-sm text-gray-700 mb-2">{submission.text}</p>
                        )}
                        {submission.files && submission.files.length > 0 && (
                          <div className="space-y-1">
                            <Label className="text-xs font-medium">Attached Files:</Label>
                            {submission.files.map((file, index) => (
                              <div key={index} className="text-xs text-gray-600 flex items-center">
                                <Paperclip className="h-3 w-3 mr-1" />
                                {file.name} ({file.size})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDetails(false)}>
              Close
            </Button>
            {selectedTask && selectedTask.status === "pending" && selectedTask.requiresSubmission && (
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setShowTaskDetails(false)
                  setShowSubmissionDialog(true)
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Submit Task
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
