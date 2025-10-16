import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

interface Result {
  status: string
  marks: number
  total_marks: number
  subject: string
}

interface SubjectStat {
  subject: string
  totalStudents: number
  passed: number
  failed: number
  totalMarks: number
  passRate?: string
  avgMarks?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department")
    
    const supabase = createServerSupabaseClient()
    
    // Fetch department-wise statistics
    const departments = [
      'Computer Science & Engineering',
      'Cyber Security',
      'AI & Data Science',
      'AI & Machine Learning'
    ]
    
    const analyticsData = []
    
    for (const dept of departments) {
      if (department && dept !== department) continue
      
      // Get student count
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('department', dept)
      
      // Get faculty count
      const { count: facultyCount } = await supabase
        .from('faculty')
        .select('*', { count: 'exact', head: true })
        .eq('department', dept)
      
      // Get results statistics
      const { data: results } = await supabase
        .from('student_results')
        .select('status, marks, total_marks')
        .eq('department', dept)
      
      const passedCount = results?.filter((r: Result) => r.status === 'Pass').length || 0
      const totalResults = results?.length || 1
      const passRate = (passedCount / totalResults) * 100
      
      // Get average marks
      const avgMarks = results?.reduce((sum: number, r: Result) => sum + r.marks, 0) / totalResults || 0
      
      analyticsData.push({
        department: dept,
        studentCount: studentCount || 0,
        facultyCount: facultyCount || 0,
        passRate: passRate.toFixed(2),
        avgMarks: avgMarks.toFixed(2),
        resultsCount: totalResults
      })
    }
    
    // Get subject-wise performance
    const { data: subjectPerformance } = await supabase
      .from('student_results')
      .select('subject, marks, total_marks, status')
    
    const subjectStats: { [key: string]: SubjectStat } = {}
    subjectPerformance?.forEach((result: Result) => {
      if (!subjectStats[result.subject]) {
        subjectStats[result.subject] = {
          subject: result.subject,
          totalStudents: 0,
          passed: 0,
          failed: 0,
          totalMarks: 0
        }
      }
      const stat = subjectStats[result.subject]
      stat.totalStudents++
      if (result.status === 'Pass') {
        stat.passed++
      } else {
        stat.failed++
      }
      stat.totalMarks += result.marks
    })
    
    const subjectAnalytics = Object.values(subjectStats).map((stat: any) => ({
      ...stat,
      passRate: ((stat.passed / stat.totalStudents) * 100).toFixed(2),
      avgMarks: (stat.totalMarks / stat.totalStudents).toFixed(2)
    }))
    
    return NextResponse.json({
      success: true,
      departmentAnalytics: analyticsData,
      subjectAnalytics
    })
    
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
