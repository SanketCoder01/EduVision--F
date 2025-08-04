"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Users, Plus, BookOpen, User, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function CreateStudyGroupsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [className, setClassName] = useState("")
  const [classDescription, setClassDescription] = useState("")
  const [subjectName, setSubjectName] = useState("")
  const [facultyName, setFacultyName] = useState("")
  const [maxMembers, setMaxMembers] = useState("")

  const handleCreateClass = async () => {
    if (!className.trim()) {
      toast({
        title: "Error",
        description: "Please enter a class name",
        variant: "destructive",
      })
      return
    }

    if (!subjectName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a subject name",
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

    if (!maxMembers || Number.parseInt(maxMembers) < 2) {
      toast({
        title: "Error",
        description: "Please enter a valid number of members (minimum 2)",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulate quick API call - removed artificial delay
      const newClass = {
        id: `class_${Date.now()}`,
        name: className,
        description: classDescription || `${subjectName} study groups`,
        subject: subjectName,
        faculty: facultyName,
        maxMembers: Number.parseInt(maxMembers),
        students_count: 0,
        created_at: new Date().toISOString(),
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
    <div className="max-w-4xl mx-auto">
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
                <Label htmlFor="className" className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Class Name *
                </Label>
                <Input
                  id="className"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g., FY-CSE, SY-IT, TY-AIML"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjectName" className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Subject Name *
                </Label>
                <Input
                  id="subjectName"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g., Data Structures, Web Development"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="facultyName" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Faculty Name *
                </Label>
                <Input
                  id="facultyName"
                  value={facultyName}
                  onChange={(e) => setFacultyName(e.target.value)}
                  placeholder="e.g., Dr. Smith, Prof. Johnson"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxMembers" className="flex items-center">
                  <Hash className="mr-2 h-4 w-4" />
                  Max Members per Group *
                </Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min="2"
                  max="10"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(e.target.value)}
                  placeholder="e.g., 5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="classDescription">Class Description (Optional)</Label>
              <Textarea
                id="classDescription"
                value={classDescription}
                onChange={(e) => setClassDescription(e.target.value)}
                placeholder="Brief description about this class and study groups..."
                className="min-h-[100px]"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button onClick={handleCreateClass} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Class
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
