"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Users, UserPlus, ArrowLeft, Plus, School, FileText, Shuffle, CheckCircle, Edit, Trash, Eye, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import { getCurrentFaculty, getAllStudentsForDept, getStudentsForYear, normalizeYear } from "@/lib/supabase-utils"

export default function ClassStudyGroupsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const classId = params.classId as string

  const [classInfo, setClassInfo] = useState<any>(null)
  const [studyGroups, setStudyGroups] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateOptions, setShowCreateOptions] = useState(false)
  const [showAssignTaskDialog, setShowAssignTaskDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("groups")
  const [showGroupDetails, setShowGroupDetails] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [groupMembers, setGroupMembers] = useState<Record<string, any[]>>({})
  const [faculty, setFaculty] = useState<any>(null)
  const [availableStudents, setAvailableStudents] = useState<any[]>([])
  const [selectedYear, setSelectedYear] = useState<string>("")
  const realtimeRef = useRef<any>(null)

  useEffect(() => {
    loadData()
    return () => { realtimeRef.current?.unsubscribe() }
  }, [classId])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const fac = await getCurrentFaculty()
      setFaculty(fac)

      // Load the class (study_groups main record)
      const { data: classData } = await supabase
        .from("study_groups")
        .select("*")
        .eq("id", classId)
        .maybeSingle()

      setClassInfo(classData || { id: classId, name: `Class ${classId}` })

      // Load sub-groups for this class
      await loadGroups()
      await loadTasks()
      
      // Load students for this class's dept+year
      if (fac?.department) {
        const yr = classData?.year || selectedYear
        const students = yr
          ? await getStudentsForYear(fac.department, yr)
          : await getAllStudentsForDept(fac.department)
        setAvailableStudents(students)
      }

      // Set up realtime
      setupRealtime()
    } catch (e) {
      console.error("loadData:", e)
      toast({ title: "Error", description: "Failed to load class data.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const loadGroups = async () => {
    const { data, error } = await supabase
      .from("study_group_members")
      .select("class_id, group_name, student_id, student_name, role, department, year")
      .eq("class_id", classId)

    if (error) console.warn("loadGroups:", error.message)

    // Group by group_name
    const grouped: Record<string, any> = {}
    ;(data || []).forEach((m: any) => {
      if (!grouped[m.group_name]) {
        grouped[m.group_name] = { id: m.group_name, name: m.group_name, members: [] }
      }
      grouped[m.group_name].members.push(m)
    })

    setStudyGroups(Object.values(grouped))
    const memberMap: Record<string, any[]> = {}
    Object.values(grouped).forEach((g: any) => { memberMap[g.id] = g.members })
    setGroupMembers(memberMap)
  }

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from("study_group_tasks")
      .select("*")
      .eq("class_id", classId)
      .order("created_at", { ascending: false })

    if (error) console.warn("loadTasks:", error.message)
    setTasks(data || [])
  }

  const setupRealtime = () => {
    realtimeRef.current?.unsubscribe()
    const channel = supabase.channel(`class_${classId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "study_group_members", filter: `class_id=eq.${classId}` }, loadGroups)
      .on("postgres_changes", { event: "*", schema: "public", table: "study_group_tasks", filter: `class_id=eq.${classId}` }, loadTasks)
      .subscribe()
    realtimeRef.current = channel
  }

  const handleDeleteGroup = async (groupName: string) => {
    setGroupToDelete(groupName)
    setShowDeleteDialog(true)
  }

  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return
    await supabase.from("study_group_members").delete().eq("class_id", classId).eq("group_name", groupToDelete)
    await supabase.from("study_group_tasks").delete().eq("class_id", classId).eq("group_name", groupToDelete)
    setStudyGroups(prev => prev.filter(g => g.name !== groupToDelete))
    setShowDeleteDialog(false)
    setGroupToDelete(null)
    toast({ title: "Group Deleted" })
  }

  const handleViewDetails = (group: any) => {
    setSelectedGroup(group)
    setShowGroupDetails(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const YEARS = ["1st", "2nd", "3rd", "4th"]

  return (
    <div className="w-full max-w-none mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
          <h1 className="text-2xl font-bold flex items-center">
            <School className="inline-block mr-2 h-6 w-6 text-blue-600" />
            {classInfo?.name || "Class Study Groups"}
          </h1>
          {classInfo?.department && (
            <Badge className="ml-3 bg-blue-100 text-blue-700">{classInfo.department?.toUpperCase()} · {normalizeYear(classInfo.year || "")} Year</Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setShowCreateOptions(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />Create Groups
          </Button>
          {studyGroups.length > 0 && (
            <Button onClick={() => setShowAssignTaskDialog(true)} variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              <FileText className="mr-2 h-4 w-4" />Assign Task
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="groups" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">
            <Users className="mr-2 h-4 w-4" />Study Groups {studyGroups.length > 0 && <Badge variant="outline" className="ml-2">{studyGroups.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <FileText className="mr-2 h-4 w-4" />Tasks & Activities {tasks.length > 0 && <Badge variant="outline" className="ml-2">{tasks.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups">
          <AnimatePresence>
            {studyGroups.length === 0 ? (
              <Card>
                <CardContent className="p-12 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No study groups yet</h3>
                  <p className="text-gray-500 mb-6">Create study groups for this class to collaborate.</p>
                  <Button onClick={() => setShowCreateOptions(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />Create Groups
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studyGroups.map((group) => (
                  <motion.div key={group.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} whileHover={{ scale: 1.02 }}>
                    <Card className="h-full flex flex-col">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle>{group.name}</CardTitle>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">{group.members?.length || 0} members</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2 flex-grow">
                        <div className="flex flex-wrap gap-1 mb-3">
                          {(group.members || []).slice(0, 5).map((member: any, i: number) => (
                            <Avatar key={i} className="h-8 w-8 border-2 border-white">
                              <AvatarImage src={member.face_image} />
                              <AvatarFallback>{member.student_name?.[0] || "S"}</AvatarFallback>
                            </Avatar>
                          ))}
                          {(group.members?.length || 0) > 5 && (
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 text-xs font-medium">
                              +{(group.members?.length || 0) - 5}
                            </div>
                          )}
                        </div>
                        {/* Task count */}
                        {tasks.filter(t => t.group_name === group.name).length > 0 && (
                          <p className="text-xs text-blue-600">{tasks.filter(t => t.group_name === group.name).length} task(s) assigned</p>
                        )}
                      </CardContent>
                      <CardFooter className="pt-2 flex justify-between">
                        <Button variant="ghost" size="sm" className="text-gray-500" onClick={() => handleViewDetails(group)}>View Details</Button>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => router.push(`/dashboard/study-groups/${classId}/assign-task?group=${group.name}`)}>
                            <FileText className="h-4 w-4 mr-1" />Assign
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDeleteGroup(group.name)}>
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
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="p-12 flex flex-col items-center text-center">
                <FileText className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No tasks assigned yet</h3>
                <p className="text-gray-500">Create study groups first, then assign tasks.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Tasks & Activities ({tasks.length})</h3>
                <Button onClick={() => router.push(`/dashboard/study-groups/${classId}/assign-task`)} className="bg-blue-600 hover:bg-blue-700" size="sm">
                  <Plus className="h-4 w-4 mr-2" />Add Task
                </Button>
              </div>
              {tasks.map(task => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-gray-500">Group: {task.group_name || "All Groups"}</p>
                      <div className="flex gap-2 mt-1">
                        {task.due_date && <span className="text-xs text-gray-400">Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                        <Badge className={`text-xs ${task.status === 'completed' ? 'bg-green-100 text-green-700' : task.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{task.status}</Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={async () => {
                        await supabase.from("study_group_tasks").delete().eq("id", task.id)
                        loadTasks()
                        toast({ title: "Task removed" })
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Options Dialog */}
      <Dialog open={showCreateOptions} onOpenChange={setShowCreateOptions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Create Study Groups</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <Button onClick={() => { setShowCreateOptions(false); router.push(`/dashboard/study-groups/${classId}/create-groups?mode=faculty`) }} className="flex items-center justify-center gap-2 h-20 bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Faculty Creates Groups</div>
                <div className="text-xs opacity-90">You select students and create groups</div>
              </div>
            </Button>
            <Button onClick={() => { setShowCreateOptions(false); router.push(`/dashboard/study-groups/${classId}/create-groups?mode=student`) }} className="flex items-center justify-center gap-2 h-20 bg-green-600 hover:bg-green-700">
              <Users className="h-6 w-6" />
              <div className="text-left">
                <div className="font-semibold">Let Students Decide</div>
                <div className="text-xs opacity-90">Students form their own groups</div>
              </div>
            </Button>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowCreateOptions(false)}>Cancel</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={showAssignTaskDialog} onOpenChange={setShowAssignTaskDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Assign Task or Activity</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <Button onClick={() => { setShowAssignTaskDialog(false); router.push(`/dashboard/study-groups/${classId}/assign-task?mode=manual`) }} className="flex items-center justify-center gap-2 h-20 bg-blue-600 hover:bg-blue-700">
              <CheckCircle className="h-6 w-6" />
              <div className="text-left"><div className="font-semibold">Assign Manually</div><div className="text-xs opacity-90">Select which groups get which tasks</div></div>
            </Button>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setShowAssignTaskDialog(false)}>Cancel</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Study Group</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-4">Delete group <strong>"{groupToDelete}"</strong>? This will remove all members and tasks. Cannot be undone.</p>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteGroup}><Trash className="h-4 w-4 mr-2" />Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group Details Dialog */}
      <Dialog open={showGroupDetails} onOpenChange={setShowGroupDetails}>
        <DialogContent className="sm:max-w-md max-h-[70vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selectedGroup?.name} — Members</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2">
            {(selectedGroup?.members || []).map((m: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-600">{m.student_name?.[0] || "S"}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{m.student_name}</p>
                  <p className="text-xs text-gray-500">{m.role === 'leader' ? '⭐ Leader' : 'Member'}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
