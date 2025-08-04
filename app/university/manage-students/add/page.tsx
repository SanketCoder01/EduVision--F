"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Plus,
  Upload,
  Download,
  FileSpreadsheet,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import {
  createStudent,
  bulkCreateStudents,
  generatePRN,
  generateSecurePassword,
  type StudentData,
} from "@/lib/supabase"
import { generateStudentTemplate, downloadTemplate } from "@/lib/excel-templates"
import {
  parseExcelFile,
  mapStudentData,
  processBulkData,
  validateStudentData,
  type BulkProcessingStats,
} from "@/lib/bulk-processor"

const departments = [
  { id: "cse", name: "Computer Science & Engineering", code: "CSE" },
  { id: "cy", name: "Cyber Security", code: "CY" },
  { id: "aids", name: "Artificial Intelligence & Data Science", code: "AIDS" },
  { id: "aiml", name: "Artificial Intelligence & Machine Learning", code: "AIML" },
]

const years = [
  { id: "first", name: "First Year" },
  { id: "second", name: "Second Year" },
  { id: "third", name: "Third Year" },
  { id: "fourth", name: "Fourth Year" },
]

export default function AddStudentPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("single")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Single student form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    year: "",
    date_of_birth: "",
    parent_name: "",
    parent_phone: "",
  })

  // Bulk upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<any[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [processingStats, setProcessingStats] = useState<BulkProcessingStats | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadStep, setUploadStep] = useState<"upload" | "preview" | "processing" | "complete">("upload")

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const password = await generateSecurePassword()
      const prn = generatePRN(formData.department, formData.year)

      const studentData: StudentData = {
        ...formData,
        prn,
        password,
        year: formData.year as "first" | "second" | "third" | "fourth",
      }

      await createStudent(studentData)

      toast({
        title: "Student Added Successfully",
        description: `${formData.name} has been added with PRN: ${prn}`,
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        department: "",
        year: "",
        date_of_birth: "",
        parent_name: "",
        parent_phone: "",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadTemplate = () => {
    const template = generateStudentTemplate()
    downloadTemplate(template, "student_template.xlsx")
    toast({
      title: "Template Downloaded",
      description: "Student template has been downloaded successfully",
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFile(file)
    setUploadStep("preview")

    try {
      const data = await parseExcelFile(file)
      const validation = validateStudentData(data)

      if (!validation.valid) {
        setValidationErrors(validation.errors)
        setParsedData([])
        return
      }

      setValidationErrors([])
      setParsedData(data)
      toast({
        title: "File Parsed Successfully",
        description: `Found ${data.length} student records`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to parse Excel file",
        variant: "destructive",
      })
      setUploadedFile(null)
      setUploadStep("upload")
    }
  }

  const handleBulkProcess = async () => {
    if (!parsedData.length) return

    setIsProcessing(true)
    setUploadStep("processing")

    try {
      const mappedData = await mapStudentData(parsedData)

      const stats = await processBulkData(
        mappedData,
        async (batch) => {
          await bulkCreateStudents(batch)
        },
        50,
        (currentStats) => {
          setProcessingStats(currentStats)
        },
      )

      setProcessingStats(stats)
      setUploadStep("complete")

      toast({
        title: "Bulk Processing Complete",
        description: `Successfully added ${stats.successful} students. ${stats.failed} failed.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process bulk upload",
        variant: "destructive",
      })
      setUploadStep("preview")
    } finally {
      setIsProcessing(false)
    }
  }

  const resetBulkUpload = () => {
    setUploadedFile(null)
    setParsedData([])
    setValidationErrors([])
    setProcessingStats(null)
    setUploadStep("upload")
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Students</h1>
          <p className="text-gray-600">Add individual students or bulk upload from Excel</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Single Student
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Bulk Upload
          </TabsTrigger>
        </TabsList>

        {/* Single Student Tab */}
        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Add Individual Student</CardTitle>
              <CardDescription>Enter student details to add them to the system</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSingleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Student Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="student@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="10-digit phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData({ ...formData, department: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name} ({dept.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Academic Year *</Label>
                    <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parent_name">Parent Name</Label>
                    <Input
                      id="parent_name"
                      value={formData.parent_name}
                      onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                      placeholder="Parent/Guardian name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parent_phone">Parent Phone</Label>
                    <Input
                      id="parent_phone"
                      value={formData.parent_phone}
                      onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                      placeholder="Parent/Guardian phone"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Complete address"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding Student...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Student
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Upload Tab */}
        <TabsContent value="bulk">
          <div className="space-y-6">
            {/* Download Template */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Download Template
                </CardTitle>
                <CardDescription>
                  Download the Excel template with required fields for bulk student upload
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleDownloadTemplate}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Download Student Template
                </Button>
              </CardContent>
            </Card>

            {/* Upload Section */}
            {uploadStep === "upload" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Excel File
                  </CardTitle>
                  <CardDescription>Upload your filled Excel template to add multiple students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-900">Choose Excel file to upload</p>
                      <p className="text-sm text-gray-600">Supports .xlsx and .xls files</p>
                    </div>
                    <Input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="mt-4 max-w-xs mx-auto"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preview Section */}
            {uploadStep === "preview" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Preview Data
                  </CardTitle>
                  <CardDescription>Review the uploaded data before processing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {validationErrors.length > 0 ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">Validation Errors:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {validationErrors.slice(0, 10).map((error, index) => (
                              <li key={index} className="text-sm">
                                {error}
                              </li>
                            ))}
                            {validationErrors.length > 10 && (
                              <li className="text-sm">...and {validationErrors.length - 10} more errors</li>
                            )}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-900">
                            {parsedData.length} students ready to process
                          </span>
                        </div>
                        <Badge variant="secondary">{uploadedFile?.name}</Badge>
                      </div>

                      {/* Preview Table */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="max-h-64 overflow-y-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="px-4 py-2 text-left">Name</th>
                                <th className="px-4 py-2 text-left">Email</th>
                                <th className="px-4 py-2 text-left">Department</th>
                                <th className="px-4 py-2 text-left">Year</th>
                                <th className="px-4 py-2 text-left">Phone</th>
                              </tr>
                            </thead>
                            <tbody>
                              {parsedData.slice(0, 10).map((row, index) => (
                                <tr key={index} className="border-t">
                                  <td className="px-4 py-2">{row["Student Name"]}</td>
                                  <td className="px-4 py-2">{row["Email ID"]}</td>
                                  <td className="px-4 py-2">{row["Department"]}</td>
                                  <td className="px-4 py-2">{row["Year"]}</td>
                                  <td className="px-4 py-2">{row["Phone No"]}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        {parsedData.length > 10 && (
                          <div className="bg-gray-50 px-4 py-2 text-sm text-gray-600 text-center">
                            Showing first 10 of {parsedData.length} records
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between">
                        <Button variant="outline" onClick={resetBulkUpload}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleBulkProcess}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Proceed with Upload
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Processing Section */}
            {uploadStep === "processing" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing Students
                  </CardTitle>
                  <CardDescription>Adding students to the database...</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {processingStats && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {processingStats.processed} / {processingStats.total}
                          </span>
                        </div>
                        <Progress value={(processingStats.processed / processingStats.total) * 100} className="h-2" />
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-blue-600">{processingStats.processed}</p>
                          <p className="text-sm text-gray-600">Processed</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-green-600">{processingStats.successful}</p>
                          <p className="text-sm text-gray-600">Successful</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-2xl font-bold text-red-600">{processingStats.failed}</p>
                          <p className="text-sm text-gray-600">Failed</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Complete Section */}
            {uploadStep === "complete" && processingStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Processing Complete
                  </CardTitle>
                  <CardDescription>Bulk student upload has been completed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-blue-600">{processingStats.total}</p>
                      <p className="text-sm text-gray-600">Total Records</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-green-600">{processingStats.successful}</p>
                      <p className="text-sm text-gray-600">Successfully Added</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-red-600">{processingStats.failed}</p>
                      <p className="text-sm text-gray-600">Failed</p>
                    </div>
                  </div>

                  {processingStats.errors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <p className="font-medium">Errors encountered:</p>
                          <ul className="list-disc list-inside space-y-1 max-h-32 overflow-y-auto">
                            {processingStats.errors.slice(0, 5).map((error, index) => (
                              <li key={index} className="text-sm">
                                Row {error.row}: {error.error}
                              </li>
                            ))}
                            {processingStats.errors.length > 5 && (
                              <li className="text-sm">...and {processingStats.errors.length - 5} more errors</li>
                            )}
                          </ul>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={resetBulkUpload}>
                      Upload More Students
                    </Button>
                    <Button
                      onClick={() => router.push("/university/manage-students")}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      View All Students
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
