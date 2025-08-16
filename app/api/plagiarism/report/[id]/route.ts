import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const reportId = params.id

    // Get plagiarism report data from database
    const { data: submission, error } = await supabase
      .from("assignment_submissions")
      .select(`
        *,
        assignment:assignment_id(title, due_date, created_at, max_marks),
        student:student_id(name, email, department, year)
      `)
      .eq("plagiarism_report_id", reportId)
      .single()

    if (error || !submission) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // Generate comprehensive report data
    const reportData = {
      id: reportId,
      appName: "EduVision",
      assignment: {
        name: submission.assignment?.title || "Assignment",
        dateGiven: submission.assignment?.created_at || new Date().toISOString(),
        dateSubmitted: submission.submitted_at,
        dueDate: submission.assignment?.due_date,
        maxMarks: submission.assignment?.max_marks || 100,
      },
      student: {
        name: submission.student?.name || "Student",
        email: submission.student?.email || "",
        department: submission.student?.department || "",
        year: submission.student?.year || "",
      },
      plagiarism: {
        percentage: submission.plagiarism_score || 0,
        status: submission.plagiarism_score > 20 ? "High Risk" : 
                submission.plagiarism_score > 10 ? "Medium Risk" : "Low Risk",
        checkedAt: submission.processed_at || new Date().toISOString(),
        sources: submission.plagiarism_sources || [],
      },
      grading: {
        grade: submission.grade,
        feedback: submission.feedback,
        gradedAt: submission.graded_at,
        autoGrade: submission.auto_grade,
      },
      generatedAt: new Date().toISOString(),
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error("Error fetching plagiarism report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
