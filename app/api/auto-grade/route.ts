import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { assignmentId, maxMarks } = await request.json()
    
    if (!assignmentId || !maxMarks) {
      return NextResponse.json({ error: "Assignment ID and max marks are required" }, { status: 400 })
    }

    const supabase = createClient()

    // Get all submissions for the assignment
    const { data: submissions, error } = await supabase
      .from("assignment_submissions")
      .select("*")
      .eq("assignment_id", assignmentId)
      .is("grade", null) // Only grade ungraded submissions

    if (error) {
      throw error
    }

    const gradedSubmissions = []

    for (const submission of submissions) {
      let autoGrade = 0
      let gradingNotes = []

      // Base score for submission (50% of total marks)
      let baseScore = maxMarks * 0.5

      // Content completeness check (30% of total marks)
      const contentScore = calculateContentScore(submission.content, maxMarks * 0.3)
      
      // Plagiarism penalty (20% of total marks)
      const plagiarismScore = submission.plagiarism_score || 0
      let plagiarismPenalty = 0

      if (plagiarismScore > 25) {
        plagiarismPenalty = maxMarks * 0.4 // Heavy penalty for high plagiarism
        gradingNotes.push(`High plagiarism detected (${plagiarismScore}%) - Major penalty applied`)
      } else if (plagiarismScore > 15) {
        plagiarismPenalty = maxMarks * 0.2 // Moderate penalty
        gradingNotes.push(`Moderate plagiarism detected (${plagiarismScore}%) - Penalty applied`)
      } else if (plagiarismScore > 8) {
        plagiarismPenalty = maxMarks * 0.1 // Minor penalty
        gradingNotes.push(`Minor plagiarism detected (${plagiarismScore}%) - Small penalty applied`)
      } else {
        gradingNotes.push(`Good originality (${plagiarismScore}% similarity)`)
      }

      // Calculate final grade
      autoGrade = Math.max(0, Math.round(baseScore + contentScore - plagiarismPenalty))
      
      // Ensure grade doesn't exceed max marks
      autoGrade = Math.min(autoGrade, maxMarks)

      // Add overall assessment
      if (autoGrade >= maxMarks * 0.9) {
        gradingNotes.push("Excellent work with high originality")
      } else if (autoGrade >= maxMarks * 0.7) {
        gradingNotes.push("Good work with room for improvement")
      } else if (autoGrade >= maxMarks * 0.5) {
        gradingNotes.push("Satisfactory work but needs significant improvement")
      } else {
        gradingNotes.push("Needs major revision and improvement")
      }

      // Update submission with auto grade
      const { error: updateError } = await supabase
        .from("assignment_submissions")
        .update({
          grade: autoGrade,
          auto_grade: autoGrade,
          feedback: `Auto-graded: ${gradingNotes.join(". ")}`,
          graded_at: new Date().toISOString(),
          graded_by: "system"
        })
        .eq("id", submission.id)

      if (updateError) {
        console.error("Error updating grade:", updateError)
        continue
      }

      gradedSubmissions.push({
        submissionId: submission.id,
        studentId: submission.student_id,
        grade: autoGrade,
        plagiarismScore,
        notes: gradingNotes
      })
    }

    return NextResponse.json({
      success: true,
      gradedCount: gradedSubmissions.length,
      submissions: gradedSubmissions
    })

  } catch (error) {
    console.error("Auto-grading error:", error)
    return NextResponse.json({ error: "Failed to auto-grade submissions" }, { status: 500 })
  }
}

function calculateContentScore(content: string, maxContentScore: number): number {
  if (!content) return 0

  const wordCount = content.split(/\s+/).length
  const sentenceCount = content.split(/[.!?]+/).length
  const paragraphCount = content.split(/\n\s*\n/).length

  // Basic content quality metrics
  let score = 0

  // Word count scoring (up to 40% of content score)
  if (wordCount >= 500) {
    score += maxContentScore * 0.4
  } else if (wordCount >= 300) {
    score += maxContentScore * 0.3
  } else if (wordCount >= 150) {
    score += maxContentScore * 0.2
  } else {
    score += maxContentScore * 0.1
  }

  // Structure scoring (up to 30% of content score)
  if (paragraphCount >= 3 && sentenceCount >= 10) {
    score += maxContentScore * 0.3
  } else if (paragraphCount >= 2 && sentenceCount >= 5) {
    score += maxContentScore * 0.2
  } else {
    score += maxContentScore * 0.1
  }

  // Completeness scoring (up to 30% of content score)
  const hasIntroduction = content.toLowerCase().includes("introduction") || 
                         content.toLowerCase().includes("overview")
  const hasConclusion = content.toLowerCase().includes("conclusion") || 
                       content.toLowerCase().includes("summary")
  
  if (hasIntroduction && hasConclusion) {
    score += maxContentScore * 0.3
  } else if (hasIntroduction || hasConclusion) {
    score += maxContentScore * 0.15
  }

  return Math.round(score)
}
