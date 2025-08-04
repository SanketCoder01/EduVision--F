"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, FileText, Calendar, Paperclip, Check, Shuffle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
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

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        const classId = params.classId as string

        // Fetch class info
        const classResult = await getClassById(classId)
        if (!classResult.success) {
          throw new Error("Failed to fetch class information")
        }

        // Fetch study groups
        const groupsResult = await getStudyGroupsByClass(classId)
        if (!groupsResult.success) {
          throw new Error("Failed to fetch study groups")
        }

        setClassInfo(classResult.data)
        setStudyGroups(groupsResult.data || [])

        // If shuffle mode, select all groups by default
        if (mode === "shuffle") {
          setSelectedGroups(groupsResult.data.map((group: any) => group.id))
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

      // Format data for server action
      const formData = {
        groupIds: selectedGroups,
        title: taskTitle,
        description: taskDescription,
        dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 1 week from now
      }

      const result = await addTaskToStudyGroup(formData)

      if (!result.success) {
        throw new Error("Failed to assign task to study groups")
      }

      toast({
        title: "Success",
        description: `Task assigned to ${selectedGroups.length} study groups successfully.`,
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
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">{mode === "manual" ? "Assign Task Manually" : "Shuffle Task Assignment"}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-600" />
                Task Details
              </CardTitle>
              <CardDescription>Define the task or activity for the study groups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="taskTitle">Task Title</Label>
                  <Input
                    id="taskTitle"
                    placeholder="Enter task title"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="taskDescription">Task Description</Label>
                  <Textarea
                    id="taskDescription"
                    placeholder="Enter task description"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    rows={4}
                  />
                </div>
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
                <div>
                  <Label className="flex items-center mb-2">
                    <Paperclip className="mr-2 h-4 w-4 text-gray-500" />
                    Attachments
                  </Label>
                  <div className="border border-dashed rounded-md p-4 text-center">
                    <p className="text-sm text-gray-500">Drag and drop files here or click to browse</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Browse Files
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {mode === "manual" ? (
                  <>
                    <Check className="mr-2 h-5 w-5 text-green-600" />
                    Select Groups
                  </>
                ) : (
                  <>
                    <Shuffle className="mr-2 h-5 w-5 text-purple-600" />
                    Shuffle Assignment
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {mode === "manual"
                  ? "Select which groups to assign this task to"
                  : "Task will be assigned to all groups randomly"}
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
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {studyGroups.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No study groups found in this class</div>
                  ) : (
                    studyGroups.map((group) => (
                      <div
                        key={group.id}
                        className={`flex items-center space-x-2 p-2 rounded-md ${
                          selectedGroups.includes(group.id) ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                        }`}
                      >
                        <Checkbox
                          id={`group-${group.id}`}
                          checked={selectedGroups.includes(group.id)}
                          onCheckedChange={() => handleGroupSelect(group.id)}
                        />
                        <Label
                          htmlFor={`group-${group.id}`}
                          className="flex-1 flex justify-between items-center cursor-pointer"
                        >
                          <span>{group.name}</span>
                          <span className="text-xs text-gray-500">{group.members?.length || 0} members</span>
                        </Label>
                      </div>
                    ))
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
