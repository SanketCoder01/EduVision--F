"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Upload, FileText, Users, Trash2, Edit, Plus, AlertCircle, CheckCircle, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

interface StudentList {
  id: string
  name: string
  created_at: string
  student_count: number
  faculty_email: string
  department: string
  year: string
}

interface Student {
  full_name: string
  email: string
  prn: string
  department?: string
  year?: string
}

export default function AttendanceSettingsPage() {
  const { toast } = useToast()
  const [studentLists, setStudentLists] = useState<StudentList[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadedStudents, setUploadedStudents] = useState<Student[]>([])
  const [listName, setListName] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const [currentFaculty, setCurrentFaculty] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: facultyData } = await supabase
          .from('faculty')
          .select('*')
          .eq('email', user.email)
          .single()
        
        if (facultyData) {
          setCurrentFaculty(facultyData)
          await loadStudentLists(facultyData.email)
        }
      }
    } catch (error) {
      console.error('Error initializing data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStudentLists = async (facultyEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('student_lists')
        .select('*')
        .eq('faculty_email', facultyEmail)
        .order('created_at', { ascending: false })

      if (error) throw error
      setStudentLists(data || [])
    } catch (error) {
      console.error('Error loading student lists:', error)
    }
  }

  const handleFileUpload = (file: File) => {
    const fileType = file.name.split('.').pop()?.toLowerCase()
    
    if (fileType === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          processStudentData(results.data)
        },
        error: (error) => {
          toast({
            title: "Error",
            description: "Failed to parse CSV file",
            variant: "destructive"
          })
        }
      })
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          processStudentData(jsonData)
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to parse Excel file",
            variant: "destructive"
          })
        }
      }
      reader.readAsArrayBuffer(file)
    } else {
      toast({
        title: "Error",
        description: "Please upload a CSV or Excel file",
        variant: "destructive"
      })
    }
  }

  const processStudentData = (data: any[]) => {
    const students: Student[] = data.map((row: any) => ({
      full_name: row['Full Name'] || row['full_name'] || row['name'] || row['Name'] || '',
      email: row['Email'] || row['email'] || row['Email ID'] || '',
      prn: row['PRN'] || row['prn'] || row['Student ID'] || row['ID'] || '',
      department: row['Department'] || row['department'] || currentFaculty?.department || '',
      year: row['Year'] || row['year'] || row['Class'] || ''
    })).filter(student => student.full_name && student.email && student.prn)

    setUploadedStudents(students)
    
    if (students.length === 0) {
      toast({
        title: "No Data Found",
        description: "Please ensure your file has columns: Full Name, Email, PRN",
        variant: "destructive"
      })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const saveStudentList = async () => {
    if (!listName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the student list",
        variant: "destructive"
      })
      return
    }

    if (uploadedStudents.length === 0) {
      toast({
        title: "Error",
        description: "Please upload a file with student data",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)
    try {
      // Save student list metadata
      const { data: listData, error: listError } = await supabase
        .from('student_lists')
        .insert({
          name: listName,
          faculty_email: currentFaculty.email,
          department: currentFaculty.department,
          year: uploadedStudents[0]?.year || '',
          student_count: uploadedStudents.length
        })
        .select()
        .single()

      if (listError) throw listError

      // Save individual students
      const studentsWithListId = uploadedStudents.map(student => ({
        ...student,
        list_id: listData.id,
        faculty_email: currentFaculty.email
      }))

      const { error: studentsError } = await supabase
        .from('student_list_entries')
        .insert(studentsWithListId)

      if (studentsError) throw studentsError

      toast({
        title: "Success",
        description: `Student list "${listName}" saved successfully with ${uploadedStudents.length} students`,
      })

      // Reset form
      setListName("")
      setUploadedStudents([])
      setShowUploadDialog(false)
      
      // Reload lists
      await loadStudentLists(currentFaculty.email)
    } catch (error) {
      console.error('Error saving student list:', error)
      toast({
        title: "Error",
        description: "Failed to save student list",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const deleteStudentList = async (listId: string) => {
    try {
      if (!currentFaculty?.email) {
        toast({ title: "Error", description: "Faculty context not loaded", variant: "destructive" })
        return
      }
      const { error } = await supabase
        .from('student_lists')
        .delete()
        .eq('id', listId)
        .eq('faculty_email', currentFaculty.email)

      if (error) throw error

      setStudentLists(prev => prev.filter(list => list.id !== listId))
      toast({
        title: "Success",
        description: "Student list deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting student list:', error)
      toast({
        title: "Error",
        description: "Failed to delete student list",
        variant: "destructive"
      })
    }
  }

  const downloadCSVTemplate = () => {
    const headers = ['Full Name', 'Email', 'PRN', 'Department', 'Year']
    const csvContent = headers.join(',') + '\n'
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', 'student_list_template.csv')
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded successfully",
    })
  }

  const downloadExcelTemplate = () => {
    const headers = ['Full Name', 'Email', 'PRN', 'Department', 'Year']
    const worksheet = XLSX.utils.aoa_to_sheet([headers])
    
    // Set column widths for better formatting
    worksheet['!cols'] = [
      { width: 25 }, // Full Name
      { width: 30 }, // Email
      { width: 15 }, // PRN
      { width: 20 }, // Department
      { width: 15 }  // Year
    ]
    
    // Style the header row
    const headerRange = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:E1')
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col })
      if (!worksheet[cellAddress]) continue
      
      worksheet[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4F46E5" } },
        alignment: { horizontal: "center" }
      }
    }
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student List Template')
    
    XLSX.writeFile(workbook, 'student_list_template.xlsx')
    
    toast({
      title: "Template Downloaded",
      description: "Excel template has been downloaded successfully",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-sans">Attendance Settings</h1>
          <p className="text-gray-600 font-sans">Manage student lists and attendance configurations</p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button className="font-sans">
              <Plus className="h-4 w-4 mr-2" />
              Upload Student List
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-sans">Upload Student List</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* List Name Input */}
              <div>
                <Label htmlFor="listName" className="font-sans">List Name *</Label>
                <Input
                  id="listName"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="Enter a name for this student list..."
                  className="font-sans"
                />
              </div>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium font-sans mb-2">
                  Drag and drop your file here
                </h3>
                <p className="text-gray-600 font-sans mb-4">
                  Support for CSV, XLSX, XLS files with columns: Full Name, Email, PRN, Department, Year<br/>
                  <span className="text-blue-600">Use the template format downloaded above for best results</span>
                </p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload" asChild>
                  <Button variant="outline" className="font-sans">
                    <FileText className="h-4 w-4 mr-2" />
                    Browse Files
                  </Button>
                </Label>
              </div>

              {/* Uploaded Students Preview */}
              {uploadedStudents.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium font-sans mb-4">
                    Preview ({uploadedStudents.length} students)
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b">
                      <div className="grid grid-cols-4 gap-4 font-medium text-sm font-sans">
                        <div>Full Name</div>
                        <div>Email</div>
                        <div>PRN</div>
                        <div>Department</div>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {uploadedStudents.slice(0, 10).map((student, index) => (
                        <div key={index} className="px-4 py-2 border-b last:border-b-0">
                          <div className="grid grid-cols-4 gap-4 text-sm font-sans">
                            <div className="truncate">{student.full_name}</div>
                            <div className="truncate">{student.email}</div>
                            <div className="truncate">{student.prn}</div>
                            <div className="truncate">{student.department}</div>
                          </div>
                        </div>
                      ))}
                      {uploadedStudents.length > 10 && (
                        <div className="px-4 py-2 text-center text-gray-500 font-sans">
                          ... and {uploadedStudents.length - 10} more students
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadDialog(false)}
                  className="font-sans"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveStudentList}
                  disabled={isUploading || !listName.trim() || uploadedStudents.length === 0}
                  className="font-sans"
                >
                  {isUploading ? "Saving..." : "Save Student List"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Download Templates */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="font-sans">Download Templates</CardTitle>
          <CardDescription className="font-sans">
            Download formatted templates to fill in your student data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={downloadCSVTemplate}
              variant="outline"
              className="flex-1 font-sans"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
            <Button
              onClick={downloadExcelTemplate}
              variant="outline"
              className="flex-1 font-sans"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Excel Template
            </Button>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 font-sans">Template Format</h4>
                <p className="text-sm text-blue-700 font-sans mt-1">
                  The template includes the following columns: <strong>Full Name</strong>, <strong>Email</strong>, <strong>PRN</strong>, <strong>Department</strong>, and <strong>Year</strong>. 
                  Fill in your student data and upload the completed file using the button above.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Lists */}
      <div className="grid gap-4">
        {studentLists.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 font-sans">No Student Lists</h3>
              <p className="text-gray-500 text-center font-sans mb-4">
                Upload your first student list to get started with attendance tracking
              </p>
              <Button onClick={() => setShowUploadDialog(true)} className="font-sans">
                <Plus className="h-4 w-4 mr-2" />
                Upload Student List
              </Button>
            </CardContent>
          </Card>
        ) : (
          studentLists.map((list) => (
            <motion.div
              key={list.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="font-sans">{list.name}</CardTitle>
                      <CardDescription className="font-sans">
                        {list.department} {list.year} • {list.student_count} students
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-sans">
                        <Users className="h-3 w-3 mr-1" />
                        {list.student_count}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 font-sans">
                      Created on {new Date(list.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteStudentList(list.id)}
                        className="font-sans"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
