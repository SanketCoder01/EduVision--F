"use server"

import { createClient as createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache"

// Types for document reissue requests
export type DocumentReissueRequest = {
  id: string
  student_id: string
  request_id: string
  document_type: string
  reason: string
  original_issue_date?: string
  urgency: "normal" | "urgent"
  status: "pending" | "processing" | "completed" | "rejected"
  supporting_document_urls?: string[]
  reissued_document_url?: string
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

export type DocumentReissueComment = {
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

// Get all document reissue requests
export async function getAllDocumentReissueRequests() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("document_reissue_requests")
      .select(`
        *,
        student:student_id(*),
        assignedTo:assigned_to(*)
      `)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching document reissue requests:", error)
    return { success: false, error }
  }
}

// Get document reissue requests by student ID
export async function getDocumentReissueRequestsByStudentId(studentId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("document_reissue_requests")
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
    console.error("Error fetching student document reissue requests:", error)
    return { success: false, error }
  }
}

// Get document reissue request by ID
export async function getDocumentReissueRequestById(requestId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("document_reissue_requests")
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
    console.error("Error fetching document reissue request:", error)
    return { success: false, error }
  }
}

// Create a new document reissue request
export async function createDocumentReissueRequest(request: Omit<DocumentReissueRequest, "id" | "request_id" | "created_at" | "updated_at">) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a request ID
    const requestId = `DOC-${Date.now().toString().slice(-6)}`
    
    const { data, error } = await supabase
      .from("document_reissue_requests")
      .insert({
        ...request,
        request_id: requestId
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/document-reissue")
    revalidatePath("/student-dashboard/other-services/document-reissue")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error creating document reissue request:", error)
    return { success: false, error }
  }
}

// Update a document reissue request
export async function updateDocumentReissueRequest(requestId: string, updates: Partial<DocumentReissueRequest>) {
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
      .from("document_reissue_requests")
      .update(updatedData)
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/document-reissue")
    revalidatePath("/student-dashboard/other-services/document-reissue")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error updating document reissue request:", error)
    return { success: false, error }
  }
}

// Get comments for a document reissue request
export async function getDocumentReissueComments(requestId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("document_reissue_comments")
      .select(`
        *,
        user:user_id(*)
      `)
      .eq("request_id", requestId)
      .order("created_at", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching document reissue comments:", error)
    return { success: false, error }
  }
}

// Add a comment to a document reissue request
export async function addDocumentReissueComment(
  requestId: string,
  userId: string,
  userType: "student" | "faculty" | "admin",
  comment: string,
  isInternal: boolean = false
) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("document_reissue_comments")
      .insert({
        request_id: requestId,
        user_id: userId,
        user_type: userType,
        comment,
        is_internal: isInternal
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/document-reissue")
    revalidatePath("/student-dashboard/other-services/document-reissue")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error adding document reissue comment:", error)
    return { success: false, error }
  }
}

// Upload supporting documents for a document reissue request
export async function uploadSupportingDocuments(requestId: string, files: File[]) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the current request to retrieve existing document URLs
    const { data: request, error: fetchError } = await supabase
      .from("document_reissue_requests")
      .select("supporting_document_urls")
      .eq("id", requestId)
      .single()
    
    if (fetchError) throw fetchError
    
    const existingUrls = request.supporting_document_urls || []
    const newUrls = []
    
    // Upload each file
    for (const file of files) {
      // Generate a unique file path
      const filePath = `document_reissue/supporting/${requestId}/${Date.now()}-${file.name}`
      
      // Upload the file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("document_reissue")
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      // Get the public URL for the uploaded file
      const { data: urlData } = await supabase.storage.from("document_reissue").getPublicUrl(filePath)
      
      if (!urlData) throw new Error("Failed to get public URL for uploaded file")
      
      newUrls.push(urlData.publicUrl)
    }
    
    // Update the request with the new document URLs
    const updatedUrls = [...existingUrls, ...newUrls]
    
    const { data, error } = await supabase
      .from("document_reissue_requests")
      .update({
        supporting_document_urls: updatedUrls,
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/document-reissue")
    revalidatePath("/student-dashboard/other-services/document-reissue")
    
    return { success: true, data, documentUrls: newUrls }
  } catch (error) {
    console.error("Error uploading supporting documents:", error)
    return { success: false, error }
  }
}

// Upload reissued document
export async function uploadReissuedDocument(requestId: string, file: File) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a unique file path
    const filePath = `document_reissue/reissued/${requestId}/${Date.now()}-${file.name}`
    
    // Upload the file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("document_reissue")
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    // Get the public URL for the uploaded file
    const { data: urlData } = await supabase.storage.from("document_reissue").getPublicUrl(filePath)
    
    if (!urlData) throw new Error("Failed to get public URL for uploaded file")
    
    // Update the request with the reissued document URL
    const { data, error } = await supabase
      .from("document_reissue_requests")
      .update({
        reissued_document_url: urlData.publicUrl,
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/document-reissue")
    revalidatePath("/student-dashboard/other-services/document-reissue")
    
    return { success: true, data, documentUrl: urlData.publicUrl }
  } catch (error) {
    console.error("Error uploading reissued document:", error)
    return { success: false, error }
  }
}

// Filter document reissue requests
export async function filterDocumentReissueRequests(filters: {
  status?: string
  documentType?: string
  urgency?: string
  searchQuery?: string
  department?: string
}) {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from("document_reissue_requests")
      .select(`
        *,
        student:student_id(*),
        assignedTo:assigned_to(*)
      `)
    
    // Apply filters
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status.toLowerCase())
    }
    
    if (filters.documentType && filters.documentType !== "all") {
      query = query.eq("document_type", filters.documentType)
    }
    
    if (filters.urgency && filters.urgency !== "all") {
      query = query.eq("urgency", filters.urgency.toLowerCase())
    }
    
    if (filters.department && filters.department !== "all") {
      query = query.eq("student.department", filters.department)
    }
    
    if (filters.searchQuery) {
      const searchTerm = filters.searchQuery.toLowerCase()
      query = query.or(
        `request_id.ilike.%${searchTerm}%,document_type.ilike.%${searchTerm}%,reason.ilike.%${searchTerm}%,student.name.ilike.%${searchTerm}%,student.prn.ilike.%${searchTerm}%`
      )
    }
    
    const { data, error } = await query.order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error filtering document reissue requests:", error)
    return { success: false, error }
  }
}
