import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department")
    const year = searchParams.get("year")
    const studentId = searchParams.get("studentId")
    
    const supabase = createServerSupabaseClient()
    
    if (studentId) {
      // Get individual student progress
      const { data: student } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single()
      
      if (!student) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        )
      }
      
      // Get student results
      const { data: results } = await supabase
        .from('student_results')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
      
      // Get attendance
      const { data: attendance } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('student_id', studentId)
      
      const totalSessions = attendance?.length || 0
      const presentSessions = attendance?.filter(a => a.status === 'present').length || 0
      const attendancePercentage = totalSessions > 0 ? (presentSessions / totalSessions) * 100 : 0
      
      // Get assignments
      const { data: submissions } = await supabase
        .from('assignment_submissions')
        .select('*')
        .eq('student_id', studentId)
      
      const totalAssignments = submissions?.length || 0
      const completedAssignments = submissions?.filter(s => s.status === 'graded').length || 0
      const avgAssignmentScore = submissions?.reduce((sum, s) => sum + (s.marks || 0), 0) / totalAssignments || 0
      
      // Calculate CGPA
      const totalMarks = results?.reduce((sum, r) => sum + r.marks, 0) || 0
      const totalPossible = results?.reduce((sum, r) => sum + r.total_marks, 0) || 0
      const percentage = totalPossible > 0 ? (totalMarks / totalPossible) * 100 : 0
      const cgpa = (percentage / 10).toFixed(2)
      
      return NextResponse.json({
        success: true,
        student: {
          ...student,
          cgpa,
          attendancePercentage: attendancePercentage.toFixed(2),
          totalResults: results?.length || 0,
          passedResults: results?.filter(r => r.status === 'Pass').length || 0,
          failedResults: results?.filter(r => r.status === 'Fail').length || 0,
          totalAssignments,
          completedAssignments,
          avgAssignmentScore: avgAssignmentScore.toFixed(2)
        },
        results,
        attendance,
        submissions
      })
    } else {
      // Get all students with filters
      let query = supabase
        .from('students')
        .select('*')
      
      if (department) {
        query = query.eq('department', department)
      }
      
      if (year) {
        query = query.eq('year', year)
      }
      
      const { data: students } = await query
      
      // Enrich with progress data
      const studentsWithProgress = await Promise.all(
        (students || []).map(async (student) => {
          const { data: results } = await supabase
            .from('student_results')
            .select('marks, total_marks, status')
            .eq('student_id', student.id)
          
          const { count: attendanceCount } = await supabase
            .from('attendance_records')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', student.id)
            .eq('status', 'present')
          
          const { count: totalAttendance } = await supabase
            .from('attendance_records')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', student.id)
          
          const totalAttendanceCount = totalAttendance || 0
          const attendancePercentage = totalAttendanceCount > 0 
            ? ((attendanceCount || 0) / totalAttendanceCount) * 100 
            : 0
          
          const totalMarks = results?.reduce((sum, r) => sum + r.marks, 0) || 0
          const totalPossible = results?.reduce((sum, r) => sum + r.total_marks, 0) || 0
          const percentage = totalPossible > 0 ? (totalMarks / totalPossible) * 100 : 0
          const cgpa = (percentage / 10).toFixed(2)
          
          return {
            ...student,
            cgpa,
            attendancePercentage: attendancePercentage.toFixed(2),
            passedResults: results?.filter(r => r.status === 'Pass').length || 0,
            failedResults: results?.filter(r => r.status === 'Fail').length || 0,
            totalResults: results?.length || 0
          }
        })
      )
      
      return NextResponse.json({
        success: true,
        students: studentsWithProgress
      })
    }
    
  } catch (error) {
    console.error("Student progress error:", error)
    return NextResponse.json(
      { error: "Failed to fetch student progress" },
      { status: 500 }
    )
  }
}
