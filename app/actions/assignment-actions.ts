"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { createNotification } from "./notification-actions"

// Mock assignments data
const mockAssignments = [
  {
    id: "1",
    title: "Data Structures Implementation",
    description: "Implement basic data structures in your preferred programming language",
    instructions: "Create implementations for Stack, Queue, and Linked List with proper documentation",
    faculty_id: "fac-001",
    class_id: "3",
    assignment_type: "programming",
    due_date: "2024-02-15T23:59:59Z",
    max_marks: 100,
    visibility: true,
    allow_resubmission: true,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    title: "Database Design Project",
    description: "Design a complete database system for a library management system",
    instructions: "Include ER diagrams, normalization, and SQL queries",
    faculty_id: "fac-002",
    class_id: "3",
    assignment_type: "project",
    due_date: "2024-02-20T23:59:59Z",
    max_marks: 100,
    visibility: true,
    allow_resubmission: false,
    created_at: "2024-01-10T14:30:00Z",
    updated_at: "2024-01-10T14:30:00Z",
  },
]

// Create a new assignment
export async function createAssignment(formData: any) {
  const supabase = createClient()

  try {
    // Generate a UUID for the assignment
    const assignmentId = uuidv4()

    // Get faculty department to ensure proper targeting
    const { data: faculty, error: facultyError } = await supabase
      .from("faculty")
      .select("department")
      .eq("id", formData.facultyId)
      .single()

    if (facultyError) throw facultyError

    // Create the assignment with department-based targeting
    const { error } = await supabase.from("assignments").insert({
      id: assignmentId,
      title: formData.title,
      description: formData.description,
      instructions: formData.instructions,
      faculty_id: formData.facultyId,
      faculty_department: faculty.department,
      target_years: formData.targetYears || [],
      assignment_type: formData.assignmentType,
      allowed_file_types: formData.allowedFileTypes,
      word_limit: formData.wordLimit,
      max_marks: formData.maxMarks,
      start_date: formData.startDate,
      due_date: formData.dueDate,
      visibility: formData.visibility,
      allow_late_submission: formData.allowLateSubmission,
      allow_resubmission: formData.allowResubmission,
      enable_plagiarism_check: formData.enablePlagiarismCheck,
      allow_group_submission: formData.allowGroupSubmission,
      status: formData.visibility ? "published" : "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) throw new Error(`Error creating assignment: ${error.message}`)

    // Add resources if any
    if (formData.resources && formData.resources.length > 0) {
      const resources = formData.resources.map((resource: any) => ({
        assignment_id: assignmentId,
        name: resource.name,
        type: resource.type,
        url: resource.url,
        created_at: new Date().toISOString(),
      }))

      const { error: resourcesError } = await supabase.from("assignment_resources").insert(resources)

      if (resourcesError) throw new Error(`Error adding resources: ${resourcesError.message}`)
    }

    revalidatePath("/dashboard/assignments")
    revalidatePath("/student-dashboard/assignments")

    // Send notifications to students if the assignment is published
    if (formData.visibility) {
      try {
        const { data: students, error: studentsError } = await supabase
          .from("students")
          .select("id")
          .eq("department", faculty.department)
          .in("year", formData.targetYears)

        if (studentsError) {
          console.error("Error fetching students for notification:", studentsError)
        } else if (students && students.length > 0) {
          for (const student of students) {
            await createNotification({
              user_id: student.id,
              title: `New Assignment: ${formData.title}`,
              message: `A new assignment has been posted. Due: ${new Date(formData.dueDate).toLocaleDateString()}`,
              type: "assignment",
              link: `/student-dashboard/assignments/${assignmentId}`,
            })
          }
        }
      } catch (notificationError) {
        console.error("Failed to send assignment notifications:", notificationError)
        // Do not block assignment creation if notifications fail
      }
    }

    return { success: true, assignmentId }
  } catch (error: any) {
    console.error("Error creating assignment:", error)
    return { success: false, error: error.message }
  }
}

// Add resources to an assignment
export async function addAssignmentResources(
  resources: {
    assignmentId: string
    name: string
    fileType: string
    fileUrl: string
  }[],
) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("assignment_resources").insert(
      resources.map((resource) => ({
        assignment_id: resource.assignmentId,
        name: resource.name,
        file_type: resource.fileType,
        file_url: resource.fileUrl,
      })),
    )

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error adding assignment resources:", error)
    return { success: false, error }
  }
}

