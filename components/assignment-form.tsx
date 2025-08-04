"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, HelpCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ClassInfo } from "@/types/assignment"
import { CreationModeSelection } from "./creation-mode-selection"
import { ClassSelection } from "./class-selection"
import { RichTextEditor } from "./rich-text-editor"
import { FileUploader } from "./file-uploader"
import { DateTimePicker } from "./date-time-picker"

interface AssignmentFormProps {
  onSubmit: (formData: {
    title: string
    description: string
    facultyId: string
    classId: string
    assignmentType: string
    allowedFileTypes: string[]
    wordLimit?: number
    maxMarks: number
    startDate: string
    dueDate: string
    visibility: boolean
    allowLateSubmission: boolean
    allowResubmission: boolean
    enablePlagiarismCheck: boolean
    allowGroupSubmission: boolean
    resources: Array<{
      name: string
      type: string
      size: string
      file?: File
    }>
  }) => Promise<void>
  classes: ClassInfo[]
  facultyId: string
}

export function AssignmentForm({ onSubmit, classes, facultyId }: AssignmentFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [creationMethod, setCreationMethod] = useState<"manual" | "ai">("manual")
  const [showAIPromptDialog, setShowAIPromptDialog] = useState(false)
  const [aiPrompt, setAIPrompt] = useState("")
  const [isProcessingAI, setIsProcessingAI] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    classId: "",
    assignmentType: "file_upload",
    allowedFileTypes: ["pdf", "docx", "zip"],
    wordLimit: "",
    maxMarks: 100,
    startDate: "",
    startTime: "",
    dueDate: "",
    dueTime: "",
    timezone: "UTC",
    visibility: true,
    allowLateSubmission: false,
    allowResubmission: false,
    enablePlagiarismCheck: true,
    allowGroupSubmission: false,
  })

  // Resources state
  const [resources, setResources] = useState<
    Array<{
      name: string
      type: string
      size: string
      file?: File
    }>
  >([])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  // Handle file types selection
  const handleFileTypeChange = (fileType: string, checked: boolean) => {
    setFormData((prev) => {
      const currentTypes = [...prev.allowedFileTypes]
      if (checked && !currentTypes.includes(fileType)) {
        return { ...prev, allowedFileTypes: [...currentTypes, fileType] }
      } else if (!checked && currentTypes.includes(fileType)) {
        return { ...prev, allowedFileTypes: currentTypes.filter((type) => type !== fileType) }
      }
      return prev
    })
  }

  // Generate with AI
  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt for the AI",
        variant: "destructive",
      })
      return
    }

    setIsProcessingAI(true)

    // Simulate AI processing
    setTimeout(() => {
      // Generate assignment based on prompt
      let generatedTitle = ""
      let generatedDescription = ""

      if (aiPrompt.toLowerCase().includes("data structure")) {
        generatedTitle = "Advanced Data Structures Implementation"
        generatedDescription =
          "# Data Structures Assignment\n\n" +
          "## Objectives\n\n" +
          "Implement and analyze advanced data structures to solve complex problems.\n\n" +
          "## Requirements\n\n" +
          "1. Implement a self-balancing binary search tree (AVL or Red-Black)\n" +
          "2. Create a priority queue using a binary heap\n" +
          "3. Develop a hash table with collision resolution\n" +
          "4. Analyze the time and space complexity of each implementation\n" +
          "5. Compare the performance of your implementations with standard library versions\n\n" +
          "## Submission Guidelines\n\n" +
          "- Submit source code with comprehensive comments\n" +
          "- Include a report (PDF) with analysis and performance comparisons\n" +
          "- Prepare test cases demonstrating the functionality of each data structure"
      } else if (aiPrompt.toLowerCase().includes("algorithm")) {
        generatedTitle = "Algorithm Design and Analysis"
        generatedDescription =
          "# Algorithms Assignment\n\n" +
          "## Objectives\n\n" +
          "Design, implement, and analyze algorithms for solving computational problems.\n\n" +
          "## Requirements\n\n" +
          "1. Implement three different sorting algorithms\n" +
          "2. Develop a graph algorithm for finding shortest paths\n" +
          "3. Create a dynamic programming solution for the knapsack problem\n" +
          "4. Analyze the time and space complexity of each algorithm\n" +
          "5. Compare the performance of your implementations with different input sizes\n\n" +
          "## Submission Guidelines\n\n" +
          "- Submit source code with comprehensive comments\n" +
          "- Include a report (PDF) with analysis and performance comparisons\n" +
          "- Prepare visualizations of algorithm performance"
      } else if (aiPrompt.toLowerCase().includes("database")) {
        generatedTitle = "Database Design and SQL Implementation"
        generatedDescription =
          "# Database Management Assignment\n\n" +
          "## Objectives\n\n" +
          "Design a relational database and implement SQL queries for data manipulation and analysis.\n\n" +
          "## Requirements\n\n" +
          "1. Design a normalized database schema for a given scenario\n" +
          "2. Create tables with appropriate constraints and relationships\n" +
          "3. Implement complex SQL queries for data retrieval and analysis\n" +
          "4. Develop stored procedures and triggers for business logic\n" +
          "5. Optimize queries for performance\n\n" +
          "## Submission Guidelines\n\n" +
          "- Submit SQL scripts for schema creation and data manipulation\n" +
          "- Include an ER diagram of your database design\n" +
          "- Provide a report explaining your design decisions and query optimizations"
      } else {
        generatedTitle = "Programming Fundamentals Assignment"
        generatedDescription =
          "# Programming Assignment\n\n" +
          "## Objectives\n\n" +
          "Demonstrate understanding of programming fundamentals through practical implementation.\n\n" +
          "## Requirements\n\n" +
          "1. Implement a solution for the given problem using proper programming techniques\n" +
          "2. Apply object-oriented principles in your design\n" +
          "3. Handle edge cases and exceptions appropriately\n" +
          "4. Write clean, well-documented code\n" +
          "5. Create comprehensive test cases\n\n" +
          "## Submission Guidelines\n\n" +
          "- Submit source code with comprehensive comments\n" +
          "- Include a report explaining your approach and design decisions\n" +
          "- Provide test cases and their expected outputs"
      }

      setFormData((prev) => ({
        ...prev,
        title: generatedTitle,
        description: generatedDescription,
      }))

      setIsProcessingAI(false)
      setShowAIPromptDialog(false)

      toast({
        title: "AI Generation Complete",
        description: "Assignment details have been generated based on your prompt.",
      })
    }, 3000)
  }

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter an assignment title",
        variant: "destructive",
      })
      return
    }

    if (!formData.description.trim()) {
      toast({
        title: "Error",
        description: "Please enter assignment instructions/description",
        variant: "destructive",
      })
      return
    }

    if (!formData.classId) {
      toast({
        title: "Error",
        description: "Please select a class",
        variant: "destructive",
      })
      return
    }

    if (!formData.dueDate) {
      toast({
        title: "Error",
        description: "Please set a due date",
        variant: "destructive",
      })
      return
    }

    if (formData.maxMarks <= 0) {
      toast({
        title: "Error",
        description: "Please enter valid maximum marks",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Format dates
      const startDateTime =
        formData.startDate && formData.startTime
          ? new Date(`${formData.startDate}T${formData.startTime}`).toISOString()
          : new Date().toISOString()

      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime || "23:59"}`).toISOString()

      // Submit form data
      await onSubmit({
        title: formData.title,
        description: formData.description,
        facultyId,
        classId: formData.classId,
        assignmentType: formData.assignmentType,
        allowedFileTypes: formData.allowedFileTypes,
        wordLimit: formData.wordLimit ? Number.parseInt(formData.wordLimit) : undefined,
        maxMarks: formData.maxMarks,
        startDate: startDateTime,
        dueDate: dueDateTime,
        visibility: formData.visibility,
        allowLateSubmission: formData.allowLateSubmission,
        allowResubmission: formData.allowResubmission,
        enablePlagiarismCheck: formData.enablePlagiarismCheck,
        allowGroupSubmission: formData.allowGroupSubmission,
        resources,
      })

      toast({
        title: "Success",
        description: "Assignment created successfully!",
      })

      // Redirect to assignments page
      router.push("/dashboard/assignments")
    } catch (error) {
      console.error("Error creating assignment:", error)
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push("/dashboard/assignments")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Create New Assignment</h1>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <CreationModeSelection
              creationMethod={creationMethod}
              setCreationMethod={setCreationMethod}
              onAISelect={() => setShowAIPromptDialog(true)}
            />

            <ClassSelection
              classes={classes}
              selectedClass={formData.classId}
              onClassChange={(value) => handleSelectChange("classId", value)}
            />
          </div>

          <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Details</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 pt-4">
              <div>
                <Label htmlFor="title" className="text-base">
                  Assignment Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter assignment title"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-base">
                  Instructions/Description
                </Label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
                  placeholder="Enter detailed instructions for the assignment"
                  minHeight="300px"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base">Assignment Type</Label>
                  <Select
                    value={formData.assignmentType}
                    onValueChange={(value) => handleSelectChange("assignmentType", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select assignment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="file_upload">File Upload</SelectItem>
                      <SelectItem value="text_based">Text-based</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="coding">Coding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="maxMarks" className="text-base">
                    Maximum Marks
                  </Label>
                  <Input
                    id="maxMarks"
                    name="maxMarks"
                    type="number"
                    value={formData.maxMarks}
                    onChange={handleInputChange}
                    placeholder="Enter maximum marks"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="wordLimit" className="text-base">
                    Word/Page Limit (Optional)
                  </Label>
                  <Input
                    id="wordLimit"
                    name="wordLimit"
                    type="number"
                    value={formData.wordLimit}
                    onChange={handleInputChange}
                    placeholder="Enter word limit"
                    className="mt-1"
                  />
                </div>

                {formData.assignmentType === "file_upload" && (
                  <div>
                    <Label className="text-base mb-2 block">Allowed File Types</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {["pdf", "docx", "pptx", "xlsx", "zip", "jpg", "png", "txt"].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`filetype-${type}`}
                            checked={formData.allowedFileTypes.includes(type)}
                            onCheckedChange={(checked) => handleFileTypeChange(type, checked as boolean)}
                          />
                          <Label htmlFor={`filetype-${type}`} className="text-sm font-normal">
                            .{type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("resources")}>Next: Resources</Button>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6 pt-4">
              <FileUploader
                files={resources}
                onFilesChange={setResources}
                label="Assignment Resources"
                emptyState={
                  <div className="border border-dashed rounded-md p-6 text-center">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <HelpCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Add Resources</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Attach PDFs, documents, images, or links that students will need to complete the assignment.
                    </p>
                  </div>
                }
              />

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("basic")}>
                  Back: Basic Details
                </Button>
                <Button onClick={() => setActiveTab("schedule")}>Next: Schedule</Button>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DateTimePicker
                  label="Start Date & Time"
                  date={formData.startDate}
                  time={formData.startTime}
                  onDateChange={(date) => setFormData((prev) => ({ ...prev, startDate: date }))}
                  onTimeChange={(time) => setFormData((prev) => ({ ...prev, startTime: time }))}
                  timezone={formData.timezone}
                  onTimezoneChange={(timezone) => setFormData((prev) => ({ ...prev, timezone }))}
                  showTimezone={true}
                />

                <DateTimePicker
                  label="Due Date & Time"
                  date={formData.dueDate}
                  time={formData.dueTime}
                  onDateChange={(date) => setFormData((prev) => ({ ...prev, dueDate: date }))}
                  onTimeChange={(time) => setFormData((prev) => ({ ...prev, dueTime: time }))}
                  required={true}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("resources")}>
                  Back: Resources
                </Button>
                <Button onClick={() => setActiveTab("settings")}>Next: Settings</Button>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 pt-4">
              <div className="space-y-4">
                <h2 className="text-lg font-medium">Submission Settings</h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Visibility</Label>
                      <p className="text-sm text-gray-500">Make assignment visible to students</p>
                    </div>
                    <Switch
                      checked={formData.visibility}
                      onCheckedChange={(checked) => handleSwitchChange("visibility", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Allow Late Submission</Label>
                      <p className="text-sm text-gray-500">Students can submit after the deadline</p>
                    </div>
                    <Switch
                      checked={formData.allowLateSubmission}
                      onCheckedChange={(checked) => handleSwitchChange("allowLateSubmission", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Allow Resubmission</Label>
                      <p className="text-sm text-gray-500">Students can resubmit their work</p>
                    </div>
                    <Switch
                      checked={formData.allowResubmission}
                      onCheckedChange={(checked) => handleSwitchChange("allowResubmission", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Enable Plagiarism Check</Label>
                      <p className="text-sm text-gray-500">Check submissions for plagiarism</p>
                    </div>
                    <Switch
                      checked={formData.enablePlagiarismCheck}
                      onCheckedChange={(checked) => handleSwitchChange("enablePlagiarismCheck", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Allow Group Submission</Label>
                      <p className="text-sm text-gray-500">Students can submit as a group</p>
                    </div>
                    <Switch
                      checked={formData.allowGroupSubmission}
                      onCheckedChange={(checked) => handleSwitchChange("allowGroupSubmission", checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("schedule")}>
                  Back: Schedule
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Create Assignment
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Prompt Dialog */}
      <Dialog open={showAIPromptDialog} onOpenChange={setShowAIPromptDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Assignment with AI</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              Describe the assignment you want to create, and our AI will generate the title and instructions for you.
            </p>
            <Textarea
              placeholder="E.g., Create a data structures assignment focusing on binary trees and their applications..."
              value={aiPrompt}
              onChange={(e) => setAIPrompt(e.target.value)}
              className="min-h-[150px]"
            />
            <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
              <div className="flex items-start">
                <HelpCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 text-sm">Tips for better results</h4>
                  <ul className="text-amber-700 text-xs mt-1 list-disc pl-4 space-y-1">
                    <li>Be specific about the topic and difficulty level</li>
                    <li>Mention any specific concepts you want to include</li>
                    <li>Specify the type of assignment (e.g., coding, essay, problem-solving)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIPromptDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateWithAI}
              disabled={isProcessingAI || !aiPrompt.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isProcessingAI ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
