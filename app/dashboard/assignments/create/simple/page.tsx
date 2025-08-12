"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Send } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import SimplifiedAssignmentModule from "@/components/SimplifiedAssignmentModule"

interface AssignmentData {
  title: string
  description: string
  instructions: string
  department: string
  year: string
  maxMarks: number
  startDate: string
  dueDate: string
  assignmentType: 'manual' | 'ai'
}

export default function SimpleAssignmentCreatePage() {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [assignmentType, setAssignmentType] = useState<'manual' | 'ai'>('manual')
  const [isPublishing, setIsPublishing] = useState(false)
  const [faculty, setFaculty] = useState<any>(null)

  const [formData, setFormData] = useState<AssignmentData>({
    title: '',
    description: '',
    instructions: '',
    department: '',
    year: '',
    maxMarks: 100,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    assignmentType: 'manual'
  })

  useEffect(() => {
    // Load faculty data
    const facultySession = localStorage.getItem('faculty_session') || 
                          localStorage.getItem('currentUser')
    
    if (facultySession) {
      try {
        const facultyData = JSON.parse(facultySession)
        setFaculty(facultyData)
        setFormData(prev => ({
          ...prev,
          department: facultyData.department || 'Computer Science'
        }))
      } catch (error) {
        console.error('Error loading faculty data:', error)
      }
    }
  }, [])

  const handleCreateManual = () => {
    setAssignmentType('manual')
    setFormData(prev => ({ ...prev, assignmentType: 'manual' }))
    setShowForm(true)
  }

  const handleCreateAI = () => {
    setAssignmentType('ai')
    setFormData(prev => ({ ...prev, assignmentType: 'ai' }))
    setShowForm(true)
  }

  const handleInputChange = (field: keyof AssignmentData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePublish = async () => {
    // Validate required fields
    if (!formData.title || !formData.description || !formData.dueDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    setIsPublishing(true)

    try {
      // Create assignment object for Supabase
      const assignment = {
        title: formData.title,
        description: formData.description,
        instructions: formData.instructions,
        department: formData.department,
        year: formData.year,
        max_marks: formData.maxMarks,
        start_date: formData.startDate,
        due_date: formData.dueDate,
        faculty_id: faculty?.id || faculty?.faculty_id || 'faculty_' + Date.now(),
        status: 'published',
        visibility: true,
        assignment_type: formData.assignmentType === 'manual' ? 'text_based' : 'text_based',
        allow_late_submission: false,
        allow_resubmission: false,
        enable_plagiarism_check: true,
        allow_group_submission: false,
        allowed_file_types: ['pdf', 'doc', 'docx']
      }

      // Try to publish to Supabase
      const { publishAssignment } = await import('@/lib/assignments')
      const { data, error } = await publishAssignment(assignment)

      if (error) {
        console.error('Supabase error:', error)
        // Fallback to localStorage
        const existingAssignments = JSON.parse(localStorage.getItem('faculty_assignments') || '[]')
        const assignmentWithId = {
          ...assignment,
          id: 'assignment_' + Date.now(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        existingAssignments.push(assignmentWithId)
        localStorage.setItem('faculty_assignments', JSON.stringify(existingAssignments))
        
        // Also save to student assignments for the specific year/department
        const studentAssignments = JSON.parse(localStorage.getItem('student_assignments') || '[]')
        studentAssignments.push(assignmentWithId)
        localStorage.setItem('student_assignments', JSON.stringify(studentAssignments))
        
        console.log('Assignment saved to localStorage as fallback')
      } else {
        console.log('Assignment published to Supabase successfully:', data)
      }

      toast({
        title: 'Success',
        description: 'Assignment published successfully!',
      })

      // Reset form and go back to assignments list
      setTimeout(() => {
        router.push('/dashboard/assignments')
      }, 1500)

    } catch (error) {
      console.error('Error publishing assignment:', error)
      
      // Fallback to localStorage if Supabase fails
      try {
        const assignment = {
          id: 'assignment_' + Date.now(),
          title: formData.title,
          description: formData.description,
          instructions: formData.instructions,
          department: formData.department,
          year: formData.year,
          max_marks: formData.maxMarks,
          start_date: formData.startDate,
          due_date: formData.dueDate,
          faculty_id: faculty?.id || 'faculty_' + Date.now(),
          status: 'published',
          visibility: true,
          assignment_type: formData.assignmentType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const existingAssignments = JSON.parse(localStorage.getItem('faculty_assignments') || '[]')
        existingAssignments.push(assignment)
        localStorage.setItem('faculty_assignments', JSON.stringify(existingAssignments))
        
        // Also save to student assignments
        const studentAssignments = JSON.parse(localStorage.getItem('student_assignments') || '[]')
        studentAssignments.push(assignment)
        localStorage.setItem('student_assignments', JSON.stringify(studentAssignments))

        toast({
          title: 'Success',
          description: 'Assignment published successfully!',
        })

        setTimeout(() => {
          router.push('/dashboard/assignments')
        }, 1500)
      } catch (fallbackError) {
        toast({
          title: 'Error',
          description: 'Failed to publish assignment. Please try again.',
          variant: 'destructive'
        })
      }
    } finally {
      setIsPublishing(false)
    }
  }

  const handleBack = () => {
    if (showForm) {
      setShowForm(false)
    } else {
      router.push('/dashboard/assignments')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-2xl font-bold text-gray-900">
            {showForm ? `Create ${assignmentType === 'manual' ? 'Manual' : 'AI'} Assignment` : 'Assignment Creation'}
          </h1>
        </div>

        {!showForm ? (
          /* Assignment Module Selection */
            <SimplifiedAssignmentModule
              onCreateManualAction={handleCreateManual}
              onCreateAIAction={handleCreateAI}
            />
        ) : (
          /* Assignment Form */
          <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {assignmentType === 'manual' ? '📝 Manual Assignment' : '🤖 AI Assignment'}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Assignment Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter assignment title"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleInputChange('department', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Information Technology">Information Technology</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Mechanical">Mechanical</SelectItem>
                      <SelectItem value="Civil">Civil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select
                    value={formData.year}
                    onValueChange={(value) => handleInputChange('year', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st Year">1st Year</SelectItem>
                      <SelectItem value="2nd Year">2nd Year</SelectItem>
                      <SelectItem value="3rd Year">3rd Year</SelectItem>
                      <SelectItem value="4th Year">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the assignment"
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Instructions */}
              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  placeholder="Provide detailed instructions for students"
                  className="mt-1"
                  rows={4}
                />
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="maxMarks">Max Marks</Label>
                  <Input
                    id="maxMarks"
                    type="number"
                    value={formData.maxMarks}
                    onChange={(e) => handleInputChange('maxMarks', parseInt(e.target.value) || 100)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
                
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isPublishing ? 'Publishing...' : 'Publish Assignment'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