// Get all assignments - Updated to handle facultyId properly
export async function getAssignments(facultyId?: string, classId?: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("assignments").select("*").order("created_at", { ascending: false })

    if (error) {
      console.log("Database error, using mock assignments:", error.message)
      return { success: true, data: mockAssignments }
    }

    let assignmentsData = data || mockAssignments

    // Only apply facultyId filter if it's a valid UUID
    if (facultyId && facultyId !== "faculty-id" && facultyId.length === 36) {
      assignmentsData = assignmentsData.filter((assignment) => assignment.faculty_id === facultyId)
    }

    if (classId) {
      assignmentsData = assignmentsData.filter((assignment) => assignment.class_id === classId)
    }

    return { success: true, data: assignmentsData }
  } catch (error) {
    console.log("Connection error, using mock assignments:", error)
    return { success: true, data: mockAssignments }
  }
}

// Get all assignments for a faculty
export async function getFacultyAssignments(facultyId: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("assignments")
      .select("*, class:class_id(*)")
      .eq("faculty_id", facultyId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return { success: false, error }
  }
}

// Get all assignments for a student
export async function getStudentAssignments(studentId: string) {
  const supabase = createClient()

  try {
    // First get the student's department and year
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("department, year")
      .eq("id", studentId)
      .single()

    if (studentError) throw studentError

    // Get faculty from the same department
    const { data: facultyList, error: facultyError } = await supabase
      .from("faculty")
      .select("id")
      .eq("department", student.department)

    if (facultyError) throw facultyError

    const facultyIds = facultyList.map((f: any) => f.id)

    // Get assignments from faculty in the same department targeting the student's year
    const { data, error } = await supabase
      .from("assignments")
      .select("*, faculty:faculty_id(name, department)")
      .in("faculty_id", facultyIds)
      .contains("target_years", [student.year])
      .eq("visibility", true)
      .order("due_date", { ascending: true })

    if (error) throw error

    // Get submission status for each assignment
    const assignmentIds = data.map((assignment: any) => assignment.id)

    if (assignmentIds.length > 0) {
      const { data: submissions, error: submissionsError } = await supabase
        .from("assignment_submissions")
        .select("*")
        .eq("student_id", studentId)
        .in("assignment_id", assignmentIds)

      if (submissionsError) throw submissionsError

      // Add submission status to each assignment
      const assignmentsWithStatus = data.map((assignment) => {
        const submission = submissions.find((sub: any) => sub.assignment_id === assignment.id)
        return {
          ...assignment,
          submission: submission || null,
        }
      })

      return { success: true, data: assignmentsWithStatus }
    }

    return { success: true, data: data.map((assignment) => ({ ...assignment, submission: null })) }
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return { success: false, error }
  }
}

// Get assignment by ID - Restored this function to maintain compatibility
export async function getAssignmentById(id: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("assignments").select("*").eq("id", id).single()

    if (error) {
      const mockAssignment = mockAssignments.find((a) => a.id === id)
      return { success: true, data: mockAssignment || mockAssignments[0] }
    }

    const { data: resources, error: resourcesError } = await supabase
      .from("assignment_resources")
      .select("*")
      .eq("assignment_id", id)

    if (resourcesError) throw resourcesError

    return {
      success: true,
      data: {
        assignment: data,
        resources: resources || [],
      },
    }
  } catch (error) {
    console.error("Error fetching assignment:", error)
    const mockAssignment = mockAssignments.find((a) => a.id === id)
    return { success: true, data: mockAssignment || mockAssignments[0] }
  }
}

