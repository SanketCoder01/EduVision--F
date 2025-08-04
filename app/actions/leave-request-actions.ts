"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Types for leave requests
export type LeaveRequest = {
  id: string
  student_id: string
  request_id: string
  leave_type: "medical" | "personal" | "family" | "academic" | "other"
  start_date: string
  end_date: string
  reason: string
  additional_info?: string
  status: "pending" | "approved" | "rejected" | "cancelled"
  document_urls?: string[]
  faculty_id?: string
  created_at: string
  updated_at: string
  student?: {
    id: string
    name: string
    email: string
    prn: string
    department: string
  }
  faculty?: {
    id: string
    name: string
    email: string
    department: string
  }
}

export type LeaveRequestComment = {
  id: string
  request_id: string
  user_id: string
  user_type: "student" | "faculty" | "admin"
  comment: string
  is_private: boolean
  created_at: string
  user?: {
    name: string
  }
}

// Get all leave requests
export async function getAllLeaveRequests() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("leave_requests")
      .select(`
        *,
        student:student_id(*),
        faculty:faculty_id(*)
      `)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching leave requests:", error)
    return { success: false, error }
  }
}

// Get leave requests by student ID
export async function getLeaveRequestsByStudentId(studentId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("leave_requests")
      .select(`
        *,
        student:student_id(*),
        faculty:faculty_id(*)
      `)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching student leave requests:", error)
    return { success: false, error }
  }
}

// Get leave requests by faculty ID
export async function getLeaveRequestsByFacultyId(facultyId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("leave_requests")
      .select(`
        *,
        student:student_id(*),
        faculty:faculty_id(*)
      `)
      .eq("faculty_id", facultyId)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching faculty leave requests:", error)
    return { success: false, error }
  }
}

// Get leave requests by department
export async function getLeaveRequestsByDepartment(department: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("leave_requests")
      .select(`
        *,
        student:student_id(*),
        faculty:faculty_id(*)
      `)
      .eq("student.department", department)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching department leave requests:", error)
    return { success: false, error }
  }
}

// Get leave request by ID
export async function getLeaveRequestById(requestId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("leave_requests")
      .select(`
        *,
        student:student_id(*),
        faculty:faculty_id(*)
      `)
      .eq("id", requestId)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching leave request:", error)
    return { success: false, error }
  }
}

// Create a new leave request
export async function createLeaveRequest(request: Omit<LeaveRequest, "id" | "request_id" | "created_at" | "updated_at">) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a request ID
    const requestId = `LEAVE-${Date.now().toString().slice(-6)}`
    
    const { data, error } = await supabase
      .from("leave_requests")
      .insert({
        ...request,
        request_id: requestId
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/dashboard/other-services/leave-requests")
    revalidatePath("/student-dashboard/other-services/leave-requests")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error creating leave request:", error)
    return { success: false, error }
  }
}

// Update a leave request
export async function updateLeaveRequest(requestId: string, updates: Partial<LeaveRequest>) {
  try {
    const supabase = createServerSupabaseClient()
    
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from("leave_requests")
      .update(updatedData)
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/dashboard/other-services/leave-requests")
    revalidatePath("/student-dashboard/other-services/leave-requests")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error updating leave request:", error)
    return { success: false, error }
  }
}

