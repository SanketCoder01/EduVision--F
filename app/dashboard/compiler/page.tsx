"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, FileText, Calendar, Settings, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Check } from 'lucide-react'

export default function FacultyCompilerPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [publishedAssignments, setPublishedAssignments] = useState([])
  const [showPublishedModal, setShowPublishedModal] = useState(false)
  const [assignmentData, setAssignmentData] = useState({
    title: "",
    facultyName: "Dr. Sarah Johnson", // Auto-filled
    givenDate: new Date().toISOString().split("T")[0], // Auto-filled
    dueDate: "",
    language: "",
    attempts: "no",
    maxAttempts: "1",
    description: "",
    rules: "",
    allowCopyPaste: false,
    allowNegativeMarking: false,
    allowResubmission: false,
    enableMarking: false,
    totalMarks: "",
  })

  const options = [
    {
      id: "create-assignment",
      title: "Create Assignment",
      description: "Create coding assignments for students",
      icon: FileText,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "create-exam",
      title: "Create Exam",
      description: "Create proctored coding exams",
      icon: Calendar,
      color: "from-red-500 to-red-600",
    },
  ]

  const languages = [
    { id: "c", name: "C" },
    { id: "cpp", name: "C++" },
    { id: "java", name: "Java" },
    { id: "python3", name: "Python" },
    { id: "javascript", name: "JavaScript" },
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setAssignmentData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!assignmentData.title || !assignmentData.dueDate || !assignmentData.language) {
        toast.error("Please fill in all required fields")
        return
      }
    }
    setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep === 1) {
      setSelectedOption(null)
    } else {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePublish = () => {
    // Validate final step
    if (!assignmentData.description) {
      toast.error("Please add assignment description")
      return
    }

    if (assignmentData.enableMarking && !assignmentData.totalMarks) {
      toast.error("Please enter total marks for the assignment")
      return
    }

    // Save to published assignments
    const newAssignment = {
      id: Date.now().toString(),
      ...assignmentData,
      publishedDate: new Date().toISOString(),
      status: "active"
    }

    setPublishedAssignments(prev => [newAssignment, ...prev])
    setShowPublishedModal(true)

    // Reset form after 2 seconds
    setTimeout(() => {
      setSelectedOption(null)
      setCurrentStep(1)
      setAssignmentData({
        title: "",
        facultyName: "Dr. Sarah Johnson",
        givenDate: new Date().toISOString().split("T")[0],
        dueDate: "",
        language: "",
        attempts: "no",
        maxAttempts: "1",
        description: "",
        rules: "",
        allowCopyPaste: false,
        allowNegativeMarking: false,
        allowResubmission: false,
        enableMarking: false,
        totalMarks: "",
      })
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Compiler Management</h1>
          <p className="text-xl text-gray-600">Create assignments and exams for students</p>
        </motion.div>

        {!selectedOption ? (
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {options.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className="cursor-pointer h-full hover:shadow-xl transition-all duration-300 border-0 overflow-hidden"
                  onClick={() => setSelectedOption(option.id)}
                >
                  <div className={`h-2 bg-gradient-to-r ${option.color}`} />
                  <CardHeader className="text-center pb-4">
                    <div
                      className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center mb-4`}
                    >
                      <option.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{option.title}</CardTitle>
                    <CardDescription className="text-base">{option.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : selectedOption === "create-assignment" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-900">Create Assignment</h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Step {currentStep} of 2</Badge>
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              </div>
            </div>

            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Assignment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Assignment Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter assignment title"
                      value={assignmentData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faculty">Faculty Name</Label>
                    <Input id="faculty" value={assignmentData.facultyName} disabled className="bg-gray-50" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="givenDate">Given Date</Label>
                      <Input
                        id="givenDate"
                        type="date"
                        value={assignmentData.givenDate}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date *</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={assignmentData.dueDate}
                        onChange={(e) => handleInputChange("dueDate", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Programming Language *</Label>
                    <Select
                      value={assignmentData.language}
                      onValueChange={(value) => handleInputChange("language", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select programming language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.id} value={lang.id}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="attempts">Set Attempts</Label>
                      <Select
                        value={assignmentData.attempts}
                        onValueChange={(value) => handleInputChange("attempts", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Allow multiple attempts?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no">No</SelectItem>
                          <SelectItem value="yes">Yes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {assignmentData.attempts === "yes" && (
                      <div className="space-y-2">
                        <Label htmlFor="maxAttempts">Maximum Attempts</Label>
                        <Select
                          value={assignmentData.maxAttempts}
                          onValueChange={(value) => handleInputChange("maxAttempts", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select maximum attempts" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleNext} className="flex items-center gap-2">
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Assignment Content & Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="description">Assignment Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what students need to do in this assignment..."
                      value={assignmentData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rules">Rules & Guidelines</Label>
                    <Textarea
                      id="rules"
                      placeholder="Enter any specific rules or guidelines for this assignment..."
                      value={assignmentData.rules}
                      onChange={(e) => handleInputChange("rules", e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Settings</h4>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Allow Copy Paste</Label>
                        <p className="text-sm text-gray-500">Students can copy and paste code</p>
                      </div>
                      <Switch
                        checked={assignmentData.allowCopyPaste}
                        onCheckedChange={(checked) => handleInputChange("allowCopyPaste", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Allow Negative Marking</Label>
                        <p className="text-sm text-gray-500">Deduct marks for wrong answers</p>
                      </div>
                      <Switch
                        checked={assignmentData.allowNegativeMarking}
                        onCheckedChange={(checked) => handleInputChange("allowNegativeMarking", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Allow Resubmission</Label>
                        <p className="text-sm text-gray-500">Students can resubmit their work</p>
                      </div>
                      <Switch
                        checked={assignmentData.allowResubmission}
                        onCheckedChange={(checked) => handleInputChange("allowResubmission", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Enable Marking System</Label>
                        <p className="text-sm text-gray-500">Assign marks to this assignment</p>
                      </div>
                      <Switch
                        checked={assignmentData.enableMarking}
                        onCheckedChange={(checked) => handleInputChange("enableMarking", checked)}
                      />
                    </div>

                    {assignmentData.enableMarking && (
                      <div className="space-y-2 ml-4">
                        <Label htmlFor="totalMarks">Total Marks</Label>
                        <Input
                          id="totalMarks"
                          type="number"
                          placeholder="Enter total marks for assignment"
                          value={assignmentData.totalMarks}
                          onChange={(e) => handleInputChange("totalMarks", e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handlePublish} className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Publish Assignment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        ) : selectedOption === "create-exam" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Calendar className="h-24 w-24 mx-auto text-gray-400 mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Exam Creation Coming Soon</h2>
            <p className="text-xl text-gray-600 mb-8">Exam creation feature will be available soon</p>
            <Button variant="outline" onClick={() => setSelectedOption(null)}>
              Back to Options
            </Button>
          </motion.div>
        ) : null}

        {/* Published Assignments Modal */}
        <Dialog open={showPublishedModal} onOpenChange={setShowPublishedModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Assignment Published!
              </DialogTitle>
            </DialogHeader>
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-gray-600">Your assignment has been successfully published and is now available to students.</p>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowPublishedModal(false)} className="w-full">
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Published Assignments Section */}
        {publishedAssignments.length > 0 && !selectedOption && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Published Assignments</h2>
            <div className="grid gap-4">
              {publishedAssignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{assignment.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>Language: {assignment.language.toUpperCase()}</span>
                          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                          {assignment.enableMarking && (
                            <span>Marks: {assignment.totalMarks}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={assignment.allowCopyPaste ? "secondary" : "destructive"}>
                            Copy Paste: {assignment.allowCopyPaste ? "Allowed" : "Disabled"}
                          </Badge>
                          <Badge variant={assignment.allowResubmission ? "secondary" : "outline"}>
                            Resubmission: {assignment.allowResubmission ? "Allowed" : "Single Attempt"}
                          </Badge>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
