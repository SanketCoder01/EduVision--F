"use server"

import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache"

// Types for document requests
export type DocumentRequest = {
  id: string
  student_id: string
  request_id: string
  document_type: string
  reason: string
  request_date: string
  status: "pending" | "in_progress" | "completed" | "rejected"
  priority: "low" | "normal" | "high" | "urgent"
  payment_status: "pending" | "completed" | "waived"
  payment_amount: number
  payment_date?: string
  payment_reference?: string
  proof_document_url?: string
  reissued_document_url?: string
  department?: string
  created_at: string
  updated_at: string
  student?: {
    id: string
    name: string
    email: string
    prn: string
    department: string
  }
}

export type DocumentRequestComment = {
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

// Get all document requests
export async function getAllDocumentRequests() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("document_requests")
      .select(`
        *,
        student:student_id(*)
      `)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching document requests:", error)
    return { success: false, error }
  }
}

// Get document requests by student ID
export async function getDocumentRequestsByStudentId(studentId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("document_requests")
      .select("*")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching student document requests:", error)
    return { success: false, error }
  }
}

// Get document request by ID
export async function getDocumentRequestById(requestId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("document_requests")
      .select(`
        *,
        student:student_id(*)
      `)
      .eq("id", requestId)
      .single()
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching document request:", error)
    return { success: false, error }
  }
}

// Create a new document request
export async function createDocumentRequest(request: Omit<DocumentRequest, "id" | "created_at" | "updated_at">) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a request ID
    const requestId = `DOC-${Date.now().toString().slice(-6)}`
    
    const { data, error } = await supabase
      .from("document_requests")
      .insert({
        ...request,
        request_id: requestId
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/document-requests")
    revalidatePath("/student-dashboard/other-services/certificate")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error creating document request:", error)
    return { success: false, error }
  }
}

// Update a document request
export async function updateDocumentRequest(requestId: string, updates: Partial<DocumentRequest>) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("document_requests")
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/document-requests")
    revalidatePath("/student-dashboard/other-services/certificate")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error updating document request:", error)
    return { success: false, error }
  }
}

// Get comments for a document request
export async function getDocumentRequestComments(requestId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("document_request_comments")
      .select(`
        *,
        user:user_id(*)
      `)
      .eq("request_id", requestId)
      .order("created_at", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching document request comments:", error)
    return { success: false, error }
  }
}

// Add a comment to a document request
export async function addDocumentRequestComment(
  requestId: string,
  userId: string,
  userType: "student" | "faculty" | "admin",
  comment: string,
  isInternal: boolean = false
) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("document_request_comments")
      .insert({
        request_id: requestId,
        user_id: userId,
        user_type: userType,
        comment,
        is_internal: isInternal
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/document-requests")
    revalidatePath("/student-dashboard/other-services/certificate")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error adding document request comment:", error)
    return { success: false, error }
  }
}

// Upload a document for a request (proof or reissued document)
export async function uploadDocumentForRequest(requestId: string, file: File, type: "proof" | "reissued") {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a unique file path
    const filePath = `document-requests/${requestId}/${type}-${Date.now()}-${file.name}`
    
    // Upload the file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    // Get the public URL for the uploaded file
    const { data: urlData } = await supabase.storage.from("documents").getPublicUrl(filePath)
    
    if (!urlData) throw new Error("Failed to get public URL for uploaded file")
    
    // Update the document request with the file URL
    const updateField = type === "proof" ? "proof_document_url" : "reissued_document_url"
    
    const { data, error } = await supabase
      .from("document_requests")
      .update({
        [updateField]: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/document-requests")
    revalidatePath("/student-dashboard/other-services/certificate")
    
    return { success: true, data, fileUrl: urlData.publicUrl }
  } catch (error) {
    console.error("Error uploading document:", error)
    return { success: false, error }
  }
}

// Filter document requests
export async function filterDocumentRequests(filters: {
  status?: string
  documentType?: string
  searchQuery?: string
  department?: string
}) {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from("document_requests")
      .select(`
        *,
        student:student_id(*)
      `)
    
    // Apply filters
    if (filters.status && filters.status !== "All") {
      query = query.eq("status", filters.status.toLowerCase())
    }
    
    if (filters.documentType && filters.documentType !== "All") {
      query = query.eq("document_type", filters.documentType)
    }
    
    if (filters.department && filters.department !== "All") {
      query = query.eq("department", filters.department)
    }
    
    if (filters.searchQuery) {
      const searchTerm = filters.searchQuery.toLowerCase()
      query = query.or(
        `request_id.ilike.%${searchTerm}%,reason.ilike.%${searchTerm}%,student.name.ilike.%${searchTerm}%,student.prn.ilike.%${searchTerm}%`
      )
    }
    
    const { data, error } = await query.order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error filtering document requests:", error)
    return { success: false, error }
  }
}
