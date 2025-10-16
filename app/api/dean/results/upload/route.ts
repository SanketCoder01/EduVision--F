import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import * as XLSX from "xlsx"

interface ResultRow {
  roll_no: string
  name: string
  email: string
  department: string
  year: string
  subject: string
  exam_type: string
  marks: number
  total_marks: number
  uploaded_by: string
  student_id?: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const deanId = formData.get("deanId") as string
    const department = formData.get("department") as string
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }
    
    // Read Excel file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "array" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)
    
    const supabase = createServerSupabaseClient()
    
    // Process each row and insert into database
    const results: ResultRow[] = []
    for (const row of data as any[]) {
      const result: ResultRow = {
        roll_no: row["Roll No"] || row["roll_no"] || "",
        name: row["Name"] || row["name"] || "",
        email: row["Email"] || row["email"] || "",
        department: department,
        year: row["Year"] || row["year"] || "",
        subject: row["Subject"] || row["subject"] || "",
        exam_type: row["Exam Type"] || row["exam_type"] || "mid-term",
        marks: parseInt(row["Marks"] || row["marks"] || "0"),
        total_marks: parseInt(row["Total Marks"] || row["total_marks"] || "100"),
        uploaded_by: deanId,
      }
      
      // Find student by email
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('email', result.email)
        .single()
      
      if (student) {
        result.student_id = student.id
      }
      
      results.push(result)
    }
    
    // Bulk insert results
    const { data: insertedResults, error: insertError } = await supabase
      .from('student_results')
      .insert(results)
      .select()
    
    if (insertError) {
      console.error("Error inserting results:", insertError)
      return NextResponse.json(
        { error: "Failed to save results" },
        { status: 500 }
      )
    }
    
    // Calculate statistics
    const totalStudents = results.length
    const passedStudents = results.filter(r => r.marks >= r.total_marks * 0.4).length
    const failedStudents = totalStudents - passedStudents
    const passPercentage = (passedStudents / totalStudents) * 100
    
    // Generate AI insights for failed students
    const failedResults = results.filter(r => r.marks < r.total_marks * 0.4)
    
    for (const failedResult of failedResults) {
      // Create improvement plan
      await supabase.from('improvement_plans').insert({
        student_id: failedResult.student_id,
        subject: failedResult.subject,
        weak_topics: ['Needs assessment'],
        status: 'pending',
        created_by: deanId
      })
      
      // Create notification for student
      if (failedResult.student_id) {
        await supabase.from('notifications').insert({
          user_id: failedResult.student_id,
          title: 'Improvement Plan Available',
          message: `An improvement plan has been created for ${failedResult.subject}. Please review it in your dashboard.`,
          type: 'info'
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      statistics: {
        totalStudents,
        passedStudents,
        failedStudents,
        passPercentage,
        failPercentage: 100 - passPercentage
      },
      results: insertedResults
    })
    
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    )
  }
}
