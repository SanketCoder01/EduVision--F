"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Search, School, ArrowRight, Plus, Trash, Edit, FileText, MessageSquare, Clock, CheckCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [classToDelete, setClassToDelete] = useState<ClassInfo | null>(null)
  const [facultyQueries, setFacultyQueries] = useState<any[]>([])
  const [selectedQuery, setSelectedQuery] = useState<any>(null)
  const [showQueryDialog, setShowQueryDialog] = useState(false)
  const [replyMessage, setReplyMessage] = useState("")
  const [activeTab, setActiveTab] = useState("classes")

  useEffect(() => {
    // Load classes from localStorage
    const storedClasses = JSON.parse(localStorage.getItem("study_classes") || "[]")
    setClasses(storedClasses)
    
    // Load faculty queries from localStorage
    const storedQueries = JSON.parse(localStorage.getItem("facultyQueries") || "[]")
    setFacultyQueries(storedQueries)
    
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

  const handleDeleteClass = (cls: ClassInfo, e: React.MouseEvent) => {
    e.stopPropagation()
    setClassToDelete(cls)
    setShowDeleteDialog(true)
  }

  const confirmDeleteClass = () => {
    if (!classToDelete) return

    try {
      // Remove class from localStorage
      const updatedClasses = classes.filter(cls => cls.id !== classToDelete.id)
      localStorage.setItem("study_classes", JSON.stringify(updatedClasses))
      
      // Remove associated study groups
      localStorage.removeItem(`study_groups_${classToDelete.id}`)
      
      // Update state
      setClasses(updatedClasses)
      
      toast({
        title: "Success",
        description: `Class "${classToDelete.name}" and all its study groups have been deleted.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the class. Please try again.",
        variant: "destructive",
      })
    } finally {
      setShowDeleteDialog(false)
      setClassToDelete(null)
    }
  }

  const handleQueryClick = (query: any) => {
    setSelectedQuery(query)
    setShowQueryDialog(true)
    
    // Mark query as read
    const updatedQueries = facultyQueries.map(q => 
      q.id === query.id ? { ...q, status: "read" } : q
    )
    setFacultyQueries(updatedQueries)
    localStorage.setItem("facultyQueries", JSON.stringify(updatedQueries))
  }

  const handleReplyToQuery = () => {
    if (!replyMessage.trim() || !selectedQuery) return

    const reply = {
      id: Date.now().toString(),
      queryId: selectedQuery.id,
      facultyName: "Current Faculty",
      message: replyMessage,
      timestamp: new Date().toISOString()
    }

    // Store reply in localStorage
    const existingReplies = JSON.parse(localStorage.getItem("facultyReplies") || "[]")
    existingReplies.push(reply)
    localStorage.setItem("facultyReplies", JSON.stringify(existingReplies))

    // Update query status to replied
    const updatedQueries = facultyQueries.map(q => 
      q.id === selectedQuery.id ? { ...q, status: "replied" } : q
    )
    setFacultyQueries(updatedQueries)
    localStorage.setItem("facultyQueries", JSON.stringify(updatedQueries))

    toast({
      title: "Reply Sent",
      description: "Your reply has been sent to the student.",
    })

    setReplyMessage("")
    setShowQueryDialog(false)
  }

  const getUnreadQueriesCount = () => {
    return facultyQueries.filter(q => q.status === "unread").length
  }

  return (
    <div className="w-full max-w-none mx-auto">
      <motion.div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold">Study Groups Management</h1>
        <Button onClick={() => router.push("/dashboard/study-groups/create")} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Create New Class
        </Button>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="queries" className="relative">
            Student Queries
            {getUnreadQueriesCount() > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {getUnreadQueriesCount()}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="mt-6">
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
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="cursor-pointer flex-1" onClick={() => router.push(`/dashboard/study-groups/${cls.id}`)}>
                        <h3 className="text-lg font-bold">{cls.name}</h3>
                        {cls.subject && <p className="text-sm text-blue-600 font-medium">{cls.subject}</p>}
                        {cls.faculty && <p className="text-sm text-gray-500">Faculty: {cls.faculty}</p>}
                        <p className="text-sm text-gray-500">
                          {cls.students_count || 0} {cls.students_count === 1 ? "student" : "students"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <School className="h-8 w-8 text-blue-500" />
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-600 hover:bg-red-50"
                          onClick={(e) => handleDeleteClass(cls, e)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="cursor-pointer" onClick={() => router.push(`/dashboard/study-groups/${cls.id}`)}>
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
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
            </div>
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="queries" className="mt-6">
          <div className="space-y-4">
            {facultyQueries.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No student queries</h3>
                <p className="text-gray-500">Student messages from study groups will appear here.</p>
              </div>
            ) : (
              facultyQueries.map((query) => (
                <Card key={query.id} className="hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={() => handleQueryClick(query)}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{query.studentName}</h4>
                          <p className="text-sm text-gray-500">Group: {query.groupName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={query.status === "unread" ? "destructive" : query.status === "read" ? "secondary" : "default"}>
                          {query.status === "unread" && <Clock className="h-3 w-3 mr-1" />}
                          {query.status === "replied" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {query.status}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(query.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 line-clamp-2">{query.message}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Query Reply Dialog */}
      <Dialog open={showQueryDialog} onOpenChange={setShowQueryDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Student Query</DialogTitle>
          </DialogHeader>
          {selectedQuery && (
            <div className="py-4">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedQuery.studentName}</p>
                    <p className="text-sm text-gray-500">Group: {selectedQuery.groupName}</p>
                  </div>
                </div>
                <p className="text-gray-700">{selectedQuery.message}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(selectedQuery.timestamp).toLocaleString()}
                </p>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Your Reply</label>
                <Textarea
                  placeholder="Type your reply to the student..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowQueryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleReplyToQuery} disabled={!replyMessage.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Class</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete the class <strong>"{classToDelete?.name}"</strong>?
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
                    <p>This action cannot be undone. The class and all its study groups, tasks, and data will be permanently deleted.</p>
                  </div>
                </div>
              </div>
            </div>
            {classToDelete && (
              <div className="text-sm text-gray-500">
                <p><strong>Subject:</strong> {classToDelete.subject || "Not specified"}</p>
                <p><strong>Faculty:</strong> {classToDelete.faculty || "Not specified"}</p>
                <p><strong>Students:</strong> {classToDelete.students_count || 0}</p>
                {classToDelete.maxMembers && <p><strong>Max Members per Group:</strong> {classToDelete.maxMembers}</p>}
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteClass}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