// Approve a leave request
export async function approveLeaveRequest(requestId: string, facultyId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("leave_requests")
      .update({
        status: "approved",
        faculty_id: facultyId,
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/dashboard/other-services/leave-requests")
    revalidatePath("/student-dashboard/other-services/leave-requests")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error approving leave request:", error)
    return { success: false, error }
  }
}

// Reject a leave request
export async function rejectLeaveRequest(requestId: string, facultyId: string, reason: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Update the request status
    const { data, error } = await supabase
      .from("leave_requests")
      .update({
        status: "rejected",
        faculty_id: facultyId,
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    // Add a comment with the rejection reason
    if (reason) {
      const { error: commentError } = await supabase
        .from("leave_request_comments")
        .insert({
          request_id: requestId,
          user_id: facultyId,
          user_type: "faculty",
          comment: `Rejection reason: ${reason}`,
          is_private: false,
          created_at: new Date().toISOString()
        })
      
      if (commentError) throw commentError
    }
    
    revalidatePath("/dashboard/other-services/leave-requests")
    revalidatePath("/student-dashboard/other-services/leave-requests")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error rejecting leave request:", error)
    return { success: false, error }
  }
}

// Cancel a leave request
export async function cancelLeaveRequest(requestId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("leave_requests")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/dashboard/other-services/leave-requests")
    revalidatePath("/student-dashboard/other-services/leave-requests")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error cancelling leave request:", error)
    return { success: false, error }
  }
}

// Get comments for a leave request
export async function getLeaveRequestComments(requestId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("leave_request_comments")
      .select(`
        *,
        user:user_id(*)
      `)
      .eq("request_id", requestId)
      .order("created_at", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching leave request comments:", error)
    return { success: false, error }
  }
}

// Add a comment to a leave request
export async function addLeaveRequestComment(
  requestId: string,
  userId: string,
  userType: "student" | "faculty" | "admin",
  comment: string,
  isPrivate: boolean = false
) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("leave_request_comments")
      .insert({
        request_id: requestId,
        user_id: userId,
        user_type: userType,
        comment,
        is_private: isPrivate,
        created_at: new Date().toISOString()
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/dashboard/other-services/leave-requests")
    revalidatePath("/student-dashboard/other-services/leave-requests")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error adding leave request comment:", error)
    return { success: false, error }
  }
}

// Upload supporting documents for a leave request
export async function uploadLeaveDocuments(requestId: string, files: File[]) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the current request to retrieve existing document URLs
    const { data: request, error: fetchError } = await supabase
      .from("leave_requests")
      .select("document_urls")
      .eq("id", requestId)
      .single()
    
    if (fetchError) throw fetchError
    
    const existingUrls = request.document_urls || []
    const newUrls = []
    
    // Upload each file
    for (const file of files) {
      // Generate a unique file path
      const filePath = `leave_requests/${requestId}/${Date.now()}-${file.name}`
      
      // Upload the file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("leave_requests")
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      // Get the public URL for the uploaded file
      const { data: urlData } = await supabase.storage.from("leave_requests").getPublicUrl(filePath)
      
      if (!urlData) throw new Error("Failed to get public URL for uploaded file")
      
      newUrls.push(urlData.publicUrl)
    }
    
    // Update the request with the new document URLs
    const updatedUrls = [...existingUrls, ...newUrls]
    
    const { data, error } = await supabase
      .from("leave_requests")
      .update({
        document_urls: updatedUrls,
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/dashboard/other-services/leave-requests")
    revalidatePath("/student-dashboard/other-services/leave-requests")
    
    return { success: true, data, documentUrls: newUrls }
  } catch (error) {
    console.error("Error uploading leave documents:", error)
    return { success: false, error }
  }
}

// Filter leave requests
export async function filterLeaveRequests(filters: {
  status?: string
  leaveType?: string
  department?: string
  facultyId?: string
  searchQuery?: string
  dateRange?: { start?: string; end?: string }
}) {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from("leave_requests")
      .select(`
        *,
        student:student_id(*),
        faculty:faculty_id(*)
      `)
    
    // Apply filters
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status.toLowerCase())
    }
    
    if (filters.leaveType && filters.leaveType !== "all") {
      query = query.eq("leave_type", filters.leaveType.toLowerCase())
    }
    
    if (filters.department && filters.department !== "all") {
      query = query.eq("student.department", filters.department)
    }
    
    if (filters.facultyId && filters.facultyId !== "all") {
      query = query.eq("faculty_id", filters.facultyId)
    }
    
    if (filters.dateRange) {
      if (filters.dateRange.start) {
        query = query.gte("start_date", filters.dateRange.start)
      }
      
      if (filters.dateRange.end) {
        query = query.lte("end_date", filters.dateRange.end)
      }
    }
    
    if (filters.searchQuery) {
      const searchTerm = filters.searchQuery.toLowerCase()
      query = query.or(
        `request_id.ilike.%${searchTerm}%,reason.ilike.%${searchTerm}%,additional_info.ilike.%${searchTerm}%,student.name.ilike.%${searchTerm}%,student.prn.ilike.%${searchTerm}%`
      )
    }
    
    const { data, error } = await query.order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error filtering leave requests:", error)
    return { success: false, error }
  }
}

// Get faculty list by department
export async function getFacultyByDepartment(department: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("faculty")
      .select("id, name, email, department")
      .eq("department", department)
      .order("name", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching faculty by department:", error)
    return { success: false, error }
  }
}
