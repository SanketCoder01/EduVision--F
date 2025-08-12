"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { FileText, Settings, Calendar, Paperclip, ArrowLeft, Check, HelpCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
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
    instructions: string
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

const steps = [
  { id: 'details', name: 'Assignment Details', icon: FileText },
  { id: 'resources', name: 'Resources', icon: Paperclip },
  { id: 'schedule', name: 'Schedule & Grading', icon: Calendar },
  { id: 'settings', name: 'Advanced Settings', icon: Settings },
];

export function AssignmentForm({ onSubmit, classes, facultyId }: AssignmentFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [creationMethod, setCreationMethod] = useState<"manual" | "ai">("manual")
  const [showAIPromptDialog, setShowAIPromptDialog] = useState(false)
  const [aiPrompt, setAIPrompt] = useState("")
  const [isProcessingAI, setIsProcessingAI] = useState(false)
  const [activeStep, setActiveStep] = useState(steps[0].id);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
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
    try {
      const response = await fetch('/api/generate-assignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate assignment' }));
        throw new Error(errorData.error || 'Failed to generate assignment');
      }

      const data = await response.json();

      setFormData((prev) => ({
        ...prev,
        title: data.title,
        description: data.description,
      }));

      setShowAIPromptDialog(false);
      toast({
        title: "Success!",
        description: "Assignment details have been generated by AI.",
      });

    } catch (error) {
      console.error("Error generating assignment:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Couldn't generate assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingAI(false);
    }
  };

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
        description: "Please enter assignment description",
        variant: "destructive",
      })
      return
    }

    if (!formData.instructions.trim()) {
      toast({
        title: "Error",
        description: "Please enter detailed instructions for the assignment",
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
        instructions: formData.instructions,
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

  const renderStepContent = () => {
    switch (activeStep) {
      case 'details':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
            <h2 class="text-xl font-semibold text-gray-800">Basic Details</h2>
            <div>
              <Label htmlFor="title" className="text-base font-medium">Assignment Title</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Advanced Data Structures" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="description" className="text-base font-medium">Description</Label>
              <RichTextEditor value={formData.description} onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))} placeholder="A brief overview of the assignment." minHeight="150px" />
            </div>
            <div>
              <Label htmlFor="instructions" className="text-base font-medium">Detailed Instructions</Label>
              <RichTextEditor value={formData.instructions} onChange={(value) => setFormData((prev) => ({ ...prev, instructions: value }))} placeholder="Explain the requirements, submission guidelines, etc." minHeight="250px" />
            </div>
          </motion.div>
        );
      case 'resources':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
            <h2 class="text-xl font-semibold text-gray-800">Supporting Resources</h2>
            <FileUploader onUpload={(files) => setResources(files)} />
          </motion.div>
        );
      case 'schedule':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
            <h2 class="text-xl font-semibold text-gray-800">Schedule & Grading</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DateTimePicker label="Start Date & Time" date={formData.startDate} time={formData.startTime} onDateChange={(date) => setFormData((prev) => ({ ...prev, startDate: date }))} onTimeChange={(time) => setFormData((prev) => ({ ...prev, startTime: time }))} />
              <DateTimePicker label="Due Date & Time" date={formData.dueDate} time={formData.dueTime} onDateChange={(date) => setFormData((prev) => ({ ...prev, dueDate: date }))} onTimeChange={(time) => setFormData((prev) => ({ ...prev, dueTime: time }))} />
            </div>
            <div>
              <Label htmlFor="maxMarks" className="text-base font-medium">Maximum Marks</Label>
              <Input id="maxMarks" name="maxMarks" type="number" value={formData.maxMarks} onChange={handleInputChange} className="mt-2 w-full md:w-1/2" />
            </div>
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
            <h2 class="text-xl font-semibold text-gray-800">Advanced Settings</h2>
            <div>
              <Label htmlFor="assignmentType" className="text-base font-medium">Submission Type</Label>
              <Select name="assignmentType" value={formData.assignmentType} onValueChange={(value) => handleSelectChange("assignmentType", value)}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Select submission type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="file_upload">File Upload</SelectItem>
                  <SelectItem value="text_entry">Text Entry</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.assignmentType === "file_upload" && (
              <div>
                <Label className="text-base font-medium">Allowed File Types</Label>
                <div className="flex flex-wrap gap-x-6 gap-y-4 mt-3">
                  {["pdf", "docx", "pptx", "xlsx", "zip", "jpg", "png"].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox id={`file-type-${type}`} checked={formData.allowedFileTypes.includes(type)} onCheckedChange={(checked) => handleFileTypeChange(type, checked as boolean)} />
                      <Label htmlFor={`file-type-${type}`} className="font-normal text-sm">{type.toUpperCase()}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {[ {id: 'allowLateSubmission', label: 'Allow Late Submission'}, {id: 'allowResubmission', label: 'Allow Resubmission'}, {id: 'enablePlagiarismCheck', label: 'Enable Plagiarism Check'}, {id: 'allowGroupSubmission', label: 'Allow Group Submission'} ].map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <Label htmlFor={item.id} className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
                    <HelpCircle className="w-4 h-4 mr-3 text-gray-400" />
                    {item.label}
                  </Label>
                  <Switch id={item.id} checked={formData[item.id]} onCheckedChange={(checked) => handleSwitchChange(item.id, checked)} />
                </div>
              ))}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-2xl shadow-lg">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="icon" className="mr-4 rounded-full" onClick={() => router.push("/faculty-dashboard/assignments")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold text-gray-800">Create New Assignment</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Vertical Stepper */}
        <nav className="lg:col-span-3 space-y-2">
          {steps.map(step => {
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`w-full flex items-center text-left p-4 rounded-lg transition-all duration-300 ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-50 hover:bg-indigo-50 text-gray-600'}`}              >
                <step.icon className={`w-6 h-6 mr-4 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                <span className="font-semibold">{step.name}</span>
                {isActive && <motion.div layoutId="active-step-indicator" className="ml-auto"><Check className="w-5 h-5"/></motion.div>}
              </button>
            )
          })}
        </nav>

        {/* Form Content */}
        <main className="lg:col-span-9">
          <Card className="border-none shadow-none">
            <CardContent className="p-2">
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                <CreationModeSelection creationMethod={creationMethod} setCreationMethod={setCreationMethod} onAISelect={() => setShowAIPromptDialog(true)} />
                <ClassSelection classes={classes} selectedClass={formData.classId} onClassChange={(value) => handleSelectChange("classId", value)} />
              </div>
              <AnimatePresence mode="wait">
                {renderStepContent()}
              </AnimatePresence>
            </CardContent>
          </Card>
        </main>
      </div>

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
