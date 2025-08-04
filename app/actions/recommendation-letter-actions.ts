"use server"

import { createServerSupabaseClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Types for recommendation letter requests
export type RecommendationLetterRequest = {
  id: string
  student_id: string
  request_id: string
  faculty_id?: string
  purpose: string
  institution_name: string
  program_name?: string
  deadline?: string
  additional_info?: string
  status: "pending" | "in_progress" | "completed" | "rejected"
  supporting_document_urls?: string[]
  letter_url?: string
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
  faculty?: {
    id: string
    name: string
    email: string
    department: string
  }
}

export type RecommendationLetterComment = {
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

// Get all recommendation letter requests
export async function getAllRecommendationLetterRequests() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("recommendation_letter_requests")
      .select(`
        *,
        student:student_id(*),
        faculty:faculty_id(*)
      `)
      .order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching recommendation letter requests:", error)
    return { success: false, error }
  }
}

// Get recommendation letter requests by student ID
export async function getRecommendationLetterRequestsByStudentId(studentId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("recommendation_letter_requests")
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
    console.error("Error fetching student recommendation letter requests:", error)
    return { success: false, error }
  }
}

// Get recommendation letter requests by faculty ID
export async function getRecommendationLetterRequestsByFacultyId(facultyId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("recommendation_letter_requests")
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
    console.error("Error fetching faculty recommendation letter requests:", error)
    return { success: false, error }
  }
}

// Get recommendation letter request by ID
export async function getRecommendationLetterRequestById(requestId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("recommendation_letter_requests")
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
    console.error("Error fetching recommendation letter request:", error)
    return { success: false, error }
  }
}

// Create a new recommendation letter request
export async function createRecommendationLetterRequest(request: Omit<RecommendationLetterRequest, "id" | "request_id" | "created_at" | "updated_at">) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a request ID
    const requestId = `REC-${Date.now().toString().slice(-6)}`
    
    const { data, error } = await supabase
      .from("recommendation_letter_requests")
      .insert({
        ...request,
        request_id: requestId
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/recommendation-letters")
    revalidatePath("/student-dashboard/other-services/recommendation-letters")
    revalidatePath("/dashboard/other-services/recommendation-letters")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error creating recommendation letter request:", error)
    return { success: false, error }
  }
}

// Update a recommendation letter request
export async function updateRecommendationLetterRequest(requestId: string, updates: Partial<RecommendationLetterRequest>) {
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
      .from("recommendation_letter_requests")
      .update(updatedData)
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/recommendation-letters")
    revalidatePath("/student-dashboard/other-services/recommendation-letters")
    revalidatePath("/dashboard/other-services/recommendation-letters")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error updating recommendation letter request:", error)
    return { success: false, error }
  }
}

// Get comments for a recommendation letter request
export async function getRecommendationLetterComments(requestId: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("recommendation_letter_comments")
      .select(`
        *,
        user:user_id(*)
      `)
      .eq("request_id", requestId)
      .order("created_at", { ascending: true })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching recommendation letter comments:", error)
    return { success: false, error }
  }
}

// Add a comment to a recommendation letter request
export async function addRecommendationLetterComment(
  requestId: string,
  userId: string,
  userType: "student" | "faculty" | "admin",
  comment: string,
  isInternal: boolean = false
) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from("recommendation_letter_comments")
      .insert({
        request_id: requestId,
        user_id: userId,
        user_type: userType,
        comment,
        is_internal: isInternal
      })
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/recommendation-letters")
    revalidatePath("/student-dashboard/other-services/recommendation-letters")
    revalidatePath("/dashboard/other-services/recommendation-letters")
    
    return { success: true, data }
  } catch (error) {
    console.error("Error adding recommendation letter comment:", error)
    return { success: false, error }
  }
}

