"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Users, UserPlus, ArrowLeft, Plus, School, FileText, Shuffle, CheckCircle, Edit, Trash } from "lucide-react"
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
  const [activeTab, setActiveTab] = useState("groups")

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const classId = params.classId as string

        // Fetch class info using server action
        const classResult = await getClassById(classId)
        if (!classResult.success) {
          throw new Error("Failed to fetch class information")
        }

        // Fetch study groups using server action
        const groupsResult = await getStudyGroupsByClass(classId)
        if (!groupsResult.success) {
          throw new Error("Failed to fetch study groups")
        }

        setClassInfo(classResult.data)
        setStudyGroups(groupsResult.data || [])
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
    <div className="max-w-6xl mx-auto">
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
                          {group.members.length} {group.members.length === 1 ? "member" : "members"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="py-2 flex-grow">
                        <div className="flex flex-wrap gap-1 mb-4">
                          {group.members.slice(0, 5).map((member: any, index: number) => (
                            <Avatar key={index} className="h-8 w-8 border-2 border-white">
                              <AvatarFallback>{member.student_name?.[0] || "S"}</AvatarFallback>
                            </Avatar>
                          ))}
                          {group.members.length > 5 && (
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-xs font-medium">
                              +{group.members.length - 5}
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-2 flex justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500"
                          onClick={() => router.push(`/dashboard/study-groups/${params.classId}/${group.id}`)}
                        >
                          View Details
                        </Button>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="text-blue-600">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600">
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
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned yet</h3>
                <p className="text-gray-500 mb-6 max-w-md">
                  Assign tasks or activities to study groups to help students collaborate effectively.
                </p>
                {studyGroups.length > 0 ? (
                  <Button onClick={() => setShowAssignTaskDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Task
                  </Button>
                ) : (
                  <Button disabled className="opacity-50">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Groups First
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
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
    </div>
  )
}
