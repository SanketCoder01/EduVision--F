"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft,
  Save,
  RefreshCw,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Copy,
  Eye,
  Settings,
  Shield,
  Upload,
  Download,
  CheckCircle,
  AlertTriangle
} from "lucide-react"

interface ExamData {
  id: string
  title: string
  facultyName: string
  examDate: string
  startTime: string
  endTime: string
  duration: string
  department: string
  studyingYear: string
  language: string
  description: string
  instructions: string
  totalMarks: string
  passingMarks: string
  enableSecurity: boolean
  enableCamera: boolean
  enableMicrophone: boolean
  enableScreenShare: boolean
  allowTabSwitch: boolean
  maxTabSwitches: string
  enableAutoSubmit: boolean
  warningThreshold: string
  status: 'draft' | 'scheduled' | 'active' | 'completed'
  createdAt: string
  lastModified: string
  studentsEnrolled: number
  submissions: number
}

export default function EditExam() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [currentTab, setCurrentTab] = useState("basic")
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Mock exam data - would be fetched from API
  const [examData, setExamData] = useState<ExamData>({
    id: params.examId as string,
    title: "Java Programming Fundamentals",
    facultyName: "Dr. John Smith",
    examDate: "2024-01-15",
    startTime: "10:00",
    endTime: "12:00",
    duration: "120",
    department: "CSE",
    studyingYear: "2nd Year",
    language: "Java",
    description: `Question 1: Array Sum
Write a program to find the sum of all elements in an array.

Input: First line contains n (size of array), followed by n integers.
Output: Print the sum of all elements.
Constraints: 1 ≤ n ≤ 1000, 1 ≤ arr[i] ≤ 100

Sample Input:
5
1 2 3 4 5

Sample Output:
15

---

Question 2: String Reversal
Write a program to reverse a given string without using built-in functions.

Input: A single line containing a string.
Output: Print the reversed string.
Constraints: 1 ≤ length ≤ 1000

Sample Input:
hello

Sample Output:
olleh

---

Question 3: Prime Number Check
Write a program to check if a given number is prime or not.

Input: A single integer n.
Output: Print 'Prime' if the number is prime, otherwise 'Not Prime'.
Constraints: 1 ≤ n ≤ 10^6

Sample Input:
17

Sample Output:
Prime`,
    instructions: `1. Read all questions carefully before starting.
2. You have 2 hours to complete the exam.
3. Camera and microphone monitoring is enabled.
4. Tab switching is not allowed.
5. Any suspicious activity will be recorded.
6. Submit your solutions before the time limit.`,
    totalMarks: "100",
    passingMarks: "40",
    enableSecurity: true,
    enableCamera: true,
    enableMicrophone: false,
    enableScreenShare: true,
    allowTabSwitch: false,
    maxTabSwitches: "3",
    enableAutoSubmit: true,
    warningThreshold: "3",
    status: 'scheduled',
    createdAt: "2024-01-10T10:00:00Z",
    lastModified: "2024-01-12T15:30:00Z",
    studentsEnrolled: 25,
    submissions: 0
  })

  const handleInputChange = (field: string, value: any) => {
    setExamData(prev => ({
      ...prev,
      [field]: value,
      lastModified: new Date().toISOString()
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Exam Saved",
        description: "Your changes have been saved successfully."
      })
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setExamData(prev => ({ ...prev, status: 'scheduled' }))
      setShowPublishDialog(false)
      
      toast({
        title: "Exam Published",
        description: "The exam has been published and is now available to students."
      })
    } catch (error) {
      toast({
        title: "Publish Failed",
        description: "Failed to publish exam. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDuplicate = () => {
    const duplicatedExam = {
      ...examData,
      id: `${examData.id}_copy`,
      title: `${examData.title} (Copy)`,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      studentsEnrolled: 0,
      submissions: 0
    }
    
    // In a real app, this would create a new exam
    toast({
      title: "Exam Duplicated",
      description: "A copy of this exam has been created."
    })
  }

  const handleDelete = () => {
    if (examData.submissions > 0) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete exam with existing submissions.",
        variant: "destructive"
      })
      return
    }
    
    toast({
      title: "Exam Deleted",
      description: "The exam has been deleted successfully."
    })
    router.push('/dashboard/compiler')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'scheduled':
        return <Badge className="bg-blue-600">Scheduled</Badge>
      case 'active':
        return <Badge className="bg-green-600">Active</Badge>
      case 'completed':
        return <Badge className="bg-gray-600">Completed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 p-4 md:p-6">
      <div className="w-full max-w-none mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/compiler')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Edit Exam: {examData.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Created: {new Date(examData.createdAt).toLocaleDateString()}</span>
                <span>Last Modified: {new Date(examData.lastModified).toLocaleDateString()}</span>
                <span>Students Enrolled: {examData.studentsEnrolled}</span>
                <span>Submissions: {examData.submissions}</span>
                {getStatusBadge(examData.status)}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleDuplicate}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              
              <Button
                onClick={() => setShowPublishDialog(true)}
                disabled={examData.status === 'active' || examData.status === 'completed'}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Republish
              </Button>
              
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={examData.submissions > 0}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Edit Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <Tabs value={currentTab} onValueChange={setCurrentTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-red-600">Exam Title *</label>
                      <Input
                        value={examData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className="border-red-200 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Faculty Name</label>
                      <Input
                        value={examData.facultyName}
                        onChange={(e) => handleInputChange("facultyName", e.target.value)}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-red-600">Department *</label>
                      <Select value={examData.department} onValueChange={(value) => handleInputChange("department", value)}>
                        <SelectTrigger className="border-red-200 focus:border-red-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CSE">Computer Science</SelectItem>
                          <SelectItem value="AIDS">AI & Data Science</SelectItem>
                          <SelectItem value="AIML">AI & Machine Learning</SelectItem>
                          <SelectItem value="CYBER">Cyber Security</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-red-600">Year *</label>
                      <Select value={examData.studyingYear} onValueChange={(value) => handleInputChange("studyingYear", value)}>
                        <SelectTrigger className="border-red-200 focus:border-red-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st Year">1st Year</SelectItem>
                          <SelectItem value="2nd Year">2nd Year</SelectItem>
                          <SelectItem value="3rd Year">3rd Year</SelectItem>
                          <SelectItem value="4th Year">4th Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-red-600">Programming Language *</label>
                      <Select value={examData.language} onValueChange={(value) => handleInputChange("language", value)}>
                        <SelectTrigger className="border-red-200 focus:border-red-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="C++">C++</SelectItem>
                          <SelectItem value="Java">Java</SelectItem>
                          <SelectItem value="Python">Python</SelectItem>
                          <SelectItem value="JavaScript">JavaScript</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-red-600">Duration (minutes) *</label>
                      <Input
                        type="number"
                        value={examData.duration}
                        onChange={(e) => handleInputChange("duration", e.target.value)}
                        className="border-red-200 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-red-600">Exam Date *</label>
                      <Input
                        type="date"
                        value={examData.examDate}
                        onChange={(e) => handleInputChange("examDate", e.target.value)}
                        className="border-red-200 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-red-600">Start Time *</label>
                      <Input
                        type="time"
                        value={examData.startTime}
                        onChange={(e) => handleInputChange("startTime", e.target.value)}
                        className="border-red-200 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-red-600">End Time *</label>
                      <Input
                        type="time"
                        value={examData.endTime}
                        onChange={(e) => handleInputChange("endTime", e.target.value)}
                        className="border-red-200 focus:border-red-500"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="content" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-red-600">Total Marks *</label>
                      <Input
                        type="number"
                        value={examData.totalMarks}
                        onChange={(e) => handleInputChange("totalMarks", e.target.value)}
                        className="border-red-200 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block text-red-600">Passing Marks *</label>
                      <Input
                        type="number"
                        value={examData.passingMarks}
                        onChange={(e) => handleInputChange("passingMarks", e.target.value)}
                        className="border-red-200 focus:border-red-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block text-red-600">Questions *</label>
                    <Textarea
                      value={examData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={20}
                      className="font-mono text-sm border-red-200 focus:border-red-500"
                      placeholder="Enter your exam questions here..."
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Instructions for Students</label>
                    <Textarea
                      value={examData.instructions}
                      onChange={(e) => handleInputChange("instructions", e.target.value)}
                      rows={6}
                      placeholder="Enter exam instructions, rules, and guidelines..."
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="security" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Security Monitoring
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <label className="text-sm font-medium">Enable Security Monitoring</label>
                            <p className="text-xs text-gray-600">Monitor student activity during exam</p>
                          </div>
                          <Switch
                            checked={examData.enableSecurity}
                            onCheckedChange={(checked) => handleInputChange("enableSecurity", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <label className="text-sm font-medium">Enable Camera</label>
                            <p className="text-xs text-gray-600">Require camera access for monitoring</p>
                          </div>
                          <Switch
                            checked={examData.enableCamera}
                            onCheckedChange={(checked) => handleInputChange("enableCamera", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <label className="text-sm font-medium">Enable Microphone</label>
                            <p className="text-xs text-gray-600">Monitor audio during exam</p>
                          </div>
                          <Switch
                            checked={examData.enableMicrophone}
                            onCheckedChange={(checked) => handleInputChange("enableMicrophone", checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <label className="text-sm font-medium">Enable Screen Share</label>
                            <p className="text-xs text-gray-600">Monitor screen activity</p>
                          </div>
                          <Switch
                            checked={examData.enableScreenShare}
                            onCheckedChange={(checked) => handleInputChange("enableScreenShare", checked)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Violation Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <label className="text-sm font-medium">Allow Tab Switching</label>
                            <p className="text-xs text-gray-600">Allow students to switch browser tabs</p>
                          </div>
                          <Switch
                            checked={examData.allowTabSwitch}
                            onCheckedChange={(checked) => handleInputChange("allowTabSwitch", checked)}
                          />
                        </div>
                        {examData.allowTabSwitch && (
                          <div>
                            <label className="text-sm font-medium mb-2 block">Max Tab Switches</label>
                            <Input
                              type="number"
                              value={examData.maxTabSwitches}
                              onChange={(e) => handleInputChange("maxTabSwitches", e.target.value)}
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <label className="text-sm font-medium">Auto Submit on Violations</label>
                            <p className="text-xs text-gray-600">Automatically submit when threshold reached</p>
                          </div>
                          <Switch
                            checked={examData.enableAutoSubmit}
                            onCheckedChange={(checked) => handleInputChange("enableAutoSubmit", checked)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Warning Threshold</label>
                          <Input
                            type="number"
                            value={examData.warningThreshold}
                            onChange={(e) => handleInputChange("warningThreshold", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="analytics" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">{examData.studentsEnrolled}</div>
                        <div className="text-sm text-gray-600">Students Enrolled</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">{examData.submissions}</div>
                        <div className="text-sm text-gray-600">Submissions</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-yellow-600">
                          {examData.submissions > 0 ? Math.round((examData.submissions / examData.studentsEnrolled) * 100) : 0}%
                        </div>
                        <div className="text-sm text-gray-600">Completion Rate</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-purple-600">{examData.totalMarks}</div>
                        <div className="text-sm text-gray-600">Total Marks</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Exam History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">Exam Created</div>
                            <div className="text-sm text-gray-600">{new Date(examData.createdAt).toLocaleString()}</div>
                          </div>
                          <Badge variant="secondary">Created</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">Last Modified</div>
                            <div className="text-sm text-gray-600">{new Date(examData.lastModified).toLocaleString()}</div>
                          </div>
                          <Badge variant="secondary">Modified</Badge>
                        </div>
                        {examData.status === 'scheduled' && (
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                            <div>
                              <div className="font-medium">Scheduled For</div>
                              <div className="text-sm text-blue-600">
                                {new Date(`${examData.examDate}T${examData.startTime}`).toLocaleString()}
                              </div>
                            </div>
                            <Badge className="bg-blue-600">Scheduled</Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Publish Confirmation Dialog */}
        <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-green-600" />
                Republish Exam
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to republish this exam? This will make it available to students again.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Important Notes:</p>
                    <ul className="text-sm text-yellow-700 mt-1 list-disc list-inside">
                      <li>Students will be notified about the republished exam</li>
                      <li>Previous submissions will be preserved</li>
                      <li>New deadline will be set based on current date/time</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowPublishDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handlePublish}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? 'Publishing...' : 'Republish Exam'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
