"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, Download, Eye, Edit, FileText, Users, CheckCircle, XCircle, Filter, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import * as XLSX from "xlsx"

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
  improvement_plan?: string
  created_at: string
}

interface DeptPerf {
  dept: string
  total: number
  passed: number
  passRate: number
}

const DEPT_MAP: Record<string, string> = {
  "Computer Science & Engineering": "cse",
  "Cyber Security": "cyber",
  "AI & Data Science": "aids",
  "AI & Machine Learning": "aiml",
}
const YEAR_KEYS = ['1st', '2nd', '3rd', '4th']

export default function ResultManagementModule({ dean }: { dean: any }) {
  const [results, setResults] = useState<StudentResult[]>([])
  const [deptPerf, setDeptPerf] = useState<DeptPerf[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDept, setFilterDept] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const { toast } = useToast()
  const channelRef = useRef<any>(null)

  useEffect(() => {
    fetchResults()
    fetchDeptPerformance()

    channelRef.current = supabase
      .channel("dean-results-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "student_results" }, () => {
        fetchResults()
        fetchDeptPerformance()
      })
      .subscribe()

    return () => { channelRef.current?.unsubscribe() }
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

  // Real department performance from both student_results + sharded tables
  const fetchDeptPerformance = async () => {
    const depts = Object.keys(DEPT_MAP)
    const perfArr: DeptPerf[] = await Promise.all(
      depts.map(async (dept) => {
        const deptKey = DEPT_MAP[dept]

        // Count total real students
        let total = 0
        for (const yr of YEAR_KEYS) {
          const { count } = await supabase
            .from(`students_${deptKey}_${yr}_year`)
            .select('*', { count: 'exact', head: true })
          total += (count || 0)
        }

        // Pass rate from student_results
        const { data: res } = await supabase
          .from('student_results')
          .select('status')
          .eq('department', dept)
          .limit(300)
        const passed = res?.filter(r => r.status === 'Pass').length || 0
        const totalRes = res?.length || 0
        const passRate = totalRes > 0 ? Math.round((passed / totalRes) * 100) : 0

        return { dept, total, passed: totalRes > 0 ? passed : 0, passRate }
      })
    )
    setDeptPerf(perfArr)
  }

  // XLSX upload: parse rows and insert into student_results
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast({ title: "Invalid file", description: "Please upload an .xlsx or .xls file", variant: "destructive" })
      return
    }

    setUploading(true)
    try {
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer, { type: "array" })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" })

      if (rows.length === 0) {
        toast({ title: "Empty file", description: "No data found in the Excel file", variant: "destructive" })
        return
      }

      // Map Excel columns to DB fields (flexible column names)
      const mapped = rows.map((row: any) => ({
        roll_no: String(row['Roll No'] || row['roll_no'] || row['PRN'] || ''),
        name: String(row['Name'] || row['name'] || row['Student Name'] || ''),
        email: String(row['Email'] || row['email'] || ''),
        department: String(row['Department'] || row['department'] || dean.department || ''),
        year: String(row['Year'] || row['year'] || ''),
        subject: String(row['Subject'] || row['subject'] || ''),
        exam_type: String(row['Exam Type'] || row['exam_type'] || 'mid-term'),
        marks: Number(row['Marks'] || row['marks'] || 0),
        total_marks: Number(row['Total Marks'] || row['total_marks'] || 100),
        uploaded_by: dean.id,
        improvement_plan: 'Pending',
      })).filter(r => r.name && r.marks !== undefined)

      if (mapped.length === 0) {
        toast({ title: "No valid rows", description: "Ensure columns: Roll No, Name, Email, Department, Year, Subject, Marks, Total Marks", variant: "destructive" })
        return
      }

      const { error } = await supabase.from('student_results').insert(mapped)
      if (error) throw error

      toast({ title: `✅ Uploaded ${mapped.length} results`, description: "Results saved to database successfully" })
      fetchResults()
      fetchDeptPerformance()
    } catch (error: any) {
      console.error('XLSX upload error:', error)
      toast({ title: "Upload failed", description: error.message || "Failed to process file", variant: "destructive" })
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  const downloadTemplate = () => {
    const template = [
      { "Roll No": "CS001", "Name": "Student Name", "Email": "student@sanjivani.edu.in", "Department": "Computer Science & Engineering", "Year": "2nd", "Subject": "Data Structures", "Exam Type": "mid-term", "Marks": 85, "Total Marks": 100 }
    ]
    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Results")
    XLSX.writeFile(wb, "results_template.xlsx")
  }

  const stats = {
    total: results.length,
    passed: results.filter(r => r.status === 'Pass').length,
    failed: results.filter(r => r.status === 'Fail').length,
    passRate: results.length > 0 ? Math.round((results.filter(r => r.status === 'Pass').length / results.length) * 100) : 0
  }

  const filteredResults = results.filter(r => {
    const matchSearch = searchTerm === "" ||
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.roll_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchDept = filterDept === "all" || r.department === filterDept
    const matchStatus = filterStatus === "all" || r.status === filterStatus
    return matchSearch && matchDept && matchStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Result Management</h2>
          <p className="text-gray-600 mt-1">Upload and track student results — all data from Supabase</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </Button>
          <label className="cursor-pointer">
            <Button className="bg-blue-600 hover:bg-blue-700" disabled={uploading} asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Upload XLSX"}
              </span>
            </Button>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <Button variant="outline" onClick={fetchResults}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Upload hint */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800 font-medium">📋 XLSX Format Required</p>
        <p className="text-xs text-blue-600 mt-1">Columns: <code>Roll No, Name, Email, Department, Year, Subject, Exam Type, Marks, Total Marks</code></p>
        <p className="text-xs text-blue-600">Percentage, Grade, Pass/Fail are calculated automatically by the database.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Results", value: stats.total, color: "text-blue-600", icon: <Users className="w-6 h-6 text-blue-500" /> },
          { label: "Passed", value: stats.passed, color: "text-green-600", icon: <CheckCircle className="w-6 h-6 text-green-500" /> },
          { label: "Failed", value: stats.failed, color: "text-red-600", icon: <XCircle className="w-6 h-6 text-red-500" /> },
          { label: "Pass Rate", value: `${stats.passRate}%`, color: "text-orange-600", icon: <FileText className="w-6 h-6 text-orange-500" /> },
        ].map(({ label, value, color, icon }) => (
          <Card key={label} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{label}</p>
                  <p className={`text-3xl font-bold ${color}`}>{value}</p>
                </div>
                {icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Real Department Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pass vs Fail Distribution
              <Badge className="bg-blue-100 text-blue-700 text-xs">From uploaded results</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="#22c55e" strokeWidth="3"
                    strokeDasharray={`${stats.passRate} ${100 - stats.passRate}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.passRate}%</div>
                    <div className="text-xs text-gray-500">Pass Rate</div>
                  </div>
                </div>
              </div>
              <div className="ml-8 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-700">Passed: {stats.passed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <span className="text-sm text-gray-700">Failed: {stats.failed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span className="text-sm text-gray-700">Total: {stats.total}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Department-wise Performance
              <Badge className="bg-green-100 text-green-700 text-xs">Live from DB</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deptPerf.map((d) => (
                <div key={d.dept} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-800 truncate max-w-[200px]">{d.dept}</span>
                    <div className="flex gap-2 items-center">
                      <span className="text-gray-500 text-xs">{d.total} students</span>
                      <span className={`font-semibold ${d.passRate > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                        {d.passRate > 0 ? `${d.passRate}% pass` : 'No results'}
                      </span>
                    </div>
                  </div>
                  <Progress value={d.passRate} className="h-2" />
                </div>
              ))}
              {deptPerf.every(d => d.passRate === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">No results uploaded yet. Upload an XLSX to see department performance.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Results Table */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle>Student Results ({filteredResults.length})</CardTitle>
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Search name, PRN, subject..."
                className="w-52"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Departments</option>
                {Object.keys(DEPT_MAP).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="Pass">Pass</option>
                <option value="Fail">Fail</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Roll No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Marks</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">%</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{result.roll_no}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{result.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[140px] truncate">{result.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{result.year}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{result.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{result.marks}/{result.total_marks}</td>
                    <td className="px-4 py-3 text-sm font-medium">{result.percentage?.toFixed(1) || '—'}%</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">{result.grade || '—'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={result.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {result.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredResults.length === 0 && (
              <div className="text-center py-16">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No results found</p>
                <p className="text-gray-400 text-sm mt-1">Upload an XLSX file to add student results</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
