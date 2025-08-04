"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Types for background verification requests
export type BackgroundVerificationRequest = {
  id: string
  student_id: string
  request_id: string
  company_name: string
  company_email: string
  company_contact: string
  contact_person: string
  verification_purpose: string
  details_to_verify: string[]
  status: "pending" | "in_progress" | "completed" | "rejected"
  verification_document_urls?: string[]
  response_document_url?: string
  created_at: string
  updated_at: string
  completed_at?: string
  student?: {
    id: string
    name: string
    email: string
    prn: string
    department: string
  }
  assigned_to?: string
  assignedTo?: {
    id: string
    name: string
    email: string
    department: string
  }
}

export type BackgroundVerificationComment = {
  id: string
  request_id: string
  user_id: string
  user_type: "student" | "faculty" | "admin"
  comment: string
  is_internal: boolean
  created_at: string
  user?: {
    name: string
  }
}

// Get all background verification requests
export async function getAllBackgroundVerificationRequests() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("background_verification_requests")
      .select(`
        *,
        student:student_id(*),
        assignedTo:assigned_to(*)
      `)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching background verification requests:", error)
    return { success: false, error }
  }
}

// Get background verification requests by student ID
export async function getBackgroundVerificationRequestsByStudentId(studentId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("background_verification_requests")
      .select(`
        *,
        student:student_id(*),
        assignedTo:assigned_to(*)
      `)
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching student background verification requests:", error)
    return { success: false, error }
  }
}

// Get background verification request by ID
export async function getBackgroundVerificationRequestById(requestId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("background_verification_requests")
      .select(`
        *,
        student:student_id(*),
        assignedTo:assigned_to(*)
      `)
      .eq("id", requestId)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching background verification request:", error)
    return { success: false, error }
  }
}

// Create a new background verification request
export async function createBackgroundVerificationRequest(request: Omit<BackgroundVerificationRequest, "id" | "request_id" | "created_at" | "updated_at">) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a request ID
    const requestId = `BG-${Date.now().toString().slice(-6)}`
    
    const { data, error } = await supabase
      .from("background_verification_requests")
      .insert({
        ...request,
        request_id: requestId
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/background-verification")
    revalidatePath("/student-dashboard/other-services/background-verification")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error creating background verification request:", error)
    return { success: false, error }
  }
}

// Update a background verification request
export async function updateBackgroundVerificationRequest(requestId: string, updates: Partial<BackgroundVerificationRequest>) {
  try {
    const supabase = createServerSupabaseClient()
    
    // If status is being updated to completed, set completed_at
    const updatedData = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    if (updates.status === "completed" && !updates.completed_at) {
      updatedData.completed_at = new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from("background_verification_requests")
      .update(updatedData)
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/background-verification")
    revalidatePath("/student-dashboard/other-services/background-verification")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error updating background verification request:", error)
    return { success: false, error }
  }
}

// Get comments for a background verification request
export async function getBackgroundVerificationComments(requestId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("background_verification_comments")
      .select(`
        *,
        user:user_id(*)
      `)
      .eq("request_id", requestId)
      .order("created_at", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching background verification comments:", error)
    return { success: false, error }
  }
}

// Add a comment to a background verification request
export async function addBackgroundVerificationComment(
  requestId: string,
  userId: string,
  userType: "student" | "faculty" | "admin",
  comment: string,
  isInternal: boolean = false
) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("background_verification_comments")
      .insert({
        request_id: requestId,
        user_id: userId,
        user_type: userType,
        comment,
        is_internal: isInternal
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/background-verification")
    revalidatePath("/student-dashboard/other-services/background-verification")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error adding background verification comment:", error)
    return { success: false, error }
  }
}

// Upload verification documents for a background verification request
export async function uploadVerificationDocuments(requestId: string, files: File[]) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the current request to retrieve existing document URLs
    const { data: request, error: fetchError } = await supabase
      .from("background_verification_requests")
      .select("verification_document_urls")
      .eq("id", requestId)
      .single()
    
    if (fetchError) throw fetchError
    
    const existingUrls = request.verification_document_urls || []
    const newUrls = []
    
    // Upload each file
    for (const file of files) {
      // Generate a unique file path
      const filePath = `background_verification/documents/${requestId}/${Date.now()}-${file.name}`
      
      // Upload the file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("background_verification")
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      // Get the public URL for the uploaded file
      const { data: urlData } = await supabase.storage.from("background_verification").getPublicUrl(filePath)
      
      if (!urlData) throw new Error("Failed to get public URL for uploaded file")
      
      newUrls.push(urlData.publicUrl)
    }
    
    // Update the request with the new document URLs
    const updatedUrls = [...existingUrls, ...newUrls]
    
    const { data, error } = await supabase
      .from("background_verification_requests")
      .update({
        verification_document_urls: updatedUrls,
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/background-verification")
    revalidatePath("/student-dashboard/other-services/background-verification")
    
    return { success: true, data, documentUrls: newUrls }
  } catch (error) {
    console.error("Error uploading verification documents:", error)
    return { success: false, error }
  }
}

// Upload response document
export async function uploadResponseDocument(requestId: string, file: File) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a unique file path
    const filePath = `background_verification/response/${requestId}/${Date.now()}-${file.name}`
    
    // Upload the file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("background_verification")
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    // Get the public URL for the uploaded file
    const { data: urlData } = await supabase.storage.from("background_verification").getPublicUrl(filePath)
    
    if (!urlData) throw new Error("Failed to get public URL for uploaded file")
    
    // Update the request with the response document URL
    const { data, error } = await supabase
      .from("background_verification_requests")
      .update({
        response_document_url: urlData.publicUrl,
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/background-verification")
    revalidatePath("/student-dashboard/other-services/background-verification")
    
    return { success: true, data, documentUrl: urlData.publicUrl }
  } catch (error) {
    console.error("Error uploading response document:", error)
    return { success: false, error }
  }
}

// Filter background verification requests
export async function filterBackgroundVerificationRequests(filters: {
  status?: string
  searchQuery?: string
  department?: string
  dateRange?: { start?: string; end?: string }
}) {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from("background_verification_requests")
      .select(`
        *,
        student:student_id(*),
        assignedTo:assigned_to(*)
      `)
    
    // Apply filters
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status.toLowerCase())
    }
    
    if (filters.department && filters.department !== "all") {
      query = query.eq("student.department", filters.department)
    }
    
    if (filters.dateRange) {
      if (filters.dateRange.start) {
        query = query.gte("created_at", filters.dateRange.start)
      }
      
      if (filters.dateRange.end) {
        query = query.lte("created_at", filters.dateRange.end)
      }
    }
    
    if (filters.searchQuery) {
      const searchTerm = filters.searchQuery.toLowerCase()
      query = query.or(
        `request_id.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,contact_person.ilike.%${searchTerm}%,student.name.ilike.%${searchTerm}%,student.prn.ilike.%${searchTerm}%`
      )
    }
    
    const { data, error } = await query.order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error filtering background verification requests:", error)
    return { success: false, error }
  }
}