// Get a single assignment by ID
export async function getAssignment(assignmentId: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("assignments")
      .select("*, class:class_id(*), faculty:faculty_id(*)")
      .eq("id", assignmentId)
      .single()

    if (error) throw error

    // Get resources for the assignment
    const { data: resources, error: resourcesError } = await supabase
      .from("assignment_resources")
      .select("*")
      .eq("assignment_id", assignmentId)

    if (resourcesError) throw resourcesError

    return { success: true, data: { ...data, resources } }
  } catch (error) {
    console.error("Error fetching assignment:", error)
    return { success: false, error }
  }
}
// Update assignment
export async function updateAssignment(
  id: string,
  formData: {
    title: string
    description: string
    classId: string
    assignmentType: string
    allowedFileTypes: string[]
    wordLimit?: number
    maxMarks: number
    startDate: string
    dueDate: string
    visibility: boolean
    allowLateSubmission: boolean
    allowResubmission: boolean
    enablePlagiarismCheck: boolean
    allowGroupSubmission: boolean
    targetYears: number[]
    facultyId: string
  },
  wasVisible: boolean,
) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("assignments")
      .update({
        title: formData.title,
        description: formData.description,
        class_id: formData.classId,
        assignment_type: formData.assignmentType,
        allowed_file_types: formData.allowedFileTypes,
        word_limit: formData.wordLimit,
        max_marks: formData.maxMarks,
        start_date: formData.startDate,
        due_date: formData.dueDate,
        visibility: formData.visibility,
        allow_late_submission: formData.allowLateSubmission,
        allow_resubmission: formData.allowResubmission,
        enable_plagiarism_check: formData.enablePlagiarismCheck,
        allow_group_submission: formData.allowGroupSubmission,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    revalidatePath(`/dashboard/assignments/manage/${id}`)
    revalidatePath("/dashboard/assignments")
    // Also revalidate student dashboard
    revalidatePath("/student-dashboard/assignments")

    // Send notifications if the assignment is newly published
    if (formData.visibility && !wasVisible) {
      try {
        const { data: faculty, error: facultyError } = await supabase
          .from("faculty")
          .select("department")
          .eq("id", formData.facultyId)
          .single()

        if (facultyError) {
          console.error("Error fetching faculty for notification:", facultyError)
          throw facultyError
        }

        const { data: students, error: studentsError } = await supabase
          .from("students")
          .select("id")
          .eq("department", faculty.department)
          .in("year", formData.targetYears)

        if (studentsError) {
          console.error("Error fetching students for notification:", studentsError)
        } else if (students && students.length > 0) {
          for (const student of students) {
            await createNotification({
              user_id: student.id,
              title: `Assignment Published: ${formData.title}`,
              message: `An assignment has been published. Due: ${new Date(
                formData.dueDate,
              ).toLocaleDateString()}`,
              type: "assignment",
              link: `/student-dashboard/assignments/${id}`,
            })
          }
        }
      } catch (notificationError) {
        console.error("Failed to send assignment update notifications:", notificationError)
        // Do not block assignment update if notifications fail
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error updating assignment:", error)
    return { success: false, error }
  }
}

// Delete assignment
export async function deleteAssignment(id: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("assignments").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/dashboard/assignments")
    // Also revalidate student dashboard
    revalidatePath("/student-dashboard/assignments")
    return { success: true }
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return { success: false, error }
  }
}

// Get submissions for an assignment - Restored this function to maintain compatibility
export async function getSubmissions(assignmentId: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("assignment_id", assignmentId)
      .order("submitted_at", { ascending: false })

    if (error) throw error

    // Get submission files
    const submissionIds = data.map((submission) => submission.id)

    if (submissionIds.length > 0) {
      const { data: files, error: filesError } = await supabase
        .from("submission_files")
        .select("*")
        .in("submission_id", submissionIds)

      if (filesError) throw filesError

      // Add files to submissions
      const submissionsWithFiles = data.map((submission) => {
        const submissionFiles = files.filter((file) => file.submission_id === submission.id)
        return {
          ...submission,
          files: submissionFiles,
        }
      })

      return { success: true, data: submissionsWithFiles }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return { success: false, error }
  }
}

// Submit assignment - Restored this function to maintain compatibility
export async function submitAssignment(formData: {
  assignmentId: string
  studentId: string
  submissionType: string
  content?: string
  files?: {
    name: string
    fileType: string
    fileUrl: string
    fileSize: number
  }[]
  existingSubmissionId?: string
}) {
  const supabase = createClient()

  try {
    // Fetch assignment to enforce due/late logic
    const { data: assignment, error: assignmentError } = await supabase
      .from("assignments")
      .select("id, due_date, allow_late_submission, closed_at, enable_plagiarism_check")
      .eq("id", formData.assignmentId)
      .single()

    if (assignmentError) throw assignmentError

    const nowIso = new Date().toISOString()
    const isAfterDue = assignment?.due_date ? new Date(nowIso) > new Date(assignment.due_date) : false
    const lateWindowOpen = assignment?.allow_late_submission && !assignment?.closed_at
    const canSubmit = !isAfterDue || lateWindowOpen

    if (!canSubmit) {
      throw new Error("Submissions are closed for this assignment.")
    }

    const computedStatus = isAfterDue ? "late" : "submitted"

    let submission: any;

    if (formData.existingSubmissionId) {
      // Update existing submission
      const { data, error } = await supabase
        .from("submissions")
        .update({
          submission_type: formData.submissionType,
          content: formData.content,
          status: computedStatus === "late" ? "late" : "resubmitted",
          submitted_at: nowIso,
        })
        .eq("id", formData.existingSubmissionId)
        .select()
        .single()

      if (error) throw error
      submission = data

      // Delete old files
      const { error: deleteError } = await supabase
        .from("submission_files")
        .delete()
        .eq("submission_id", formData.existingSubmissionId)

      if (deleteError) throw deleteError

    } else {
      // Create new submission
      const { data, error } = await supabase
        .from("submissions")
        .insert({
          assignment_id: formData.assignmentId,
          student_id: formData.studentId,
          submission_type: formData.submissionType,
          content: formData.content,
          status: computedStatus,
          submitted_at: nowIso,
        })
        .select()
        .single()

      if (error) throw error
      submission = data
    }

    // Add files if any
    if (formData.files && formData.files.length > 0) {
      const { error: filesError } = await supabase.from("submission_files").insert(
        formData.files.map((file) => ({
          submission_id: submission.id,
          name: file.name,
          file_type: file.fileType,
          file_url: file.fileUrl,
          file_size: file.fileSize,
        })),
      )

      if (filesError) throw filesError
    }

    // Plagiarism processing
    try {
      if (assignment?.enable_plagiarism_check) {
        if (formData.submissionType === "text" && formData.content) {
          // Call internal plagiarism API for text submissions
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/plagiarism`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: formData.content, title: `Submission ${submission.id}` }),
          })
          const result = await res.json().catch(() => ({}))
          const score = typeof result?.plagiarismScore === "number" ? result.plagiarismScore : null
          const reportUrl = result?.report_url || null

          await supabase
            .from("submissions")
            .update({
              plagiarism_score: score,
              plagiarism_report_url: reportUrl,
              plagiarism_status: "completed",
              ocr_used: false,
              processed_at: new Date().toISOString(),
            })
            .eq("id", submission.id)
        } else if (formData.files && formData.files.length > 0) {
          // Create a job for file-based submissions (OCR if needed handled by worker)
          const primaryFile = formData.files[0]
          await supabase.from("plagiarism_jobs").insert({
            submission_id: submission.id,
            vendor: "mock",
            status: "pending",
            input_type: "file",
            file_url: primaryFile.fileUrl,
          })
          // Mark status as processing for now
          await supabase
            .from("submissions")
            .update({ plagiarism_status: "processing" })
            .eq("id", submission.id)
        }
      }
    } catch (plagErr) {
      console.error("Plagiarism processing error:", plagErr)
      // Do not block submission; just record failure state
      await supabase
        .from("submissions")
        .update({ plagiarism_status: "failed" })
        .eq("id", submission.id)
    }

    revalidatePath(`/student-dashboard/assignments`)
    return { success: true, data: submission }
  } catch (error) {
    console.error("Error submitting assignment:", error)
    return { success: false, error }
  }
}

// Submit an assignment with the new schema
export async function submitAssignmentNew(formData: any) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("assignment_submissions")
      .insert({
        assignment_id: formData.assignmentId,
        student_id: formData.studentId,
        content: formData.content,
        status: formData.status || "submitted",
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Add attachments if any
    if (formData.attachments && formData.attachments.length > 0) {
      const attachments = formData.attachments.map((attachment: any) => ({
        submission_id: data.id,
        name: attachment.name,
        file_type: attachment.fileType,
        file_url: attachment.fileUrl,
        created_at: new Date().toISOString(),
      }))

      const { error: attachmentsError } = await supabase.from("submission_attachments").insert(attachments)

      if (attachmentsError) throw attachmentsError
    }

    revalidatePath("/student-dashboard/assignments")
    return { success: true, data }
  } catch (error) {
    console.error("Error submitting assignment:", error)
    return { success: false, error }
  }
}

// Save draft
export async function saveDraft(formData: {
  assignmentId: string
  studentId: string
  submissionType: string
  content?: string
  files?: {
    name: string
    fileType: string
    fileUrl: string
    fileSize: number
  }[]
}) {
  const supabase = createClient()

  try {
    // Create draft
    const { data: draft, error: draftError } = await supabase
      .from("submissions")
      .insert({
        assignment_id: formData.assignmentId,
        student_id: formData.studentId,
        submission_type: formData.submissionType,
        content: formData.content,
        status: "draft",
        submitted_at: null,
      })
      .select()
      .single()

    if (draftError) throw draftError

    // Add files if any
    if (formData.files && formData.files.length > 0) {
      const { error: filesError } = await supabase.from("submission_files").insert(
        formData.files.map((file) => ({
          submission_id: draft.id,
          name: file.name,
          file_type: file.fileType,
          file_url: file.fileUrl,
          file_size: file.fileSize,
        })),
      )

      if (filesError) throw filesError
    }

    return { success: true, data: draft }
  } catch (error) {
    console.error("Error saving draft:", error)
    return { success: false, error }
  }
}

// Grade submission - Restored this function to maintain compatibility
export async function gradeSubmission(submissionId: string, grade: string, feedback: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("submissions")
      .update({
        status: "graded",
        grade,
        feedback,
        graded_at: new Date().toISOString(),
      })
      .eq("id", submissionId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error grading submission:", error)
    return { success: false, error }
  }
}

// Close assignment (stops late submissions)
export async function closeAssignment(assignmentId: string) {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from("assignments")
      .update({ closed_at: new Date().toISOString() })
      .eq("id", assignmentId)
    if (error) throw error
    revalidatePath("/dashboard/assignments")
    revalidatePath(`/dashboard/assignments/manage/${assignmentId}`)
    return { success: true }
  } catch (e) {
    console.error("Error closing assignment:", e)
    return { success: false, error: e }
  }
}

// Reopen assignment (re-enable late window)
export async function reopenAssignment(assignmentId: string) {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from("assignments")
      .update({ closed_at: null })
      .eq("id", assignmentId)
    if (error) throw error
    revalidatePath("/dashboard/assignments")
    revalidatePath(`/dashboard/assignments/manage/${assignmentId}`)
    return { success: true }
  } catch (e) {
    console.error("Error reopening assignment:", e)
    return { success: false, error: e }
  }
}

// Get submissions for an assignment with the new schema
export async function getAssignmentSubmissions(assignmentId: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("assignment_submissions")
      .select("*, student:student_id(*)")
      .eq("assignment_id", assignmentId)
      .order("submitted_at", { ascending: false })

    if (error) throw error

    // Get attachments for each submission
    const submissionIds = data.map((submission) => submission.id)

    if (submissionIds.length > 0) {
      const { data: attachments, error: attachmentsError } = await supabase
        .from("submission_attachments")
        .select("*")
        .in("submission_id", submissionIds)

      if (attachmentsError) throw attachmentsError

      // Add attachments to each submission
      const submissionsWithAttachments = data.map((submission) => {
        const submissionAttachments = attachments.filter((attachment) => attachment.submission_id === submission.id)
        return {
          ...submission,
          attachments: submissionAttachments,
        }
      })

      return { success: true, data: submissionsWithAttachments }
    }

    return { success: true, data: data.map((submission) => ({ ...submission, attachments: [] })) }
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return { success: false, error }
  }
}

// Grade a submission with the new schema
export async function gradeSubmissionNew(formData: any) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("assignment_submissions")
      .update({
        grade: formData.grade,
        feedback: formData.feedback,
        graded_at: new Date().toISOString(),
        graded_by: formData.gradedBy,
      })
      .eq("id", formData.submissionId)
      .select()
      .single()

    if (error) throw error

    revalidatePath("/dashboard/assignments")
    return { success: true, data }
  } catch (error) {
    console.error("Error grading submission:", error)
    return { success: false, error }
  }
}

// Return submission for resubmission
export async function returnForResubmission(submissionId: string, feedback: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("submissions")
      .update({
        status: "returned",
        feedback,
        graded_at: null,
        grade: null,
      })
      .eq("id", submissionId)
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error returning submission:", error)
    return { success: false, error }
  }
}

// Send notification
export async function sendNotification(formData: {
  assignmentId: string
  recipientIds: string[]
  type: string
  content: string
}) {
  const supabase = createClient()

  try {
    const notifications = formData.recipientIds.map((recipientId) => ({
      assignment_id: formData.assignmentId,
      recipient_id: recipientId,
      type: formData.type,
      content: formData.content,
    }))

    const { data, error } = await supabase.from("assignment_notifications").insert(notifications)

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error sending notifications:", error)
    return { success: false, error }
  }
}

// Add comment
export async function addComment(formData: {
  assignmentId: string
  submissionId?: string
  userId: string
  userType: "faculty" | "student"
  content: string
}) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("assignment_comments")
      .insert({
        assignment_id: formData.assignmentId,
        submission_id: formData.submissionId,
        user_id: formData.userId,
        user_type: formData.userType,
        content: formData.content,
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error adding comment:", error)
    return { success: false, error }
  }
}

// Get comments for an assignment or submission
export async function getComments(assignmentId: string, submissionId?: string) {
  const supabase = createClient()

  try {
    let query = supabase
      .from("assignment_comments")
      .select("*")
      .eq("assignment_id", assignmentId)
      .order("created_at", { ascending: true })

    if (submissionId) {
      query = query.eq("submission_id", submissionId)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching comments:", error)
    return { success: false, error }
  }
}

// Get student submissions for an assignment
export async function getStudentSubmissions(studentId: string, assignmentId?: string) {
  const supabase = createClient()

  try {
    let query = supabase.from("submissions").select("*, assignment:assignments(*)").eq("student_id", studentId)

    if (assignmentId) {
      query = query.eq("assignment_id", assignmentId)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    // Get submission files
    const submissionIds = data.map((submission) => submission.id)

    if (submissionIds.length > 0) {
      const { data: files, error: filesError } = await supabase
        .from("submission_files")
        .select("*")
        .in("submission_id", submissionIds)

      if (filesError) throw filesError

      // Add files to submissions
      const submissionsWithFiles = data.map((submission) => {
        const submissionFiles = files.filter((file) => file.submission_id === submission.id)
        return {
          ...submission,
          files: submissionFiles,
        }
      })

      return { success: true, data: submissionsWithFiles }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching student submissions:", error)
    return { success: false, error }
  }
}

// Get assignments for a student - Restored this function to maintain compatibility
export async function getStudentAssignmentsOld(studentId: string, classIds: string[]) {
  const supabase = createClient()

  try {
    // Get all visible assignments for the student's classes
    const { data: assignments, error: assignmentsError } = await supabase
      .from("assignments")
      .select("*")
      .in("class_id", classIds)
      .eq("visibility", true)
      .order("due_date", { ascending: true })

    if (assignmentsError) throw assignmentsError

    // Get student's submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select("*")
      .eq("student_id", studentId)

    if (submissionsError) throw submissionsError

    // Combine assignments with submission status
    const assignmentsWithStatus = assignments.map((assignment) => {
      const submission = submissions.find((sub) => sub.assignment_id === assignment.id)
      return {
        ...assignment,
        submission: submission || null,
        status: submission ? submission.status : "not_submitted",
      }
    })

    return { success: true, data: assignmentsWithStatus }
  } catch (error) {
    console.error("Error fetching student assignments:", error)
    return { success: false, error }
  }
}
