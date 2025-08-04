"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Users, UserPlus, Plus, Minus, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { Slider } from "@/components/ui/slider"
import { getClassById, getStudentsByClass, createStudyGroups } from "@/app/actions/study-group-actions"

export default function CreateStudyGroupsPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const mode = searchParams.get("mode") || "faculty"

  const [classInfo, setClassInfo] = useState<any>(null)
  const [students, setStudents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [groupSize, setGroupSize] = useState(5)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [groups, setGroups] = useState<Array<{ id: number; students: string[] }>>([])
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

        // Fetch students
        const studentsResult = await getStudentsByClass(classId)
        if (!studentsResult.success) {
          throw new Error("Failed to fetch students")
        }

        setClassInfo(classResult.data)
        setStudents(studentsResult.data || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load class and students data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.classId, toast])

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId)
      } else {
        if (prev.length >= groupSize) {
          toast({
            title: "Group size limit reached",
            description: `You can only select up to ${groupSize} students per group.`,
            variant: "destructive",
          })
          return prev
        }
        return [...prev, studentId]
      }
    })
  }

  const handleAddGroup = () => {
    if (selectedStudents.length === 0) {
      toast({
        title: "No students selected",
        description: "Please select at least one student for the group.",
        variant: "destructive",
      })
      return
    }

    setGroups((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        students: selectedStudents,
      },
    ])
    setSelectedStudents([])
  }

  const handleRemoveGroup = (groupId: number) => {
    setGroups((prev) => prev.filter((group) => group.id !== groupId))
  }

  const handleSubmit = async () => {
    if (groups.length === 0) {
      toast({
        title: "No groups created",
        description: "Please create at least one group before submitting.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Format data for server action
      const formData = {
        classId: params.classId as string,
        groupSize,
        groupMembers: groups.map((group) => ({
          groupId: group.id,
          studentIds: group.students,
        })),
        createdBy: "faculty-id", // Replace with actual faculty ID from auth
        creationType: "faculty" as const,
      }

      const result = await createStudyGroups(formData)

      if (!result.success) {
        throw new Error("Failed to create study groups")
      }

      toast({
        title: "Success",
        description: `Created ${groups.length} study groups successfully.`,
      })

      // Redirect back to class study groups page
      router.push(`/dashboard/study-groups/${params.classId}`)
    } catch (error) {
      console.error("Error creating study groups:", error)
      toast({
        title: "Error",
        description: "Failed to create study groups.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStudentById = (id: string) => {
    return students.find((student) => student.id === id)
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
        <h1 className="text-2xl font-bold">Create Study Groups</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="mr-2 h-5 w-5 text-blue-600" />
                Group Settings
              </CardTitle>
              <CardDescription>Configure how you want to create the study groups</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="groupSize">Maximum Students Per Group: {groupSize}</Label>
                  <Slider
                    id="groupSize"
                    min={2}
                    max={10}
                    step={1}
                    value={[groupSize]}
                    onValueChange={(value) => setGroupSize(value[0])}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-blue-600" />
                Select Students
              </CardTitle>
              <CardDescription>
                Select up to {groupSize} students for each group. Selected: {selectedStudents.length}/{groupSize}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="relative">
                  <Input placeholder="Search students..." className="pl-8 mb-4" />
                  <div className="absolute left-2 top-2.5 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                  {students.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No students found in this class</div>
                  ) : (
                    students.map((student) => (
                      <div
                        key={student.id}
                        className={`flex items-center space-x-2 p-2 rounded-md ${
                          selectedStudents.includes(student.id)
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <Checkbox
                          id={`student-${student.id}`}
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => handleStudentSelect(student.id)}
                          disabled={!selectedStudents.includes(student.id) && selectedStudents.length >= groupSize}
                        />
                        <Label
                          htmlFor={`student-${student.id}`}
                          className="flex-1 flex justify-between items-center cursor-pointer"
                        >
                          <span>{student.name}</span>
                          <span className="text-xs text-gray-500">{student.prn}</span>
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleAddGroup}
                disabled={selectedStudents.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add as Group {groups.length + 1}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-green-600" />
                Created Groups
              </CardTitle>
              <CardDescription>Review and submit the study groups you've created</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AnimatePresence>
                  {groups.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-8 text-gray-500"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-gray-400" />
                      </div>
                      <p>No groups created yet</p>
                      <p className="text-sm">Select students and add them as a group</p>
                    </motion.div>
                  ) : (
                    groups.map((group) => (
                      <motion.div
                        key={group.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="border rounded-md p-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium">Group {group.id}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveGroup(group.id)}
                            className="h-8 w-8 text-red-600"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {group.students.map((studentId) => {
                            const student = getStudentById(studentId)
                            return (
                              <div key={studentId} className="text-sm flex justify-between">
                                <span>{student?.name}</span>
                                <span className="text-gray-500">{student?.prn}</span>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSubmit}
                disabled={groups.length === 0 || isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700"
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
                    Creating Groups...
                  </div>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Create {groups.length} Study Groups
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