// Upload supporting documents for a recommendation letter request
export async function uploadSupportingDocuments(requestId: string, files: File[]) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the current request to retrieve existing document URLs
    const { data: request, error: fetchError } = await supabase
      .from("recommendation_letter_requests")
      .select("supporting_document_urls")
      .eq("id", requestId)
      .single()
    
    if (fetchError) throw fetchError
    
    const existingUrls = request.supporting_document_urls || []
    const newUrls = []
    
    // Upload each file
    for (const file of files) {
      // Generate a unique file path
      const filePath = `recommendation_letters/supporting/${requestId}/${Date.now()}-${file.name}`
      
      // Upload the file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("recommendation_letters")
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      // Get the public URL for the uploaded file
      const { data: urlData } = await supabase.storage.from("recommendation_letters").getPublicUrl(filePath)
      
      if (!urlData) throw new Error("Failed to get public URL for uploaded file")
      
      newUrls.push(urlData.publicUrl)
    }
    
    // Update the request with the new document URLs
    const updatedUrls = [...existingUrls, ...newUrls]
    
    const { data, error } = await supabase
      .from("recommendation_letter_requests")
      .update({
        supporting_document_urls: updatedUrls,
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/recommendation-letters")
    revalidatePath("/student-dashboard/other-services/recommendation-letters")
    revalidatePath("/dashboard/other-services/recommendation-letters")
    
    return { success: true, data, documentUrls: newUrls }
  } catch (error) {
    console.error("Error uploading supporting documents:", error)
    return { success: false, error }
  }
}

// Upload recommendation letter
export async function uploadRecommendationLetter(requestId: string, file: File) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Generate a unique file path
    const filePath = `recommendation_letters/letters/${requestId}/${Date.now()}-${file.name}`
    
    // Upload the file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("recommendation_letters")
      .upload(filePath, file)
    
    if (uploadError) throw uploadError
    
    // Get the public URL for the uploaded file
    const { data: urlData } = await supabase.storage.from("recommendation_letters").getPublicUrl(filePath)
    
    if (!urlData) throw new Error("Failed to get public URL for uploaded file")
    
    // Update the request with the letter URL
    const { data, error } = await supabase
      .from("recommendation_letter_requests")
      .update({
        letter_url: urlData.publicUrl,
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", requestId)
      .select()
    
    if (error) throw error
    
    revalidatePath("/university/other-services/recommendation-letters")
    revalidatePath("/student-dashboard/other-services/recommendation-letters")
    revalidatePath("/dashboard/other-services/recommendation-letters")
    
    return { success: true, data, letterUrl: urlData.publicUrl }
  } catch (error) {
    console.error("Error uploading recommendation letter:", error)
    return { success: false, error }
  }
}

// Get faculty list for recommendation letters
export async function getFacultyForRecommendation(department?: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from("faculty")
      .select("id, name, email, department")
      .order("name", { ascending: true })
    
    if (department) {
      query = query.eq("department", department)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error fetching faculty for recommendation:", error)
    return { success: false, error }
  }
}

// Filter recommendation letter requests
export async function filterRecommendationLetterRequests(filters: {
  status?: string
  searchQuery?: string
  department?: string
  facultyId?: string
  dateRange?: { start?: string; end?: string }
}) {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from("recommendation_letter_requests")
      .select(`
        *,
        student:student_id(*),
        faculty:faculty_id(*)
      `)
    
    // Apply filters
    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status.toLowerCase())
    }
    
    if (filters.department && filters.department !== "all") {
      query = query.eq("student.department", filters.department)
    }
    
    if (filters.facultyId && filters.facultyId !== "all") {
      query = query.eq("faculty_id", filters.facultyId)
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
        `request_id.ilike.%${searchTerm}%,purpose.ilike.%${searchTerm}%,institution_name.ilike.%${searchTerm}%,program_name.ilike.%${searchTerm}%,student.name.ilike.%${searchTerm}%,student.prn.ilike.%${searchTerm}%`
      )
    }
    
    const { data, error } = await query.order("created_at", { ascending: false })
    
    if (error) throw error
    
    return { success: true, data }
  } catch (error) {
    console.error("Error filtering recommendation letter requests:", error)
    return { success: false, error }
  }
}
