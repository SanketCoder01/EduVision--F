"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, Download, Eye, Edit, Bot, FileText, Users, CheckCircle, XCircle, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

interface StudentResult {
  id: string
  roll_no: string
  name: string
  email: string
  department: string
  year: string
  subject: string
  exam_type: string
  marks: number
  total_marks: number
  percentage: number
  grade: string
  status: string
}

export default function ResultManagementModule({ dean }: { dean: any }) {
  const [results, setResults] = useState<StudentResult[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase
        .from('student_results')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setResults(data || [])
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock data insertion
      const mockResults: StudentResult[] = [
        {
          id: "1",
          roll_no: "CS001",
          name: "Arjun Patel",
          department: "Computer Science & Engineering",
          marks: 85,
          total_marks: 100,
          status: "Pass",
          email: "arjun.patel@sanjivani.edu",
          improvement_plan: "Completed",
          created_at: new Date().toISOString()
        },
        {
          id: "2",
          roll_no: "CS002",
          name: "Priya Singh",
          department: "AI & Data Science",
          marks: 78,
          total_marks: 100,
          status: "Pass",
          email: "priya.singh@sanjivani.edu",
          improvement_plan: "Completed",
          created_at: new Date().toISOString()
        },
        {
          id: "3",
          roll_no: "CY001",
          name: "Rahul Kumar",
          department: "Cyber Security",
          marks: 45,
          total_marks: 100,
          status: "Fail",
          email: "rahul.kumar@sanjivani.edu",
          improvement_plan: "Pending",
          created_at: new Date().toISOString()
        }
      ]

      // Insert mock data into Supabase
      const { error } = await supabase
        .from('student_results')
        .insert(mockResults)

      if (error) throw error
      
      await fetchResults()
    } catch (error) {
      console.error('Error uploading results:', error)
    } finally {
      setUploading(false)
    }
  }

  const generateImprovementPlan = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('student_results')
        .update({ improvement_plan: 'Generated' })
        .eq('id', studentId)

      if (error) throw error
      await fetchResults()
    } catch (error) {
      console.error('Error generating plan:', error)
    }
  }

  const sendNotification = async (studentId: string, type: 'congratulations' | 'improvement') => {
    try {
      // Implement notification logic
      console.log(`Sending ${type} notification to student ${studentId}`)
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  const stats = {
    total: results.length,
    passed: results.filter(r => r.status === 'Pass').length,
    failed: results.filter(r => r.status === 'Fail').length,
    passRate: results.length > 0 ? (results.filter(r => r.status === 'Pass').length / results.length) * 100 : 0
  }

  const departmentStats = [
    { dept: "Computer Science & Engineering", passRate: 96, failed: 18 },
    { dept: "AI & Data Science", passRate: 95, failed: 16 },
    { dept: "AI & Machine Learning", passRate: 94, failed: 15 },
    { dept: "Cyber Security", passRate: 93, failed: 18 }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Result Management & Action Dashboard</h2>
        <div className="flex gap-3">
          <label className="cursor-pointer">
            <Button className="bg-blue-600 hover:bg-blue-700" disabled={uploading}>
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Uploading..." : "Upload XLSX"}
            </Button>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Students</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.passed}</div>
            <div className="text-sm text-gray-600">Passed Students</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{stats.failed}</div>
            <div className="text-sm text-gray-600">Failed Students</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">{stats.passRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Pass Percentage</div>
          </CardContent>
        </Card>
      </div>

      {/* Pass/Fail Chart & Department Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Pass vs Fail Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full bg-green-200"></div>
                <div 
                  className="absolute inset-0 rounded-full bg-red-200 transform -rotate-90" 
                  style={{clipPath: `polygon(50% 50%, 50% 0%, ${50 + (stats.passRate/2)}% 0%, 100% 0%, 100% 100%, 0% 100%)`}}
                ></div>
                <div className="absolute inset-4 rounded-full bg-white flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{stats.passRate.toFixed(1)}%</div>
                    <div className="text-xs text-gray-600">Pass Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Department-wise Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {departmentStats.map((dept, index) => (
                <div key={dept.dept} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{dept.dept}</span>
                    <span className="text-gray-600">{dept.passRate}% pass</span>
                  </div>
                  <Progress value={dept.passRate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Results Table */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Student Results Table</CardTitle>
            <div className="flex gap-2">
              <Input 
                placeholder="Search students..." 
                className="w-64" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Roll No</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Department</th>
                  <th className="text-left p-3">Marks</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Improvement Plan</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results
                  .filter(result => 
                    searchTerm === "" || 
                    result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    result.roll_no.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((result, index) => (
                  <tr key={result.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{result.roll_no}</td>
                    <td className="p-3 font-medium">{result.name}</td>
                    <td className="p-3">{result.department}</td>
                    <td className="p-3">{result.marks}/{result.total_marks}</td>
                    <td className="p-3">
                      <Badge variant={result.status === "Pass" ? "default" : "destructive"}>
                        {result.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">{result.email}</td>
                    <td className="p-3">
                      <Badge variant={result.improvement_plan === "Completed" ? "default" : "secondary"}>
                        {result.improvement_plan || "Pending"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View Report
                        </Button>
                        {result.status === "Fail" ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 border-red-600"
                            onClick={() => generateImprovementPlan(result.id)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Assign Plan
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-green-600 border-green-600"
                            onClick={() => sendNotification(result.id, 'congratulations')}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Certificate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons & Automation */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Automation & Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="bg-red-600 hover:bg-red-700 text-white h-16">
              <div className="text-center">
                <div className="font-semibold">Generate Improvement Plans</div>
                <div className="text-sm opacity-90">For {stats.failed} failed students</div>
              </div>
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white h-16">
              <div className="text-center">
                <div className="font-semibold">Schedule Re-Tests</div>
                <div className="text-sm opacity-90">Auto-schedule for failed</div>
              </div>
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-16">
              <div className="text-center">
                <div className="font-semibold">Send Notifications</div>
                <div className="text-sm opacity-90">Notify all students</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Smart Suggestions */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="w-5 h-5 mr-2 text-purple-600" />
            Smart Suggestions (AI-based)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              `${stats.failed} students failed → Suggest remedial classes next week`,
              "Re-test can be scheduled on Friday for failed students",
              "Send motivation email to failed students with improvement resources",
              "Consider additional lab sessions for struggling departments"
            ].map((suggestion, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">{suggestion}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
